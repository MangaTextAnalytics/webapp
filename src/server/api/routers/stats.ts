import { Stats } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const statsRouter = createTRPCRouter({
  getStats: publicProcedure.input(z.object({
    ownerId: z.number(),
    type: z.enum(["volume", "manga", "library"]),
  })).query(async ({ ctx, input }) => {
    const { ownerId, type } = input;

    return ctx.db.stats.findFirst({
      where: {
        [type]: {
          id: ownerId,
        },
      },
    });
  }),
});

export const updateStats = async (ctx: any, statsId: number, ownerId: number, type: 'manga' | 'volume' | 'library') => {
    const newStats: Stats = {
      id: statsId,
      totalWords: 0,
      uniqueWords: 0,
      wordsUsedOnce: 0,
      wordsUsedOncePct: 0,
    }

    const freqs = await ctx.db.frequency.findMany({
      where: {
        [type]: {
          id: ownerId,
        },
      },
    });

    for(let freq of freqs) {
      newStats.totalWords += freq.count;
      newStats.uniqueWords++;
      if(freq.count == 1) {
        newStats.wordsUsedOnce++;
      }
    }
    newStats.wordsUsedOncePct = (100 * newStats.wordsUsedOnce / newStats.uniqueWords ) || 0;

    await ctx.db.stats.update({
      where: {
        id: statsId,
      },
      data: {
        totalWords: newStats.totalWords,
        uniqueWords: newStats.uniqueWords,
        wordsUsedOnce: newStats.wordsUsedOnce,
        wordsUsedOncePct: newStats.wordsUsedOncePct,
      },
    });
}
