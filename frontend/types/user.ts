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

  height_cm: string;

  gender: Gender;

  date_of_birth: string;

  activity_level: ActivityLevel;

  goal: Goal;

  diet_preference: DietPreference;

  medical_conditions: string;

  food_allergies: string;

  bio: string;
}

export interface ProfileUpdateData {
  full_name?: string;

  profile_picture?: string | null;

  height_cm?: number | null;

  gender?: Gender;

  date_of_birth?: string | null;

  activity_level?: ActivityLevel;

  goal?: Goal;

  diet_preference?: DietPreference;

  medical_conditions?: string;

  food_allergies?: string;

  bio?: string;
}