import type { Streak } from "@/reports/build-best-streaks";
import type { StreakResponse } from "@/schemas/habits.schema";

export class StreakPresenter {
  static toHTTP(streak: Streak): StreakResponse {
    return {
      from: streak.from.toISOString(),
      to: streak.to.toISOString(),
      streak_num: streak.streak_num,
    };
  }

  static toHTTPList(streaks: Streak[]): StreakResponse[] {
    return streaks.map(StreakPresenter.toHTTP);
  }
}
