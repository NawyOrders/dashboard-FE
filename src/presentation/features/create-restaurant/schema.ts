import { z } from 'zod';
import {
  validateEmail,
  validateName,
  validatePhone,
  type NameKind,
  type PhoneKind,
} from '@/domain/rules/validation';

const optionalUrl = z.union([z.string().url('Enter a valid URL'), z.literal('')]);

function nameSchema(required: string, kind: NameKind) {
  return z
    .string()
    .min(1, required)
    .superRefine((value, ctx) => {
      const message = validateName(value, kind);
      if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, message });
    });
}

function phoneSchema(required: string, kind: PhoneKind) {
  return z
    .string()
    .min(1, required)
    .superRefine((value, ctx) => {
      const message = validatePhone(value, kind);
      if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, message });
    });
}

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .superRefine((value, ctx) => {
    const message = validateEmail(value);
    if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  });

export const createRestaurantSchema = z.object({
  businessName: nameSchema('Business name is required', 'business'),
  restaurantName: nameSchema('Restaurant name is required', 'restaurant'),
  contact: z.object({
    phone: phoneSchema('Phone is required', 'phone'),
    email: emailSchema,
  }),
  logoUrl: optionalUrl,
  brandColors: z.object({
    primary: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex color'),
    secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex color'),
  }),
  socialLinks: z.object({
    facebook: optionalUrl,
    instagram: optionalUrl,
    tiktok: optionalUrl,
    website: optionalUrl,
  }),
  packageCode: z.enum(['start', 'growth']),
  durationMonths: z.union([z.literal(3), z.literal(6), z.literal(12)]),
  status: z.enum(['active', 'pending', 'inactive']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'Expiry date is required'),
  branches: z.array(
    z.object({
      name: nameSchema('Branch name is required', 'branch'),
      address: z.string().min(3, 'Address is required'),
      phone: phoneSchema('Phone is required', 'branchPhone'),
    }),
  ),
});

export type CreateRestaurantValues = z.infer<typeof createRestaurantSchema>;

export { nameSchema, phoneSchema, emailSchema };

export const STEPS = ['basics', 'subscription', 'branches', 'review'] as const;
export type StepKey = (typeof STEPS)[number];

export const STEP_FIELDS: Record<StepKey, (keyof CreateRestaurantValues)[]> = {
  basics: ['businessName', 'restaurantName', 'contact', 'logoUrl', 'brandColors', 'socialLinks'],
  subscription: ['packageCode', 'durationMonths', 'status', 'startDate', 'endDate'],
  branches: ['branches'],
  review: [],
};
