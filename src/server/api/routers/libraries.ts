import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { Library } from "@prisma/client";
import { updateStats } from "./stats";

const updateLibraryManga = async (ctx: any, library: Library, mangaId: number, add: boolean) => {
    // connect/disconnect the library's manga
    await ctx.db.library.update({
      where: {
        id: library.id,
      },
      data: {
        mangas: {
          [add ? "connect" : "disconnect"]: {
            id: mangaId,
          },
        },
      },
    });

    const mangaFrequencies = await ctx.db.frequency.findMany({
      where: {
        mangaId: mangaId,
      },
    })

    for(let mangaFreq of mangaFrequencies) {
      let libFreq = await ctx.db.frequency.findFirst({
        where: {
          termTerm: mangaFreq.termTerm,
          libraryId: library.id,
        },
      });

      // if it's already in the library, update the count
      if(libFreq) {
        // Increment the count in Frequency
        libFreq = await ctx.db.frequency.update({
          where: {
            id: libFreq.id,
          },
          data: {
            count: {
              [add ? "increment" : "decrement"]: mangaFreq.count,
            },
          },
        });

        // If the count is 0, delete the Frequency
        if(libFreq.count == 0) {
          await ctx.db.frequency.delete({ where: { id: libFreq.id } });
        }
      } else if(add) {
        // Otherwise, create a new Frequency
        libFreq = await ctx.db.frequency.create({
          data: {
            libraryId: library.id,
            termTerm: mangaFreq.termTerm,
            count: mangaFreq.count,
          },
        });
      }
    }
}

const getOrCreateLibrary = async (ctx: any): Promise<Library> => {
    let library = await ctx.db.library.findFirst({
      where: { userId: ctx.session.user.id },
    });

    if(!library) {
      // create a new library
      let stats = await ctx.db.stats.create({});
      library = await ctx.db.library.create({
        data: {
          userId: ctx.session.user.id,
          statsId: stats.id,
        },
      });
    }

    return library;
}

export const libraryRouter = createTRPCRouter({
  getCurrentLibrary: protectedProcedure.query(async ({ ctx }) => {
    return await getOrCreateLibrary(ctx);
  }),

  mangaInLibrary: protectedProcedure
    .input(z.object({
      mangaId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.library.findFirst({
        where: {
          userId: ctx.session.user.id,
          mangas: {
            some: {
              id: input.mangaId,
            },
          },
        },
      });

      return !!result;
    }),

    /**
      * Add or remove a manga from the user's library. Returns an empty promise.
      *
      * @param mangaId The ID of the manga to add or remove
      * @param add Whether to add or remove the manga
      */
    updateMangaLibrary: protectedProcedure
    .input(z.object({
      mangaId: z.number(),
      add: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const library = await getOrCreateLibrary(ctx);
      await updateLibraryManga(ctx, library, input.mangaId, input.add);
      return updateStats(ctx, library.statsId, library.id, "library");
    }),
});
