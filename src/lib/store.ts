import { useSyncExternalStore } from "react";
import { createSeedState } from "./seed";
import type { AppState, FoodRequest, FoodType, PartnerInquiry, Status } from "./types";

const KEY = "monah.demo.v1";

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed?.version === 1 && Array.isArray(parsed.requests)) return parsed;
    }
  } catch {
    /* storage unavailable or corrupted: fall through to seed */
  }
  return createSeedState();
}

let state: AppState = load();
const listeners = new Set<() => void>();

function commit(next: AppState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota: keep working in memory */
  }
  listeners.forEach((l) => l());
}

// Keep several open tabs in sync (new request in one tab appears in the admin tab).
window.addEventListener("storage", (e) => {
  if (e.key === KEY) {
    state = load();
    listeners.forEach((l) => l());
  }
});

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const useAppState = () => useSyncExternalStore(subscribe, () => state);

export interface NewRequestInput {
  facility: string;
  phone: string;
  area: string;
  foodType: FoodType;
  description: string;
  quantityText: string;
  units: number;
  readyAt: string;
  notes: string;
}

/** Creates a request. It always starts as "طلب جديد" and is never auto-approved. */
export function addRequest(input: NewRequestInput): FoodRequest {
  const now = new Date().toISOString();
  const counter = state.counter + 1;
  const req: FoodRequest = {
    ...input,
    id: crypto.randomUUID(),
    ref: `MN-${String(counter).padStart(4, "0")}`,
    confirmedSafe: true,
    status: "new",
    adminNote: "",
    rejectReason: "",
    distributionConfirmed: false,
    createdAt: now,
    updatedAt: now,
    history: [{ status: "new", at: now }],
    isDemo: false,
  };
  commit({ ...state, counter, requests: [req, ...state.requests] });
  return req;
}

export interface StatusChange {
  status: Status;
  adminNote: string;
  rejectReason?: string;
  distributionConfirmed?: boolean;
}

/** Applies a status change with the business rules enforced in one place. */
export function updateRequest(id: string, change: StatusChange): { ok: true } | { ok: false; error: string } {
  const current = state.requests.find((r) => r.id === id);
  if (!current) return { ok: false, error: "الطلب غير موجود." };
  if (change.status === "rejected" && !change.rejectReason?.trim()) {
    return { ok: false, error: "يجب كتابة سبب الرفض." };
  }
  if (change.status === "distributed" && !change.distributionConfirmed) {
    return { ok: false, error: "يلزم تأكيد التوزيع يدويًا قبل الانتقال إلى «تم التوزيع»." };
  }
  const now = new Date().toISOString();
  const statusChanged = current.status !== change.status;
  const note = change.status === "rejected" ? change.rejectReason!.trim() : change.adminNote.trim();
  const next: FoodRequest = {
    ...current,
    status: change.status,
    adminNote: change.adminNote.trim(),
    rejectReason: change.status === "rejected" ? change.rejectReason!.trim() : "",
    distributionConfirmed: change.status === "distributed",
    updatedAt: now,
    history: statusChanged
      ? [...current.history, { status: change.status, at: now, ...(note ? { note } : {}) }]
      : current.history,
  };
  commit({ ...state, requests: state.requests.map((r) => (r.id === id ? next : r)) });
  return { ok: true };
}

export function addInquiry(name: string, phone: string): PartnerInquiry {
  const inquiry: PartnerInquiry = {
    id: crypto.randomUUID(),
    name,
    phone,
    createdAt: new Date().toISOString(),
  };
  commit({ ...state, inquiries: [inquiry, ...state.inquiries] });
  return inquiry;
}

export function resetDemoData() {
  commit(createSeedState());
}

export interface Stats {
  facilities: number;
  requests: number;
  unitsDistributed: number;
  distributions: number;
  byStatus: Record<Status, number>;
}

export function computeStats(requests: FoodRequest[]): Stats {
  const byStatus: Record<Status, number> = { new: 0, review: 0, receiving: 0, distributed: 0, rejected: 0 };
  let unitsDistributed = 0;
  const facilities = new Set<string>();
  for (const r of requests) {
    byStatus[r.status]++;
    if (r.status !== "rejected") facilities.add(r.facility.trim());
    if (r.status === "distributed") unitsDistributed += r.units;
  }
  return {
    facilities: facilities.size,
    requests: requests.length,
    unitsDistributed,
    distributions: byStatus.distributed,
    byStatus,
  };
}
