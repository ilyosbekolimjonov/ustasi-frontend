"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import { login } from "@/lib/auth-api";
import { getRoleDashboardPath, writeAuthSession } from "@/lib/auth-storage";

function validateEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("To'g'ri email manzilini kiriting.");
      return;
    }

    if (password.length < 8) {
      setError("Parol kamida 8 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    setLoading(true);

    try {
      const result = await login({ email, password });

      if (result.accessToken) {
        writeAuthSession({
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });
      }

      startTransition(() => {
        router.push(getRoleDashboardPath(result.user.role));
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error &&
          submitError.message ===
            "Server bilan bog'lanib bo'lmadi. Iltimos, keyinroq urinib ko'ring."
          ? submitError.message
          : "Email yoki parol noto'g'ri",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-bold text-[var(--navy)]">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="auth-input"
          placeholder="sizning@email.uz"
          autoComplete="email"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-bold text-[var(--navy)]">
          Parol
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="auth-input"
          placeholder="Kamida 8 ta belgi"
          autoComplete="current-password"
        />
      </div>

      <div className="flex justify-end">
        <Link href="#" className="text-sm font-semibold text-[var(--teal)]">
          Parolni unutdingizmi?
        </Link>
      </div>

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
        {loading ? "Kirilmoqda..." : "Kirish"}
      </button>
    </form>
  );
}
