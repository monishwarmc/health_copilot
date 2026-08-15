import api from "@/lib/api";

import {Weight, WeightStats, WeightListResponse} from "@/types/weight"


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