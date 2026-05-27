import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["MAHASISWA", "DOSEN", "ADMIN"]);
export const jenisPrestasiEnum = pgEnum("jenis_prestasi", ["INDIVIDUAL", "KELOMPOK"]);
export const tingkatPrestasiEnum = pgEnum("tingkat_prestasi", ["LOKAL", "NASIONAL", "INTERNASIONAL"]);
export const statusRiwayatEnum = pgEnum("status_riwayat", ["TERCATAT", "DIARSIPKAN"]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  username: text("username").unique(),
  displayUsername: text("display_username"),
  role: userRoleEnum("role").notNull().default("MAHASISWA"),
  nimNip: text("nim_nip").notNull().unique(),
  programStudi: text("program_studi").notNull().default("Pendidikan Matematika"),
  angkatan: integer("angkatan"),
  noHp: text("no_hp"),
  fotoProfilUrl: text("foto_profil_url"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: "date" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  namaKategori: text("nama_kategori").notNull(),
  keterangan: text("keterangan").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  namaKegiatan: text("nama_kegiatan").notNull(),
  jenisPrestasi: jenisPrestasiEnum("jenis_prestasi").notNull(),
  tingkatPrestasi: tingkatPrestasiEnum("tingkat_prestasi").notNull(),
  juaraPeringkat: text("juara_peringkat").notNull(),
  penyelenggara: text("penyelenggara").notNull(),
  tanggalKegiatan: timestamp("tanggal_kegiatan", { mode: "date" }).notNull(),
  buktiUrl: text("bukti_url").notNull(),
  statusRiwayat: statusRiwayatEnum("status_riwayat").notNull().default("TERCATAT"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  achievements: many(achievements),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const categoryRelations = relations(categories, ({ many }) => ({
  achievements: many(achievements),
}));

export const achievementRelations = relations(achievements, ({ one }) => ({
  user: one(user, {
    fields: [achievements.userId],
    references: [user.id],
  }),
  category: one(categories, {
    fields: [achievements.categoryId],
    references: [categories.id],
  }),
}));

export type DbUser = typeof user.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
export type NewCategory = typeof categories.$inferInsert;
