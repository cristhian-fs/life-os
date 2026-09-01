import "reflect-metadata";
import { AppDataSource } from "@/db/data-source";
import { WorkStatus, WorkType } from "@/db/entities/work.entity";
import { TypeORMWorkRepository } from "@/repositories/typeorm/typeorm-work-repository";
import { TypeORMBookDetailRepository } from "@/repositories/typeorm/typeorm-book-detail-repository";

const USER_ID = "C8T3UE4KX8aMnPsguAHLcLUp7NoSK4L7";

interface BookSeed {
  title: string;
  author: string;
  startedAt: Date | null;
  completedAt: Date;
  rating: number;
}

// Todas as datas em 2026
const BOOKS: BookSeed[] = [
  {
    title: "Noites brancas",
    author: "Fiódor Dostoiévski",
    startedAt: new Date("2026-01-15"),
    completedAt: new Date("2026-01-30"),
    rating: 5,
  },
  {
    title: "A metamorfose",
    author: "Franz Kafka",
    startedAt: null,
    completedAt: new Date("2026-02-19"),
    rating: 5,
  },
  {
    title: "A morte de Ivan Ilitch",
    author: "Liev Tolstói",
    startedAt: new Date("2026-02-27"),
    completedAt: new Date("2026-03-03"),
    rating: 5,
  },
  {
    title: "Memórias do subsolo",
    author: "Fiódor Dostoiévski",
    startedAt: null,
    completedAt: new Date("2026-03-31"),
    rating: 5,
  },
  {
    title: "1984",
    author: "George Orwell",
    startedAt: new Date("2026-05-23"),
    completedAt: new Date("2026-07-06"),
    rating: 5,
  },
  {
    title: "Revolução dos bichos",
    author: "George Orwell",
    startedAt: new Date("2026-06-08"),
    completedAt: new Date("2026-06-11"),
    rating: 5,
  },
  {
    title: "Crime e castigo",
    author: "Fiódor Dostoiévski",
    startedAt: new Date("2026-06-12"), // 1 dia após terminar Revolução dos bichos
    completedAt: new Date("2026-07-21"),
    rating: 5,
  },
  {
    title: "O estrangeiro",
    author: "Albert Camus",
    startedAt: new Date("2026-07-30"),
    completedAt: new Date("2026-08-01"),
    rating: 5,
  },
  {
    title: "De quanta terra precisa um homem? E outras histórias",
    author: "Liev Tolstói",
    startedAt: new Date("2026-08-03"),
    completedAt: new Date("2026-08-06"),
    rating: 5,
  },
  {
    title: "Vidas secas",
    author: "Graciliano Ramos",
    startedAt: new Date("2026-08-07"),
    completedAt: new Date("2026-08-12"),
    rating: 3,
  },
  {
    title: "Admirável Mundo Novo",
    author: "Aldous Huxley",
    startedAt: new Date("2026-08-13"),
    completedAt: new Date("2026-08-27"),
    rating: 4,
  },
];

async function seed() {
  const dataSource = await AppDataSource.initialize();

  const workRepository = new TypeORMWorkRepository(dataSource);
  const bookDetailRepository = new TypeORMBookDetailRepository(dataSource);

  for (const book of BOOKS) {
    const work = await workRepository.create({
      user_id: USER_ID,
      type: WorkType.BOOK,
      title: book.title,
      creator: book.author,
      status: WorkStatus.COMPLETED,
      rating: book.rating,
      started_at: book.startedAt ?? undefined,
      completed_at: book.completedAt,
      external_url: null,
    });

    await bookDetailRepository.create({
      work_id: work.id,
      isbn: null,
      pages: null,
      publisher: null,
    });

    console.log(`Seeded: ${book.title}`);
  }

  await dataSource.destroy();
  console.log(`\nDone. ${BOOKS.length} books seeded.`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
