"use client";

import { useEffect, useMemo, useState } from "react";

import { uploadPublicImage } from "@/lib/auth-api";
import type { ServiceRequest, ServiceRequestPayload } from "@/lib/dashboard-api";

type PendingFile = {
  file: File;
  previewUrl: string;
};

type ServiceRequestFormProps = {
  initialRequest?: ServiceRequest | null;
  submitLabel: string;
  busyLabel: string;
  loading?: boolean;
  onSubmit: (payload: ServiceRequestPayload) => Promise<void>;
  onCancel?: () => void;
};

function toInputValue(value: number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

export function ServiceRequestForm({
  initialRequest,
  submitLabel,
  busyLabel,
  loading = false,
  onSubmit,
  onCancel,
}: ServiceRequestFormProps) {
  const [title, setTitle] = useState(initialRequest?.title ?? "");
  const [description, setDescription] = useState(initialRequest?.description ?? "");
  const [category, setCategory] = useState(initialRequest?.category ?? "");
  const [city, setCity] = useState(initialRequest?.city ?? "");
  const [addressText, setAddressText] = useState(initialRequest?.addressText ?? "");
  const [budgetMin, setBudgetMin] = useState(toInputValue(initialRequest?.budgetMin));
  const [budgetMax, setBudgetMax] = useState(toInputValue(initialRequest?.budgetMax));
  const [existingImages, setExistingImages] = useState<string[]>(initialRequest?.images ?? []);
  const [newFiles, setNewFiles] = useState<PendingFile[]>([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setTitle(initialRequest?.title ?? "");
    setDescription(initialRequest?.description ?? "");
    setCategory(initialRequest?.category ?? "");
    setCity(initialRequest?.city ?? "");
    setAddressText(initialRequest?.addressText ?? "");
    setBudgetMin(toInputValue(initialRequest?.budgetMin));
    setBudgetMax(toInputValue(initialRequest?.budgetMax));
    setExistingImages(initialRequest?.images ?? []);
    setNewFiles((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
    setError("");
  }, [initialRequest]);

  useEffect(() => {
    return () => {
      newFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [newFiles]);

  const totalImages = useMemo(
    () => existingImages.length + newFiles.length,
    [existingImages.length, newFiles.length],
  );

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!selected.length) {
      return;
    }

    if (totalImages + selected.length > 2) {
      setError("So'rovga ko'pi bilan 2 ta rasm biriktirish mumkin.");
      return;
    }

    setError("");
    setNewFiles((current) => [
      ...current,
      ...selected.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  }

  function removeExistingImage(imageUrl: string) {
    setExistingImages((current) => current.filter((item) => item !== imageUrl));
  }

  function removeNewFile(previewUrl: string) {
    setNewFiles((current) => {
      const found = current.find((item) => item.previewUrl === previewUrl);

      if (found) {
        URL.revokeObjectURL(found.previewUrl);
      }

      return current.filter((item) => item.previewUrl !== previewUrl);
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!title.trim() || !description.trim() || !category.trim() || !city.trim()) {
      setError("Sarlavha, tavsif, kategoriya va shaharni to'ldiring.");
      return;
    }

    const minValue = budgetMin ? Number(budgetMin) : undefined;
    const maxValue = budgetMax ? Number(budgetMax) : undefined;

    if (minValue !== undefined && maxValue !== undefined && maxValue < minValue) {
      setError("Maksimal budjet minimal summadan kichik bo'lmasligi kerak.");
      return;
    }

    if (existingImages.length + newFiles.length > 2) {
      setError("So'rovga ko'pi bilan 2 ta rasm biriktirish mumkin.");
      return;
    }

    try {
      setUploading(true);

      const uploadedUrls = await Promise.all(newFiles.map((item) => uploadPublicImage(item.file)));

      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        city: city.trim(),
        addressText: addressText.trim() || undefined,
        budgetMin: minValue,
        budgetMax: maxValue,
        images: [...existingImages, ...uploadedUrls],
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "So'rovni saqlab bo'lmadi.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Sarlavha" value={title} onChange={setTitle} placeholder="Masalan, Konditsioner ta'miri kerak" />
        <Field label="Kategoriya" value={category} onChange={setCategory} placeholder="Masalan, Elektrik" />
        <Field label="Shahar" value={city} onChange={setCity} placeholder="Toshkent" />
        <Field
          label="Manzil"
          value={addressText}
          onChange={setAddressText}
          placeholder="Hudud yoki aniq manzil"
        />
        <Field
          label="Minimal budjet"
          value={budgetMin}
          onChange={setBudgetMin}
          placeholder="0"
          type="number"
        />
        <Field
          label="Maksimal budjet"
          value={budgetMax}
          onChange={setBudgetMax}
          placeholder="0"
          type="number"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-bold text-[var(--navy)]">Tavsif</label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="auth-input min-h-36 resize-y"
          placeholder="Muammoni batafsil yozing."
        />
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[var(--navy)]">Rasmlar</p>
            <p className="text-xs text-[var(--muted)]">Ko'pi bilan 2 ta rasm yuklang.</p>
          </div>
          <label className="button-secondary cursor-pointer text-sm">
            Rasm tanlash
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {totalImages ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {existingImages.map((imageUrl) => (
              <ImagePreview
                key={imageUrl}
                src={imageUrl}
                removable
                onRemove={() => removeExistingImage(imageUrl)}
              />
            ))}
            {newFiles.map((item) => (
              <ImagePreview
                key={item.previewUrl}
                src={item.previewUrl}
                removable
                onRemove={() => removeNewFile(item.previewUrl)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.2rem] border border-dashed border-[var(--border)] bg-[rgba(255,255,255,0.56)] px-4 py-5 text-sm text-[var(--muted)]">
            Hozircha rasm biriktirilmagan.
          </div>
        )}
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          className="button-primary cursor-pointer"
          disabled={loading || uploading}
        >
          {loading || uploading ? busyLabel : submitLabel}
        </button>
        {onCancel ? (
          <button type="button" className="button-secondary cursor-pointer" onClick={onCancel}>
            Bekor qilish
          </button>
        ) : null}
      </div>
    </form>
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
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="auth-input"
        placeholder={placeholder}
      />
    </div>
  );
}

function ImagePreview({
  src,
  removable,
  onRemove,
}: {
  src: string;
  removable?: boolean;
  onRemove?: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[1.2rem] border border-[var(--border)] bg-white">
      <img src={src} alt="" className="h-40 w-full object-cover" />
      {removable ? (
        <div className="p-3">
          <button type="button" className="text-sm font-semibold text-[var(--amber-deep)]" onClick={onRemove}>
            Olib tashlash
          </button>
        </div>
      ) : null}
    </div>
  );
}
