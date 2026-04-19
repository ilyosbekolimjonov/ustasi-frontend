"use client";

import { useEffect, useState } from "react";

import { DashboardCard, EmptyState, ErrorState, LoadingState } from "@/components/dashboard/dashboard-ui";
import { UserDashboardShell } from "@/components/dashboard/user-dashboard-shell";
import { uploadPublicImage } from "@/lib/auth-api";
import {
  getCurrentUser,
  listRegions,
  updateCurrentUser,
  type Region,
  type UserProfile,
} from "@/lib/dashboard-api";
import type { AuthSession } from "@/lib/auth-storage";

export default function ProfilePage() {
  return (
    <UserDashboardShell
      title="Profile"
      description="Asosiy profilingizni yangilang: ism, telefon, profil rasmi, manzil va viloyat."
    >
      {(session) => <ProfileContent session={session} />}
    </UserDashboardShell>
  );
}

function ProfileContent({ session }: { session: AuthSession }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [regionId, setRegionId] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const [user, regionItems] = await Promise.all([
          getCurrentUser(session.accessToken),
          listRegions({ limit: 100 }),
        ]);

        if (cancelled) {
          return;
        }

        setProfile(user);
        setRegions(regionItems);
        setFullName(user.fullName);
        setPhone(user.phone);
        setAddress(user.address ?? "");
        setRegionId(user.regionId ?? "");
        setPreviewUrl(user.avatarUrl ?? "");
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Profil yuklanmadi.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [session.accessToken]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const avatarUrl = avatarFile ? await uploadPublicImage(avatarFile) : profile?.avatarUrl ?? undefined;

      const updated = await updateCurrentUser(session.accessToken, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        avatarUrl,
        regionId: regionId || undefined,
      });

      setProfile(updated);
      setPreviewUrl(updated.avatarUrl ?? "");
      setAvatarFile(null);
      setSuccess("Profil ma'lumotlari yangilandi.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Profil saqlanmadi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingState label="Profil yuklanmoqda..." />;
  }

  if (error && !profile) {
    return <ErrorState message={error} />;
  }

  if (!profile) {
    return <EmptyState title="Profil topilmadi" description="Hisob ma'lumotlari mavjud emas." />;
  }

  return (
    <DashboardCard>
      <div className="grid items-start gap-6 lg:grid-cols-[0.36fr_0.64fr]">
        <div className="rounded-[1.6rem] bg-[rgba(255,250,242,0.86)] p-5">
          <div className="overflow-hidden rounded-[1.4rem] border border-[var(--border)] bg-white">
            {previewUrl ? (
              <img src={previewUrl} alt={profile.fullName} className="h-72 w-full object-cover" />
            ) : (
              <div className="flex h-72 items-center justify-center text-5xl font-bold text-[var(--navy)]">
                {profile.fullName.slice(0, 1)}
              </div>
            )}
          </div>
          <label className="button-secondary mt-4 w-full cursor-pointer text-sm">
            Profil rasmini yuklash
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setAvatarFile(file);
                setPreviewUrl(file ? URL.createObjectURL(file) : profile.avatarUrl ?? "");
              }}
            />
          </label>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <Field label="To'liq ism" value={fullName} onChange={setFullName} />
          <Field label="Telefon" value={phone} onChange={setPhone} />
          <Field label="Manzil" value={address} onChange={setAddress} />

          <div className="grid gap-2">
            <label className="text-sm font-bold text-[var(--navy)]">Viloyat</label>
            <select
              value={regionId}
              onChange={(event) => setRegionId(event.target.value)}
              className="auth-input"
            >
              <option value="">Viloyatni tanlang</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.nameUz}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-[1.2rem] border border-[var(--border)] bg-white/72 px-4 py-4 text-sm text-[var(--muted)]">
            <p>Email: <span className="font-semibold text-[var(--navy)]">{profile.email}</span></p>
            <p className="mt-2">Rol: <span className="font-semibold text-[var(--navy)]">{profile.role}</span></p>
          </div>

          {error ? <ErrorState message={error} /> : null}
          {success ? (
            <div className="rounded-[1.2rem] border border-[rgba(45,143,139,0.22)] bg-[rgba(237,250,248,0.92)] px-4 py-3 text-sm text-[var(--teal)]">
              {success}
            </div>
          ) : null}

          <button type="submit" className="button-primary w-fit cursor-pointer" disabled={saving}>
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </form>
      </div>
    </DashboardCard>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-bold text-[var(--navy)]">{label}</label>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="auth-input" />
    </div>
  );
}
