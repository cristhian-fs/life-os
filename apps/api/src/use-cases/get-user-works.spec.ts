import { beforeEach, describe, expect, it } from "vitest";
import { WorkType } from "@/db/entities/work.entity";
import { InMemoryArticleDetailRepository } from "@/repositories/in-memory/in-memory-article-detail-repository";
import { InMemoryBookDetailRepository } from "@/repositories/in-memory/in-memory-book-detail-repository";
import { InMemoryCourseDetailRepository } from "@/repositories/in-memory/in-memory-course-detail-repository";
import { InMemoryMovieDetailRepository } from "@/repositories/in-memory/in-memory-movie-detail-repository";
import { InMemoryWorkRepository } from "@/repositories/in-memory/in-memory-work-repository";
import { makeWork } from "@/test/factories";
import { GetUserWorksUseCase } from "./get-user-works";

let worksRepository: InMemoryWorkRepository;
let bookDetailRepository: InMemoryBookDetailRepository;
let movieDetailRepository: InMemoryMovieDetailRepository;
let articleDetailRepository: InMemoryArticleDetailRepository;
let courseDetailRepository: InMemoryCourseDetailRepository;
let sut: GetUserWorksUseCase;

describe("Get User Works Use Case", () => {
  beforeEach(() => {
    worksRepository = new InMemoryWorkRepository();
    bookDetailRepository = new InMemoryBookDetailRepository();
    movieDetailRepository = new InMemoryMovieDetailRepository();
    articleDetailRepository = new InMemoryArticleDetailRepository();
    courseDetailRepository = new InMemoryCourseDetailRepository();
    sut = new GetUserWorksUseCase(worksRepository, {
      book: bookDetailRepository,
      movie: movieDetailRepository,
      article: articleDetailRepository,
      course: courseDetailRepository,
    });
  });

  it("should return every work type for the user, each with its own detail relation loaded", async () => {
    const book = await worksRepository.create(
      makeWork({ user_id: "user_01", type: WorkType.BOOK }),
    );
    const bookDetail = await bookDetailRepository.create({
      work_id: book.id,
      isbn: "9780618968633",
    });

    const movie = await worksRepository.create(
      makeWork({ user_id: "user_01", type: WorkType.MOVIE }),
    );
    const movieDetail = await movieDetailRepository.create({
      work_id: movie.id,
      director: "Christopher Nolan",
    });

    const article = await worksRepository.create(
      makeWork({ user_id: "user_01", type: WorkType.ARTICLE }),
    );
    const articleDetail = await articleDetailRepository.create({
      work_id: article.id,
      source_name: "Some Blog",
    });

    const course = await worksRepository.create(
      makeWork({ user_id: "user_01", type: WorkType.COURSE }),
    );
    const courseDetail = await courseDetailRepository.create({
      work_id: course.id,
      platform: "Some Platform",
    });

    const { works } = await sut.execute({ userId: "user_01" });

    expect(works).toHaveLength(4);

    const byId = Object.fromEntries(works.map((work) => [work.id, work]));
    expect(byId[book.id].bookDetail).toEqual(bookDetail);
    expect(byId[movie.id].movieDetail).toEqual(movieDetail);
    expect(byId[article.id].articleDetail).toEqual(articleDetail);
    expect(byId[course.id].courseDetail).toEqual(courseDetail);
  });

  it("should return null for the relation when no detail row exists yet", async () => {
    const book = await worksRepository.create(
      makeWork({ user_id: "user_01", type: WorkType.BOOK }),
    );

    const { works } = await sut.execute({ userId: "user_01" });

    expect(works).toEqual([
      expect.objectContaining({ id: book.id, bookDetail: null }),
    ]);
  });

  it("should not return work items belonging to another user", async () => {
    await worksRepository.create(makeWork({ user_id: "user_02" }));

    const { works } = await sut.execute({ userId: "user_01" });

    expect(works).toEqual([]);
  });
});
