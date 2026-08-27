import type { MovieDetail } from "@/db/entities/movie-detail.entity";
import type { DetailRepository } from "./detail-repository";

export type CreateMovieDetailInput = {
  work_id: string;
  runtime_minutes?: number | null;
  director?: string | null;
};

export interface MovieDetailRepository extends DetailRepository<
  MovieDetail,
  CreateMovieDetailInput
> {}
