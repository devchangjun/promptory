import { router } from "../trpc";
import { promptRouter } from "./prompt";
import { collectionRouter } from "./collection";

export const appRouter = router({
  prompt: promptRouter,
  collection: collectionRouter,
});

export type AppRouter = typeof appRouter;
