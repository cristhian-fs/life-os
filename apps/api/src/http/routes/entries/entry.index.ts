import { createRouter } from "@/lib/create-app";
import { loggedIn } from "@/http/middlewares/logged-in";

import * as handlers from "./entry.handlers";
import * as routes from "./entry.routes";

const router = createRouter();
router.use("*", loggedIn);

export default router
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.update, handlers.update)
  .openapi(routes.deleteEntry, handlers.deleteEntry);
