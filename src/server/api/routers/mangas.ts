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

export const updateManga = async (manga: Partial<Manga>, ctx: any) => {
  const frequencies: Partial<SchemaFrequency>[] = await ctx.db.frequency.findMany({
    where: { manga_id: manga.id },
    orderBy: { count: "desc" },
  });

  for(let frequency of frequencies) {
    delete frequency.manga_id;
    delete frequency.id;
  }
  manga.frequencies = frequencies as Frequency[];
}

export const updateMangas = async (mangas: Partial<Manga>[], ctx: any) => {
  let promises = [];
  for(let manga of mangas) {
    promises.push(updateManga(manga, ctx));
  }
  return Promise.all(promises);
}

export const mangaRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    let mangas: Partial<Manga>[] = await ctx.db.manga.findMany();
    await updateMangas(mangas, ctx);
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

    await updateMangas(mangas, ctx);
    return mangas as Manga[];
  }),

  getOne: publicProcedure.input(
    z.object({ mangaId: z.number() })
  ).query(async ({ input, ctx }) => {
    const manga: Partial<Manga> | null = await ctx.db.manga.findUnique({
      where: { id: input.mangaId },
    });

    if(!manga) {
      return null;
    }

    await updateManga(manga, ctx);
    return manga as Manga;
  }),

  getForLibrary: protectedProcedure.query(async ({ ctx }) => {
    const mangas = await ctx.db.manga.findMany({
      where: {
        libraries: {
          some: {
            userId: ctx.session.user.id,
          },
        },
      },
    });

    return mangas as SchemaManga[];
  }),
});
