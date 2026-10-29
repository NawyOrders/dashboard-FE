// OPEN: branch data is fixed until the backend returns addresses in a detail endpoint, then remove this file

import type { Branch, Tenant } from '@/domain/entities';

export interface FixedBranch {
  nameEn: string;
  nameAr: string;
  addressLine: string;
  city: string;
  /** Valid Egyptian mobile number (11 digits, starts with 010/011/012/015). */
  phone: string;
  latitude: number;
  longitude: number;
  workingHours: { day: string; open: string; close: string };
}

/** Display branches keyed by the restaurant id of the tenant (`Tenant.id`). */
export const FIXED_BRANCHES: Record<string, FixedBranch[]> = {
  t_1: [
    {
      nameEn: 'Acme Grill - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '12 El Nasr Street',
      city: 'Cairo',
      phone: '01000000001',
      latitude: 30.0564,
      longitude: 31.2447,
      workingHours: { day: 'Saturday', open: '10:00', close: '23:00' },
    },
    {
      nameEn: 'Acme Grill - Branch 2',
      nameAr: 'الفرع الثاني',
      addressLine: '17 Makram Ebeid Street',
      city: 'Cairo',
      phone: '01000000002',
      latitude: 30.0604,
      longitude: 31.2477,
      workingHours: { day: 'Sunday', open: '10:00', close: '23:00' },
    },
  ],
  t_2: [
    {
      nameEn: 'Blue Olive Bistro - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '8 El Batal Ahmed Abdel Aziz Street',
      city: 'Giza',
      phone: '01000000003',
      latitude: 30.0684,
      longitude: 31.2537,
      workingHours: { day: 'Saturday', open: '09:00', close: '22:00' },
    },
    {
      nameEn: 'Blue Olive Bistro - Branch 2',
      nameAr: 'الفرع الثاني',
      addressLine: '23 Gamaet El Dowal El Arabeya',
      city: 'Giza',
      phone: '01000000004',
      latitude: 30.0724,
      longitude: 31.2567,
      workingHours: { day: 'Monday', open: '09:00', close: '22:00' },
    },
  ],
  t_3: [
    {
      nameEn: 'Cedar & Salt - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '4 Ahmed Orabi Street',
      city: 'Cairo',
      phone: '01000000005',
      latitude: 30.0804,
      longitude: 31.2627,
      workingHours: { day: 'Saturday', open: '10:00', close: '23:00' },
    },
  ],
  t_4: [
    {
      nameEn: 'Demo Diner - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '31 Port Said Street',
      city: 'Alexandria',
      phone: '01000000006',
      latitude: 31.2001,
      longitude: 29.9187,
      workingHours: { day: 'Friday', open: '11:00', close: '23:00' },
    },
  ],
  t_5: [],
  t_6: [
    {
      nameEn: 'Green Fork Kitchen - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '15 El Haram Street',
      city: 'Giza',
      phone: '01000000007',
      latitude: 30.0124,
      longitude: 31.1857,
      workingHours: { day: 'Saturday', open: '10:00', close: '23:00' },
    },
    {
      nameEn: 'Green Fork Kitchen - Branch 2',
      nameAr: 'الفرع الثاني',
      addressLine: '9 Faisal Street',
      city: 'Giza',
      phone: '01000000008',
      latitude: 30.0164,
      longitude: 31.1897,
      workingHours: { day: 'Tuesday', open: '10:00', close: '23:00' },
    },
  ],
  t_7: [
    {
      nameEn: 'Harbor House - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '27 El Geish Street',
      city: 'Port Said',
      phone: '01000000009',
      latitude: 31.2653,
      longitude: 32.3019,
      workingHours: { day: 'Saturday', open: '11:00', close: '23:00' },
    },
    {
      nameEn: 'Harbor House - Branch 2',
      nameAr: 'الفرع الثاني',
      addressLine: '14 Atef El Sadat Street',
      city: 'Port Said',
      phone: '01000000010',
      latitude: 31.2693,
      longitude: 32.3059,
      workingHours: { day: 'Wednesday', open: '11:00', close: '23:00' },
    },
  ],
  t_8: [
    {
      nameEn: 'Ivory Spoon - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '6 El Gaish Road',
      city: 'Mansoura',
      phone: '01000000011',
      latitude: 31.0409,
      longitude: 31.3785,
      workingHours: { day: 'Saturday', open: '10:00', close: '22:00' },
    },
    {
      nameEn: 'Ivory Spoon - Branch 2',
      nameAr: 'الفرع الثاني',
      addressLine: '19 El Gomhoria Street',
      city: 'Mansoura',
      phone: '01000000012',
      latitude: 31.0449,
      longitude: 31.3825,
      workingHours: { day: 'Thursday', open: '10:00', close: '22:00' },
    },
  ],
  t_9: [
    {
      nameEn: 'Juniper Table - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '3 El Bahr Street',
      city: 'Tanta',
      phone: '01000000013',
      latitude: 30.7865,
      longitude: 31.0004,
      workingHours: { day: 'Saturday', open: '10:00', close: '23:00' },
    },
  ],
  t_10: [
    {
      nameEn: "Kelvin's Kitchen - Main",
      nameAr: 'الفرع الرئيسي',
      addressLine: '10 El Sheikh Zayed Street',
      city: 'Giza',
      phone: '01000000014',
      latitude: 30.1644,
      longitude: 31.3257,
      workingHours: { day: 'Saturday', open: '10:00', close: '23:00' },
    },
  ],
  t_11: [
    {
      nameEn: 'Luna Verde - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '22 El Horreya Street',
      city: 'Alexandria',
      phone: '01000000015',
      latitude: 31.2041,
      longitude: 29.9227,
      workingHours: { day: 'Saturday', open: '09:00', close: '22:00' },
    },
    {
      nameEn: 'Luna Verde - Branch 2',
      nameAr: 'الفرع الثاني',
      addressLine: '7 El Sultan Hussein Street',
      city: 'Alexandria',
      phone: '01000000016',
      latitude: 31.2081,
      longitude: 29.9267,
      workingHours: { day: 'Friday', open: '09:00', close: '22:00' },
    },
  ],
  t_12: [
    {
      nameEn: 'Maple & Main - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '11 Gameat El Nasr Street',
      city: 'Zagazig',
      phone: '01000000017',
      latitude: 30.5877,
      longitude: 31.502,
      workingHours: { day: 'Saturday', open: '10:00', close: '23:00' },
    },
    {
      nameEn: 'Maple & Main - Branch 2',
      nameAr: 'الفرع الثاني',
      addressLine: '28 El Mansoura Street',
      city: 'Zagazig',
      phone: '01000000018',
      latitude: 30.5917,
      longitude: 31.506,
      workingHours: { day: 'Monday', open: '10:00', close: '23:00' },
    },
  ],
  t_13: [
    {
      nameEn: 'Nomad Noodles - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '5 Thawra Street',
      city: 'Ismailia',
      phone: '01000000019',
      latitude: 30.5965,
      longitude: 32.2715,
      workingHours: { day: 'Saturday', open: '11:00', close: '23:00' },
    },
  ],
  t_14: [
    {
      nameEn: 'Orange Peel Cafe - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '18 El Nasr Street',
      city: 'Nasr City, Cairo',
      phone: '01000000020',
      latitude: 30.0588,
      longitude: 31.3402,
      workingHours: { day: 'Saturday', open: '08:00', close: '23:00' },
    },
    {
      nameEn: 'Orange Peel Cafe - Branch 2',
      nameAr: 'الفرع الثاني',
      addressLine: '2 Abbas El Akkad Street',
      city: 'Nasr City, Cairo',
      phone: '01000000021',
      latitude: 30.0628,
      longitude: 31.3442,
      workingHours: { day: 'Tuesday', open: '08:00', close: '23:00' },
    },
  ],
  t_15: [
    {
      nameEn: 'Pike Street Deli - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '30 26th of July Street',
      city: 'Suez',
      phone: '01000000022',
      latitude: 29.9737,
      longitude: 32.5263,
      workingHours: { day: 'Saturday', open: '10:00', close: '23:00' },
    },
    {
      nameEn: 'Pike Street Deli - Branch 2',
      nameAr: 'الفرع الثاني',
      addressLine: '12 El Geish Street',
      city: 'Suez',
      phone: '01000000023',
      latitude: 29.9777,
      longitude: 32.5303,
      workingHours: { day: 'Wednesday', open: '10:00', close: '23:00' },
    },
  ],
  t_16: [
    {
      nameEn: 'Quartz Quisine - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '9 El Corniche Street',
      city: 'Luxor',
      phone: '01000000024',
      latitude: 25.6872,
      longitude: 32.6396,
      workingHours: { day: 'Saturday', open: '11:00', close: '23:00' },
    },
  ],
  t_17: [
    {
      nameEn: 'Rustic Root - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '16 Abtal Street',
      city: 'Aswan',
      phone: '01000000025',
      latitude: 24.0889,
      longitude: 32.8998,
      workingHours: { day: 'Saturday', open: '10:00', close: '22:00' },
    },
    {
      nameEn: 'Rustic Root - Branch 2',
      nameAr: 'الفرع الثاني',
      addressLine: '4 El Sad El Aali Street',
      city: 'Aswan',
      phone: '01000000026',
      latitude: 24.0929,
      longitude: 32.9038,
      workingHours: { day: 'Friday', open: '10:00', close: '22:00' },
    },
  ],
  t_18: [
    {
      nameEn: 'Saffron Street - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '21 El Gomhoria Street',
      city: 'Fayoum',
      phone: '01000000027',
      latitude: 29.3084,
      longitude: 30.8428,
      workingHours: { day: 'Saturday', open: '10:00', close: '23:00' },
    },
    {
      nameEn: 'Saffron Street - Branch 2',
      nameAr: 'الفرع الثاني',
      addressLine: '13 Saad Zaghloul Street',
      city: 'Fayoum',
      phone: '01000000028',
      latitude: 29.3124,
      longitude: 30.8468,
      workingHours: { day: 'Thursday', open: '10:00', close: '23:00' },
    },
  ],
  t_19: [
    {
      nameEn: 'Terra Tomate - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '7 El Mahatta Street',
      city: 'Beni Suef',
      phone: '01000000029',
      latitude: 29.0661,
      longitude: 31.0994,
      workingHours: { day: 'Saturday', open: '10:00', close: '22:00' },
    },
  ],
  t_20: [],
  t_21: [
    {
      nameEn: 'Velvet Vine - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '25 El Minya Street',
      city: 'Minya',
      phone: '01000000030',
      latitude: 28.1099,
      longitude: 30.7503,
      workingHours: { day: 'Saturday', open: '10:00', close: '23:00' },
    },
    {
      nameEn: 'Velvet Vine - Branch 2',
      nameAr: 'الفرع الثاني',
      addressLine: '8 El Horreya Street',
      city: 'Minya',
      phone: '01000000031',
      latitude: 28.1139,
      longitude: 30.7543,
      workingHours: { day: 'Tuesday', open: '10:00', close: '23:00' },
    },
  ],
  t_22: [
    {
      nameEn: 'Willow & Wheat - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '19 El Geish Street',
      city: 'Sohag',
      phone: '01000000032',
      latitude: 26.5591,
      longitude: 31.6957,
      workingHours: { day: 'Saturday', open: '10:00', close: '22:00' },
    },
    {
      nameEn: 'Willow & Wheat - Branch 2',
      nameAr: 'الفرع الثاني',
      addressLine: '6 El Nasr Street',
      city: 'Sohag',
      phone: '01000000033',
      latitude: 26.5631,
      longitude: 31.6997,
      workingHours: { day: 'Monday', open: '10:00', close: '22:00' },
    },
  ],
  t_23: [
    {
      nameEn: 'Xenon Xpress - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '3 El Qarna Street',
      city: 'Qena',
      phone: '01000000034',
      latitude: 26.1551,
      longitude: 32.7164,
      workingHours: { day: 'Saturday', open: '11:00', close: '23:00' },
    },
  ],
  t_24: [
    {
      nameEn: 'Yarrow Yard - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '14 El Shohada Street',
      city: 'Damietta',
      phone: '01000000035',
      latitude: 31.4165,
      longitude: 31.8133,
      workingHours: { day: 'Saturday', open: '10:00', close: '23:00' },
    },
    {
      nameEn: 'Yarrow Yard - Branch 2',
      nameAr: 'الفرع الثاني',
      addressLine: '27 El Gomhoria Street',
      city: 'Damietta',
      phone: '01000000036',
      latitude: 31.4205,
      longitude: 31.8173,
      workingHours: { day: 'Thursday', open: '10:00', close: '23:00' },
    },
  ],
  t_25: [
    {
      nameEn: 'Zephyr Kitchen - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '11 El Gaish Street',
      city: 'Kafr El Sheikh',
      phone: '01000000037',
      latitude: 31.1107,
      longitude: 30.9388,
      workingHours: { day: 'Saturday', open: '10:00', close: '22:00' },
    },
    {
      nameEn: 'Zephyr Kitchen - Branch 2',
      nameAr: 'الفرع الثاني',
      addressLine: '5 Saad Zaghloul Street',
      city: 'Kafr El Sheikh',
      phone: '01000000038',
      latitude: 31.1147,
      longitude: 30.9428,
      workingHours: { day: 'Wednesday', open: '10:00', close: '22:00' },
    },
  ],
  t_26: [
    {
      nameEn: 'Copper Cactus - Main',
      nameAr: 'الفرع الرئيسي',
      addressLine: '20 El Bahr Street',
      city: 'Damanhour',
      phone: '01000000039',
      latitude: 31.0341,
      longitude: 30.4682,
      workingHours: { day: 'Saturday', open: '10:00', close: '23:00' },
    },
    {
      nameEn: 'Copper Cactus - Branch 2',
      nameAr: 'الفرع الثاني',
      addressLine: '9 El Gomhoria Street',
      city: 'Damanhour',
      phone: '01000000040',
      latitude: 31.0381,
      longitude: 30.4722,
      workingHours: { day: 'Friday', open: '10:00', close: '23:00' },
    },
  ],
};

/**
 * Replaces the display fields of every branch of a tenant with the fixed data. The id and
 * status of a submitted branch are kept so edits and status changes still work in memory.
 */
export function applyFixedBranches(tenant: Tenant): Tenant {
  const fixed = FIXED_BRANCHES[tenant.id];
  if (!fixed) return tenant;

  const branches: Branch[] = fixed.map((branch, index) => {
    const existing = tenant.branches[index];
    return {
      id: existing?.id ?? `${tenant.id}-branch-${index + 1}`,
      tenantId: tenant.id,
      name: branch.nameEn,
      nameAr: branch.nameAr,
      address: branch.addressLine,
      city: branch.city,
      phone: branch.phone,
      status: existing?.status ?? 'active',
      workingDay: branch.workingHours.day,
      openTime: branch.workingHours.open,
      closeTime: branch.workingHours.close,
      menuImageUrl: existing?.menuImageUrl ?? null,
      latitude: branch.latitude,
      longitude: branch.longitude,
    };
  });

  return { ...tenant, branches };
}
