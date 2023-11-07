import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const frequencyRouter = createTRPCRouter({
  getFrequencies: publicProcedure.input(z.object({
    ownerId: z.number(),
    type: z.enum(["volume", "manga", "library"]),
    start: z.number().optional(),
    end: z.number().optional(),
  })).query(async ({ ctx, input }) => {
    const { ownerId, type } = input;

    const skip = input.start || 0;
    const take = input.end ? input.end - skip : undefined;

    const frequencies = await ctx.db.frequency.findMany({
      where: {
        [type]: {
          id: ownerId,
        },
      },
      orderBy: {
        count: "desc",
      },

      skip: skip,
      take: take,
    });

    const totalCount = await ctx.db.frequency.count({
      where: {
        [type]: {
          id: ownerId,
        },
      },
    });

    return {
      totalCount,
      frequencies,
    };
  }),
});
