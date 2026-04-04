import type { DivIcon, LatLngExpression } from "leaflet";
import type { Polyline as LeafletPolyline } from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { useEffect, useRef } from "react";
import type {
  Destination,
  EntryMode,
  FocusRequest,
  Point,
  PresetDestination,
  RouteInfo,
} from "../types/navigation";

type CampusMapViewProps = {
  mapCenter: LatLngExpression;
  focusRequest: FocusRequest | null;
  route: RouteInfo | null;
  simulationPoint: Point | null;
  isSimulationRunning: boolean;
  effectiveHeading: number;
  gyroEnabled: boolean;
  startPoint: Point;
  startLabel: string;
  activeEntryMode: EntryMode;
  destinations: PresetDestination[];
  destination: Destination | null;
  buildingPinIcon: DivIcon;
  onSelectPresetDestination: (place: PresetDestination) => void;
  compactLabel: (label: string) => string;
};

function MapFocusController({ request }: { request: FocusRequest | null }) {
  const map = useMap();

  useEffect(() => {
    if (!request) {
      return;
    }
    map.flyTo([request.point.lat, request.point.lon], request.zoom, {
      duration: 0.8,
    });
  }, [map, request]);

  return null;
}

function RouteBoundsController({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length < 2) {
      return;
    }
    map.fitBounds(points, { padding: [48, 48] });
  }, [map, points]);

  return null;
}

function SimulationFollowController({
  point,
  enabled,
  heading,
  rotateWithHeading,
}: {
  point: Point | null;
  enabled: boolean;
  heading: number;
  rotateWithHeading: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!point || !enabled) {
      return;
    }

    map.setView([point.lat, point.lon], Math.max(map.getZoom(), 20), {
      animate: true,
      duration: 0.35,
    });

    const container = map.getContainer();
    if (rotateWithHeading) {
      container.classList.add("sim-nav-mode");
      container.style.setProperty(
        "--map-rotation",
        `${(-heading).toFixed(2)}deg`,
      );
    } else {
      container.classList.remove("sim-nav-mode");
      container.style.removeProperty("--map-rotation");
    }

    return () => {
      if (!rotateWithHeading) {
        container.classList.remove("sim-nav-mode");
        container.style.removeProperty("--map-rotation");
      }
    };
  }, [map, point, enabled, heading, rotateWithHeading]);

  return null;
}

function RouteAnimationController({
  animatedPolylineRef,
}: {
  animatedPolylineRef: React.RefObject<LeafletPolyline | null>;
}) {
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const polyline = animatedPolylineRef.current;
    if (!polyline) {
      return;
    }

    const pathElement = (polyline as any)._path as SVGPathElement | undefined;
    if (!pathElement) {
      console.warn("[RouteAnimation] Path element not found");
      return;
    }

    const start = performance.now();

    const animate = (timestamp: number) => {
      const elapsed = timestamp - start;
      const dashOffset = -((elapsed / 22) % 64);
      const breathe = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(elapsed / 350));

      pathElement.style.strokeDashoffset = dashOffset.toFixed(2);
      pathElement.style.strokeOpacity = breathe.toFixed(3);

      frameRef.current = window.requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      pathElement.style.removeProperty("stroke-dashoffset");
      pathElement.style.removeProperty("stroke-opacity");
    };
  }, [animatedPolylineRef]);

  return null;
}

export function CampusMapView({
  mapCenter,
  focusRequest,
  route,
  simulationPoint,
  isSimulationRunning,
  effectiveHeading,
  gyroEnabled,
  startPoint,
  startLabel,
  activeEntryMode,
  destinations,
  destination,
  buildingPinIcon,
  onSelectPresetDestination,
  compactLabel,
}: CampusMapViewProps) {
  const animatedPolylineRef = useRef<LeafletPolyline | null>(null);

  return (
    <MapContainer
      className="h-full w-full"
      center={mapCenter}
      zoom={19}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapFocusController request={focusRequest} />
      {route?.points ? <RouteBoundsController points={route.points} /> : null}
      <SimulationFollowController
        point={simulationPoint}
        enabled={isSimulationRunning}
        heading={effectiveHeading}
        rotateWithHeading={gyroEnabled}
      />
      <RouteAnimationController animatedPolylineRef={animatedPolylineRef} />

      <CircleMarker
        center={[startPoint.lat, startPoint.lon]}
        radius={8}
        pathOptions={{
          color: "#0ea5e9",
          fillColor: "#22d3ee",
          fillOpacity: 0.9,
        }}
      >
        <Tooltip direction="top" offset={[0, -12]}>
          {startLabel}
        </Tooltip>
      </CircleMarker>

      {activeEntryMode === "quick"
        ? destinations.map((place) => (
            <CircleMarker
              key={`hit-${place.label}`}
              center={[place.lat, place.lon]}
              radius={15}
              pathOptions={{
                color: "transparent",
                fillColor: "transparent",
                fillOpacity: 0,
              }}
              eventHandlers={{
                click: () => {
                  onSelectPresetDestination(place);
                },
              }}
            />
          ))
        : null}

      {activeEntryMode === "quick"
        ? destinations.map((place) => (
            <Marker
              key={`pin-${place.label}`}
              position={[place.lat, place.lon]}
              icon={buildingPinIcon}
              eventHandlers={{
                click: () => {
                  onSelectPresetDestination(place);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -10]}>
                {compactLabel(place.label)}
              </Tooltip>
            </Marker>
          ))
        : null}

      {destination ? (
        <CircleMarker
          center={[destination.lat, destination.lon]}
          radius={8}
          pathOptions={{
            color: "#0f172a",
            fillColor: "#f8fafc",
            fillOpacity: 1,
          }}
        >
          <Tooltip direction="top" offset={[0, -12]}>
            Destination
          </Tooltip>
        </CircleMarker>
      ) : null}

      {route ? (
        <>
          <Polyline
            positions={route.points}
            pathOptions={{
              color: "#0284c7",
              weight: 7,
              opacity: 0.9,
              className: "route-line-base",
            }}
          />
          <Polyline
            ref={animatedPolylineRef}
            positions={route.points}
            pathOptions={{
              color: "#67e8f9",
              weight: 4,
              opacity: 0.95,
              dashArray: "18 14",
              className: "route-line-animated",
            }}
          />
        </>
      ) : null}

      {simulationPoint ? (
        <CircleMarker
          center={[simulationPoint.lat, simulationPoint.lon]}
          radius={7}
          pathOptions={{
            color: "#b45309",
            fillColor: "#facc15",
            fillOpacity: 0.95,
          }}
        >
          <Tooltip direction="top" offset={[0, -12]}>
            Debug Walker
          </Tooltip>
        </CircleMarker>
      ) : null}
    </MapContainer>
  );
}
