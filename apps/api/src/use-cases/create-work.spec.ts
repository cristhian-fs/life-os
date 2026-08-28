import { beforeEach, describe, expect, it } from "vitest";
import { WorkStatus, WorkType } from "@/db/entities/work.entity";
import { InMemoryArticleDetailRepository } from "@/repositories/in-memory/in-memory-article-detail-repository";
import { InMemoryBookDetailRepository } from "@/repositories/in-memory/in-memory-book-detail-repository";
import { InMemoryCourseDetailRepository } from "@/repositories/in-memory/in-memory-course-detail-repository";
import { InMemoryMovieDetailRepository } from "@/repositories/in-memory/in-memory-movie-detail-repository";
import { InMemoryWorkRepository } from "@/repositories/in-memory/in-memory-work-repository";
import { CreateWorkUseCase } from "./create-work";

let worksRepository: InMemoryWorkRepository;
let bookDetailRepository: InMemoryBookDetailRepository;
let movieDetailRepository: InMemoryMovieDetailRepository;
let articleDetailRepository: InMemoryArticleDetailRepository;
let courseDetailRepository: InMemoryCourseDetailRepository;
let sut: CreateWorkUseCase;

describe("Create Work Use Case", () => {
  beforeEach(() => {
    worksRepository = new InMemoryWorkRepository();
    bookDetailRepository = new InMemoryBookDetailRepository();
    movieDetailRepository = new InMemoryMovieDetailRepository();
    articleDetailRepository = new InMemoryArticleDetailRepository();
    courseDetailRepository = new InMemoryCourseDetailRepository();
    sut = new CreateWorkUseCase(worksRepository, {
      book: bookDetailRepository,
      movie: movieDetailRepository,
      article: articleDetailRepository,
      course: courseDetailRepository,
    });
  });

  it("should create a book work with its book detail", async () => {
    const { work, detail } = await sut.execute({
      userId: "user_01",
      payload: {
        type: WorkType.BOOK,
        title: "The Hobbit",
        creator: "J.R.R. Tolkien",
        status: WorkStatus.TO_CONSUME,
        image_url: "covers/the-hobbit.png",
        detail: { isbn: "9780618968633", pages: 310, publisher: "Allen & Unwin" },
      },
    });

    expect(work).toEqual(
      expect.objectContaining({
        user_id: "user_01",
        type: WorkType.BOOK,
        title: "The Hobbit",
        image_url: "covers/the-hobbit.png",
      }),
    );
    expect(detail).toEqual(
      expect.objectContaining({ work_id: work.id, isbn: "9780618968633", pages: 310 }),
    );

    expect(bookDetailRepository.items).toHaveLength(1);
    expect(movieDetailRepository.items).toHaveLength(0);
    expect(articleDetailRepository.items).toHaveLength(0);
    expect(courseDetailRepository.items).toHaveLength(0);
  });

  it("should create a movie work with its movie detail", async () => {
    const { work, detail } = await sut.execute({
      userId: "user_01",
      payload: {
        type: WorkType.MOVIE,
        title: "Interstellar",
        creator: "Christopher Nolan",
        status: WorkStatus.COMPLETED,
        detail: { runtime_minutes: 169, director: "Christopher Nolan" },
      },
    });

    expect(work).toEqual(
      expect.objectContaining({
        type: WorkType.MOVIE,
        title: "Interstellar",
        image_url: null,
      }),
    );
    expect(detail).toEqual(
      expect.objectContaining({ work_id: work.id, runtime_minutes: 169 }),
    );

    expect(movieDetailRepository.items).toHaveLength(1);
    expect(bookDetailRepository.items).toHaveLength(0);
    expect(articleDetailRepository.items).toHaveLength(0);
    expect(courseDetailRepository.items).toHaveLength(0);
  });

  it("should create an article work with its article detail", async () => {
    const { work, detail } = await sut.execute({
      userId: "user_01",
      payload: {
        type: WorkType.ARTICLE,
        title: "A Brief History of Time Zones",
        creator: "Some Blog",
        status: WorkStatus.IN_PROGRESS,
        detail: {
          source_name: "Some Blog",
          reading_time_minutes: 12,
          published_at: "2024-01-01T00:00:00.000Z",
        },
      },
    });

    expect(work).toEqual(
      expect.objectContaining({ type: WorkType.ARTICLE, title: "A Brief History of Time Zones" }),
    );
    expect(detail).toEqual(
      expect.objectContaining({
        work_id: work.id,
        source_name: "Some Blog",
        reading_time_minutes: 12,
        published_at: new Date("2024-01-01T00:00:00.000Z"),
      }),
    );

    expect(articleDetailRepository.items).toHaveLength(1);
    expect(bookDetailRepository.items).toHaveLength(0);
    expect(movieDetailRepository.items).toHaveLength(0);
    expect(courseDetailRepository.items).toHaveLength(0);
  });

  it("should create a course work with its course detail", async () => {
    const { work, detail } = await sut.execute({
      userId: "user_01",
      payload: {
        type: WorkType.COURSE,
        title: "TypeScript Deep Dive",
        creator: "Some Platform",
        status: WorkStatus.ABANDONED,
        detail: { platform: "Some Platform", instructor: "Jane Doe", duration_hours: 8.5 },
      },
    });

    expect(work).toEqual(
      expect.objectContaining({ type: WorkType.COURSE, title: "TypeScript Deep Dive" }),
    );
    expect(detail).toEqual(
      expect.objectContaining({ work_id: work.id, platform: "Some Platform", duration_hours: 8.5 }),
    );

    expect(courseDetailRepository.items).toHaveLength(1);
    expect(bookDetailRepository.items).toHaveLength(0);
    expect(movieDetailRepository.items).toHaveLength(0);
    expect(articleDetailRepository.items).toHaveLength(0);
  });

  it("should persist a backdated started_at/completed_at set at creation", async () => {
    const { work } = await sut.execute({
      userId: "user_01",
      payload: {
        type: WorkType.BOOK,
        title: "Dune",
        creator: "Frank Herbert",
        status: WorkStatus.COMPLETED,
        started_at: "2023-01-01T00:00:00.000Z",
        completed_at: "2023-02-01T00:00:00.000Z",
        detail: {},
      },
    });

    expect(work.started_at).toEqual(new Date("2023-01-01T00:00:00.000Z"));
    expect(work.completed_at).toEqual(new Date("2023-02-01T00:00:00.000Z"));
  });
});
