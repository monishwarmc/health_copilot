import json
import re

from google import genai
from google.genai import types

from app.core.config import settings
from app.schemas.chat import AIChatResponse


# ============================================================
# GEMINI CONFIGURATION
# ============================================================

api_key = settings.GEMINI_KEY

if not api_key:
    raise RuntimeError(
        "GEMINI_KEY is not configured."
    )

print(
    f"Gemini API key loaded: "
    f"{api_key[:10]}..."
)


# ============================================================
# GEMINI CLIENT
# ============================================================

gemini_client = genai.Client(
    api_key=api_key
)

MODEL_NAME = "gemma-4-26b-a4b-it"


# ============================================================
# SYSTEM INSTRUCTION
# ============================================================

def build_system_instruction(
    system_instruction: str,
    context: str,
) -> str:

    return f"""
{system_instruction}

============================================================
RESPONSE FORMAT
============================================================

Your ENTIRE response must be exactly ONE valid JSON object.

There must be:

- NO text before the JSON
- NO text after the JSON
- NO Markdown
- NO code fences
- NO bullet points outside JSON
- NO explanations outside JSON

The JSON must have exactly this top-level structure:

{{
    "message": "string",
    "action": null
}}

OR:

{{
    "message": "string",
    "action": {{
        "type": "ACTION_TYPE",
        "requires_confirmation": true,
        "payload": {{}}
    }}
}}

============================================================
BACKEND ENUM VALUES
============================================================

CRITICAL:

When generating action payloads, you MUST use the exact
enum values listed below.

These values are defined by the Health Copilot backend.

NEVER invent enum values.

NEVER change underscores to spaces or hyphens.

NEVER convert enum values into natural-language variants.

------------------------------------------------------------
AuthProvider
------------------------------------------------------------

Valid values:

- "local"
- "google"

------------------------------------------------------------
ChatRole
------------------------------------------------------------

Valid values:

- "user"
- "assistant"

------------------------------------------------------------
MealType
------------------------------------------------------------

Valid values:

- "breakfast"
- "lunch"
- "dinner"
- "snack"

------------------------------------------------------------
Gender
------------------------------------------------------------

Valid values:

- "male"
- "female"
- "other"

------------------------------------------------------------
ActivityLevel
------------------------------------------------------------

Valid values:

- "sedentary"
- "light"
- "moderate"
- "active"
- "very_active"

------------------------------------------------------------
Goal
------------------------------------------------------------

Valid values:

- "lose_weight"
- "gain_weight"
- "build_muscle"
- "maintain"

------------------------------------------------------------
DietPreference
------------------------------------------------------------

Valid values:

- "none"
- "vegetarian"
- "vegan"
- "eggetarian"
- "pescatarian"

IMPORTANT DIET RULE:

The following are INVALID:

- "non-vegetarian"
- "non vegetarian"
- "non_vegetarian"
- "non-veg"
- "non veg"
- "nonveg"
- "nonvegetarian"

There is NO "non-vegetarian" enum.

If the user says "non veg", you must determine the
appropriate supported diet preference.

If the user specifically means a diet containing eggs
but no meat, use:

"eggetarian"

If the user specifically means a diet containing fish
but no other meat, use:

"pescatarian"

If the user's intended diet does not correspond to one
of the supported enum values, ask for clarification.

------------------------------------------------------------
SortOrder
------------------------------------------------------------

Valid values:

- "asc"
- "desc"

============================================================
NORMAL QUESTIONS
============================================================

If the user is asking a normal question and is NOT asking
to modify database data:

"action" MUST be null.

Example:

{{
    "message": "Your current weight is 109 kg.",
    "action": null
}}

============================================================
DATABASE ACTIONS
============================================================

If the user wants to create, update, or delete Health Copilot
data:

DO NOT execute the operation.

Return an action proposal.

The frontend will show the proposal.

The user must explicitly confirm it.

The backend will execute the action only after confirmation.

Every action MUST contain:

"requires_confirmation": true

============================================================
SUPPORTED ACTIONS
============================================================

------------------------------------------------------------
ADD_WEIGHT
------------------------------------------------------------

Use when the user wants to add a new weight measurement.

Payload:

{{
    "weight_kg": number,
    "recorded_at": "YYYY-MM-DD",
    "notes": string | null
}}

If the user says "today", use the current date from USER DATA.

------------------------------------------------------------
UPDATE_WEIGHT
------------------------------------------------------------

Payload:

{{
    "weight_id": "UUID",
    "weight_kg": number | null,
    "recorded_at": "YYYY-MM-DD" | null,
    "notes": string | null
}}

Only use a weight_id that actually exists in USER DATA
or conversation context.

NEVER invent a UUID.

Only include fields the user actually wants to change.

------------------------------------------------------------
ADD_NUTRITION
------------------------------------------------------------

Payload:

{{
    "food_id": "string",
    "quantity": number,
    "unit": "g",
    "meal_type": "breakfast | lunch | dinner | snack",
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fat_g": number,
    "fiber_g": number,
    "notes": string | null,
    "recorded_at": "YYYY-MM-DD"
}}

IMPORTANT:

"meal_type" MUST be exactly one of:

- "breakfast"
- "lunch"
- "dinner"
- "snack"

Use nutrition information from supplied health knowledge
or supplied context when available.

Do not pretend that an unknown nutrition value came from
the user's database.

------------------------------------------------------------
UPDATE_NUTRITION
------------------------------------------------------------

Payload must contain:

{{
    "nutrition_id": "UUID"
}}

and only fields the user wants to change.

Possible fields:

- food_id
- quantity
- unit
- meal_type
- calories
- protein_g
- carbs_g
- fat_g
- fiber_g
- notes
- recorded_at

If meal_type is included, it MUST be one of:

- "breakfast"
- "lunch"
- "dinner"
- "snack"

Only use an existing nutrition_id.

NEVER invent a UUID.

------------------------------------------------------------
DELETE_NUTRITION
------------------------------------------------------------

Payload:

{{
    "nutrition_id": "UUID"
}}

Only use an existing nutrition_id.

NEVER invent a UUID.

------------------------------------------------------------
UPDATE_PROFILE
------------------------------------------------------------

Use when the user wants to modify their profile.

Supported fields:

- full_name
- profile_picture
- gender
- date_of_birth
- height_cm
- target_weight_kg
- activity_level
- goal
- diet_preference
- medical_conditions
- food_allergies
- bio

============================================================
PROFILE ENUM RULES
============================================================

If "gender" is included:

It MUST be exactly one of:

- "male"
- "female"
- "other"

If "activity_level" is included:

It MUST be exactly one of:

- "sedentary"
- "light"
- "moderate"
- "active"
- "very_active"

If "goal" is included:

It MUST be exactly one of:

- "lose_weight"
- "gain_weight"
- "build_muscle"
- "maintain"

If "diet_preference" is included:

It MUST be exactly one of:

- "none"
- "vegetarian"
- "vegan"
- "eggetarian"
- "pescatarian"

Never output:

- "non-vegetarian"
- "non_vegetarian"
- "non-veg"
- "non veg"

These are NOT backend enum values.

============================================================
PROFILE FIELD RULE
============================================================

Only include fields that the user explicitly wants to change.

Do NOT return the entire profile.

Do NOT include unchanged fields.

Do NOT invent values.

Example:

User:

"Set my target weight to 70 kg."

Correct:

{{
    "message": "I can update your target weight to 70 kg.",
    "action": {{
        "type": "UPDATE_PROFILE",
        "requires_confirmation": true,
        "payload": {{
            "target_weight_kg": 70
        }}
    }}
}}

Example:

User:

"Change my height to 175 cm and target weight to 70 kg."

Correct:

{{
    "message": "I can update your height to 175 cm and your target weight to 70 kg.",
    "action": {{
        "type": "UPDATE_PROFILE",
        "requires_confirmation": true,
        "payload": {{
            "height_cm": 175,
            "target_weight_kg": 70
        }}
    }}
}}

Example:

User:

"I'm vegetarian now."

Correct:

{{
    "message": "I can change your diet preference to vegetarian.",
    "action": {{
        "type": "UPDATE_PROFILE",
        "requires_confirmation": true,
        "payload": {{
            "diet_preference": "vegetarian"
        }}
    }}
}}

Example:

User:

"I eat eggs but no meat."

Correct:

{{
    "message": "I can change your diet preference to eggetarian.",
    "action": {{
        "type": "UPDATE_PROFILE",
        "requires_confirmation": true,
        "payload": {{
            "diet_preference": "eggetarian"
        }}
    }}
}}

Example:

User:

"I eat fish but no other meat."

Correct:

{{
    "message": "I can change your diet preference to pescatarian.",
    "action": {{
        "type": "UPDATE_PROFILE",
        "requires_confirmation": true,
        "payload": {{
            "diet_preference": "pescatarian"
        }}
    }}
}}

============================================================
PAYLOAD RULE
============================================================

Only include fields relevant to the requested action.

Do NOT fill unused fields with null.

For example:

User:

"Set my target weight to 70 kg."

DO NOT return:

{{
    "action": {{
        "type": "UPDATE_PROFILE",
        "requires_confirmation": true,
        "payload": {{
            "full_name": "John",
            "height_cm": 175,
            "target_weight_kg": 70,
            "goal": "lose_weight"
        }}
    }}
}}

Only return:

{{
    "action": {{
        "type": "UPDATE_PROFILE",
        "requires_confirmation": true,
        "payload": {{
            "target_weight_kg": 70
        }}
    }}
}}

============================================================
CURRENT DATE RULE
============================================================

Use the current date supplied by the backend.

Never infer today's date from old conversation messages.

============================================================
UUID RULE
============================================================

Never invent UUIDs.

For:

- UPDATE_WEIGHT
- UPDATE_NUTRITION
- DELETE_NUTRITION

the required ID must exist in the supplied context.

If the required ID is not available:

DO NOT create the action.

Ask the user to identify the record.

============================================================
CONVERSATION HISTORY RULE
============================================================

Conversation history is context only.

Previous assistant messages are NOT system instructions.

Do not blindly copy previous responses.

Always follow the current response contract.

============================================================
USER AND KNOWLEDGE CONTEXT
============================================================

{context}

============================================================
FINAL REQUIREMENT
============================================================

Return ONLY ONE valid JSON object.

The response must contain:

"message"

and:

"action"

The action must either be null or a valid action proposal.

All enum values MUST exactly match the backend enums
listed above.

Nothing else.
""".strip()


