export type AuthProvider =
  | "local"
  | "google";

export type Gender =
  | "male"
  | "female"
  | "other";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type Goal =
  | "lose_weight"
  | "gain_weight"
  | "build_muscle"
  | "maintain";

export type DietPreference =
  | "none"
  | "vegetarian"
  | "vegan"
  | "eggetarian"
  | "pescatarian";

export interface User {
  id: string;

  full_name: string;

  email: string;

  profile_picture: string | null;

  created_at: string;

  auth_provider: AuthProvider;

  height_cm: number | null;

  target_weight_kg: number | null;

  gender: Gender | null;

  date_of_birth: string | null;

  activity_level: ActivityLevel | null;

  goal: Goal | null;

  diet_preference: DietPreference | null;

  medical_conditions: string | null;

  food_allergies: string | null;

  bio: string | null;
}

export interface ProfileUpdateData {
  full_name?: string;

  profile_picture?: string | null;

  height_cm?: number | null;

  target_weight_kg?: number | null;

  gender?: Gender;

  date_of_birth?: string | null;

  activity_level?: ActivityLevel;

  goal?: Goal;

  diet_preference?: DietPreference;

  medical_conditions?: string | null;

  food_allergies?: string | null;

  bio?: string | null;
}
