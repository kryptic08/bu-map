export type Point = {
  lat: number;
  lon: number;
};

export type Destination = Point & {
  label: string;
};

export type RouteStep = {
  instruction: string;
  distance: number;
};

export type RouteInfo = {
  distance: number;
  duration: number;
  profile: "foot" | "driving";
  points: [number, number][];
  steps: RouteStep[];
};

export type RoutePacket = {
  v: 1;
  s: [number, number];
  d: [number, number];
  sl: string;
  dl: string;
  p: "foot" | "driving";
};

export type PresetDestination = Destination & {
  image: string;
  floorPlans?: { label: string; image: string }[];
  floorDirectory?: {
    floorLabel: string;
    items: { label: string; marker: [number, number]; via?: [number, number][] }[];
  }[];
  summary: string;
  details: string[];
  keywords: string[];
};

export type EntryMode = "ai" | "quick";

export type FocusRequest = {
  point: Point;
  zoom: number;
};