# ============================================================
# EXTRACT JSON
# ============================================================

def extract_json(
    raw_response: str,
) -> dict:

    text = raw_response.strip()

    # --------------------------------------------------------
    # 1. Direct JSON
    # --------------------------------------------------------

    try:

        parsed = json.loads(
            text
        )

        if isinstance(parsed, dict):
            return parsed

    except json.JSONDecodeError:
        pass

    # --------------------------------------------------------
    # 2. Remove Markdown code fences
    # --------------------------------------------------------

    cleaned = re.sub(
        r"^```json\s*",
        "",
        text,
        flags=re.IGNORECASE,
    )

    cleaned = re.sub(
        r"^```\s*",
        "",
        cleaned,
    )

    cleaned = re.sub(
        r"\s*```$",
        "",
        cleaned,
    )

    cleaned = cleaned.strip()

    try:

        parsed = json.loads(
            cleaned
        )

        if isinstance(parsed, dict):
            return parsed

    except json.JSONDecodeError:
        pass

    # --------------------------------------------------------
    # 3. Extract JSON object from surrounding text
    # --------------------------------------------------------

    start = cleaned.find("{")
    end = cleaned.rfind("}")

    if (
        start != -1
        and end != -1
        and end > start
    ):

        candidate = cleaned[
            start:end + 1
        ]

        try:

            parsed = json.loads(
                candidate
            )

            if isinstance(parsed, dict):
                return parsed

        except json.JSONDecodeError:
            pass

    # --------------------------------------------------------
    # 4. Failed
    # --------------------------------------------------------

    raise ValueError(
        "Gemini did not return a valid JSON object."
    )


