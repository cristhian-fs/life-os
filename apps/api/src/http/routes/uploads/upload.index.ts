import { loggedIn } from "@/http/middlewares/logged-in";
import { createRouter } from "@/lib/create-app";
import * as handlers from "./upload.handlers";
import * as routes from "./upload.routes";

const router = createRouter();
router.use("*", loggedIn);

export default router
  .openapi(routes.uploadImage, handlers.uploadImage)
  .openapi(routes.fetchOgImage, handlers.fetchOgImage);
