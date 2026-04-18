import type { Destination, Point, RouteInfo, RouteStep } from "../types/navigation";

type OsrmStep = {
  distance: number;
  name: string;
  maneuver?: {
    type?: string;
    modifier?: string;
  };
};

type OsrmRoute = {
  distance: number;
  duration: number;
  geometry: {
    coordinates: [number, number][];
  };
  legs: Array<{
    steps: OsrmStep[];
  }>;
};

const ROUTE_CACHE = new Map<string, { updatedAt: number; value: RouteInfo }>();
const ROUTE_INFLIGHT = new Map<string, Promise<RouteInfo>>();
const ROUTE_CACHE_TTL_MS = 60_000;
const REQUEST_TIMEOUT_MS = 5_000;

function createCacheKey(start: Point, destination: Destination): string {
  return `${start.lat.toFixed(5)},${start.lon.toFixed(5)}|${destination.lat.toFixed(5)},${destination.lon.toFixed(5)}`;
}

function buildInstruction(step: OsrmStep): string {
  const maneuverType = step.maneuver?.type ?? "continue";
  const modifier = step.maneuver?.modifier;
  const road = step.name ? ` on ${step.name}` : "";

  if (maneuverType === "arrive") return "Arrive at destination";
  if (maneuverType === "depart") return `Head ${modifier ?? "forward"}${road}`;
  if (maneuverType === "turn") return `Turn ${modifier ?? "ahead"}${road}`;
  if (maneuverType === "new name") return `Continue${road}`;
  if (maneuverType === "roundabout") return "Enter the roundabout";

  return `Continue ${modifier ?? "ahead"}${road}`;
}

/**
 * Create a simple fallback route when OSRM fails
 * Generates a straight-line path with waypoints for campus navigation
 */
function createFallbackRoute(start: Point, destination: Destination): RouteInfo {
  console.log("[Router] Creating fallback route for campus navigation");
  
  // Calculate distance in meters (simple Haversine approximation)
  const R = 6371000; // Earth radius in meters
  const dLat = (destination.lat - start.lat) * (Math.PI / 180);
  const dLon = (destination.lon - start.lon) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(start.lat * (Math.PI / 180)) * Math.cos(destination.lat * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  // Create waypoints between start and destination
  const numWaypoints = Math.max(3, Math.ceil(distance / 100)); // One waypoint every ~100m
  const points: [number, number][] = [];
  
  for (let i = 0; i <= numWaypoints; i++) {
    const t = i / numWaypoints;
    const lat = start.lat + (destination.lat - start.lat) * t;
    const lon = start.lon + (destination.lon - start.lon) * t;
    points.push([lat, lon]);
  }
  
  const steps: RouteStep[] = [
    {
      instruction: `Head towards ${destination.label}`,
      distance: distance
    }
  ];
  
  return {
    distance,
    duration: Math.round(distance / 1.4), // ~1.4 m/s walking speed
    profile: "foot",
    points,
    steps,
  };
}


async function fetchOsrmRoute(start: Point, destination: Point, signal?: AbortSignal): Promise<{ route: OsrmRoute, profile: "foot" | "driving" }> {
  const waypoints = `${start.lon},${start.lat};${destination.lon},${destination.lat}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  
  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }

  try {
    let firstRoute: OsrmRoute | undefined;
    let selectedProfile: "foot" | "driving" = "driving";

    for (const profile of ["foot", "driving"] as const) {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/${profile}/${waypoints}?overview=full&geometries=geojson&steps=true`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        continue;
      }

      const data = await response.json() as { routes?: OsrmRoute[] };
      if (data.routes && data.routes.length > 0) {
        firstRoute = data.routes[0];
        selectedProfile = profile;
        break;
      }
    }

    if (!firstRoute) {
      throw new Error("No routes found.");
    }

    return { route: firstRoute, profile: selectedProfile };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function planBestRoutes(
  start: Point,
  destination: Destination,
  signal?: AbortSignal,
): Promise<RouteInfo> {
  const key = createCacheKey(start, destination);

  // 1. Check Cache
  const cached = ROUTE_CACHE.get(key);
  if (cached && Date.now() - cached.updatedAt < ROUTE_CACHE_TTL_MS) {
    return cached.value;
  }

  // 2. Check In-flight to deduplicate concurrent identical requests
  const inflight = ROUTE_INFLIGHT.get(key);
  if (inflight) {
    return inflight;
  }

  // 3. Initiate new fetch
  const planPromise = (async () => {
    try {
      const { route, profile } = await fetchOsrmRoute(start, destination, signal);
      
      // Convert GeoJSON [lon, lat] coordinates to our [lat, lon] tuples
      const points: [number, number][] = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
      const steps: RouteStep[] = route.legs.flatMap((leg) =>
        leg.steps.map((step) => ({
          instruction: buildInstruction(step),
          distance: step.distance,
      }))
    );

    const routeInfo: RouteInfo = {
      distance: route.distance,
      duration: route.duration,
      profile,
      points,
      steps,
    };

    ROUTE_CACHE.set(key, { updatedAt: Date.now(), value: routeInfo });
    return routeInfo;
    } catch (error) {
      console.warn("[Router] OSRM route failed, using campus fallback:", error);
      // Fallback for campus areas where OSRM may not have complete data
      const routeInfo = createFallbackRoute(start, destination);
      ROUTE_CACHE.set(key, { updatedAt: Date.now(), value: routeInfo });
      return routeInfo;
    }
  })();

  ROUTE_INFLIGHT.set(key, planPromise);

  try {
    return await planPromise;
  } finally {
    ROUTE_INFLIGHT.delete(key);
  }
}
