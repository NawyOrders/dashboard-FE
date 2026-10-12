import { z } from 'zod';

const optionalUrl = z.union([z.string().url('Enter a valid URL'), z.literal('')]);

export const createRestaurantSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  restaurantName: z.string().min(2, 'Restaurant name is required'),
  contact: z.object({
    phone: z.string().min(6, 'Phone is required'),
    email: z.string().email('Enter a valid email'),
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
      name: z.string().min(2, 'Branch name is required'),
      address: z.string().min(3, 'Address is required'),
      phone: z.string().min(6, 'Phone is required'),
    }),
  ),
});

export type CreateRestaurantValues = z.infer<typeof createRestaurantSchema>;

export const STEPS = ['basics', 'subscription', 'branches', 'review'] as const;
export type StepKey = (typeof STEPS)[number];

export const STEP_FIELDS: Record<StepKey, (keyof CreateRestaurantValues)[]> = {
  basics: ['businessName', 'restaurantName', 'contact', 'logoUrl', 'brandColors', 'socialLinks'],
  subscription: ['packageCode', 'durationMonths', 'status', 'startDate', 'endDate'],
  branches: ['branches'],
  review: [],
};
