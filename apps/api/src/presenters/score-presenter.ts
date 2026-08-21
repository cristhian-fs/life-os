import type { ScorePoint } from "@/reports/build-score-history";
import type { ScorePointResponse } from "@/schemas/habits.schema";

export class ScorePresenter {
  static toHTTP(point: ScorePoint): ScorePointResponse {
    return {
      date: point.date.toISOString(),
      percentage: point.percentage,
    };
  }

  static toHTTPList(points: ScorePoint[]): ScorePointResponse[] {
    return points.map(ScorePresenter.toHTTP);
  }
}
