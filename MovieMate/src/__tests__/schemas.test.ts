import {
  entryFormSchema,
  fieldErrors,
  loginSchema,
  registerSchema,
  movieSchema,
} from '@/utils/schemas';

test('innlogging avviser ugyldig e-post og kort passord med feil per felt', () => {
  const result = loginSchema.safeParse({
    email: 'ikke-epost',
    password: 'kort',
  });
  expect(result.success).toBe(false);
  if (!result.success)
    expect(fieldErrors(result.error)).toEqual({
      email: 'Skriv inn en gyldig e-postadresse',
      password: 'Passordet må ha minst 8 tegn',
    });
});
test('registrering krever navn og godtar gyldig bruker', () => {
  expect(
    registerSchema.safeParse({
      name: ' ',
      email: 'a@example.com',
      password: 'passord123',
    }).success,
  ).toBe(false);
  expect(
    registerSchema.safeParse({
      name: 'Ada',
      email: 'a@example.com',
      password: 'passord123',
    }).success,
  ).toBe(true);
});
test.each(['0', '11', '2.5', 'abc'])('vurdering %s avvises', (rating) => {
  expect(
    entryFormSchema.safeParse({
      status: 'wanted',
      rating,
      favorite: false,
      comment: '',
    }).success,
  ).toBe(false);
});
test.each(['', '1', '10'])('vurdering %s godtas', (rating) => {
  expect(
    entryFormSchema.safeParse({
      status: 'completed',
      rating,
      favorite: true,
      comment: 'Bra film',
    }).success,
  ).toBe(true);
});
test('uventede data fra nettet avvises', () => {
  expect(movieSchema.safeParse({ id: '603', title: 'Matrix' }).success).toBe(
    false,
  );
});
