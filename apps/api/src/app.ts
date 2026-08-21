import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import habit from "@/http/routes/habits/habit.index";
import entry from "@/http/routes/entries/entry.index";

const app = createApp();

configureOpenAPI(app);

const routes = [habit, entry] as const;

routes.forEach((route) => {
  app.route("/api", route);
});

export type AppType = (typeof routes)[number];

export default app;
