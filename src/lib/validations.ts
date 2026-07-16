import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "Vorname muss mindestens 2 Zeichen haben").max(60),
    lastName: z.string().min(2, "Nachname muss mindestens 2 Zeichen haben").max(60),
    email: z.string().email("Ungültige E-Mail-Adresse"),
    password: z
      .string()
      .min(10, "Passwort muss mindestens 10 Zeichen haben")
      .regex(/[A-Z]/, "Passwort muss einen Großbuchstaben enthalten")
      .regex(/[a-z]/, "Passwort muss einen Kleinbuchstaben enthalten")
      .regex(/[0-9]/, "Passwort muss eine Zahl enthalten")
      .regex(/[^A-Za-z0-9]/, "Passwort muss ein Sonderzeichen enthalten"),
    passwordConfirm: z.string(),
    country: z.string().min(2, "Bitte Land auswählen"),
    paypalEmail: z.string().email("Ungültige PayPal E-Mail").optional().or(z.literal("")),
    iban: z.string().optional().or(z.literal("")),
    bic: z.string().optional().or(z.literal("")),
    taxId: z.string().optional().or(z.literal("")),
    referralCode: z.string().optional().or(z.literal("")),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "Du musst die AGB akzeptieren" }),
    }),
    captchaToken: z.string().min(1, "Bitte Captcha bestätigen"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwörter stimmen nicht überein",
    path: ["passwordConfirm"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(1, "Passwort ist erforderlich"),
  totpCode: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(10, "Passwort muss mindestens 10 Zeichen haben")
      .regex(/[A-Z]/, "Passwort muss einen Großbuchstaben enthalten")
      .regex(/[a-z]/, "Passwort muss einen Kleinbuchstaben enthalten")
      .regex(/[0-9]/, "Passwort muss eine Zahl enthalten"),
    passwordConfirm: z.string(),
    token: z.string().min(1),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwörter stimmen nicht überein",
    path: ["passwordConfirm"],
  });

export const payoutRequestSchema = z.object({
  amount: z.number().min(1, "Betrag muss größer als 0 sein"),
  method: z.enum(["paypal", "sepa", "crypto"]),
  destination: z.string().min(3, "Zielangabe erforderlich"),
});

export const affiliateSettingsSchema = z.object({
  firstName: z.string().min(2).max(60),
  lastName: z.string().min(2).max(60),
  paypalEmail: z.string().email().optional().or(z.literal("")),
  iban: z.string().optional().or(z.literal("")),
  bic: z.string().optional().or(z.literal("")),
  cryptoWalletAddress: z.string().optional().or(z.literal("")),
  taxId: z.string().optional().or(z.literal("")),
  preferredPayoutMethod: z.enum(["paypal", "sepa", "crypto"]),
});
