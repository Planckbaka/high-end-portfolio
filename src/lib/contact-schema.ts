import { z } from "zod";
import { VALIDATION_LIMITS, REGEX } from "@/config/constants";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(VALIDATION_LIMITS.NAME_MAX_LENGTH, "Use at most 100 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email.")
    .max(VALIDATION_LIMITS.EMAIL_MAX_LENGTH, "Use at most 254 characters.")
    .regex(REGEX.EMAIL, "Enter a valid email address."),
  message: z
    .string()
    .trim()
    .min(1, "Enter a message.")
    .max(VALIDATION_LIMITS.MESSAGE_MAX_LENGTH, "Use at most 5,000 characters."),
});
export type ContactFormData = z.infer<typeof contactSchema>;
