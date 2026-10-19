import { useState } from "react";
import { ArrowLeft, ClipboardList, FlaskConical, HandHeart, Handshake, PackageCheck, ShieldCheck, Truck, Users, UtensilsCrossed, Scale, HeartHandshake } from "lucide-react";
import { Button } from "../components/ui";
import { WheatMark } from "../components/Logo";
import { PartnerModal } from "../components/PartnerModal";
import { goToSection, navigate } from "../lib/router";
import { computeStats, useAppState } from "../lib/store";
import { fmtNumber } from "../lib/format";

const STEPS = [
  { icon: ClipboardList, title: "المنشأة تسجل فائض الطعام", text: "تعبئ المنشأة نموذجًا قصيرًا بنوع الطعام وكميته وموعد جاهزيته." },
  { icon: Users, title: "فريق مُونة يراجع ويُنسّق", text: "يراجع الفريق الطلب ويتواصل مع المنشأة لتحديد موعد الاستلام." },
  { icon: ShieldCheck, title: "استلام الطعام والتحقق من سلامته", text: "يُفحص الطعام عند الاستلام، ولا يُقبل إلا ما كان صالحًا ومحفوظًا جيدًا." },
  { icon: Truck, title: "التوزيع على الأسر المستحقة", text: "يُوزَّع الطعام بالتعاون مع الجهات الخيرية والمتطوعين بكرامة وخصوصية." },
];

const PRINCIPLES = [
  { icon: ShieldCheck, title: "سلامة الغذاء أولًا", text: "نقبل الطعام الصالح فقط، ونرفض ما لا نضمن سلامته." },
  { icon: HeartHandshake, title: "كرامة المستفيد", text: "يصل الطعام إلى الأسر بخصوصية واحترام." },
  { icon: Scale, title: "شفافية في كل خطوة", text: "لكل طلب رقم مرجعي وحالة واضحة من التسجيل حتى التوزيع." },
];

function Stat({ icon: Icon, value, label }: { icon: typeof Users; value: number; label: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand/70 sm:p-6">
      <span className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-olive-100 text-olive-700">
        <Icon className="size-5" />
      </span>
      <div className="text-3xl font-black text-olive-800 sm:text-4xl">{fmtNumber(value)}</div>
      <div className="mt-1 text-sm font-bold text-olive-700">{label}</div>
    </div>
  );
}

