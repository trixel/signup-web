import type { RegistrationFormData } from "@/types/registration";
import {
  DOCUMENT_SLOTS,
  DOCUMENT_TYPES,
  GENDER_OPTIONS,
} from "@/types/registration";

interface RegistrationSummaryProps {
  form: RegistrationFormData;
  categoryName?: string;
  subcategoryName?: string;
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-3 border-b border-neutral-100 py-2.5 text-sm last:border-0">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-black">{value || "—"}</dd>
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
  const isCompany = form.type_person === 2;
  const documentType =
    DOCUMENT_TYPES.find((t) => t.value === form.document_type)?.label ?? "—";
  const gender =
    GENDER_OPTIONS.find((g) => g.value === form.gender)?.label ?? "—";

  return (
    <div className="border border-neutral-200 p-4">
      <p className="mb-3 text-sm font-medium text-black">Resumen del registro</p>
      <dl>
        <SummaryItem
          label="Tipo"
          value={isCompany ? "Empresa" : "Persona"}
        />
        <SummaryItem
          label={isCompany ? "Representante" : "Nombre completo"}
          value={`${form.first_name} ${form.last_name}`.trim()}
        />
        <SummaryItem label="Tipo de documento" value={documentType} />
        <SummaryItem label="Número de documento" value={form.document_number} />
        {!isCompany && (
          <SummaryItem
            label="Fecha de nacimiento"
            value={formatDate(form.date_birth)}
          />
        )}
        <SummaryItem
          label="Fecha de expedición"
          value={formatDate(form.date_expiration)}
        />
        {!isCompany && <SummaryItem label="Género" value={gender} />}
        <SummaryItem
          label="Celular"
          value={`${form.country_code} ${form.phone}`.trim()}
        />
        <SummaryItem label="Categoría" value={categoryName ?? "—"} />
        <SummaryItem label="Subcategoría" value={subcategoryName ?? "—"} />
        <SummaryItem
          label="Foto de perfil"
          value={form.profile_picture ? "Cargada" : "Pendiente"}
        />
        {DOCUMENT_SLOTS.map((slot) => (
          <SummaryItem
            key={slot.id}
            label={slot.label}
            value={form.documents.some((d) => d.id === slot.id) ? "Cargado" : "Pendiente"}
          />
        ))}
        <SummaryItem label="Correo electrónico" value={form.email || "Por completar"} />
      </dl>
    </div>
  );
}
