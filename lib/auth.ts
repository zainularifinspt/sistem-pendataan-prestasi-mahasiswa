import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";

import { db, schema } from "@/lib/db";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "development-only-secret-change-me-before-production",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
        returned: true,
        defaultValue: "MAHASISWA",
      },
      nimNip: {
        type: "string",
        required: true,
        returned: true,
      },
      programStudi: {
        type: "string",
        returned: true,
        defaultValue: "Pendidikan Matematika",
      },
      angkatan: {
        type: "number",
        required: false,
        returned: true,
      },
      noHp: {
        type: "string",
        required: false,
        returned: true,
      },
      fotoProfilUrl: {
        type: "string",
        required: false,
        returned: true,
      },
    },
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 24,
      usernameValidator: (value) => /^[0-9]+$/.test(value),
      usernameNormalization: false,
    }),
  ],
});
