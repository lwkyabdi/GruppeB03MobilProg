import { z } from 'zod';

export const statuses = ['wanted', 'watching', 'completed'] as const;
export const statusLabels = {
  wanted: 'Vil se',
  watching: 'Ser nå',
  completed: 'Sett',
};
export const loginSchema = z.object({
  email: z.email('Skriv inn en gyldig e-postadresse').trim(),
  password: z.string().min(8, 'Passordet må ha minst 8 tegn'),
});
export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, 'Navn må ha minst 2 tegn'),
});
export const entryFormSchema = z.object({
  status: z.enum(statuses),
  rating: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || /^(10|[1-9])$/.test(value),
      'Velg et heltall fra 1 til 10, eller la feltet stå tomt',
    ),
  comment: z.string().trim().max(500, 'Kommentar kan ha maks 500 tegn'),
  favorite: z.boolean(),
});
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
});
export const movieSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  overview: z.string(),
  poster_path: z.string().nullable(),
  release_date: z.string(),
  vote_average: z.number().min(0).max(10),
});
export const entrySchema = z.object({
  id: z.string(),
  tmdbId: z.number().int().positive(),
  title: z.string(),
  posterPath: z.string().nullable(),
  status: z.enum(statuses),
  rating: z.number().int().min(1).max(10).nullable(),
  favorite: z.boolean(),
  comment: z.string().nullable(),
  createdAt: z.string(),
});
export type User = z.infer<typeof userSchema>;
export type Movie = z.infer<typeof movieSchema>;
export type Entry = z.infer<typeof entrySchema>;
export type EntryChanges = Pick<
  Entry,
  'status' | 'rating' | 'favorite' | 'comment'
>;

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0]);
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}
