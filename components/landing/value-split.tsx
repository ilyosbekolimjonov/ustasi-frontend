import Link from "next/link";

import { SectionHeading } from "./section-heading";

const customerBenefits = [
  "Qisqa vaqt ichida mos usta topish",
  "Bir joydan bir nechta yo'nalish bo'yicha izlash",
  "Aloqa va buyurtma jarayonini soddalashtirish",
];

const masterBenefits = [
  "Ko'proq ko'rinish va yangi mijozlar oqimi",
  "Xizmatlaringizni aniq profil bilan taqdim etish",
  "Platforma orqali ish hajmini barqaror oshirish",
];

function ValueCard({
  id,
  title,
  description,
  items,
  cta,
  href,
  accentClass,
}: {
  id: string;
  title: string;
  description: string;
  items: string[];
  cta: string;
  href: string;
  accentClass: string;
}) {
  return (
    <article
      id={id}
      className={`relative overflow-hidden rounded-[2rem] border p-8 shadow-[0_24px_60px_rgba(23,32,51,0.12)] ${accentClass}`}
    >
      <div className="relative z-10">
        <h3 className="section-title text-4xl text-[var(--navy)]">{title}</h3>
        <p className="mt-4 max-w-xl text-base leading-8 text-[var(--navy-soft)]">
          {description}
        </p>
        <ul className="mt-8 space-y-3">
          {items.map((item) => (
            <li
              key={item}
              className="rounded-[1.25rem] border border-white/70 bg-white/75 px-4 py-4 text-sm font-medium text-[var(--navy-soft)]"
            >
              {item}
            </li>
          ))}
        </ul>
        <Link href={href} className="button-primary mt-8">
          {cta}
        </Link>
      </div>
    </article>
  );
}

export function ValueSplit() {
  return (
    <section className="section-shell py-20 sm:py-24">
      <SectionHeading
        eyebrow="Nima uchun Ustasi"
        title="Platforma ikki tomonga ham foyda beradigan qilib qurilgan"
        description="Mijozlar uchun tezkor yechim, ustalar uchun esa ko'rinish va o'sish imkoniyati bir sahifada uyg'unlashadi."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <ValueCard
          id="mijozlar"
          title="Mijozlar uchun"
          description="Qidiruvdan aloqa qilishgacha bo'lgan yo'l imkon qadar sodda va tushunarli bo'lishi kerak."
          items={customerBenefits}
          cta="Hoziroq usta topish"
          href="/signup"
          accentClass="border-[rgba(243,166,35,0.25)] bg-[linear-gradient(180deg,rgba(255,248,235,0.94),rgba(255,255,255,0.78))]"
        />
        <ValueCard
          id="ustalar"
          title="Ustalar uchun"
          description="O'z xizmatini ko'rsatadigan mutaxassislar uchun bu sahifa yangi mijozlar va ishonchli imidjga yordam beradi."
          items={masterBenefits}
          cta="Usta sifatida qo'shilish"
          href="/login"
          accentClass="border-[rgba(45,143,139,0.24)] bg-[linear-gradient(180deg,rgba(237,250,248,0.94),rgba(255,255,255,0.78))]"
        />
      </div>
    </section>
  );
}
