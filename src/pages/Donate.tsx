import { useState, type FormEvent } from "react";
import { CheckCircle2, Clock, Copy, HandHeart, Info, Send } from "lucide-react";
import { Button, Field, inputClass, toast } from "../components/ui";
import { addRequest } from "../lib/store";
import { fmtDateTime, normalizePhone, toLatinDigits, toLocalInput } from "../lib/format";
import { navigate } from "../lib/router";
import { FOOD_TYPE_LABEL, type FoodRequest, type FoodType } from "../lib/types";

interface Form {
  facility: string;
  phone: string;
  area: string;
  foodType: FoodType | "";
  description: string;
  quantityText: string;
  units: string;
  readyAt: string;
  notes: string;
  confirmed: boolean;
}

const EMPTY: Form = {
  facility: "",
  phone: "",
  area: "",
  foodType: "",
  description: "",
  quantityText: "",
  units: "",
  readyAt: "",
  notes: "",
  confirmed: false,
};

type Errors = Partial<Record<keyof Form, string>>;

function validate(f: Form): Errors {
  const e: Errors = {};
  if (f.facility.trim().length < 2) e.facility = "أدخل اسم المنشأة.";
  if (!normalizePhone(f.phone)) e.phone = "أدخل رقم جوال سعودي صحيح، مثل 05XXXXXXXX.";
  if (f.area.trim().length < 3) e.area = "اكتب الحي أو موقع الاستلام داخل خليص.";
  if (!f.foodType) e.foodType = "اختر نوع الطعام.";
  if (f.description.trim().length < 5) e.description = "اكتب وصفًا مختصرًا للطعام (٥ أحرف على الأقل).";
  if (f.quantityText.trim().length < 1) e.quantityText = "اكتب الكمية، مثل: ٣ صواني أو ٥ أكياس.";
  const units = Number(toLatinDigits(f.units));
  if (!f.units.trim() || !Number.isInteger(units) || units < 1 || units > 5000) {
    e.units = "أدخل عددًا صحيحًا للوجبات أو العبوات بين ١ و٥٠٠٠.";
  }
  if (!f.readyAt) e.readyAt = "حدد موعد جاهزية الطعام للاستلام.";
  else if (new Date(f.readyAt).getTime() < Date.now() - 5 * 60_000) e.readyAt = "موعد الجاهزية لا يمكن أن يكون في الماضي.";
  if (!f.confirmed) e.confirmed = "يلزم تأكيد صلاحية الطعام وحفظه بطريقة مناسبة.";
  return e;
}

const QUICK_TIMES = [
  { label: "بعد ساعة", hours: 1 },
  { label: "بعد ٣ ساعات", hours: 3 },
  { label: "غدًا بعد ١٢ ساعة", hours: 12 },
];

