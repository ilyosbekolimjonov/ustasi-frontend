import { SectionHeading } from "./section-heading";

const faqs = [
  {
    question: "Ustani qanday topsam bo'ladi?",
    answer:
      "Kerakli xizmat yo'nalishini tanlaysiz, qisqa so'rov qoldirasiz va sizga mos ustalar bilan bog'lanasiz.",
  },
  {
    question: "Qanday ro'yxatdan o'taman?",
    answer:
      "Sahifadagi Sign up tugmasi orqali hisob ochasiz va kerakli rolni tanlab davom etasiz.",
  },
  {
    question: "Usta sifatida qanday qo'shilaman?",
    answer:
      "Login yoki Sign up orqali kirib, profil ma'lumotlaringizni to'ldirasiz va xizmat yo'nalishlaringizni ko'rsatasiz.",
  },
  {
    question: "Xizmatlar qaysi yo'nalishlarda bo'ladi?",
    answer:
      "Elektrik, santexnik, konditsioner, maishiy texnika va boshqa ko'plab kundalik xizmatlar bosqichma-bosqich qo'shiladi.",
  },
  {
    question: "Mijoz va usta o'rtasidagi aloqa qanday bo'ladi?",
    answer:
      "Platforma foydalanuvchini kerakli usta bilan tez bog'lashga xizmat qiladi, keyingi kelishuv esa qulay usulda davom etadi.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="section-shell py-20 sm:py-24">
      <SectionHeading
        eyebrow="FAQ"
        title="Ko'p beriladigan savollar"
        description="Sahifa MVP bo'lgani uchun foydalanuvchi eng tez tushunadigan va ishonch hosil qiladigan javoblarga urg'u berildi."
        align="center"
      />
      <div className="mt-10 grid gap-4">
        {faqs.map((faq, index) => (
          <details
            key={faq.question}
            className="section-card group rounded-[1.6rem] px-5 py-5 sm:px-7"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
              <span className="text-base font-bold text-[var(--navy)] sm:text-lg">
                {faq.question}
              </span>
              <span className="icon-badge shrink-0 text-sm font-bold transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="muted-text mt-4 max-w-3xl pr-10 text-sm leading-7 sm:text-base">
              {faq.answer}
            </p>
            <div className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--amber-deep)]">
              {`0${index + 1}`}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
