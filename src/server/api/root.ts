import { createTRPCRouter } from "~/server/api/trpc";
import { mangaRouter } from "~/server/api/routers/mangas";
import { libraryRouter } from "./routers/libraries";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  mangas: mangaRouter,
  libraries: libraryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
