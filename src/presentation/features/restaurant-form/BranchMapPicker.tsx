import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/config/map';
import type { RegistrationMapConfig } from '@/domain/entities/registration-schema';

export interface BranchMapPickerProps {
  /** Coordinates of the branch, `null` while nothing is picked yet. */
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number, longitude: number) => void;
  mapConfig: RegistrationMapConfig;
  disabled?: boolean;
}

/** Marker built from the design tokens, so no image asset and no hex value is needed. */
const MARKER_HTML =
  '<span class="block size-4 rounded-full border-2 border-card bg-primary"></span>';

function markerIcon(): L.DivIcon {
  return L.divIcon({
    html: MARKER_HTML,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function round(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

/**
 * Branch map picker (NW-246).
 *
 * Leaflet with the OpenStreetMap tiles of the registration JSON. Clicking the map or
 * dragging the marker writes the coordinates back as numbers.
 */
export function BranchMapPicker({
  latitude,
  longitude,
  onChange,
  mapConfig,
  disabled,
}: BranchMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const disabledRef = useRef(disabled);

  onChangeRef.current = onChange;
  disabledRef.current = disabled;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const center: L.LatLngExpression =
      latitude !== null && longitude !== null
        ? [latitude, longitude]
        : [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng];

    const map = L.map(container, {
      center,
      zoom: DEFAULT_MAP_ZOOM,
      scrollWheelZoom: false,
    });
    L.tileLayer(mapConfig.tileUrl, { attribution: mapConfig.attribution }).addTo(map);
    mapRef.current = map;

    map.on('click', (event: L.LeafletMouseEvent) => {
      if (disabledRef.current) return;
      onChangeRef.current(round(event.latlng.lat), round(event.latlng.lng));
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // The map is created once; the marker follows the coordinates below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapConfig.tileUrl, mapConfig.attribution]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (latitude === null || longitude === null) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const position: L.LatLngExpression = [latitude, longitude];
    if (!markerRef.current) {
      markerRef.current = L.marker(position, { icon: markerIcon(), draggable: !disabled }).addTo(map);
      markerRef.current.on('dragend', () => {
        const position = markerRef.current?.getLatLng();
        if (!position || disabledRef.current) return;
        onChangeRef.current(round(position.lat), round(position.lng));
      });
    } else {
      const marker = markerRef.current;
      marker.setLatLng(position);
      if (disabled) {
        marker.dragging?.disable();
      } else {
        marker.dragging?.enable();
      }
    }
  }, [latitude, longitude, disabled]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (disabled) {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
    } else {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
    }
  }, [disabled]);

  return (
    <div
      ref={containerRef}
      className="h-64 w-full overflow-hidden rounded-panel border border-border bg-bg-2"
      aria-label={mapConfig.tileProvider}
    />
  );
}
