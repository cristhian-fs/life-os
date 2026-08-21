import type { HistoryBarPoint } from "@/reports/build-history-bar";
import type { HistoryBarPointResponse } from "@/schemas/habits.schema";

export class HistoryBarPresenter {
  static toHTTP(point: HistoryBarPoint): HistoryBarPointResponse {
    return {
      date: point.date.toISOString(),
      count: point.count,
    };
  }

  static toHTTPList(points: HistoryBarPoint[]): HistoryBarPointResponse[] {
    return points.map(HistoryBarPresenter.toHTTP);
  }
}
