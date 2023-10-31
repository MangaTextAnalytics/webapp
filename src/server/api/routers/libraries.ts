import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { Frequency, Manga, updateMangas } from "~/server/api/routers/mangas";
import { Library as SchemaLibrary, LibraryFrequency as SchemaLibraryFrequency } from "@prisma/client";

interface Library extends SchemaLibrary {
  frequencies: Frequency[];
}

export const libraryRouter = createTRPCRouter({
  getCurrentLibrary: protectedProcedure.query(async ({ ctx }) => {
    let schemaResult = await ctx.db.library.findFirst({
      where: { userId: ctx.session.user.id },
    });

    if(!schemaResult) {
      // create a new library
      schemaResult = await ctx.db.library.create({
        data: {
          userId: ctx.session.user.id,
        },
      });
    }
    const result = schemaResult as Partial<Library>;

    // update the frequencies
    const frequencies: Partial<SchemaLibraryFrequency>[] = await ctx.db.libraryFrequency.findMany({
      where: {
        library_id: result.id,
      },
      orderBy: { count: "desc" },
    });

    for(let frequency of frequencies) {
      delete frequency.library_id;
      delete frequency.id;
    }
    result.frequencies = frequencies as Frequency[];

    return result as Library;
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


    addMangaToLibrary: protectedProcedure
    .input(z.object({
      mangaId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // link the manga to the library
      const library = await ctx.db.library.upsert({
        where: {
          userId: ctx.session.user.id,
        },
        create: {
          userId: ctx.session.user.id,
          // Other fields for Library creation
          mangas: {
            connect: {
              id: input.mangaId,
            },
          },
        },
        update: {
          mangas: {
            connect: {
              id: input.mangaId,
            },
          },
        },
      });

      // update the library's frequencies and counts
      const frequencies = await ctx.db.frequency.findMany({
        where: {
          manga_id: input.mangaId,
        },
      })

      for(let freq of frequencies) { 
        const libFreq = await ctx.db.libraryFrequency.upsert({
          where: {
            termTerm_library_id: {
              termTerm: freq.termTerm,
              library_id: library.id,
            },
          },
          create: {
            count: freq.count,
            term: {
              connect: {
                term: freq.termTerm,
              },
            },
            library: {
              connect: {
                id: library.id,
              },
            },
          },
          update: {
            count: {
              increment: freq.count,
            },
          },
        });

        // update library based on the new frequency (freq)
        library.totalWords += freq.count;
        if(freq.count == 1 && libFreq.count == 1) {
          // new word used once
          library.wordsUsedOnce++;
        }
      }

      const count = await ctx.db.libraryFrequency.count({
        where: {
          library_id: library.id,
        },
      });

      // update totals
      library.uniqueWords = count;
      library.wordsUsedOncePct = 100 * library.wordsUsedOnce / library.uniqueWords;

      // update the library
      await ctx.db.library.update({
        where: {
          id: library.id,
        },
        data: {
          totalWords: library.totalWords,
          uniqueWords: library.uniqueWords,
          wordsUsedOnce: library.wordsUsedOnce,
          wordsUsedOncePct: library.wordsUsedOncePct,
        },
      });
    }),
});