export function Home() {
  const { requests } = useAppState();
  const stats = computeStats(requests);
  const [partnerOpen, setPartnerOpen] = useState(false);

  return (
    <>
      {/* Hero */}
      <section className="pattern relative overflow-hidden bg-olive-800 text-cream">
        <div className="pointer-events-none absolute -start-24 -top-24 size-80 rounded-full bg-olive-600/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 end-0 size-96 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="animate-rise">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-olive-700/70 px-4 py-1.5 text-sm font-bold text-gold-soft ring-1 ring-olive-500/50">
              <WheatMark className="size-5 text-olive-600" />
              مبادرة مجتمعية في محافظة خليص
            </span>
            <h1 className="text-6xl font-black leading-tight sm:text-7xl">مُونة</h1>
            <p className="mt-2 text-2xl font-bold text-gold-soft sm:text-3xl">من فائض النعمة، نصنع الكفاية</p>
            <p className="mt-6 max-w-xl text-lg leading-9 text-olive-100">
              نصل فائض الطعام الصالح للاستهلاك بمن يحتاجه، لنحفظ النعمة ونعزز التكافل في محافظة خليص.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button variant="gold" size="lg" onClick={() => navigate("/donate")}>
                <HandHeart className="size-5" />
                ساهم بفائض الطعام
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="!bg-transparent !text-cream !ring-olive-300/60 hover:!bg-olive-700"
                onClick={() => goToSection("about")}
              >
                تعرف على مُونة
                <ArrowLeft className="size-5" />
              </Button>
            </div>
          </div>

          <div className="animate-rise hidden justify-center lg:flex" style={{ animationDelay: "120ms" }} aria-hidden="true">
            <div className="relative">
              <div className="absolute inset-0 -rotate-6 rounded-[2.5rem] bg-gold/25" />
              <div className="relative flex size-72 items-center justify-center rounded-[2.5rem] bg-olive-700 ring-1 ring-olive-500/60 shadow-lift">
                <WheatMark className="size-44 text-olive-800" />
                <span className="absolute -bottom-4 start-6 flex items-center gap-2 rounded-2xl bg-cream px-4 py-2 text-sm font-black text-olive-800 shadow-lift">
                  <UtensilsCrossed className="size-4 text-gold" />
                  طعام صالح، لا يُهدر
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-black text-olive-800 sm:text-4xl">ما هي مُونة؟</h2>
            <p className="mt-4 leading-9 text-olive-900/80">
              في المطاعم والمخابز والمحلات الغذائية يتبقى كل يوم طعام صالح قد يُرمى، وفي الجوار أسر تحتاجه. مُونة حلقة وصل بينهما:
              تنظّم استلام الفائض الصالح وتوزيعه بالتعاون مع الجهات الخيرية والمتطوعين.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="rounded-3xl bg-beige/70 p-5 ring-1 ring-sand/70">
                <p.icon className="mb-3 size-6 text-gold" />
                <h3 className="font-black text-olive-800">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-7 text-olive-900/75">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-beige/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-black text-olive-800 sm:text-4xl">كيف تعمل مُونة؟</h2>
          <p className="mt-3 text-olive-900/75">أربع خطوات واضحة من تسجيل الفائض حتى وصوله لمن يحتاجه.</p>
          <ol className="relative mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-3xl bg-white p-6 shadow-soft ring-1 ring-sand/70 transition hover:-translate-y-1 hover:shadow-lift">
                <span className="absolute -top-4 start-6 flex size-9 items-center justify-center rounded-full bg-gold text-lg font-black text-white shadow-soft">
                  {fmtNumber(i + 1)}
                </span>
                <span className="mb-4 mt-2 flex size-14 items-center justify-center rounded-2xl bg-olive-100 text-olive-700">
                  <s.icon className="size-7" />
                </span>
                <h3 className="text-lg font-black text-olive-800">{s.title}</h3>
                <p className="mt-2 text-sm leading-7 text-olive-900/75">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black text-olive-800 sm:text-4xl">أثر مُونة</h2>
            <p className="mt-3 text-olive-900/75">أرقام تتحدث تلقائيًا مع كل طلب تُسجّله أو تُحدّث حالته.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-gold-soft px-4 py-2 text-sm font-bold text-[#7a5a14] ring-1 ring-[#e6cf8f]">
            <FlaskConical className="size-4" />
            بيانات تجريبية وليست نتائج حقيقية
          </span>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat icon={Handshake} value={stats.facilities} label="منشآت مشاركة" />
          <Stat icon={ClipboardList} value={stats.requests} label="طلبات فائض" />
          <Stat icon={UtensilsCrossed} value={stats.unitsDistributed} label="وجبات وعبوات موزعة" />
          <Stat icon={PackageCheck} value={stats.distributions} label="عمليات توزيع مكتملة" />
        </div>
      </section>

      {/* Partners */}
      <section id="partners" className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-sand/70 sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-black text-olive-800">شركاؤنا</h2>
              <p className="mt-2 text-olive-900/75">هنا ستظهر شعارات المنشآت والجهات التي تشاركنا حفظ النعمة.</p>
            </div>
            <Button variant="primary" onClick={() => setPartnerOpen(true)}>
              <Handshake className="size-5" />
              انضم كشريك
            </Button>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="flex aspect-[3/2] items-center justify-center rounded-2xl border-2 border-dashed border-sand bg-cream text-sm font-bold text-olive-700/50"
              >
                شعار شريك
              </div>
            ))}
          </div>
        </div>
      </section>

      <PartnerModal open={partnerOpen} onClose={() => setPartnerOpen(false)} />
    </>
  );
}
