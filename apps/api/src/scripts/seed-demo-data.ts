// Seeds a wide spread of demo data (habits + entries, works of every
// type/status, purchase-wishlist items) so every dashboard graph has
// something to draw. Run with `pnpm seed:demo`. Not idempotent — re-running
// adds more rows on top of whatever is already there.
import "reflect-metadata";
import { faker } from "@faker-js/faker";
import { subDays, subMonths } from "date-fns";
import { AppDataSource } from "@/db/data-source";
import { Habit, HabitGoalPeriod, HabitType } from "@/db/entities/habit.entity";
import { Work, WorkStatus, WorkType } from "@/db/entities/work.entity";
import {
  addUTCDays,
  diffInUTCDays,
  utcISODay,
} from "@/reports/date-buckets";
import { TypeORMHabitRepository } from "@/repositories/typeorm/typeorm-habit-repository";
import { TypeORMEntryRepository } from "@/repositories/typeorm/typeorm-entry-repository";
import { TypeORMWorkRepository } from "@/repositories/typeorm/typeorm-work-repository";
import { TypeORMBookDetailRepository } from "@/repositories/typeorm/typeorm-book-detail-repository";
import { TypeORMMovieDetailRepository } from "@/repositories/typeorm/typeorm-movie-detail-repository";
import { TypeORMCourseDetailRepository } from "@/repositories/typeorm/typeorm-course-detail-repository";
import { TypeORMArticleDetailRepository } from "@/repositories/typeorm/typeorm-article-detail-repository";
import { TypeORMVideoDetailRepository } from "@/repositories/typeorm/typeorm-video-detail-repository";
import { TypeORMPurchaseWishlistRepository } from "@/repositories/typeorm/typeorm-purchase-wishlist-repository";

// Same dev user seed-books.ts already writes to. Override with SEED_USER_ID
// to point this at another account.
const USER_ID = process.env.SEED_USER_ID ?? "C8T3UE4KX8aMnPsguAHLcLUp7NoSK4L7";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const toUTCMidnight = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

// -------------------------------------------------------------------------
// Habits + entries
// -------------------------------------------------------------------------

type HabitSeed = {
  name: string;
  type: HabitType;
  unit: string | null;
  goal_value: number | null;
  goal_period: HabitGoalPeriod;
  active_weekdays: number[] | null;
  // chance a *logged* day actually hits the goal — lower it to see broken
  // streaks and low scores on the charts, raise it for long green runs.
  successRate: number;
};

const HABITS: HabitSeed[] = [
  {
    name: "Beber água",
    type: HabitType.NUMERIC,
    unit: "ml",
    goal_value: 2000,
    goal_period: HabitGoalPeriod.DAILY,
    active_weekdays: null,
    successRate: 0.7,
  },
  {
    name: "Exercício físico",
    type: HabitType.BOOLEAN,
    unit: null,
    goal_value: null,
    goal_period: HabitGoalPeriod.DAILY,
    active_weekdays: [1, 2, 3, 4, 5], // weekdays only
    successRate: 0.65,
  },
  {
    name: "Meditar",
    type: HabitType.BOOLEAN,
    unit: null,
    goal_value: null,
    goal_period: HabitGoalPeriod.DAILY,
    active_weekdays: [1, 3, 5], // Mon/Wed/Fri
    successRate: 0.8,
  },
  {
    name: "Ler",
    type: HabitType.NUMERIC,
    unit: "páginas",
    goal_value: 20,
    goal_period: HabitGoalPeriod.DAILY,
    active_weekdays: null,
    successRate: 0.55,
  },
  {
    name: "Correr",
    type: HabitType.NUMERIC,
    unit: "km",
    goal_value: 5,
    goal_period: HabitGoalPeriod.WEEKLY,
    active_weekdays: [6, 7], // weekends only
    successRate: 0.6,
  },
  {
    name: "Dormir cedo",
    type: HabitType.BOOLEAN,
    unit: null,
    goal_value: null,
    goal_period: HabitGoalPeriod.DAILY,
    active_weekdays: null,
    successRate: 0.4, // deliberately rough, for a habit that looks abandoned
  },
];

const SKIP_RATE = 0.18; // chance a given active day never got an entry at all

