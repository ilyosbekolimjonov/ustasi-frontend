"use client";

import Link from "next/link";
import { useState } from "react";

import { signup, type SignupRole } from "@/lib/auth-api";
import { toUzbekPhoneE164 } from "@/lib/uz-phone";

import { UzPhoneField } from "./uz-phone-field";

function validateEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

function roleLabel(role: SignupRole) {
  return role === "MASTER" ? "Usta" : "Mijoz";
}

export function SignupForm() {
  const [role, setRole] = useState<SignupRole>("USER");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [experienceText, setExperienceText] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const isMaster = role === "MASTER";

  function resetStatus() {
    setError("");
    setSuccessMessage("");
  }

  function validateForm() {
    if (!fullName.trim()) return "Ism-familiyangizni kiriting.";
    if (!validateEmail(email)) return "To'g'ri email manzilini kiriting.";
    if (phoneDigits.length !== 9) return "Telefon raqamini to'liq kiriting.";
    if (password.length < 8) return "Parol kamida 8 ta belgidan iborat bo'lishi kerak.";
    if (password !== confirmPassword) return "Parollar bir xil emas.";

    if (isMaster) {
      if (!category.trim()) return "Qaysi yo'nalishda ishlashingizni kiriting.";
      if (!city.trim()) return "Shaharingizni kiriting.";
      if (!experienceText.trim()) return "Tajriba ma'lumotingizni kiriting.";
      if (!bio.trim()) return "O'zingiz haqingizda qisqacha yozing.";
      if (!profileImageFile) return "Profil rasmi usta uchun majburiy.";
    }

    return "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetStatus();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const result = await signup({
        role,
        fullName,
        email,
        phone: toUzbekPhoneE164(phoneDigits),
        password,
        avatarFile,
        category: isMaster ? category : undefined,
        city: isMaster ? city : undefined,
        region: isMaster ? region : undefined,
        experienceText: isMaster ? experienceText : undefined,
        bio: isMaster ? bio : undefined,
        profileImageFile: isMaster ? profileImageFile : undefined,
      });

      setSuccessMessage(
        result.verificationEmailSent
          ? `Hisobingiz yaratildi. ${email} manziliga tasdiqlash havolasi yuborildi.`
          : "Hisob yaratildi. Tasdiqlash havolasini yuborishda muammo bo'ldi, keyinroq qayta urinib ko'ring.",
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Ro'yxatdan o'tishda xatolik yuz berdi.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <RoleCard 
          active={role === "USER"}
          title="Mijoz sifatida"
          text="Uy, ofis yoki texnika uchun kerakli ustani topish uchun."
          onClick={() => {
            setRole("USER");
            resetStatus();
          }}
        />
        <RoleCard
          active={role === "MASTER"}
          title="Usta sifatida"
          text="Xizmatlaringizni ko'rsatib, yangi mijozlar olish uchun."
          onClick={() => {
            setRole("MASTER");
            resetStatus();
          }}
        />
      </div>

      {successMessage ? (
        <div className="rounded-[1.6rem] border border-[rgba(45,143,139,0.2)] bg-[rgba(237,250,248,0.95)] px-5 py-5 text-[var(--navy)]">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--teal)]">
            Muvaffaqiyatli
          </p>
          <h3 className="mt-3 text-2xl font-bold">
            {roleLabel(role)} hisobi yaratildi
          </h3>
          <p className="mt-3 text-sm leading-7 text-[var(--navy-soft)] sm:text-base">
            {successMessage}
          </p>
          <Link href="/login" className="button-primary mt-5">
            Kirish sahifasiga o&apos;tish
          </Link>
        </div>
      ) : (
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="full-name"
              label="To'liq ism"
              value={fullName}
              onChange={setFullName}
              placeholder="Ali Aliyev"
            />
            <Field
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="sizning@email.uz"
            />
            <UzPhoneField
              label="Telefon"
              value={phoneDigits}
              onChange={setPhoneDigits}
            />
            <Field
              id="password"
              label="Parol"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Kamida 8 ta belgi"
            />
            <Field
              id="confirm-password"
              label="Parolni tasdiqlang"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Parolni qayta kiriting"
            />
            <FileField
              label={isMaster ? "Profil rasmi" : "Avatar (ixtiyoriy)"}
              helperText={
                isMaster
                  ? "Rasm profilingizda ko'rinadi va mijozlarga ishonch beradi."
                  : "Istasangiz profilingiz uchun rasm qo'shishingiz mumkin."
              }
              required={isMaster}
              file={isMaster ? profileImageFile : avatarFile}
              onChange={(file) => {
                if (isMaster) {
                  setProfileImageFile(file);
                } else {
                  setAvatarFile(file);
                }
              }}
            />
          </div>

          {isMaster ? (
            <div className="grid gap-5 rounded-[1.6rem] border border-[rgba(45,143,139,0.16)] bg-[rgba(237,250,248,0.74)] p-4 sm:p-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="category"
                  label="Xizmat yo'nalishi"
                  value={category}
                  onChange={setCategory}
                  placeholder="Masalan, Elektrik"
                />
                <Field
                  id="city"
                  label="Shahar"
                  value={city}
                  onChange={setCity}
                  placeholder="Toshkent"
                />
                <Field
                  id="region"
                  label="Tuman yoki hudud"
                  value={region}
                  onChange={setRegion}
                  placeholder="Yunusobod"
                />
                <Field
                  id="experience"
                  label="Tajriba"
                  value={experienceText}
                  onChange={setExperienceText}
                  placeholder="Masalan, 7 yil tajriba"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="bio" className="text-sm font-bold text-[var(--navy)]">
                  O&apos;zingiz haqingizda
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  className="auth-input min-h-32 resize-y"
                  placeholder="Qanday xizmat ko'rsatishingiz, tajribangiz va ishlash usulingiz haqida qisqacha yozing."
                />
              </div>
            </div>
          ) : null}

          <div
            className={`rounded-[1.25rem] border px-4 py-3 text-sm ${
              error
                ? "border-[rgba(207,122,18,0.22)] bg-[rgba(255,248,235,0.92)] text-[var(--amber-deep)]"
                : "border-transparent bg-transparent p-0"
            }`}
            aria-live="polite"
          >
            {error}
          </div>

          <button type="submit" className="button-primary w-full cursor-pointer" disabled={loading}>
            {loading ? "Yuborilmoqda..." : `${roleLabel(role)} sifatida ro'yxatdan o'tish`}
          </button>
        </form>
      )}
    </div>
  );
}

