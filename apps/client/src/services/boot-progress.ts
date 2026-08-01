export type BootProgress = {
  readonly step: number;
  readonly total: number;
  readonly pct: number;
  readonly labelDe: string;
  readonly labelEn: string;
};

export type BootProgressListener = (progress: BootProgress) => void;

const BOOT_STEPS = [
  {
    id: "core",
    labelDe: "Initialisiere Archiv-Kern…",
    labelEn: "Initializing archive core…",
  },
  {
    id: "fonts",
    labelDe: "Lade Schriftarten…",
    labelEn: "Loading typefaces…",
  },
  {
    id: "network",
    labelDe: "Verbinde mit dem Archiv-Netz…",
    labelEn: "Connecting to the archive network…",
  },
  {
    id: "auth",
    labelDe: "Prüfe Hüter-Session…",
    labelEn: "Verifying keeper session…",
  },
  {
    id: "save",
    labelDe: "Lade lokalen Spielstand…",
    labelEn: "Loading local save…",
  },
  {
    id: "cloud",
    labelDe: "Synchronisiere Cloud-Chronik…",
    labelEn: "Syncing cloud chronicle…",
  },
  {
    id: "offline",
    labelDe: "Berechne Offline-Fortschritt…",
    labelEn: "Calculating offline progress…",
  },
  {
    id: "systems",
    labelDe: "Starte Spielsysteme…",
    labelEn: "Starting game systems…",
  },
  {
    id: "ready",
    labelDe: "Das Archiv ist bereit.",
    labelEn: "The archive is ready.",
  },
] as const;

export type BootStepId = (typeof BOOT_STEPS)[number]["id"];

export function createBootProgressReporter(
  onProgress?: BootProgressListener,
): {
  readonly total: number;
  report(stepId: BootStepId): void;
} {
  const total = BOOT_STEPS.length;
  const indexById = new Map(
    BOOT_STEPS.map((step, index) => [step.id, index] as const),
  );

  return {
    total,
    report(stepId) {
      const index = indexById.get(stepId);
      if (index === undefined || onProgress === undefined) {
        return;
      }
      const step = BOOT_STEPS[index];
      if (step === undefined) {
        return;
      }
      const pct = Math.round(((index + 1) / total) * 100);
      onProgress({
        step: index + 1,
        total,
        pct,
        labelDe: step.labelDe,
        labelEn: step.labelEn,
      });
    },
  };
}
