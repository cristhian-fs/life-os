import { loggedIn } from "@/http/middlewares/logged-in";
import { createRouter } from "@/lib/create-app";
import * as handlers from "./purchase-wishlist.handlers";
import * as routes from "./purchase-wishlist.routes";

const router = createRouter();
router.use("*", loggedIn);

export default router
  .openapi(routes.list, handlers.list)
  .openapi(routes.get, handlers.get)
  .openapi(routes.create, handlers.create)
  .openapi(routes.update, handlers.update)
  .openapi(routes.deletePurchaseWishlist, handlers.deletePurchaseWishlist);
