"use client";

import type { RegistrationFormData } from "@/types/registration";
import { DOCUMENT_SLOTS } from "@/types/registration";
import { useLanguage } from "@/i18n/LanguageProvider";

interface RegistrationSummaryProps {
  form: RegistrationFormData;
  categoryName?: string;
  subcategoryName?: string;
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-3 border-b border-neutral-100 py-2.5 text-sm last:border-0">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-black">{value}</dd>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export function RegistrationSummary({
  form,
  categoryName,
  subcategoryName,
}: RegistrationSummaryProps) {
  const { t } = useLanguage();
  const isCompany = form.type_person === 2;
  const documentType = t(
    `documentTypes.${form.document_type}` as "documentTypes.0",
  );
  const gender = t(`gender.${form.gender}` as "gender.1");

  return (
    <div className="border border-neutral-200 p-4">
      <p className="mb-3 text-sm font-medium text-black">{t("summary.title")}</p>
      <dl>
        <SummaryItem
          label={t("summary.type")}
          value={isCompany ? t("summary.company") : t("summary.person")}
        />
        <SummaryItem
          label={isCompany ? t("summary.representative") : t("summary.fullName")}
          value={`${form.first_name} ${form.last_name}`.trim()}
        />
        <SummaryItem label={t("summary.documentType")} value={documentType} />
        <SummaryItem
          label={t("summary.documentNumber")}
          value={form.document_number || t("common.dash")}
        />
        {!isCompany && (
          <SummaryItem
            label={t("summary.birthDate")}
            value={formatDate(form.date_birth) || t("common.dash")}
          />
        )}
        <SummaryItem
          label={t("summary.issueDate")}
          value={formatDate(form.date_expiration) || t("common.dash")}
        />
        {!isCompany && <SummaryItem label={t("summary.gender")} value={gender} />}
        <SummaryItem
          label={t("summary.phone")}
          value={`${form.country_code} ${form.phone}`.trim()}
        />
        <SummaryItem
          label={t("summary.category")}
          value={categoryName ?? t("common.dash")}
        />
        <SummaryItem
          label={t("summary.subcategory")}
          value={subcategoryName ?? t("common.dash")}
        />
        <SummaryItem
          label={t("summary.profilePhoto")}
          value={form.profile_picture ? t("common.uploaded") : t("common.pending")}
        />
        {DOCUMENT_SLOTS.map((slot) => (
          <SummaryItem
            key={slot.id}
            label={t(`documentSlots.${slot.key}.label`)}
            value={
              form.documents.some((d) => d.id === slot.id)
                ? t("common.loaded")
                : t("common.pending")
            }
          />
        ))}
        <SummaryItem
          label={t("summary.email")}
          value={form.email || t("common.toComplete")}
        />
      </dl>
    </div>
  );
}
