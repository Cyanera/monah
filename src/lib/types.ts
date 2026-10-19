export type Status = "new" | "review" | "receiving" | "distributed" | "rejected";

export type FoodType = "meals" | "bakery" | "produce" | "packaged" | "other";

export interface HistoryEntry {
  status: Status;
  at: string; // ISO
  note?: string;
}

export interface FoodRequest {
  id: string;
  ref: string;
  facility: string;
  phone: string;
  area: string;
  foodType: FoodType;
  description: string;
  quantityText: string; // free text, e.g. "٣ صواني كبيرة"
  units: number; // number of meals / packs, used in statistics
  readyAt: string; // ISO
  notes: string;
  confirmedSafe: boolean;
  status: Status;
  adminNote: string;
  rejectReason: string;
  distributionConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  history: HistoryEntry[];
  isDemo: boolean;
}

export interface PartnerInquiry {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface AppState {
  version: 1;
  requests: FoodRequest[];
  inquiries: PartnerInquiry[];
  counter: number;
}

export const STATUS_ORDER: Status[] = ["new", "review", "receiving", "distributed", "rejected"];

export const STATUS_LABEL: Record<Status, string> = {
  new: "طلب جديد",
  review: "قيد المراجعة",
  receiving: "جارٍ الاستلام",
  distributed: "تم التوزيع",
  rejected: "مرفوض",
};

export const FOOD_TYPE_LABEL: Record<FoodType, string> = {
  meals: "وجبات",
  bakery: "مخبوزات",
  produce: "خضار وفواكه",
  packaged: "مواد غذائية معبأة",
  other: "أخرى",
};
