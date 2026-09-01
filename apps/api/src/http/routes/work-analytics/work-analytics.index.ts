import { loggedIn } from "@/http/middlewares/logged-in";
import { createRouter } from "@/lib/create-app";
import * as handlers from "./work-analytics.handlers";
import * as routes from "./work-analytics.routes";

const router = createRouter();
router.use("*", loggedIn);

export default router
  .openapi(routes.backlog, handlers.backlog)
  .openapi(routes.statusFunnel, handlers.statusFunnel)
  .openapi(routes.completedCount, handlers.completedCount)
  .openapi(routes.avgWishlistWaitTime, handlers.avgWishlistWaitTime)
  .openapi(routes.summary, handlers.summary);
