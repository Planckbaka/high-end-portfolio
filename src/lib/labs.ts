import type { LabDetail, LabsManifest, LabSummary } from "@/types";
import manifestJson from "./labs-data/manifest.json";
import { labDetailLoaders } from "./labs-data";

const manifest = manifestJson as LabsManifest;

export function getLabsManifest(): LabsManifest {
  return manifest;
}

export function getAllLabs(): LabSummary[] {
  return manifest.labs;
}

export function getLabSummary(track: string, name: string): LabSummary | null {
  return manifest.labs.find((lab) => lab.track === track && lab.name === name) || null;
}

export async function getLabDetail(track: string, name: string): Promise<LabDetail | null> {
  const loader = labDetailLoaders[`${track}/${name}`];
  if (!loader) return null;
  const loaded = await loader();
  return loaded.default as LabDetail;
}
