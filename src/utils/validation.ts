import { z } from "zod";

export const authSchema = z.object({
  email: z.email("Invalid email"),
  password: z
    .string()
    .min(
      6,
      "Password must be at least 6 characters",
    ),
});

export const characterPaginationSchema =
  z.object({
    page: z.coerce
      .number()
      .int()
      .min(1)
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10),

    name: z
      .string()
      .trim()
      .optional(),

    status: z
      .string()
      .trim()
      .optional(),

    species: z
      .string()
      .trim()
      .optional(),

    gender: z
      .string()
      .trim()
      .optional(),
  });