import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const frequencyRouter = createTRPCRouter({
  getFrequencies: publicProcedure.input(z.object({
    ownerId: z.number(),
    type: z.enum(["volume", "manga", "library"]),
    sorted: z.boolean().optional(),
  })).query(async ({ ctx, input }) => {
    const { ownerId, type } = input;

    return await ctx.db.frequency.findMany({
      where: {
        [type]: {
          id: ownerId,
        },
      },
      orderBy: {
        count: "desc",
      },
    });
  }),
});
