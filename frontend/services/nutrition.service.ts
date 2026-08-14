import api from "@/lib/api";

/* ============================================================================
 * Enums
 * ========================================================================== */

export type MealType =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack";

export type SortOrder =
  | "asc"
  | "desc";

/* ============================================================================
 * Food search
 * ========================================================================== */

export interface FoodSearchItem {
  id: string;
  name: string;
  source: string;

  calories_per_100g: number;
  protein_g_per_100g: number;
  carbs_g_per_100g: number;
  fat_g_per_100g: number;
  fiber_g_per_100g: number;
}

export interface FoodSearchResponse {
  items: FoodSearchItem[];
}

/* ============================================================================
 * Nutrition
 * ========================================================================== */

export interface NutritionItem {
  id: string;
  user_id: string;

  food_name: string;

  quantity: number;
  unit: string;

  meal_type: MealType;

  notes: string | null;

  recorded_at: string;

  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;

  source: string | null;
  source_food_id: string | null;

  created_at: string;
}

export interface NutritionListResponse {
  items: NutritionItem[];

  total: number;
  page: number;
  limit: number;
  pages: number;
}

/* ============================================================================
 * Requests
 * ========================================================================== */

export interface NutritionCreateRequest {
  food_id: string;

  quantity: number;

  unit?: string;

  meal_type: MealType;

  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;

  notes?: string | null;

  recorded_at?: string | null;
}

export interface NutritionUpdateRequest {
  food_id?: string | null;

  quantity?: number | null;

  unit?: string | null;

  meal_type?: MealType | null;

  calories?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
  fiber_g?: number | null;

  notes?: string | null;

  recorded_at?: string | null;
}

/* ============================================================================
 * Search
 * ========================================================================== */

export const searchFood = (
  query: string
) => {
  return api.get<FoodSearchResponse>(
    "/nutrition/search",
    {
      params: {
        q: query,
      },
    }
  );
};

/* ============================================================================
 * Nutrition CRUD
 * ========================================================================== */

export const createNutrition = (
  data: NutritionCreateRequest
) => {
  return api.post<NutritionItem>(
    "/nutrition",
    data
  );
};

export const getNutrition = (
  page = 1,
  limit = 20,
  sort: SortOrder = "desc"
) => {
  return api.get<NutritionListResponse>(
    "/nutrition",
    {
      params: {
        page,
        limit,
        sort,
      },
    }
  );
};

export const updateNutrition = (
  nutritionId: string,
  data: NutritionUpdateRequest
) => {
  return api.patch<NutritionItem>(
    `/nutrition/${nutritionId}`,
    data
  );
};

export const deleteNutrition = (
  nutritionId: string
) => {
  return api.delete<{
    message: string;
  }>(
    `/nutrition/${nutritionId}`
  );
};