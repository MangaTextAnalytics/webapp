import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { Manga as SchemaManga, Frequency as SchemaFrequency } from "@prisma/client";

export type Frequency = {
  termTerm: string;
  count: number;
};

export interface Manga extends SchemaManga {
  frequencies: Frequency[];
  uniqueWords: number;
  totalWords: number;
  wordsUsedOnce: number;
  wordsUsedOncePct: string;
}

export const mangaRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    let mangas: Partial<Manga>[] = await ctx.db.manga.findMany();

    for(let manga of mangas) {
      const frequencies: Partial<SchemaFrequency>[] = await ctx.db.frequency.findMany({
        where: { manga_id: manga.id },
      });

      let sum = 0;
      let usedOnce = 0;
      for(let frequency of frequencies) {
        delete frequency.manga_id;
        delete frequency.id;
        sum += frequency.count || 0;
        if(frequency.count === 1) {
          usedOnce++;
        }
      }
      manga.frequencies = frequencies as Frequency[];
      manga.totalWords = sum;
      manga.uniqueWords = frequencies.length;
      manga.wordsUsedOnce = usedOnce;
    }

    return mangas as Manga[];
  }),

  getMatching: publicProcedure.input(
    z.object({ query: z.string() })
  ).query(async ({ input, ctx }) => {
    const keywords = input.query.split(" ");

    let mangas: Partial<Manga>[] = await ctx.db.manga.findMany({
      where: {
        OR: keywords.map((keyword) => {
          return { 
            title: {
              contains: keyword,
              mode: "insensitive" 
            } 
          };
        }),
      },
    });

    for(let manga of mangas) {
      const frequencies: Partial<SchemaFrequency>[] = await ctx.db.frequency.findMany({
        where: { manga_id: manga.id },
      });

      let sum = 0;
      let usedOnce = 0;
      for(let frequency of frequencies) {
        delete frequency.manga_id;
        delete frequency.id;
        sum += frequency.count || 0;
        if(frequency.count === 1) {
          usedOnce++;
        }
      }
      manga.frequencies = frequencies as Frequency[];
      manga.totalWords = sum;
      manga.uniqueWords = frequencies.length;
      manga.wordsUsedOnce = usedOnce;
      manga.wordsUsedOncePct = `${(usedOnce / frequencies.length * 100).toFixed(0)}%`;
    }

    return mangas as Manga[];
  }),

  getOne: publicProcedure.input(
    z.object({ id: z.number() })
  ).query(({ input, ctx }) => {
    return ctx.db.manga.findUnique({
      where: { id: input.id },
    });
  }),

});
