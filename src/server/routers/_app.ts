import { router } from "../trpc";
import { promptRouter } from "./prompt";

export const appRouter = router({
  prompt: promptRouter,
});

export type AppRouter = typeof appRouter;
