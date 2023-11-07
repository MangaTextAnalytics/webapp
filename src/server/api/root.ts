import { createTRPCRouter } from "~/server/api/trpc";
import { mangaRouter } from "~/server/api/routers/mangas";
import { libraryRouter } from "./routers/libraries";
import { frequencyRouter } from "./routers/frequencies";
import { statsRouter } from "./routers/stats";
import { volumeRouter } from "./routers/volumes";
import { termRouter } from "./routers/terms";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  term: termRouter,
  stats: statsRouter,
  mangas: mangaRouter,
  volumes: volumeRouter,
  libraries: libraryRouter,
  frequencies: frequencyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
