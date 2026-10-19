import type { AppState, FoodRequest, Status } from "./types";

const H = 3600_000;

interface SeedRow {
  facility: string;
  phone: string;
  area: string;
  foodType: FoodRequest["foodType"];
  description: string;
  quantityText: string;
  units: number;
  readyInHours: number;
  createdAgoHours: number;
  status: Status;
  notes?: string;
  adminNote?: string;
  rejectReason?: string;
}

// All names, numbers and areas below are fictional demo data.
const ROWS: SeedRow[] = [
  {
    facility: "مطعم السفرة الذهبية",
    phone: "0500000001",
    area: "وسط خليص، قرب السوق المركزي",
    foodType: "meals",
    description: "أرز ولحم من وجبات الغداء، محفوظة في حافظات ساخنة",
    quantityText: "٣ صواني كبيرة",
    units: 40,
    readyInHours: 2,
    createdAgoHours: 1,
    status: "new",
  },
  {
    facility: "مخبز الفرن الطازج",
    phone: "0500000002",
    area: "الحي الشرقي",
    foodType: "bakery",
    description: "خبز تنور وصامولي من إنتاج اليوم",
    quantityText: "٦ أكياس",
    units: 60,
    readyInHours: 5,
    createdAgoHours: 3,
    status: "new",
    notes: "الاستلام من الباب الخلفي للمخبز",
  },
  {
    facility: "بقالة الخير",
    phone: "0500000003",
    area: "الحي الغربي",
    foodType: "packaged",
    description: "عصائر وألبان قريبة الانتهاء (أكثر من ٣ أيام متبقية)",
    quantityText: "٤ كراتين",
    units: 48,
    readyInHours: 24,
    createdAgoHours: 6,
    status: "review",
    adminNote: "بانتظار التأكد من تواريخ الصلاحية عند الاستلام.",
  },
  {
    facility: "مطعم مندي الوادي",
    phone: "0500000004",
    area: "طريق خليص الرئيسي",
    foodType: "meals",
    description: "مندي دجاج وأرز بعد مناسبة خاصة، لم يُقدَّم للضيوف",
    quantityText: "٥ صواني",
    units: 55,
    readyInHours: 1,
    createdAgoHours: 8,
    status: "receiving",
    adminNote: "تم التنسيق مع المتطوع لاستلام الطعام خلال ساعة.",
  },
  {
    facility: "سوبرماركت الواحة",
    phone: "0500000005",
    area: "الحي الشمالي",
    foodType: "produce",
    description: "خضار وفواكه طازجة بحالة جيدة (طماطم، خيار، موز)",
    quantityText: "١٠ صناديق",
    units: 80,
    readyInHours: -20,
    createdAgoHours: 30,
    status: "distributed",
    adminNote: "تم الاستلام والتحقق من السلامة ثم التوزيع.",
  },
  {
    facility: "حلويات الريحان",
    phone: "0500000006",
    area: "وسط خليص",
    foodType: "bakery",
    description: "كعك ومعمول مغلف من إنتاج الأمس",
    quantityText: "٨ علب",
    units: 32,
    readyInHours: -44,
    createdAgoHours: 52,
    status: "distributed",
    adminNote: "وُزّعت العلب على ٨ أسر عبر الجهة الخيرية الشريكة.",
  },
  {
    facility: "مطعم شواء النخيل",
    phone: "0500000007",
    area: "الحي الجنوبي",
    foodType: "meals",
    description: "وجبات مطبوخة منذ أكثر من ١٢ ساعة",
    quantityText: "٢ صينية",
    units: 15,
    readyInHours: -70,
    createdAgoHours: 76,
    status: "rejected",
    rejectReason: "الطعام مطبوخ منذ مدة طويلة ولا يمكن ضمان سلامته للتوزيع.",
  },
  {
    facility: "مخبز البركة",
    phone: "0500000008",
    area: "الحي الشرقي",
    foodType: "bakery",
    description: "خبز عربي متبقٍ نهاية اليوم",
    quantityText: "٤ أكياس",
    units: 40,
    readyInHours: 30,
    createdAgoHours: 0.5,
    status: "new",
  },
];

export function createSeedState(now = Date.now()): AppState {
  const requests: FoodRequest[] = ROWS.map((r, i) => {
    const created = new Date(now - r.createdAgoHours * H).toISOString();
    const updated = r.status === "new" ? created : new Date(now - (r.createdAgoHours - 1) * H).toISOString();
    const path: Status[] =
      r.status === "new"
        ? ["new"]
        : r.status === "review"
          ? ["new", "review"]
          : r.status === "receiving"
            ? ["new", "review", "receiving"]
            : r.status === "distributed"
              ? ["new", "review", "receiving", "distributed"]
              : ["new", "review", "rejected"];
    const history = path.map((status, k) => ({
      status,
      at: new Date(now - (r.createdAgoHours - k * 0.4) * H).toISOString(),
      ...(status === r.status && (r.rejectReason || r.adminNote) ? { note: r.rejectReason || r.adminNote } : {}),
    }));
    return {
      id: `seed-${i + 1}`,
      ref: `MN-${String(i + 1).padStart(4, "0")}`,
      facility: r.facility,
      phone: r.phone,
      area: r.area,
      foodType: r.foodType,
      description: r.description,
      quantityText: r.quantityText,
      units: r.units,
      readyAt: new Date(now + r.readyInHours * H).toISOString(),
      notes: r.notes ?? "",
      confirmedSafe: true,
      status: r.status,
      adminNote: r.adminNote ?? "",
      rejectReason: r.rejectReason ?? "",
      distributionConfirmed: r.status === "distributed",
      createdAt: created,
      updatedAt: updated,
      history,
      isDemo: true,
    };
  });
  return { version: 1, requests, inquiries: [], counter: requests.length };
}
