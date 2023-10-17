import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { Manga, updateMangas } from "~/server/api/routers/mangas";
import { Library as SchemaLibrary } from "@prisma/client";

interface Library extends SchemaLibrary {
  mangas: Manga[];
}

export const libraryRouter = createTRPCRouter({
  getOne: protectedProcedure.query(async ({ ctx }) => {
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

    const mangas: Partial<Manga>[] = await ctx.db.manga.findMany({
      where: { libraries: { some: { id: schemaResult.id } } },
    });
    await updateMangas(mangas, ctx);
    result.mangas = mangas as Manga[];

    return result;
  }),
});