async function seedHabits() {
  const habitsRepository = new TypeORMHabitRepository(AppDataSource);
  const entriesRepository = new TypeORMEntryRepository(AppDataSource);
  const rawHabitRepo = AppDataSource.getRepository(Habit);

  const today = toUTCMidnight(new Date());
  let entryCount = 0;

  for (const seed of HABITS) {
    const habit = await habitsRepository.create({
      user_id: USER_ID,
      name: seed.name,
      description: null,
      type: seed.type,
      unit: seed.unit,
      goal_value: seed.goal_value,
      goal_period: seed.goal_period,
      active_weekdays: seed.active_weekdays,
    });

    // CreateHabitInput has no created_at — backdate directly so "all"/"6months"/
    // "year" charts have real history instead of a single day.
    const monthsAgo = faker.number.int({ min: 9, max: 11 });
    const createdAt = toUTCMidnight(
      subDays(subMonths(new Date(), monthsAgo), faker.number.int({ min: 0, max: 20 })),
    );
    await rawHabitRepo.update(habit.id, { created_at: createdAt });

    const totalDays = diffInUTCDays(createdAt, today);
    for (let i = 0; i <= totalDays; i++) {
      const day = addUTCDays(createdAt, i);

      if (seed.active_weekdays && !seed.active_weekdays.includes(utcISODay(day))) {
        continue;
      }
      if (faker.datatype.boolean({ probability: SKIP_RATE })) continue;

      const hitsGoal = faker.datatype.boolean({ probability: seed.successRate });

      if (seed.type === HabitType.BOOLEAN) {
        await entriesRepository.create({
          user_id: USER_ID,
          habit_id: habit.id,
          date: day,
          value_boolean: hitsGoal,
        });
      } else {
        const goal = seed.goal_value ?? 1;
        const value_numeric = hitsGoal
          ? faker.number.int({ min: goal, max: Math.round(goal * 1.5) })
          : faker.number.int({ min: Math.max(1, Math.round(goal * 0.3)), max: goal - 1 });

        await entriesRepository.create({
          user_id: USER_ID,
          habit_id: habit.id,
          date: day,
          value_numeric,
        });
      }
      entryCount++;
    }

    console.log(`Habit seeded: ${seed.name} (created ${createdAt.toISOString().slice(0, 10)})`);
  }

  console.log(`-> ${HABITS.length} habits, ${entryCount} entries`);
}

// -------------------------------------------------------------------------
// Works (every type x status) + type-specific detail rows
// -------------------------------------------------------------------------

function workContent(type: WorkType): { title: string; creator: string } {
  switch (type) {
    case WorkType.BOOK:
      return { title: faker.book.title(), creator: faker.book.author() };
    case WorkType.MOVIE:
      return {
        title: capitalize(faker.word.words({ count: { min: 1, max: 4 } })),
        creator: faker.person.fullName(),
      };
    case WorkType.COURSE:
      return {
        title: capitalize(faker.company.buzzPhrase()),
        creator: faker.person.fullName(),
      };
    case WorkType.ARTICLE:
      return {
        title: capitalize(faker.lorem.sentence({ min: 4, max: 9 })).replace(/\.$/, ""),
        creator: faker.company.name(),
      };
    case WorkType.VIDEO:
      return {
        title: capitalize(faker.word.words({ count: { min: 2, max: 6 } })),
        creator: faker.internet.displayName(),
      };
  }
}

async function seedWorkDetail(type: WorkType, workId: string) {
  switch (type) {
    case WorkType.BOOK:
      await new TypeORMBookDetailRepository(AppDataSource).create({
        work_id: workId,
        isbn: faker.string.numeric(13),
        pages: faker.number.int({ min: 80, max: 900 }),
        publisher: faker.book.publisher(),
      });
      return;
    case WorkType.MOVIE:
      await new TypeORMMovieDetailRepository(AppDataSource).create({
        work_id: workId,
        runtime_minutes: faker.number.int({ min: 80, max: 180 }),
        director: faker.person.fullName(),
      });
      return;
    case WorkType.COURSE:
      await new TypeORMCourseDetailRepository(AppDataSource).create({
        work_id: workId,
        platform: faker.helpers.arrayElement([
          "Udemy",
          "Coursera",
          "Alura",
          "Pluralsight",
          "LinkedIn Learning",
        ]),
        instructor: faker.person.fullName(),
        duration_hours: faker.number.float({ min: 1, max: 40, fractionDigits: 1 }),
      });
      return;
    case WorkType.ARTICLE:
      await new TypeORMArticleDetailRepository(AppDataSource).create({
        work_id: workId,
        source_name: faker.company.name(),
        reading_time_minutes: faker.number.int({ min: 3, max: 20 }),
        published_at: faker.date.recent({ days: 300 }).toISOString(),
      });
      return;
    case WorkType.VIDEO:
      await new TypeORMVideoDetailRepository(AppDataSource).create({
        work_id: workId,
        platform: faker.helpers.arrayElement(["YouTube", "Vimeo", "Twitch"]),
        duration_minutes: faker.number.int({ min: 3, max: 180 }),
      });
      return;
  }
}

