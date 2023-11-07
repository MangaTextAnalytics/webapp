import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const volumeRouter = createTRPCRouter({
  getOne: publicProcedure.input(z.object({
    volumeId: z.number(),
  })).query(async ({ ctx, input }) => {
    const { volumeId } = input;
    return ctx.db.volume.findFirst({
      where: {
        id: volumeId,
      },
    });
  }),

  getVolumes: publicProcedure.input(z.object({
    mangaId: z.number(),
  })).query(async ({ ctx, input }) => {
    const { mangaId } = input;

    return ctx.db.volume.findMany({
      where: {
        mangaId,
      },
      orderBy: {
        volume: "asc",
      },
    });
  }),

  getTitle: publicProcedure.input(z.object({
    mangaId: z.number().optional(),
  })).query(async ({ ctx, input }) => {
    const { mangaId } = input;
    if(!mangaId) return

    const manga = await ctx.db.manga.findFirst({
      where: {
        id: mangaId,
      },
      select: {
        title: true,
      },
    });

    return manga?.title;
  }),
});
