import { SectionHeading } from "./section-heading";

const customerSteps = [
  "Xizmatni tanlang va muammoingizni qisqacha yozing.",
  "Mos ustalarni ko'rib chiqib so'rov yuboring.",
  "Tez bog'lanib, qulay vaqtda xizmatni boshlang.",
];

const masterSteps = [
  "Ro'yxatdan o'tib, yo'nalishlaringizni tanlang.",
  "Profil, tajriba va aloqa ma'lumotlarini to'ldiring.",
  "Yangi buyurtmalarni qabul qilib, mijoz bazangizni kengaytiring.",
];

function StepCard({
  title,
  steps,
  accent,
}: {
  title: string;
  steps: string[];
  accent: string;
}) {
  return (
    <article className="section-card rounded-[2rem] p-7 sm:p-8">
      <div
        className="inline-flex rounded-full px-4 py-2 text-sm font-bold"
        style={{ backgroundColor: accent }}
      >
        {title}
      </div>
      <ol className="mt-6 space-y-4">
        {steps.map((step, index) => (
          <li
            key={step}
            className="flex gap-4 rounded-[1.35rem] border border-white/70 bg-white/70 px-4 py-4"
          >
            <span className="icon-badge shrink-0 text-sm font-bold">
              {index + 1}
            </span>
            <p className="text-sm leading-7 text-[var(--navy-soft)] sm:text-base">{step}</p>
          </li>
        ))}
      </ol>
    </article>
  );
}

export function HowItWorks() {
  return (
    <section id="qanday-ishlaydi" className="section-shell py-20 sm:py-24">
      <SectionHeading
        eyebrow="Qanday ishlaydi"
        title="Har ikki tomon uchun sodda, tez va tushunarli jarayon"
        description="Ustasi xizmat qidirayotgan mijozlar va buyurtma izlayotgan ustalar uchun ortiqcha bosqichlarsiz ishlaydi."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <StepCard
          title="Mijoz uchun"
          steps={customerSteps}
          accent="rgba(243, 166, 35, 0.16)"
        />
        <StepCard
          title="Usta uchun"
          steps={masterSteps}
          accent="rgba(45, 143, 139, 0.16)"
        />
      </div>
    </section>
  );
}
