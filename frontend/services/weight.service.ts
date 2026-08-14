import api from "@/lib/api";

export interface Weight {
  id: string;
  weight_kg: number;
  notes: string | null;
  recorded_at: string;
  created_at: string;
}

export interface WeightListResponse {
  items: Weight[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface WeightStats {
  current_weight: number;
  starting_weight: number;
  target_weight: number;
  weight_change: number;
  remaining_to_goal: number;
  goal_progress_percent: number;
  entries: number;
  latest_recorded_at: string;
}

export interface CreateWeightData {
  weight_kg: number;
  notes?: string | null;
  recorded_at?: string;
}

export interface UpdateWeightData {
  weight_kg: number;
  notes?: string | null;
  recorded_at?: string;
}

export const createWeight = (data: CreateWeightData) =>
  api.post<Weight>("/weights", data);

export const getWeights = (
  page = 1,
  limit = 100,
  sort: "asc" | "desc" = "asc"
) =>
  api.get<WeightListResponse>("/weights", {
    params: {
      page,
      limit,
      sort,
    },
  });

export const getLatestWeight = () =>
  api.get<Weight>("/weights/latest");

export const getWeightStats = () =>
  api.get<WeightStats>("/weights/stats");

export const updateWeight = (
  weightId: string,
  data: UpdateWeightData
) =>
  api.patch<Weight>(
    `/weights/${weightId}`,
    data
  );

export const deleteWeight = (weightId: string) =>
  api.delete<{ message: string }>(
    `/weights/${weightId}`
  );