const WORKS_PER_COMBO = { min: 2, max: 4 };

async function seedWorks(): Promise<{ id: string; type: WorkType }[]> {
  const workRepository = new TypeORMWorkRepository(AppDataSource);
  const rawWorkRepo = AppDataSource.getRepository(Work);

  const now = new Date();
  const created: { id: string; type: WorkType }[] = [];

  for (const type of Object.values(WorkType)) {
    for (const status of Object.values(WorkStatus)) {
      const count = faker.number.int(WORKS_PER_COMBO);

      for (let i = 0; i < count; i++) {
        const { title, creator } = workContent(type);

        // Spread creation across the whole window (0-10 months back) so
        // to_consume items land near "today" too, not just deep history.
        const createdAt = subDays(
          subMonths(now, faker.number.int({ min: 0, max: 10 })),
          faker.number.int({ min: 0, max: 29 }),
        );

        let started_at: Date | undefined;
        let completed_at: Date | undefined;
        let rating: number | undefined;

        if (status !== WorkStatus.TO_CONSUME) {
          started_at = faker.date.soon({ days: 30, refDate: createdAt });
          if (started_at > now) started_at = now;
        }
        if (status === WorkStatus.COMPLETED) {
          completed_at = faker.date.soon({ days: 60, refDate: started_at });
          if (completed_at > now) completed_at = now;
          rating = faker.number.int({ min: 1, max: 5 });
        }
        if (status === WorkStatus.ABANDONED) {
          rating = faker.helpers.maybe(() => faker.number.int({ min: 1, max: 3 }), {
            probability: 0.4,
          });
        }

        const work = await workRepository.create({
          user_id: USER_ID,
          type,
          title,
          creator,
          status,
          rating,
          started_at,
          completed_at,
          external_url: faker.helpers.maybe(() => faker.internet.url(), {
            probability: 0.5,
          }),
        });

        // created_at isn't settable through CreateWorkInput — backdate directly.
        await rawWorkRepo.update(work.id, { created_at: createdAt });

        await seedWorkDetail(type, work.id);

        created.push({ id: work.id, type });
      }
    }
  }

  console.log(`-> ${created.length} works across ${Object.values(WorkType).length} types x ${Object.values(WorkStatus).length} statuses`);
  return created;
}

// -------------------------------------------------------------------------
// Purchase wishlist — mostly linked to books, some standalone
// -------------------------------------------------------------------------

const STANDALONE_ITEMS = [
  "Fone de ouvido bluetooth",
  "Teclado mecânico",
  "Cadeira de escritório",
  "Suporte para monitor",
  "Mochila para notebook",
  "Luminária de mesa",
];

async function seedPurchaseWishlist(works: { id: string; type: WorkType }[]) {
  const repository = new TypeORMPurchaseWishlistRepository(AppDataSource);
  const bookWorks = works.filter((w) => w.type === WorkType.BOOK);

  const ITEM_COUNT = 18;
  for (let i = 0; i < ITEM_COUNT; i++) {
    const linkToWork = faker.datatype.boolean({ probability: 0.65 });
    const work =
      linkToWork && bookWorks.length > 0 && faker.datatype.boolean({ probability: 0.7 })
        ? faker.helpers.arrayElement(bookWorks)
        : linkToWork
          ? faker.helpers.arrayElement(works)
          : null;

    const purchased = faker.datatype.boolean({ probability: 0.5 });

    await repository.create({
      user_id: USER_ID,
      work_id: work?.id ?? null,
      title: work ? null : faker.helpers.arrayElement(STANDALONE_ITEMS),
      estimated_price_in_cents: faker.number.int({ min: 2000, max: 60000 }),
      currency: "BRL",
      store_or_url: faker.helpers.arrayElement([
        "Amazon",
        "Livraria Cultura",
        "Mercado Livre",
        faker.internet.url(),
      ]),
      purchased_at: purchased ? faker.date.recent({ days: 200 }) : null,
    });
  }

  console.log(`-> ${ITEM_COUNT} purchase-wishlist items`);
}

// -------------------------------------------------------------------------

async function seed() {
  await AppDataSource.initialize();

  await seedHabits();
  const works = await seedWorks();
  await seedPurchaseWishlist(works);

  await AppDataSource.destroy();
  console.log("\nDone.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
