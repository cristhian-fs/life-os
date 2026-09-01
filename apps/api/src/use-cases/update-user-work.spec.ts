import { beforeEach, describe, expect, it } from "vitest";
import { WorkStatus, WorkType } from "@/db/entities/work.entity";
import { InMemoryArticleDetailRepository } from "@/repositories/in-memory/in-memory-article-detail-repository";
import { InMemoryBookDetailRepository } from "@/repositories/in-memory/in-memory-book-detail-repository";
import { InMemoryCourseDetailRepository } from "@/repositories/in-memory/in-memory-course-detail-repository";
import { InMemoryMovieDetailRepository } from "@/repositories/in-memory/in-memory-movie-detail-repository";
import { InMemoryVideoDetailRepository } from "@/repositories/in-memory/in-memory-video-detail-repository";
import { InMemoryWorkRepository } from "@/repositories/in-memory/in-memory-work-repository";
import { makeWork } from "@/test/factories";
import { UpdateUserWorkUseCase } from "./update-user-work";

let worksRepository: InMemoryWorkRepository;
let bookDetailRepository: InMemoryBookDetailRepository;
let movieDetailRepository: InMemoryMovieDetailRepository;
let articleDetailRepository: InMemoryArticleDetailRepository;
let courseDetailRepository: InMemoryCourseDetailRepository;
let videoDetailRepository: InMemoryVideoDetailRepository;
let sut: UpdateUserWorkUseCase;

describe("Update User Work Use Case", () => {
  beforeEach(() => {
    worksRepository = new InMemoryWorkRepository();
    bookDetailRepository = new InMemoryBookDetailRepository();
    movieDetailRepository = new InMemoryMovieDetailRepository();
    articleDetailRepository = new InMemoryArticleDetailRepository();
    courseDetailRepository = new InMemoryCourseDetailRepository();
    videoDetailRepository = new InMemoryVideoDetailRepository();
    sut = new UpdateUserWorkUseCase(worksRepository, {
      book: bookDetailRepository,
      movie: movieDetailRepository,
      article: articleDetailRepository,
      course: courseDetailRepository,
      video: videoDetailRepository,
    });
  });

  it("should be able to update an user work item", async () => {
    const work = await worksRepository.create(
      makeWork({ user_id: "user_01", type: WorkType.BOOK }),
    );

    const { work: updated } = await sut.execute({
      userId: "user_01",
      workId: work.id,
      payload: { title: "Updated title", status: WorkStatus.COMPLETED, rating: 5 },
    });

    expect(updated).toEqual(
      expect.objectContaining({
        title: "Updated title",
        status: WorkStatus.COMPLETED,
        rating: 5,
      }),
    );
  });

  it("should be able to attach an image to an existing work item", async () => {
    const work = await worksRepository.create(
      makeWork({ user_id: "user_01", image_url: null }),
    );

    const { work: updated } = await sut.execute({
      userId: "user_01",
      workId: work.id,
      payload: { image_url: "covers/updated-cover.png" },
    });

    expect(updated?.image_url).toBe("covers/updated-cover.png");
  });

  it("should be able to clear a work item's image", async () => {
    const work = await worksRepository.create(
      makeWork({ user_id: "user_01", image_url: "covers/old-cover.png" }),
    );

    const { work: updated } = await sut.execute({
      userId: "user_01",
      workId: work.id,
      payload: { image_url: null },
    });

    expect(updated?.image_url).toBeNull();
  });

  it("should convert started_at/completed_at strings to dates", async () => {
    const work = await worksRepository.create(
      makeWork({ user_id: "user_01" }),
    );

    const { work: updated } = await sut.execute({
      userId: "user_01",
      workId: work.id,
      payload: {
        started_at: "2024-01-01T00:00:00.000Z",
        completed_at: "2024-02-01T00:00:00.000Z",
      },
    });

    expect(updated?.started_at).toEqual(new Date("2024-01-01T00:00:00.000Z"));
    expect(updated?.completed_at).toEqual(new Date("2024-02-01T00:00:00.000Z"));
  });

  it("should not change the work item's type", async () => {
    const work = await worksRepository.create(
      makeWork({ user_id: "user_01", type: WorkType.BOOK }),
    );

    const { work: updated } = await sut.execute({
      userId: "user_01",
      workId: work.id,
      payload: { title: "New title" },
    });

    expect(updated?.type).toBe(WorkType.BOOK);
  });

  it("should not update a work item that belongs to another user", async () => {
    const work = await worksRepository.create(
      makeWork({ user_id: "user_01" }),
    );

    const { work: updated } = await sut.execute({
      userId: "user_02",
      workId: work.id,
      payload: { title: "Hijacked" },
    });

    expect(updated).toBeNull();
  });

  it("should return null when the work item does not exist", async () => {
    const { work } = await sut.execute({
      userId: "user_01",
      workId: "non-existing-id",
      payload: { title: "Anything" },
    });

    expect(work).toBeNull();
  });

  it("should update the existing detail row for the work item's type", async () => {
    const work = await worksRepository.create(
      makeWork({ user_id: "user_01", type: WorkType.BOOK }),
    );
    await bookDetailRepository.create({
      work_id: work.id,
      isbn: "9780618968633",
      pages: 310,
    });

    await sut.execute({
      userId: "user_01",
      workId: work.id,
      payload: { detail: { pages: 320, publisher: "Allen & Unwin" } },
    });

    const detail = await bookDetailRepository.findByWorkId(work.id);
    expect(detail).toEqual(
      expect.objectContaining({
        isbn: "9780618968633",
        pages: 320,
        publisher: "Allen & Unwin",
      }),
    );
  });

  it("should create a detail row when the work item doesn't have one yet", async () => {
    const work = await worksRepository.create(
      makeWork({ user_id: "user_01", type: WorkType.MOVIE }),
    );

    await sut.execute({
      userId: "user_01",
      workId: work.id,
      payload: { detail: { director: "Denis Villeneuve" } },
    });

    const detail = await movieDetailRepository.findByWorkId(work.id);
    expect(detail).toEqual(
      expect.objectContaining({ director: "Denis Villeneuve" }),
    );
  });

  it("should ignore detail fields that don't belong to the work item's type", async () => {
    const work = await worksRepository.create(
      makeWork({ user_id: "user_01", type: WorkType.MOVIE }),
    );
    await movieDetailRepository.create({
      work_id: work.id,
      director: "Christopher Nolan",
    });

    await sut.execute({
      userId: "user_01",
      workId: work.id,
      // isbn/pages belong to books, not movies — must be dropped
      payload: { detail: { isbn: "123", pages: 1, director: "Denis Villeneuve" } },
    });

    const detail = await movieDetailRepository.findByWorkId(work.id);
    expect(detail).toEqual(
      expect.objectContaining({ director: "Denis Villeneuve" }),
    );
    expect(bookDetailRepository.items).toHaveLength(0);
  });

  it("should convert published_at to a date when updating an article's detail", async () => {
    const work = await worksRepository.create(
      makeWork({ user_id: "user_01", type: WorkType.ARTICLE }),
    );
    await articleDetailRepository.create({
      work_id: work.id,
      source_name: "Some Blog",
    });

    await sut.execute({
      userId: "user_01",
      workId: work.id,
      payload: { detail: { published_at: "2024-01-01T00:00:00.000Z" } },
    });

    const detail = await articleDetailRepository.findByWorkId(work.id);
    expect(detail?.published_at).toEqual(new Date("2024-01-01T00:00:00.000Z"));
  });
});
