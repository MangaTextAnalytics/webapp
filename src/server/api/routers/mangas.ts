import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { Manga } from "@prisma/client";

export const mangaRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    let mangas = await ctx.db.manga.findMany();
    return mangas as Manga[];
  }),

  getMatching: publicProcedure.input(
    z.object({ query: z.string() })
  ).query(async ({ input, ctx }) => {
    const keywords = input.query.split(" ");

    let mangas = await ctx.db.manga.findMany({
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

    return mangas as Manga[];
  }),

  getOne: publicProcedure.input(
    z.object({ mangaId: z.number() })
  ).query(async ({ input, ctx }) => {
    const manga = await ctx.db.manga.findUnique({
      where: { id: input.mangaId },
    });

    return manga;
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

    return mangas;
  }),
});
