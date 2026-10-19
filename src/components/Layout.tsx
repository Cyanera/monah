import { useEffect, useState, type ReactNode } from "react";
import { HandHeart, Mail, Menu, MessageCircle, ShieldAlert, X } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "./ui";
import { CONTACT } from "../config";
import { goToSection, navigate, useRoute, type Route } from "../lib/router";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const NAV: { label: string; section?: string; route?: Route }[] = [
  { label: "الرئيسية", route: "/" },
  { label: "كيف تعمل مُونة", section: "how" },
  { label: "أثر مُونة", section: "impact" },
  { label: "لوحة الإدارة التجريبية", route: "/admin" },
];

export function Header() {
  const route = useRoute();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [route]);

  const go = (item: (typeof NAV)[number]) => {
    setOpen(false);
    if (item.section) goToSection(item.section);
    else if (item.route) navigate(item.route);
  };

  const active = (item: (typeof NAV)[number]) => item.route === route && !item.section;

  return (
    <header className="sticky top-0 z-40 border-b border-sand/60 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <button onClick={() => navigate("/")} aria-label="مُونة - الرئيسية">
          <Logo />
        </button>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
          {NAV.map((item) => (
            <button
              key={item.label}
              onClick={() => go(item)}
              aria-current={active(item) ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-bold transition hover:bg-olive-100 ${
                active(item) ? "bg-olive-100 text-olive-800" : "text-olive-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button size="sm" className="hidden sm:inline-flex" onClick={() => navigate("/donate")}>
            <HandHeart className="size-4" />
            ساهم بفائض الطعام
          </Button>
          <button
            className="rounded-full p-2 text-olive-800 hover:bg-olive-100 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="animate-pop border-t border-sand/60 bg-cream px-4 pb-4 pt-2 lg:hidden" aria-label="قائمة الجوال">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {NAV.map((item) => (
              <button
                key={item.label}
                onClick={() => go(item)}
                className={`rounded-2xl px-4 py-3 text-start font-bold ${
                  active(item) ? "bg-olive-100 text-olive-800" : "text-olive-700 hover:bg-olive-50"
                }`}
              >
                {item.label}
              </button>
            ))}
            <Button className="mt-2" onClick={() => navigate("/donate")}>
              <HandHeart className="size-4" />
              ساهم بفائض الطعام
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  const links = [
    CONTACT.x && { href: CONTACT.x, label: "حساب مُونة على منصة إكس", icon: <XIcon className="size-5" /> },
    CONTACT.instagram && { href: CONTACT.instagram, label: "حساب مُونة على إنستغرام", icon: <InstagramIcon className="size-5" /> },
    CONTACT.whatsapp && { href: `https://wa.me/${CONTACT.whatsapp}`, label: "تواصل عبر واتساب", icon: <MessageCircle className="size-5" /> },
    CONTACT.email && { href: `mailto:${CONTACT.email}`, label: "راسلنا عبر البريد", icon: <Mail className="size-5" /> },
  ].filter(Boolean) as { href: string; label: string; icon: ReactNode }[];

  return (
    <footer className="pattern mt-20 bg-olive-900 text-olive-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Logo tone="light" showTagline />
          <p className="mt-4 max-w-sm text-sm leading-7 text-olive-200">
            مبادرة مجتمعية تحفظ فائض الطعام الصالح للاستهلاك وتوصله إلى الأسر المحتاجة بالتعاون مع الجهات الخيرية والمتطوعين.
          </p>
        </div>

        <div>
          <h3 className="mb-3 font-black text-cream">الموقع</h3>
          <p className="text-sm text-olive-200">محافظة خليص، المملكة العربية السعودية</p>
          <h3 className="mb-3 mt-6 font-black text-cream">روابط</h3>
          <ul className="space-y-1.5 text-sm">
            <li><button className="hover:text-white" onClick={() => navigate("/donate")}>ساهم بفائض الطعام</button></li>
            <li><button className="hover:text-white" onClick={() => navigate("/admin")}>لوحة الإدارة التجريبية</button></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-black text-cream">تواصل معنا</h3>
          {links.length > 0 ? (
            <ul className="flex flex-wrap gap-3">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={l.label}
                    className="flex size-11 items-center justify-center rounded-full bg-olive-800 transition hover:bg-gold hover:text-white"
                  >
                    {l.icon}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-olive-200">حسابات التواصل الرسمية للمبادرة قيد الإعداد وستُعلن قريبًا.</p>
          )}
        </div>
      </div>

      <div className="border-t border-olive-800">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-olive-300 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} مُونة. جميع الحقوق محفوظة.</span>
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="size-4 text-gold" />
            نسخة تجريبية للعرض فقط، والبيانات المعروضة غير حقيقية.
          </span>
        </div>
      </div>
    </footer>
  );
}
