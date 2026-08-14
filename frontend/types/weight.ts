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
  current_weight: number | null;
  starting_weight: number | null;
  target_weight: number | null;
  weight_change: number;
  remaining_to_goal: number | null;
  goal_progress_percent: number;
  entries: number;
  latest_recorded_at: string | null;
}