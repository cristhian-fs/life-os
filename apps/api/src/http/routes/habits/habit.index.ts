import { createRouter } from "@/lib/create-app";
import { loggedIn } from "@/http/middlewares/logged-in";

import * as handlers from "./habit.handlers";
import * as routes from "./habit.routes";

const router = createRouter();
router.use("*", loggedIn);

export default router.openapi(routes.list, handlers.list);
