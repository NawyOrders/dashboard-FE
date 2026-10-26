/** Anchors of the three groups of the registration form (NW-246). */
export const FORM_GROUP_IDS = {
  details: 'rf-group-details',
  branches: 'rf-group-branches',
  subscription: 'rf-group-subscription',
} as const;

export type FormGroupId = (typeof FORM_GROUP_IDS)[keyof typeof FORM_GROUP_IDS];
