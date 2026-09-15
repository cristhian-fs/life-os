import { createRouter } from "@/lib/create-app";
import { loggedIn } from "@/http/middlewares/logged-in";

import * as handlers from "./topic.handlers";
import * as routes from "./topic.routes";

const router = createRouter();
router.use("*", loggedIn);

export default router
  .openapi(routes.list, handlers.list)
  .openapi(routes.get, handlers.get)
  .openapi(routes.update, handlers.update)
  .openapi(routes.create, handlers.create)
  .openapi(routes.deleteTopic, handlers.deleteTopic)
  .openapi(routes.tree, handlers.tree);