function RoleCard({
  active,
  title,
  text,
  onClick,
}: {
  active: boolean;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
        active
          ? "border-[rgba(23,32,51,0.12)] bg-[var(--navy)] text-white shadow-lg"
          : "border-[var(--border)] bg-white/72 text-[var(--navy)]"
      }`}
    >
      <div className="text-sm font-bold">{title}</div>
      <p className={`mt-2 text-sm ${active ? "text-white/72" : "text-[var(--muted)]"}`}>
        {text}
      </p>
    </button>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-bold text-[var(--navy)]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="auth-input"
        placeholder={placeholder}
      />
    </div>
  );
}

function FileField({
  label,
  helperText,
  required,
  file,
  onChange,
}: {
  label: string;
  helperText: string;
  required?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-bold text-[var(--navy)]">
        {label}
        {required ? " *" : ""}
      </label>
      <label className="auth-input flex min-h-14 cursor-pointer items-center justify-between gap-3">
        <span className="truncate text-sm text-[var(--navy-soft)]">
          {file ? file.name : "Fayl tanlang"}
        </span>
        <span className="rounded-full bg-[rgba(23,32,51,0.08)] px-3 py-1 text-xs font-bold text-[var(--navy)]">
          Yuklash
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />
      </label>
      <p className="text-xs text-[var(--muted)]">{helperText}</p>
    </div>
  );
}
