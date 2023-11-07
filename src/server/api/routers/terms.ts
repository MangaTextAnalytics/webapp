import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

import { Term } from "@prisma/client";

interface TermWithRank extends Term {
  rank: number;
}

export const termRouter = createTRPCRouter({
  getTermWithRank: publicProcedure.input(z.object({
    term: z.string(),
  })).query(async ({ ctx, input }) => {
    const { term } = input;

    const termWithRank = await ctx.db.term.findFirst({
      where: {
        term: term,
      },
    });

    if(!termWithRank) {
      return null;
    }

    let rank = 1 + await ctx.db.term.count({
      where: {
        totalCount: {
          gt: termWithRank.totalCount,
        },
      },
    });

    // round to the nearest 100
    rank = Math.ceil(rank / 100) * 100
    return {
      ...termWithRank,
      rank,
    } as TermWithRank;
  }),
});
