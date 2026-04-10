import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Kirish"
      title="Hisobingizga kiring"
      description="Email va parolingizni kiriting, so'ng Ustasi ichidagi kerakli bo'limga o'tasiz."
      sideTitle="Ishonchli xizmat sari qulay kirish"
      sideText="Kerakli ustani topish ham, xizmatlaringizni taklif qilish ham bir necha qadamdan boshlanadi."
      highlights={[
        "Mijozlar va ustalar uchun bitta qulay kirish sahifasi tayyor.",
        "Kirishdan keyin hisobingiz ma'lumotlari saqlanib, ishlaringizni davom ettirasiz.",
        "Soddalik, ishonch va tezlik bu sahifaning asosiy tamoyili.",
      ]}
      bottomText="Hisobingiz yo'qmi?"
      bottomLinkLabel="Ro'yxatdan o'ting"
      bottomLinkHref="/signup"
    >
      <LoginForm />
    </AuthShell>
  );
}
