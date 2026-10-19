import { useMemo, useState } from "react";
import { Calendar, ChevronLeft, Inbox, Package, Phone, RotateCcw, Search, ShieldAlert, ShieldCheck, TriangleAlert } from "lucide-react";
import { Button, ConfirmDialog, Modal, StatusBadge, inputClass, toast } from "../components/ui";
import { computeStats, resetDemoData, updateRequest, useAppState } from "../lib/store";
import { fmtDateTime, fmtNumber, fmtShort } from "../lib/format";
import { FOOD_TYPE_LABEL, STATUS_LABEL, STATUS_ORDER, type FoodRequest, type Status } from "../lib/types";

type Filter = Status | "all";

export function Admin() {
  const { requests, inquiries } = useAppState();
  const stats = computeStats(requests);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests
      .filter((r) => filter === "all" || r.status === filter)
      .filter(
        (r) =>
          !q ||
          [r.facility, r.ref, r.area, r.description, r.phone].some((v) => v.toLowerCase().includes(q)),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [requests, query, filter]);

  const selected = requests.find((r) => r.id === openId) ?? null;

  const chips: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "الكل", count: requests.length },
    ...STATUS_ORDER.map((s) => ({ key: s as Filter, label: STATUS_LABEL[s], count: stats.byStatus[s] })),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div
        role="note"
        className="mb-8 flex items-start gap-3 rounded-2xl bg-clay-soft p-4 text-sm leading-7 text-[#6b3219] ring-1 ring-[#e4b9a2]"
      >
        <ShieldAlert className="mt-1 size-5 shrink-0 text-clay" />
        <p>
          <strong>لوحة تجريبية غير محمية.</strong> لا يوجد تسجيل دخول، والبيانات محفوظة في متصفحك فقط. لا تصلح للاستخدام التشغيلي
          العام قبل إضافة الصلاحيات والحماية والتخزين الآمن. لا تُدخل بيانات أسر حقيقية أو معلومات شخصية حساسة.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-olive-800 sm:text-4xl">لوحة الإدارة التجريبية</h1>
          <p className="mt-2 text-olive-900/75">راجع طلبات فائض الطعام وحدّث حالتها من التسجيل حتى التوزيع.</p>
        </div>
        <Button variant="secondary" size="sm" className="w-fit" onClick={() => setResetOpen(true)}>
          <RotateCcw className="size-4" />
          إعادة تعيين البيانات التجريبية
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "إجمالي الطلبات", value: stats.requests },
          { label: "تنتظر المراجعة", value: stats.byStatus.new },
          { label: "قيد العمل (مراجعة / استلام)", value: stats.byStatus.review + stats.byStatus.receiving },
          { label: "وجبات وعبوات موزعة", value: stats.unitsDistributed },
        ].map((s) => (
          <div key={s.label} className="rounded-3xl bg-white p-4 shadow-soft ring-1 ring-sand/70 sm:p-5">
            <div className="text-3xl font-black text-olive-800">{fmtNumber(s.value)}</div>
            <div className="mt-0.5 text-sm font-bold text-olive-700">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="mt-8 space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-olive-600" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باسم المنشأة أو الرقم المرجعي أو الحي…"
            aria-label="بحث في الطلبات"
            className={`${inputClass()} ps-12`}
          />
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="تصفية حسب الحالة">
          {chips.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              aria-pressed={filter === c.key}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ring-1 transition ${
                filter === c.key ? "bg-olive-700 text-cream ring-olive-700" : "bg-white text-olive-700 ring-sand hover:bg-olive-50"
              }`}
            >
              {c.label}
              <span className={`rounded-full px-2 text-xs ${filter === c.key ? "bg-olive-600" : "bg-olive-100"}`}>{fmtNumber(c.count)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="mt-6">
        {visible.length === 0 ? (
          <div className="rounded-[2rem] border-2 border-dashed border-sand bg-white/60 px-6 py-16 text-center">
            <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-olive-100 text-olive-600">
              <Inbox className="size-7" />
            </span>
            <h2 className="text-xl font-black text-olive-800">
              {requests.length === 0 ? "لا توجد طلبات بعد" : "لا توجد نتائج مطابقة"}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-olive-900/70">
              {requests.length === 0
                ? "ستظهر هنا طلبات فائض الطعام فور إرسالها من صفحة «ساهم بفائض الطعام»."
                : "جرّب تغيير كلمات البحث أو اختيار حالة أخرى."}
            </p>
            {requests.length > 0 && (
              <Button variant="secondary" size="sm" className="mt-5" onClick={() => { setQuery(""); setFilter("all"); }}>
                مسح البحث والتصفية
              </Button>
            )}
          </div>
        ) : (
          <ul className="space-y-3">
            {visible.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => setOpenId(r.id)}
                  className="group grid w-full gap-3 rounded-3xl bg-white p-4 text-start shadow-soft ring-1 ring-sand/70 transition hover:-translate-y-0.5 hover:shadow-lift sm:p-5 md:grid-cols-[1.4fr_1fr_1fr_auto_auto] md:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-olive-800">{r.facility}</span>
                      {r.isDemo && <span className="rounded-full bg-beige px-2 py-0.5 text-xs font-bold text-olive-700">تجريبي</span>}
                    </div>
                    <div dir="ltr" className="text-start text-xs font-bold text-olive-600">{r.ref}</div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-olive-900/80">
                    <Package className="size-4 shrink-0 text-gold" />
                    {FOOD_TYPE_LABEL[r.foodType]} · {r.quantityText}
                    <span className="text-olive-600">({fmtNumber(r.units)})</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-olive-900/80">
                    <Calendar className="size-4 shrink-0 text-gold" />
                    {fmtShort(r.readyAt)}
                  </div>
                  <StatusBadge status={r.status} />
                  <ChevronLeft className="hidden size-5 text-olive-400 transition group-hover:-translate-x-1 md:block" />
                  {r.status === "rejected" && r.rejectReason && (
                    <p className="flex items-start gap-1.5 text-sm text-clay md:col-span-5">
                      <TriangleAlert className="mt-1 size-4 shrink-0" />
                      سبب الرفض: {r.rejectReason}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {inquiries.length > 0 && (
        <section className="mt-12" aria-labelledby="inq">
          <h2 id="inq" className="text-xl font-black text-olive-800">طلبات الانضمام كشريك</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {inquiries.map((q) => (
              <li key={q.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-sand/70">
                <span className="font-bold text-olive-800">{q.name}</span>
                <span dir="ltr" className="text-sm text-olive-700">{q.phone}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <RequestDetail request={selected} onClose={() => setOpenId(null)} />

      <ConfirmDialog
        open={resetOpen}
        danger
        title="إعادة تعيين البيانات التجريبية؟"
        message="سيتم حذف جميع الطلبات التي أضفتَها وإعادة البيانات التجريبية الأصلية. لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="نعم، أعد التعيين"
        onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          resetDemoData();
          setResetOpen(false);
          setOpenId(null);
          setQuery("");
          setFilter("all");
          toast("تمت إعادة تعيين البيانات التجريبية.", "info");
        }}
      />
    </div>
  );
}

function RequestDetail({ request, onClose }: { request: FoodRequest | null; onClose: () => void }) {
  return (
    <Modal open={!!request} onClose={onClose} title="تفاصيل الطلب" wide>
      {/* key resets the draft whenever a different request is opened */}
      {request && <DetailBody key={request.id} request={request} onClose={onClose} />}
    </Modal>
  );
}

function DetailBody({ request: r, onClose }: { request: FoodRequest; onClose: () => void }) {
  const [status, setStatus] = useState<Status>(r.status);
  const [adminNote, setAdminNote] = useState(r.adminNote);
  const [rejectReason, setRejectReason] = useState(r.rejectReason);
  const [confirmed, setConfirmed] = useState(r.distributionConfirmed);
  const [error, setError] = useState("");

  const changed =
    status !== r.status || adminNote.trim() !== r.adminNote || (status === "rejected" && rejectReason.trim() !== r.rejectReason);

  const save = () => {
    const res = updateRequest(r.id, { status, adminNote, rejectReason, distributionConfirmed: confirmed });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    toast(`تم تحديث الطلب ${r.ref}: ${STATUS_LABEL[status]}.`);
    onClose();
  };

  const rows: [string, string][] = [
    ["الحي / موقع الاستلام", r.area],
    ["نوع الطعام", FOOD_TYPE_LABEL[r.foodType]],
    ["الكمية", `${r.quantityText} (${fmtNumber(r.units)} وجبة/عبوة)`],
    ["موعد الجاهزية", fmtDateTime(r.readyAt)],
    ["تاريخ التسجيل", fmtDateTime(r.createdAt)],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-black text-olive-800">{r.facility}</h3>
          <div dir="ltr" className="text-start text-sm font-bold text-olive-600">{r.ref}</div>
        </div>
        <StatusBadge status={r.status} />
      </div>

      <dl className="grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-sand/70 sm:grid-cols-2">
        <div className="flex items-start gap-2 sm:col-span-2">
          <Phone className="mt-1 size-4 shrink-0 text-gold" />
          <div>
            <dt className="text-xs text-olive-600">رقم التواصل</dt>
            <dd><a href={`tel:${r.phone}`} dir="ltr" className="font-bold text-olive-800 underline decoration-olive-300">{r.phone}</a></dd>
          </div>
        </div>
        {rows.map(([k, v]) => (
          <div key={k}>
            <div>
              <dt className="text-xs text-olive-600">{k}</dt>
              <dd className="font-bold text-olive-900">{v}</dd>
            </div>
          </div>
        ))}
        <div className="sm:col-span-2">
          <dt className="text-xs text-olive-600">وصف الطعام</dt>
          <dd className="font-bold text-olive-900">{r.description}</dd>
        </div>
        {r.notes && (
          <div className="sm:col-span-2">
            <dt className="text-xs text-olive-600">ملاحظات المنشأة</dt>
            <dd className="text-olive-900">{r.notes}</dd>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-olive-700 sm:col-span-2">
          <ShieldCheck className="size-4 text-olive-600" />
          أكدت المنشأة أن الطعام صالح ومحفوظ بطريقة مناسبة.
        </div>
      </dl>

      {/* Status change */}
      <fieldset>
        <legend className="mb-2 text-sm font-bold text-olive-900">تغيير حالة الطلب</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {STATUS_ORDER.map((s) => (
            <label
              key={s}
              className={`cursor-pointer rounded-2xl border px-2 py-2.5 text-center text-sm font-bold transition has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-gold ${
                status === s ? "border-olive-600 bg-olive-100 text-olive-800 ring-2 ring-olive-300" : "border-sand bg-white text-olive-700 hover:bg-olive-50"
              }`}
            >
              <input
                type="radio"
                name="status"
                className="sr-only"
                checked={status === s}
                onChange={() => {
                  setStatus(s);
                  setError("");
                }}
              />
              {STATUS_LABEL[s]}
            </label>
          ))}
        </div>
      </fieldset>

      {status === "rejected" && (
        <div>
          <label htmlFor="reject" className="mb-1.5 block text-sm font-bold text-clay">سبب الرفض (مطلوب)</label>
          <textarea
            id="reject"
            rows={2}
            value={rejectReason}
            onChange={(e) => { setRejectReason(e.target.value); setError(""); }}
            className={inputClass(error && !rejectReason.trim() ? error : undefined)}
            placeholder="مثال: الطعام لا يستوفي شروط السلامة"
          />
        </div>
      )}

      {status === "distributed" && (
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gold/50 bg-gold-soft/60 p-4 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-gold">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => { setConfirmed(e.target.checked); setError(""); }}
            className="mt-1 size-5 shrink-0 accent-olive-700"
          />
          <span className="text-sm leading-7 text-[#5c430e]">
            <strong>تأكيد يدوي مطلوب:</strong> أؤكد أن الطعام استُلم وتم التحقق من سلامته ووُزّع فعليًا على الأسر المستحقة.
          </span>
        </label>
      )}

      <div>
        <label htmlFor="admin-note" className="mb-1.5 flex items-baseline gap-2 text-sm font-bold text-olive-900">
          ملاحظة إدارية <span className="text-xs font-normal text-olive-700/70">(اختياري)</span>
        </label>
        <textarea id="admin-note" rows={2} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} className={inputClass()} />
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-2xl bg-clay-soft p-3 text-sm font-bold text-clay">
          <TriangleAlert className="size-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Button variant="secondary" onClick={onClose}>إغلاق</Button>
        <Button onClick={save} disabled={!changed}>حفظ التغييرات</Button>
      </div>

      {/* History */}
      <div>
        <h4 className="mb-3 text-sm font-black text-olive-800">سجل الطلب</h4>
        <ol className="relative space-y-4 border-s-2 border-sand ps-5">
          {[...r.history].reverse().map((h, i) => (
            <li key={`${h.at}-${i}`} className="relative">
              <span className="absolute -start-[1.65rem] top-1.5 size-3 rounded-full bg-olive-600 ring-4 ring-cream" />
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={h.status} />
                <span className="text-xs text-olive-600">{fmtDateTime(h.at)}</span>
              </div>
              {h.note && <p className="mt-1 text-sm text-olive-900/80">{h.note}</p>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
