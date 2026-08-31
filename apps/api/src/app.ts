import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import habit from "@/http/routes/habits/habit.index";
import entry from "@/http/routes/entries/entry.index";
import work from "@/http/routes/works/work.index";
import upload from "@/http/routes/uploads/upload.index";
import purchaseWishlist from "@/http/routes/purchase-wishlist/purchase-wishlist.index";

const app = createApp();

configureOpenAPI(app);

const routes = [habit, entry, work, upload, purchaseWishlist] as const;

routes.forEach((route) => {
  app.route("/api", route);
});

export type AppType = (typeof routes)[number];

export default app;
