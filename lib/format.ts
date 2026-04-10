type NamedValue = {
  nameUz?: string;
  nameEn?: string;
  nameRu?: string;
};

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Belgilanmagan";
  }

  return new Intl.NumberFormat("uz-UZ").format(value) + " so'm";
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) {
    return "Belgilanmagan";
  }

  return new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "medium",
    timeZone: "Asia/Tashkent",
  }).format(new Date(value));
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) {
    return "Belgilanmagan";
  }

  return new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tashkent",
  }).format(new Date(value));
}

export function getLocalizedName(item: NamedValue | null | undefined, fallback: string) {
  return item?.nameUz || item?.nameEn || item?.nameRu || fallback;
}

export function formatRequestBudget(min?: number | null, max?: number | null) {
  if (min !== null && min !== undefined && max !== null && max !== undefined) {
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  }

  if (min !== null && min !== undefined) {
    return `${formatCurrency(min)} dan`;
  }

  if (max !== null && max !== undefined) {
    return `${formatCurrency(max)} gacha`;
  }

  return "Kelishiladi";
}