export function Donate() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<FoodRequest | null>(null);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      toast("راجع الحقول المظللة ثم أعد المحاولة.", "error");
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    const req = addRequest({
      facility: form.facility.trim(),
      phone: normalizePhone(form.phone)!,
      area: form.area.trim(),
      foodType: form.foodType as FoodType,
      description: form.description.trim(),
      quantityText: form.quantityText.trim(),
      units: Number(toLatinDigits(form.units)),
      readyAt: new Date(form.readyAt).toISOString(),
      notes: form.notes.trim(),
    });
    setDone(req);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-14 sm:py-20">
        <div className="animate-pop rounded-[2rem] bg-white p-7 text-center shadow-lift ring-1 ring-sand/70 sm:p-10">
          <span className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-olive-100 text-olive-600">
            <CheckCircle2 className="size-9" />
          </span>
          <h1 className="text-2xl font-black text-olive-800">شكرًا لمساهمتك في حفظ النعمة</h1>
          <p className="mt-3 leading-8 text-olive-900/80">تم استلام طلبك وسيقوم فريق مُونة بمراجعته.</p>

          <div className="mt-6 rounded-2xl bg-cream p-4 ring-1 ring-sand">
            <div className="text-sm text-olive-700">الرقم المرجعي</div>
            <div className="mt-1 flex items-center justify-center gap-2 text-2xl font-black tracking-wider text-olive-800" dir="ltr">
              {done.ref}
              <button
                aria-label="نسخ الرقم المرجعي"
                className="rounded-full p-1.5 text-olive-600 hover:bg-olive-100"
                onClick={() => {
                  navigator.clipboard?.writeText(done.ref).then(
                    () => toast("تم نسخ الرقم المرجعي."),
                    () => toast("تعذر النسخ، انسخ الرقم يدويًا.", "error"),
                  );
                }}
              >
                <Copy className="size-4" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-olive-800">
              الحالة:
              <span className="rounded-full bg-gold-soft px-3 py-0.5 font-bold text-[#7a5a14] ring-1 ring-inset ring-[#e6cf8f]">طلب جديد</span>
            </div>
          </div>

          <p className="mt-4 flex items-start gap-2 text-start text-sm leading-7 text-olive-900/75">
            <Info className="mt-1 size-4 shrink-0 text-gold" />
            لا يُعتمد الطعام تلقائيًا بمجرد إرسال النموذج؛ سيراجعه الفريق ويتواصل معك على الرقم الذي أدخلته لتنسيق الاستلام.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={() => { setForm(EMPTY); setDone(null); }}>تسجيل طلب آخر</Button>
            <Button variant="secondary" onClick={() => navigate("/admin")}>عرض الطلب في لوحة الإدارة</Button>
            <Button variant="ghost" onClick={() => navigate("/")}>العودة للرئيسية</Button>
          </div>
        </div>
      </div>
    );
  }

  const err = (k: keyof Form) => errors[k];
  const common = (k: keyof Form) => ({
    id: `f-${k}`,
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `f-${k}-error` : undefined,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div className="mb-8">
        <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-olive-100 text-olive-700">
          <HandHeart className="size-6" />
        </span>
        <h1 className="text-3xl font-black text-olive-800 sm:text-4xl">ساهم بفائض الطعام</h1>
        <p className="mt-3 leading-8 text-olive-900/75">
          عبّئ البيانات التالية وسيراجع فريق مُونة طلبك ويتواصل معك لتنسيق الاستلام. يستغرق ذلك أقل من دقيقتين.
        </p>
      </div>

      <form onSubmit={submit} noValidate className="space-y-6 rounded-[2rem] bg-white p-5 shadow-soft ring-1 ring-sand/70 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="اسم المنشأة" htmlFor="f-facility" error={err("facility")}>
            <input {...common("facility")} className={inputClass(err("facility"))} value={form.facility} onChange={(e) => set("facility", e.target.value)} autoComplete="organization" />
          </Field>
          <Field label="رقم التواصل" htmlFor="f-phone" error={err("phone")}>
            <input {...common("phone")} className={`${inputClass(err("phone"))} text-end`} dir="ltr" inputMode="tel" autoComplete="tel" placeholder="05XXXXXXXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
        </div>

        <Field label="الحي أو موقع الاستلام داخل خليص" htmlFor="f-area" error={err("area")} hint="مثال: الحي الشرقي، بجوار السوق المركزي.">
          <input {...common("area")} className={inputClass(err("area"))} value={form.area} onChange={(e) => set("area", e.target.value)} />
        </Field>

        <fieldset>
          <legend className="mb-2 text-sm font-bold text-olive-900">نوع الطعام</legend>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5" role="radiogroup" aria-describedby={err("foodType") ? "f-foodType-error" : undefined}>
            {(Object.keys(FOOD_TYPE_LABEL) as FoodType[]).map((t, i) => (
              <label
                key={t}
                className={`cursor-pointer rounded-2xl border px-3 py-3 text-center text-sm font-bold transition has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-gold ${
                  form.foodType === t ? "border-olive-600 bg-olive-100 text-olive-800 ring-2 ring-olive-300" : "border-sand bg-white text-olive-700 hover:bg-olive-50"
                } ${err("foodType") ? "border-clay" : ""}`}
              >
                <input
                  type="radio"
                  name="foodType"
                  id={i === 0 ? "f-foodType" : undefined}
                  className="sr-only"
                  checked={form.foodType === t}
                  onChange={() => set("foodType", t)}
                />
                {FOOD_TYPE_LABEL[t]}
              </label>
            ))}
          </div>
          {err("foodType") && <p id="f-foodType-error" role="alert" className="mt-1.5 text-sm font-bold text-clay">{err("foodType")}</p>}
        </fieldset>

        <Field label="وصف مختصر للطعام" htmlFor="f-description" error={err("description")}>
          <textarea {...common("description")} rows={3} className={inputClass(err("description"))} placeholder="مثال: أرز ولحم من وجبات الغداء، محفوظة في حافظات ساخنة" value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="الكمية" htmlFor="f-quantityText" error={err("quantityText")} hint="مثال: ٣ صواني كبيرة، أو ٥ أكياس.">
            <input {...common("quantityText")} className={inputClass(err("quantityText"))} value={form.quantityText} onChange={(e) => set("quantityText", e.target.value)} />
          </Field>
          <Field label="عدد الوجبات أو العبوات" htmlFor="f-units" error={err("units")} hint="تقدير تقريبي يكفي.">
            <input {...common("units")} className={`${inputClass(err("units"))} text-end`} dir="ltr" inputMode="numeric" value={form.units} onChange={(e) => set("units", e.target.value)} />
          </Field>
        </div>

        <Field label="موعد جاهزية الطعام للاستلام" htmlFor="f-readyAt" error={err("readyAt")}>
          <input {...common("readyAt")} type="datetime-local" min={toLocalInput(new Date())} className={inputClass(err("readyAt"))} value={form.readyAt} onChange={(e) => set("readyAt", e.target.value)} />
          <div className="mt-2.5 flex flex-wrap gap-2">
            {QUICK_TIMES.map((q) => (
              <button
                type="button"
                key={q.label}
                onClick={() => set("readyAt", toLocalInput(new Date(Date.now() + q.hours * 3600_000)))}
                className="inline-flex items-center gap-1.5 rounded-full bg-olive-50 px-3.5 py-1.5 text-sm font-bold text-olive-700 ring-1 ring-olive-200 hover:bg-olive-100"
              >
                <Clock className="size-3.5" />
                {q.label}
              </button>
            ))}
          </div>
          {form.readyAt && !err("readyAt") && <p className="mt-2 text-xs text-olive-700">الموعد المحدد: {fmtDateTime(new Date(form.readyAt).toISOString())}</p>}
        </Field>

        <Field label="ملاحظات إضافية" htmlFor="f-notes" optional>
          <textarea {...common("notes")} rows={2} className={inputClass()} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>

        <div>
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
              err("confirmed") ? "border-clay bg-clay-soft/50" : "border-sand bg-cream"
            } has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-gold`}
          >
            <input
              {...common("confirmed")}
              type="checkbox"
              className="mt-1 size-5 shrink-0 accent-olive-700"
              checked={form.confirmed}
              onChange={(e) => set("confirmed", e.target.checked)}
            />
            <span className="text-sm leading-7 text-olive-900">
              أؤكد أن الطعام صالح للاستهلاك، ولم يُقدَّم سابقًا للزبائن، ومحفوظ بطريقة مناسبة (تبريد أو تسخين أو تغليف).
            </span>
          </label>
          {err("confirmed") && <p id="f-confirmed-error" role="alert" className="mt-1.5 text-sm font-bold text-clay">{err("confirmed")}</p>}
        </div>

        <Button type="submit" size="lg" className="w-full">
          <Send className="size-5" />
          إرسال الطلب
        </Button>
      </form>
    </div>
  );
}
