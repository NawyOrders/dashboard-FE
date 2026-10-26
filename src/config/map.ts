/**
 * Default position for the branch map picker (NW-246).
 *
 * The registration-fields JSON does not define a default centre, so the map opens on
 * Cairo until coordinates are picked.
 */
export const DEFAULT_MAP_CENTER = { lat: 30.0444, lng: 31.2357 } as const;

export const DEFAULT_MAP_ZOOM = 12;
