import type { MovieDetail } from "@/db/entities/movie-detail.entity";
import type {
  CreateMovieDetailInput,
  MovieDetailRepository,
} from "@/repositories/movie-detail-repository";

export class InMemoryMovieDetailRepository implements MovieDetailRepository {
  public items: MovieDetail[] = [];

  async create(data: CreateMovieDetailInput): Promise<MovieDetail> {
    const movieDetail: MovieDetail = {
      work_id: data.work_id,
      runtime_minutes: data.runtime_minutes ?? null,
      director: data.director ?? null,
    } as MovieDetail;

    this.items.push(movieDetail);
    return movieDetail;
  }

  async findByWorkId(workId: string): Promise<MovieDetail | null> {
    return this.items.find((item) => item.work_id === workId) ?? null;
  }

  async save(movieDetail: MovieDetail): Promise<MovieDetail> {
    const index = this.items.findIndex(
      (item) => item.work_id === movieDetail.work_id,
    );

    if (index === -1)
      throw new Error(
        `Cannot save movie detail ${movieDetail.work_id}: not found in repository`,
      );

    this.items[index] = movieDetail;
    return movieDetail;
  }
}
