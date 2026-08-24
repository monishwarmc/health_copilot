from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.weight import router as weight_router
from app.api.nutrition import router as nutrition_router
from app.api.chat import router as chat_router


app = FastAPI()


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Local development
        "http://localhost:3000",
        "http://127.0.0.1:3000",

        # Production frontend
        "https://health-copilot-rouge.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],
    allow_headers=[
        "Authorization",
        "Content-Type",
    ],
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(weight_router)
app.include_router(nutrition_router)
app.include_router(chat_router)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def home():
    return {
        "backend": "Health Copilot"
    }