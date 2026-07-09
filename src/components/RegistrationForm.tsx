"use client";

import { useCallback, useEffect, useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { RegistrationSummary } from "@/components/RegistrationSummary";
import { CountrySelect } from "@/components/CountrySelect";
import { FormField, inputClassName, selectClassName } from "@/components/FormField";
import { DEFAULT_COUNTRY_DIAL } from "@/data/countries";
import type {
  CobruCategory,
  CobruDocument,
  CobruSubcategory,
  RegistrationFormData,
} from "@/types/registration";
import {
  DOCUMENT_SLOTS,
  DOCUMENT_TYPES,
  GENDER_OPTIONS,
} from "@/types/registration";
import {
  normalizeNameInput,
  prepareNameForCobru,
  validateFullName,
} from "@/lib/validation";

const STEPS = ["Tipo", "Personal", "Documentos", "Cuenta", "Verificación"] as const;

const initialForm: RegistrationFormData = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  phone: "",
  country_code: DEFAULT_COUNTRY_DIAL,
  document_type: "0",
  document_number: "",
  gender: 2,
  date_birth: "",
  date_expiration: "",
  type_person: 0,
  category: 0,
  subcategory: 0,
  referal_code: "",
  profile_picture: "",
  documents: [],
};

export function RegistrationForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RegistrationFormData>(initialForm);
  const [categories, setCategories] = useState<CobruCategory[]>([]);
  const [subcategories, setSubcategories] = useState<CobruSubcategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<{
    username: string;
    email: string;
  } | null>(null);

  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [codesSent, setCodesSent] = useState(false);

  const updateForm = useCallback(
    (patch: Partial<RegistrationFormData>) => {
      setForm((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  function selectPersonType(type: 1 | 2) {
    setError(null);
    updateForm({
      type_person: type,
      document_type: type === 2 ? "3" : "0",
    });
    setStep(1);
  }

  const isCompany = form.type_person === 2;

  useEffect(() => {
    fetch("/api/categories")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || data.error) {
          throw new Error(data.message || "No se pudieron cargar las categorías");
        }
        if (Array.isArray(data.message)) {
          setCategories(data.message);
        }
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => {
    if (!form.category) {
      setSubcategories([]);
      return;
    }

    fetch(`/api/subcategories?category_id=${form.category}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error && Array.isArray(data.message)) {
          setSubcategories(data.message);
        }
      })
      .catch(() => setSubcategories([]));
  }, [form.category]);

  function setDocument(id: number, url: string) {
    setForm((prev) => {
      const others = prev.documents.filter((d) => d.id !== id);
      return { ...prev, documents: [...others, { id, url }] };
    });
  }

  function clearDocument(id: number) {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== id),
    }));
  }

  function getDocumentUrl(id: number) {
    return form.documents.find((d) => d.id === id)?.url;
  }

  const categoryName = categories.find((c) => c.id === form.category)?.name;
  const subcategoryName = subcategories.find((s) => s.id === form.subcategory)?.name;

  function validateStep(): string | null {
    switch (step) {
      case 0:
        if (!form.type_person) return "Selecciona si registras una persona o una empresa";
        return null;
      case 1: {
        const nameError = validateFullName(form.first_name, form.last_name);
        if (nameError) return nameError;
        if (!form.document_number.trim()) return "El número de documento es requerido";
        if (form.type_person === 1 && !form.date_birth) {
          return "La fecha de nacimiento es requerida";
        }
        if (!form.date_expiration) return "La fecha de expedición es requerida";
        if (!form.phone.trim()) return "El celular es requerido";
        if (!form.category) return "Selecciona una categoría";
        if (!form.subcategory) return "Selecciona una subcategoría";
        return null;
      }
      case 2: {
        const required = DOCUMENT_SLOTS.filter((s) => s.required);
        for (const slot of required) {
          if (!getDocumentUrl(slot.id)) {
            return `Debes cargar: ${slot.label}`;
          }
        }
        if (!form.profile_picture) return "Debes cargar tu foto de perfil";
        return null;
      }
      case 3: {
        const nameError = validateFullName(form.first_name, form.last_name);
        if (nameError) return nameError;
        if (!form.email.trim()) return "El correo es requerido";
        if (!form.password || form.password.length < 8) {
          return "La contraseña debe tener al menos 8 caracteres";
        }
        return null;
      }
      default:
        return null;
    }
  }

  async function handleNext() {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    if (step === 3) {
      await handleRegister();
      return;
    }

    setStep((s) => s + 1);
  }

  async function handleRegister() {
    setSubmitting(true);
    setError(null);

    const first_name = prepareNameForCobru(form.first_name);
    const last_name = prepareNameForCobru(form.last_name);
    const nameError = validateFullName(first_name, last_name);

    if (nameError) {
      setError(nameError);
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, first_name, last_name }),
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          typeof data.message === "string"
            ? data.message
            : "Error al crear la cuenta",
        );
      }

      const user = data.message ?? data;
      setRegisteredUser({
        username: user.username,
        email: user.email,
      });
      setStep(4);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function sendConfirmationCodes() {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: true, email: true }),
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.message || "Error al enviar códigos");
      }

      setCodesSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyCode(type: "email" | "phone") {
    setSubmitting(true);
    setError(null);

    const code = type === "email" ? parseInt(emailCode, 10) : parseInt(phoneCode, 10);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, code }),
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.message || "Código inválido");
      }

      if (type === "email") setEmailVerified(true);
      else setPhoneVerified(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="border border-neutral-200 p-10 text-center">
        <h3 className="text-xl font-semibold text-black">Cuenta verificada</h3>
        <p className="mt-2 text-sm text-neutral-600">
          Tu cuenta Trixel está lista para operar.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 px-6 py-4">
        <div className="flex gap-2">
          {STEPS.map((label, i) => {
            const displayLabel =
              label === "Personal" && isCompany ? "Representante legal" : label;

            return (
            <div
              key={label}
              className={`flex-1 border-b-2 pb-2 text-center text-xs font-medium uppercase tracking-wide ${
                i === step
                  ? "border-black text-black"
                  : i < step
                    ? "border-neutral-400 text-neutral-600"
                    : "border-transparent text-neutral-400"
              }`}
            >
              {displayLabel}
            </div>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-black">
            {error}
          </div>
        )}

        {/* Step 0: Tipo */}
        {step === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">
              ¿Cómo deseas registrarte?
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => selectPersonType(1)}
                className={`border p-5 text-left transition ${
                  form.type_person === 1
                    ? "border-black bg-neutral-50"
                    : "border-neutral-300 hover:border-black"
                }`}
              >
                <svg
                  className="mb-3 h-8 w-8 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
                <p className="font-medium text-black">Persona</p>
                <p className="mt-1 text-sm text-neutral-600">
                  Registro como persona natural
                </p>
              </button>
              <button
                type="button"
                onClick={() => selectPersonType(2)}
                className={`border p-5 text-left transition ${
                  form.type_person === 2
                    ? "border-black bg-neutral-50"
                    : "border-neutral-300 hover:border-black"
                }`}
              >
                <svg
                  className="mb-3 h-8 w-8 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3.75 21h16.5M4.5 21V9.75A2.25 2.25 0 016.75 7.5h10.5a2.25 2.25 0 012.25 2.25V21M9 21v-4.5a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5V21M9 10.5h.008v.008H9V10.5zm3 0h.008v.008H12V10.5z"
                  />
                </svg>
                <p className="font-medium text-black">Empresa</p>
                <p className="mt-1 text-sm text-neutral-600">
                  Registro como persona jurídica
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Personal */}
        {step === 1 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label={isCompany ? "Nombres del representante" : "Nombres"}
              required
              hint="Tal como aparece en tu cédula, distinto al apellido"
            >
              <input
                className={inputClassName}
                value={form.first_name}
                onChange={(e) => updateForm({ first_name: normalizeNameInput(e.target.value) })}
                onBlur={(e) => updateForm({ first_name: prepareNameForCobru(e.target.value) })}
                placeholder="Juan"
                autoComplete="given-name"
              />
            </FormField>
            <FormField
              label={isCompany ? "Apellidos del representante" : "Apellidos"}
              required
              hint="Tal como aparece en tu cédula, distinto al nombre"
            >
              <input
                className={inputClassName}
                value={form.last_name}
                onChange={(e) => updateForm({ last_name: normalizeNameInput(e.target.value) })}
                onBlur={(e) => updateForm({ last_name: prepareNameForCobru(e.target.value) })}
                placeholder="García López"
                autoComplete="family-name"
              />
            </FormField>
            <FormField label={isCompany ? "Tipo de documento (empresa)" : "Tipo de documento"} required>
              <select
                className={selectClassName}
                value={form.document_type}
                onChange={(e) => updateForm({ document_type: e.target.value })}
              >
                {(isCompany
                  ? DOCUMENT_TYPES.filter((t) => t.value === "3")
                  : DOCUMENT_TYPES.filter((t) => t.value !== "3")
                ).map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label={isCompany ? "NIT" : "Número de documento"} required>
              <input
                className={inputClassName}
                value={form.document_number}
                onChange={(e) => updateForm({ document_number: e.target.value })}
                placeholder="1234567890"
              />
            </FormField>
            {!isCompany && (
              <FormField label="Fecha de nacimiento" required>
                <input
                  type="date"
                  className={inputClassName}
                  value={form.date_birth}
                  onChange={(e) => updateForm({ date_birth: e.target.value })}
                />
              </FormField>
            )}
            <FormField label="Fecha de expedición" required>
              <input
                type="date"
                className={inputClassName}
                value={form.date_expiration}
                onChange={(e) => updateForm({ date_expiration: e.target.value })}
              />
            </FormField>
            {!isCompany && (
              <FormField label="Género" required>
                <select
                  className={selectClassName}
                  value={form.gender}
                  onChange={(e) => updateForm({ gender: parseInt(e.target.value, 10) })}
                >
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </FormField>
            )}
            <div className="sm:col-span-2">
              <FormField label="Celular" required hint="Se usará como nombre de usuario">
                <div className="flex min-w-0 gap-2">
                  <CountrySelect
                    value={form.country_code}
                    onChange={(dial) => updateForm({ country_code: dial })}
                  />
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    className={`${inputClassName} min-w-0 flex-1`}
                    value={form.phone}
                    onChange={(e) => updateForm({ phone: e.target.value })}
                    placeholder="3001234567"
                  />
                </div>
              </FormField>
            </div>
            <FormField label="Categoría" required>
              <select
                className={selectClassName}
                value={form.category || ""}
                onChange={(e) => updateForm({
                  category: parseInt(e.target.value, 10) || 0,
                  subcategory: 0,
                })}
                disabled={loadingCategories || categories.length === 0}
              >
                <option value="">
                  {loadingCategories
                    ? "Cargando categorías..."
                    : categories.length === 0
                      ? "Sin categorías disponibles"
                      : "Seleccionar categoría"}
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>
            {form.category > 0 && (
              <FormField label="Subcategoría" required>
                <select
                  className={selectClassName}
                  value={form.subcategory || ""}
                  onChange={(e) => updateForm({ subcategory: parseInt(e.target.value, 10) })}
                >
                  <option value="">Seleccionar subcategoría</option>
                  {subcategories.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </FormField>
            )}
          </div>
        )}

        {/* Step 2: Documents */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-sm text-neutral-600">
              Sube documentos claros y legibles.
            </p>

            <FileUpload
              label="Foto de perfil"
              description="Selfie o foto reciente de tu rostro"
              accept="image/*"
              value={form.profile_picture}
              onChange={(url) => updateForm({ profile_picture: url })}
              onClear={() => updateForm({ profile_picture: "" })}
            />

            {DOCUMENT_SLOTS.map((slot) => (
              <FileUpload
                key={slot.id}
                label={slot.label}
                description={slot.description}
                accept={slot.accept}
                value={getDocumentUrl(slot.id)}
                onChange={(url) => setDocument(slot.id, url)}
                onClear={() => clearDocument(slot.id)}
              />
            ))}
          </div>
        )}

        {/* Step 3: Account */}
        {step === 3 && (
          <div className="space-y-5">
            <RegistrationSummary
              form={form}
              categoryName={categoryName}
              subcategoryName={subcategoryName}
            />
            <FormField label="Correo electrónico" required>
              <input
                type="email"
                className={inputClassName}
                value={form.email}
                onChange={(e) => updateForm({ email: e.target.value })}
                placeholder="correo@ejemplo.com"
              />
            </FormField>
            <FormField label="Contraseña" required hint="Mínimo 8 caracteres">
              <input
                type="password"
                className={inputClassName}
                value={form.password}
                onChange={(e) => updateForm({ password: e.target.value })}
                placeholder="••••••••"
              />
            </FormField>
          </div>
        )}

        {/* Step 4: Verification */}
        {step === 4 && (
          <div className="mx-auto max-w-md space-y-6">
            <div className="border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-black">
              Cuenta creada
              {registeredUser && (
                <span className="mt-1 block text-neutral-600">
                  Usuario: {registeredUser.username}
                </span>
              )}
            </div>

            {!codesSent ? (
              <button
                type="button"
                onClick={sendConfirmationCodes}
                disabled={submitting}
                className="w-full border border-black bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
              >
                {submitting ? "Enviando..." : "Enviar códigos de verificación"}
              </button>
            ) : (
              <>
                <FormField label="Código de correo electrónico">
                  <div className="flex gap-2">
                    <input
                      className={inputClassName}
                      value={emailCode}
                      onChange={(e) => setEmailCode(e.target.value)}
                      placeholder="123456"
                      disabled={emailVerified}
                    />
                    <button
                      type="button"
                      onClick={() => verifyCode("email")}
                      disabled={submitting || emailVerified}
                      className="shrink-0 border border-black bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {emailVerified ? "✓" : "Verificar"}
                    </button>
                  </div>
                </FormField>

                <FormField label="Código de celular">
                  <div className="flex gap-2">
                    <input
                      className={inputClassName}
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value)}
                      placeholder="123456"
                      disabled={phoneVerified}
                    />
                    <button
                      type="button"
                      onClick={() => verifyCode("phone")}
                      disabled={submitting || phoneVerified}
                      className="shrink-0 border border-black bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {phoneVerified ? "✓" : "Verificar"}
                    </button>
                  </div>
                </FormField>

                {emailVerified && phoneVerified && (
                  <button
                    type="button"
                    onClick={() => setSuccess(true)}
                    className="w-full border border-black bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    Finalizar
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Navigation */}
        {step < 4 && (
          <div className="mt-8 flex items-center justify-between border-t border-neutral-200 pt-6">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep((s) => Math.max(0, s - 1));
              }}
              disabled={step === 0}
              className="px-4 py-2 text-sm text-neutral-600 hover:text-black disabled:invisible"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              className="border border-black bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
            >
              {submitting
                ? "Procesando..."
                : step === 3
                  ? "Crear cuenta"
                  : "Siguiente"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
