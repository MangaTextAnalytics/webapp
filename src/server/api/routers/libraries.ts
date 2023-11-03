import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { Frequency } from "~/server/api/routers/mangas";
import { Manga as SchemaManga, Library as SchemaLibrary, LibraryFrequency as SchemaLibraryFrequency } from "@prisma/client";

interface Library extends SchemaLibrary {
  frequencies: Frequency[];
}

const updateLibraryManga = async (ctx: any, library: SchemaLibrary, mangaId: number, add: boolean) => {
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
        manga_id: mangaId,
      },
    })

    for(let mangaFreq of mangaFrequencies) {
      let libFreq = await ctx.db.libraryFrequency.findFirst({
        where: {
          termTerm: mangaFreq.termTerm,
          library_id: library.id,
        },
      });

      // if it's already in the library, update the count
      if(libFreq) {
        // Increment the count in LibraryFrequency
        libFreq = await ctx.db.libraryFrequency.update({
          where: {
            id: libFreq.id,
          },
          data: {
            count: {
              [add ? "increment" : "decrement"]: mangaFreq.count,
            },
          },
        });

        // If the count is 0, delete the LibraryFrequency
        if(libFreq.count == 0) {
          await ctx.db.libraryFrequency.delete({ where: { id: libFreq.id } });
        }
      } else if(add) {
        // Otherwise, create a new LibraryFrequency
        libFreq = await ctx.db.libraryFrequency.create({
          data: {
            library_id: library.id,
            termTerm: mangaFreq.termTerm,
            count: mangaFreq.count,
          },
        });
      }
    }
}

const updateLibraryStats = async (ctx: any, library: SchemaLibrary) => {
    const newLib: SchemaLibrary = {
      id: library.id,
      userId: library.userId,
      totalWords: 0,
      uniqueWords: 0,
      wordsUsedOnce: 0,
      wordsUsedOncePct: 0,
    }

    const libFreqs = await ctx.db.libraryFrequency.findMany({
      where: {
        library_id: library.id,
      },
    });

    for(let libFreq of libFreqs) {
      newLib.totalWords += libFreq.count;
      newLib.uniqueWords++;
      if(libFreq.count == 1) {
        newLib.wordsUsedOnce++;
      }
    }
    newLib.wordsUsedOncePct = (100 * newLib.wordsUsedOnce / newLib.uniqueWords ) || 0;

    await ctx.db.library.update({
      where: {
        id: library.id,
      },
      data: {
        totalWords: newLib.totalWords,
        uniqueWords: newLib.uniqueWords,
        wordsUsedOnce: newLib.wordsUsedOnce,
        wordsUsedOncePct: newLib.wordsUsedOncePct,
      },
    });
}

const getOrCreateLibrary = async (ctx: any): Promise<SchemaLibrary> => {
    let library = await ctx.db.library.findFirst({
      where: { userId: ctx.session.user.id },
    });

    if(!library) {
      // create a new library
      library = await ctx.db.library.create({
        data: {
          userId: ctx.session.user.id,
        },
      });
    }

    return library;
}

export const libraryRouter = createTRPCRouter({
  getCurrentLibrary: protectedProcedure.query(async ({ ctx }) => {
    const library: Partial<Library> = await getOrCreateLibrary(ctx);

    // link the frequencies
    const frequencies: Partial<SchemaLibraryFrequency>[] = await ctx.db.libraryFrequency.findMany({
      where: {
        library_id: library.id,
      },
      orderBy: { count: "desc" },
    });

    for(let frequency of frequencies) {
      delete frequency.library_id;
      delete frequency.id;
    }
    library.frequencies = frequencies as Frequency[];

    return library as Library;
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
      return updateLibraryStats(ctx, library);
    }),
});
