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
}

export const mangaRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    let mangas: Partial<Manga>[] = await ctx.db.manga.findMany();

    for(let manga of mangas) {
      const frequencies: Partial<SchemaFrequency>[] = await ctx.db.frequency.findMany({
        where: { manga_id: manga.id },
      });

      for(let frequency of frequencies) {
        delete frequency.manga_id;
        delete frequency.id;
      }
      manga.frequencies = frequencies as Frequency[];
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
