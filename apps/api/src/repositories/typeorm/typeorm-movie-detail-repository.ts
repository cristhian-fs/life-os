import type { DataSource, DeepPartial, Repository } from "typeorm";
import { MovieDetail } from "@/db/entities/movie-detail.entity";
import type {
  CreateMovieDetailInput,
  MovieDetailRepository,
} from "@/repositories/movie-detail-repository";

export class TypeORMMovieDetailRepository implements MovieDetailRepository {
  protected readonly repo: Repository<MovieDetail>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(MovieDetail);
  }
  async create(movieDetail: CreateMovieDetailInput): Promise<MovieDetail> {
    const data = await this.repo.save(this.repo.create(movieDetail));

    return data;
  }
  async findByWorkId(workId: string): Promise<MovieDetail | null> {
    return this.repo.findOneBy({ work_id: workId });
  }
  async save(movieDetail: MovieDetail): Promise<MovieDetail> {
    const existing = await this.repo.findOneBy({
      work_id: movieDetail.work_id,
    });
    if (!existing) {
      throw new Error(
        `Cannot save movie detail ${movieDetail.work_id}: not found in repository`,
      );
    }
    const merged = this.repo.merge(
      existing,
      movieDetail as DeepPartial<MovieDetail>,
    );
    return this.repo.save(merged);
  }
}
