import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const pendingOrdersTable = pgTable("pending_orders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  imageUrl: varchar({ length: 1000 }).notNull(),
  prompt: varchar({ length: 1000 }).notNull(),
  userId: integer().references(() => usersTable.id),
  createdAt: timestamp().defaultNow().notNull(),
  status: varchar({ length: 50 }).notNull().default('pending'),
});
