import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
    user: {
        watchlistEntry: r.many.watchlistEntry({
            from: r.user.id,
            to: r.watchlistEntry.userId,
        }),
    },
    watchlistEntry: {
        user: r.one.user({
            from: r.watchlistEntry.userId,
            to: r.user.id,
            optional: false,
        }),
    },
}));

export type Relations = typeof relations;
