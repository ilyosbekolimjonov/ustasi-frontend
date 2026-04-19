"use client";

import { useEffect, useState } from "react";

import { DashboardCard, EmptyState, ErrorState, LoadingState } from "@/components/dashboard/dashboard-ui";
import { MasterDashboardShell } from "@/components/dashboard/master-dashboard-shell";
import { uploadPublicImage } from "@/lib/auth-api";
import type { AuthSession } from "@/lib/auth-storage";
import {
  getOwnMasterProfile,
  listRegions,
  updateOwnMasterProfile,
  type MasterProfile,
  type Region,
} from "@/lib/dashboard-api";

export default function MasterProfilePage() {
  return (
    <MasterDashboardShell
      title="Profile"
      description="Usta profilingizdagi xizmat yo'nalishi, viloyat, tajriba va ko'rinish ma'lumotlarini yangilang."
    >
      {(session) => <MasterProfileContent session={session} />}
    </MasterDashboardShell>
  );
}

function MasterProfileContent({ session }: { session: AuthSession }) {
  const [profile, setProfile] = useState<MasterProfile | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
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
        const [regionItems, masterProfile] = await Promise.all([
          listRegions({ limit: 100 }),
          getOwnMasterProfile(session.accessToken).catch(() => null),
        ]);

        if (cancelled) {
          return;
        }

        setRegions(regionItems);

        if (masterProfile) {
          setProfile(masterProfile);
          setCategory(masterProfile.category);
          setCity(masterProfile.city);
          setRegion(masterProfile.region ?? "");
          setBio(masterProfile.bio);
          setExperienceYears(String(masterProfile.experienceYears ?? ""));
          setProfileImageUrl(masterProfile.profileImageUrl);
          setIsAvailable(masterProfile.isAvailable);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Usta profili yuklanmadi.");
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

  useEffect(() => {
    if (!profileImageFile) {
      setProfileImagePreviewUrl("");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(profileImageFile);
    setProfileImagePreviewUrl(nextPreviewUrl);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [profileImageFile]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const years = Number(experienceYears);
    if (!category.trim() || !city.trim() || !bio.trim()) {
      setError("Yo'nalish, viloyat va bio maydonlarini to'ldiring.");
      return;
    }

    if (!experienceYears.trim() || !Number.isInteger(years) || years < 0 || years > 30) {
      setError("Tajriba 0 dan 30 yilgacha raqam bo'lishi kerak.");
      return;
    }

    if (!profileImageFile && !profileImageUrl) {
      setError("Profil rasmi usta profili uchun majburiy.");
      return;
    }

    try {
      setSaving(true);
      const nextProfileImageUrl = profileImageFile
        ? await uploadPublicImage(profileImageFile)
        : profileImageUrl;

      const updated = await updateOwnMasterProfile(session.accessToken, {
        category: category.trim(),
        city: city.trim(),
        region: region.trim() || undefined,
        bio: bio.trim(),
        experienceYears: years,
        experienceText: `${years} yil tajriba`,
        profileImageUrl: nextProfileImageUrl,
        isAvailable,
      });

      setProfile(updated);
      setProfileImageUrl(updated.profileImageUrl);
      setProfileImageFile(null);
      setSuccess("Usta profili yangilandi.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Usta profili saqlanmadi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingState label="Usta profili yuklanmoqda..." />;
  }

  if (error && !profile && !category) {
    return <ErrorState message={error} />;
  }

  return (
    <DashboardCard>
      <form className="grid items-start gap-6 lg:grid-cols-[0.38fr_0.62fr]" onSubmit={handleSubmit}>
        <div className="rounded-[1.6rem] bg-[rgba(255,250,242,0.86)] p-5">
          <div className="overflow-hidden rounded-[1.4rem] border border-[var(--border)] bg-white">
            {profileImagePreviewUrl || profileImageUrl ? (
              <img
                src={profileImagePreviewUrl || profileImageUrl}
                alt=""
                className="h-72 w-full object-cover"
              />
            ) : (
              <div className="flex h-72 items-center justify-center px-5 text-center text-sm text-[var(--muted)]">
                Profil rasmi tanlanmagan.
              </div>
            )}
          </div>
          <label className="button-secondary mt-4 w-full cursor-pointer text-sm">
            Profil rasmini yuklash
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => setProfileImageFile(event.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <div className="grid gap-4">
          {!profile ? (
            <EmptyState
              title="Profilni yakunlang"
              description="Usta dashboard to'liq ishlashi uchun asosiy profil ma'lumotlarini to'ldiring."
            />
          ) : null}

          <Field label="Xizmat yo'nalishi" value={category} onChange={setCategory} placeholder="Masalan, Elektrik" />

          <div className="grid gap-2">
            <label className="text-sm font-bold text-[var(--navy)]">Viloyat</label>
            <select value={city} onChange={(event) => setCity(event.target.value)} className="auth-input">
              <option value="">Viloyatni tanlang</option>
              {regions.map((item) => (
                <option key={item.id} value={item.nameUz}>
                  {item.nameUz}
                </option>
              ))}
            </select>
          </div>

          <Field label="Tuman" value={region} onChange={setRegion} placeholder="Masalan, Yunusobod" />
          <Field
            label="Tajriba (yil)"
            value={experienceYears}
            onChange={(value) => setExperienceYears(value.replace(/\D/g, "").slice(0, 2))}
            placeholder="Masalan, 5"
            type="number"
          />

          <div className="grid gap-2">
            <label className="text-sm font-bold text-[var(--navy)]">Bio</label>
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              className="auth-input min-h-36 resize-y"
              placeholder="Tajribangiz, xizmatlaringiz va ishlash uslubingiz haqida qisqacha yozing."
            />
          </div>

          <label className="flex items-center gap-3 rounded-[1.2rem] border border-[var(--border)] bg-white/72 px-4 py-4 text-sm font-semibold text-[var(--navy)]">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(event) => setIsAvailable(event.target.checked)}
            />
            Hozir buyurtma qabul qilaman
          </label>

          {error ? <ErrorState message={error} /> : null}
          {success ? (
            <div className="rounded-[1.2rem] border border-[rgba(45,143,139,0.22)] bg-[rgba(237,250,248,0.92)] px-4 py-3 text-sm text-[var(--teal)]">
              {success}
            </div>
          ) : null}

          <button type="submit" className="button-primary w-fit cursor-pointer" disabled={saving}>
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </form>
    </DashboardCard>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-bold text-[var(--navy)]">{label}</label>
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        max={type === "number" ? 30 : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="auth-input"
        placeholder={placeholder}
      />
    </div>
  );
}
