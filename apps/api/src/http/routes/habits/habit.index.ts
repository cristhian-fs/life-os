import { createRouter } from "@/lib/create-app";
import { loggedIn } from "@/http/middlewares/logged-in";

import * as handlers from "./habit.handlers";
import * as routes from "./habit.routes";

const router = createRouter();
router.use("*", loggedIn);

export default router
  .openapi(routes.list, handlers.list)
  .openapi(routes.today, handlers.today)
  .openapi(routes.progressSummary, handlers.progressSummary)
  .openapi(routes.get, handlers.get)
  .openapi(routes.update, handlers.update)
  .openapi(routes.create, handlers.create)
  .openapi(routes.deleteHabit, handlers.deleteHabit)
  .openapi(routes.archiveHabit, handlers.archiveHabit)
  .openapi(routes.bestStreaks, handlers.bestStreaks)
  .openapi(routes.scoreHistory, handlers.scoreHistory)
  .openapi(routes.historyBar, handlers.historyBar)
  .openapi(routes.calendarMap, handlers.calendarMap);
