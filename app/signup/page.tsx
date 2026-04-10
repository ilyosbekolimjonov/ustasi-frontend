import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Ro'yxatdan o'tish"
      title="Ustasi bilan boshlang"
      description="O'zingizga mos yo'lni tanlang va kerakli ma'lumotlarni kiriting. Emailingizga tasdiqlash havolasi yuboriladi."
      sideTitle="Yaqin yordam va yangi mijozlar shu yerdan boshlanadi"
      sideText="Mijoz sifatida ustani tez toping yoki usta sifatida profilingizni yaratib xizmatlaringizni ko'rsating."
      highlights={[
        "Mijozlar uchun qisqa va qulay ro'yxatdan o'tish tayyor.",
        "Ustalar xizmat yo'nalishi, hududi va tajribasini ko'rsatib profilini to'ldiradi.",
        "Ro'yxatdan o'tgach, hisobingizni tasdiqlash havolasi emailingizga yuboriladi.",
      ]}
      bottomText="Hisobingiz bormi?"
      bottomLinkLabel="Kirish"
      bottomLinkHref="/login"
    >
      <SignupForm />
    </AuthShell>
  );
}
