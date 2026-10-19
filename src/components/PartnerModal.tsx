import { useState, type FormEvent } from "react";
import { Field, Modal, Button, inputClass, toast } from "./ui";
import { addInquiry } from "../lib/store";
import { normalizePhone } from "../lib/format";

export function PartnerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const close = () => {
    setErrors({});
    onClose();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhone(phone);
    const next = {
      name: name.trim().length < 2 ? "أدخل اسم المنشأة أو الجهة." : undefined,
      phone: normalized ? undefined : "أدخل رقم جوال سعودي صحيح، مثل 05XXXXXXXX.",
    };
    setErrors(next);
    if (next.name || next.phone) return;
    addInquiry(name.trim(), normalized!);
    toast("تم تسجيل رغبتك في الشراكة. سيتواصل معك فريق مُونة.");
    setName("");
    setPhone("");
    onClose();
  };

  return (
    <Modal open={open} onClose={close} title="انضم كشريك">
      <form onSubmit={submit} noValidate className="space-y-4">
        <p className="text-sm text-olive-900/75">اترك بيانات منشأتك أو جهتك وسيتواصل معك فريق مُونة لبحث الشراكة.</p>
        <Field label="اسم المنشأة أو الجهة" htmlFor="p-name" error={errors.name}>
          <input id="p-name" className={inputClass(errors.name)} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} />
        </Field>
        <Field label="رقم التواصل" htmlFor="p-phone" error={errors.phone}>
          <input id="p-phone" inputMode="tel" dir="ltr" className={`${inputClass(errors.phone)} text-end`} placeholder="05XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errors.phone} />
        </Field>
        <Button type="submit" className="w-full">إرسال</Button>
      </form>
    </Modal>
  );
}