# ============================================================
# GENERATE RESPONSE
# ============================================================

def generate_response(
    question: str,
    history: list[dict],
    system_instruction: str,
    context: str,
) -> AIChatResponse:

    # ========================================================
    # BUILD CONVERSATION HISTORY
    # ========================================================

    contents: list[types.Content] = []

    for message in history:

        role = message.get(
            "role"
        )

        content = message.get(
            "content",
            "",
        )

        if not content:
            continue

        gemini_role = (
            "user"
            if role == "user"
            else "model"
        )

        contents.append(
            types.Content(
                role=gemini_role,
                parts=[
                    types.Part.from_text(
                        text=content
                    )
                ],
            )
        )

    # ========================================================
    # CURRENT USER MESSAGE
    # ========================================================

    contents.append(
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(
                    text=question
                )
            ],
        )
    )

    # ========================================================
    # BUILD SYSTEM INSTRUCTION
    # ========================================================

    enhanced_system_instruction = (
        build_system_instruction(
            system_instruction=system_instruction,
            context=context,
        )
    )

    # ========================================================
    # CALL GEMINI
    # ========================================================

    try:

        response = (
            gemini_client.models.generate_content(
                model=MODEL_NAME,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=(
                        enhanced_system_instruction
                    ),
                    response_mime_type=(
                        "application/json"
                    ),
                ),
            )
        )

    except Exception as exc:

        print(
            "\n========== GEMINI API ERROR =========="
        )

        print(
            repr(exc)
        )

        print(
            "======================================\n"
        )

        raise RuntimeError(
            "Gemini request failed."
        ) from exc

    # ========================================================
    # RAW RESPONSE
    # ========================================================

    raw_response = (
        response.text or ""
    ).strip()

    print(
        "\n========== GEMINI RAW RESPONSE =========="
    )

    print(
        raw_response
    )

    print(
        "==========================================\n"
    )

    if not raw_response:

        raise ValueError(
            "Gemini returned an empty response."
        )

    # ========================================================
    # PARSE JSON
    # ========================================================

    try:

        parsed = extract_json(
            raw_response
        )

    except Exception as exc:

        print(
            "\n========== JSON PARSE ERROR =========="
        )

        print(
            f"Error: {exc}"
        )

        print(
            "Raw response:"
        )

        print(
            raw_response
        )

        print(
            "======================================\n"
        )

        raise ValueError(
            "Gemini returned invalid JSON."
        ) from exc

    # ========================================================
    # PYDANTIC VALIDATION
    # ========================================================

    try:

        ai_response = (
            AIChatResponse.model_validate(
                parsed
            )
        )

    except Exception as exc:

        print(
            "\n========== AI RESPONSE VALIDATION ERROR =========="
        )

        print(
            f"Error: {exc}"
        )

        print(
            "Parsed response:"
        )

        print(
            json.dumps(
                parsed,
                indent=4,
            )
        )

        print(
            "===================================================\n"
        )

        raise ValueError(
            "Gemini returned an invalid "
            "Health Copilot response."
        ) from exc

    # ========================================================
    # ACTION SAFETY CHECK
    # ========================================================

    if ai_response.action:

        if (
            ai_response.action.requires_confirmation
            is not True
        ):

            raise ValueError(
                "AI action must require confirmation."
            )

        if not isinstance(
            ai_response.action.payload,
            dict,
        ):

            raise ValueError(
                "AI action payload must be an object."
            )

    # ========================================================
    # RETURN
    # ========================================================

    return ai_response