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
  })();

  ROUTE_INFLIGHT.set(key, planPromise);

  try {
    return await planPromise;
  } finally {
    ROUTE_INFLIGHT.delete(key);
  }
}
