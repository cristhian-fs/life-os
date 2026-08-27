import { loggedIn } from "@/http/middlewares/logged-in";
import { createRouter } from "@/lib/create-app";
import * as handlers from "./work.handlers";
import * as routes from "./work.routes";

const router = createRouter();
router.use("*", loggedIn);

export default router
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.update, handlers.update)
  .openapi(routes.deleteWork, handlers.deleteWork);
