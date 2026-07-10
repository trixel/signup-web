"use client";

import { useCallback, useEffect, useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { RegistrationSummary } from "@/components/RegistrationSummary";
import { CountrySelect } from "@/components/CountrySelect";
import { FormField, inputClassName, selectClassName } from "@/components/FormField";
import { DEFAULT_COUNTRY_DIAL } from "@/data/countries";
import { useLanguage } from "@/i18n/LanguageProvider";
import type {
  CobruCategory,
  CobruSubcategory,
  CompanyValidationErrorCode,
  RegistrationFormData,
} from "@/types/registration";
import {
  DOCUMENT_SLOTS,
  DOCUMENT_TYPE_VALUES,
  GENDER_VALUES,
} from "@/types/registration";
import {
  getMaxNameLength,
  normalizeCompanyNameInput,
  normalizeNameInput,
  prepareCompanyNameForCobru,
  prepareNameForCobru,
  validateCompanyName,
  validateFullName,
} from "@/lib/validation";

const RESEND_COOLDOWN_SEC = 60;

const STEP_KEYS = [
  "steps.type",
  "steps.personal",
  "steps.documents",
  "steps.account",
  "steps.verification",
] as const;

const initialForm: RegistrationFormData = {
  first_name: "",
  last_name: "",
  company_name: "",
  legal_document_type: "0",
  legal_document_number: "",
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

type ConfirmationTarget = "both" | "email" | "phone";

export function RegistrationForm() {
  const { t } = useLanguage();
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
  const [userAccessToken, setUserAccessToken] = useState<string | null>(null);

  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [codesSent, setCodesSent] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState({ email: 0, phone: 0 });

  const updateForm = useCallback(
    (patch: Partial<RegistrationFormData>) => {
      setForm((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  const isCompany = form.type_person === 2;
  const uploadDocumentNumber = isCompany
    ? form.legal_document_number
    : form.document_number;

  function translateNameError(code: ReturnType<typeof validateFullName>) {
    if (!code) return null;
    if (code === "WORD_MAX_LENGTH") {
      return t("validation.WORD_MAX_LENGTH", { max: getMaxNameLength() });
    }
    return t(`validation.${code}`);
  }

  function translateCompanyError(code: CompanyValidationErrorCode | null) {
    if (!code) return null;

    const keyMap: Record<CompanyValidationErrorCode, string> = {
      COMPANY_NAME_REQUIRED: "validation.companyNameRequired",
      COMPANY_NAME_MIN_LENGTH: "validation.companyNameMinLength",
      COMPANY_NAME_INVALID: "validation.companyNameInvalid",
    };

    return t(keyMap[code] as "validation.companyNameRequired");
  }

  function startResendCooldown(type: "email" | "phone") {
    setResendCooldown((prev) => ({ ...prev, [type]: RESEND_COOLDOWN_SEC }));
  }

  useEffect(() => {
    const hasCooldown = resendCooldown.email > 0 || resendCooldown.phone > 0;
    if (!hasCooldown) return;

    const timer = window.setInterval(() => {
      setResendCooldown((prev) => ({
        email: prev.email > 0 ? prev.email - 1 : 0,
        phone: prev.phone > 0 ? prev.phone - 1 : 0,
      }));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown.email, resendCooldown.phone]);

  function selectPersonType(type: 1 | 2) {
    setError(null);
    updateForm({
      type_person: type,
      document_type: type === 2 ? "3" : "0",
      legal_document_type: type === 2 ? "0" : form.legal_document_type,
    });
    setStep(1);
  }

  useEffect(() => {
    fetch("/api/categories")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || data.error) {
          throw new Error(data.message || t("validation.categoriesLoadError"));
        }
        if (Array.isArray(data.message)) {
          setCategories(data.message);
        }
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoadingCategories(false));
  }, [t]);

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
        if (!form.type_person) return t("typeStep.selectType");
        return null;
      case 1: {
        if (isCompany) {
          const companyError = translateCompanyError(
            validateCompanyName(form.company_name),
          );
          if (companyError) return companyError;
          if (!form.document_number.trim()) return t("validation.documentRequired");
        }

        const nameError = translateNameError(
          validateFullName(form.first_name, form.last_name),
        );
        if (nameError) return nameError;

        if (!isCompany && !form.document_number.trim()) {
          return t("validation.documentRequired");
        }

        if (isCompany && !form.legal_document_number.trim()) {
          return t("validation.legalDocumentRequired");
        }

        if ((form.type_person === 1 || isCompany) && !form.date_birth) {
          return t("validation.birthRequired");
        }
        if (!form.date_expiration) return t("validation.issueRequired");
        if (!form.category) return t("validation.categoryRequired");
        if (!form.subcategory) return t("validation.subcategoryRequired");
        return null;
      }
      case 2: {
        const required = DOCUMENT_SLOTS.filter((s) => s.required);
        for (const slot of required) {
          if (!getDocumentUrl(slot.id)) {
            return t("validation.uploadRequired", {
              label: t(`documentSlots.${slot.key}.label`),
            });
          }
        }
        if (!form.profile_picture) return t("validation.profileRequired");
        return null;
      }
      case 3: {
        const nameError = translateNameError(
          validateFullName(form.first_name, form.last_name),
        );
        if (nameError) return nameError;
        if (!form.email.trim()) return t("validation.emailRequired");
        if (!form.phone.trim()) return t("validation.phoneRequired");
        if (!form.password || form.password.length < 8) {
          return t("validation.passwordMin");
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
    const company_name = prepareCompanyNameForCobru(form.company_name);
    const nameError = translateNameError(validateFullName(first_name, last_name));
    const companyError = isCompany
      ? translateCompanyError(validateCompanyName(company_name))
      : null;

    if (nameError || companyError) {
      setError(nameError ?? companyError);
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, first_name, last_name, company_name }),
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        const code = typeof data.code === "string" ? data.code : null;
        if (code) {
          const translatedName = translateNameError(
            code as NonNullable<ReturnType<typeof validateFullName>>,
          );
          if (translatedName) throw new Error(translatedName);

          const translatedCompany = translateCompanyError(
            code as CompanyValidationErrorCode,
          );
          if (translatedCompany) throw new Error(translatedCompany);
        }
        throw new Error(
          typeof data.message === "string"
            ? data.message
            : t("validation.registerError"),
        );
      }

      const user = data.message ?? data;
      const username = typeof user.username === "string" ? user.username : "";

      if (!username) {
        throw new Error(t("validation.registerError"));
      }

      const loginResponse = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password: form.password,
        }),
      });
      const loginData = await loginResponse.json();

      if (!loginResponse.ok || loginData.error || !loginData.access) {
        throw new Error(
          typeof loginData.message === "string"
            ? loginData.message
            : t("validation.loginAfterRegisterError"),
        );
      }

      setRegisteredUser({
        username,
        email: user.email,
      });
      setUserAccessToken(loginData.access);
      setStep(4);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function sendConfirmationCodes(target: ConfirmationTarget = "both") {
    setSubmitting(true);
    setError(null);
    setResendNotice(null);

    if (!userAccessToken) {
      setError(t("validation.sessionRequired"));
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: target === "both" || target === "phone",
          email: target === "both" || target === "email",
          access_token: userAccessToken,
        }),
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.message || t("validation.sendCodesError"));
      }

      if (target === "both") {
        setCodesSent(true);
      } else {
        setCodesSent(true);
        startResendCooldown(target);
        setResendNotice(
          target === "email"
            ? t("verification.codeResentEmail")
            : t("verification.codeResentPhone"),
        );
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyCode(type: "email" | "phone") {
    setSubmitting(true);
    setError(null);
    setResendNotice(null);

    if (!userAccessToken) {
      setError(t("validation.sessionRequired"));
      setSubmitting(false);
      return;
    }

    const code = type === "email" ? parseInt(emailCode, 10) : parseInt(phoneCode, 10);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, code, access_token: userAccessToken }),
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.message || t("validation.invalidCode"));
      }

      if (type === "email") setEmailVerified(true);
      else setPhoneVerified(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function renderResendButton(type: "email" | "phone") {
    const cooldown = resendCooldown[type];
    const label =
      cooldown > 0
        ? t("verification.resendIn", { seconds: cooldown })
        : type === "email"
          ? t("verification.resendEmail")
          : t("verification.resendPhone");

    return (
      <button
        type="button"
        onClick={() => sendConfirmationCodes(type)}
        disabled={submitting || cooldown > 0}
        className="text-xs text-neutral-600 underline-offset-2 hover:text-black hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
      >
        {submitting ? t("verification.resending") : label}
      </button>
    );
  }

  if (success) {
    return (
      <div className="border border-neutral-200 p-10 text-center">
        <h3 className="text-xl font-semibold text-black">
          {t("verification.accountVerified")}
        </h3>
        <p className="mt-2 text-sm text-neutral-600">
          {t("verification.accountReady")}
        </p>
        <a
          href="https://panel.trixel.co"
          className="mt-6 inline-flex border border-black bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          {t("verification.goToPanel")}
        </a>
      </div>
    );
  }

  return (
    <div className="border border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 px-6 py-4">
        <div className="flex gap-2">
          {STEP_KEYS.map((key, i) => {
            const labelKey =
              key === "steps.personal" && isCompany
                ? "steps.personalLegal"
                : key;

            return (
              <div
                key={key}
                className={`flex-1 border-b-2 pb-2 text-center text-xs font-medium uppercase tracking-wide ${
                  i === step
                    ? "border-black text-black"
                    : i < step
                      ? "border-neutral-400 text-neutral-600"
                      : "border-transparent text-neutral-400"
                }`}
              >
                {t(labelKey)}
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

        {step === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">{t("typeStep.question")}</p>
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
                <p className="font-medium text-black">{t("typeStep.person")}</p>
                <p className="mt-1 text-sm text-neutral-600">
                  {t("typeStep.personDesc")}
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
                <p className="font-medium text-black">{t("typeStep.company")}</p>
                <p className="mt-1 text-sm text-neutral-600">
                  {t("typeStep.companyDesc")}
                </p>
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-5 sm:grid-cols-2">
            {isCompany && (
              <>
                <div className="sm:col-span-2 border-b border-neutral-200 pb-2">
                  <h3 className="text-sm font-semibold text-black">
                    {t("form.companySection")}
                  </h3>
                </div>
                <div className="sm:col-span-2">
                  <FormField
                    label={t("form.companyName")}
                    required
                    hint={t("form.companyNameHint")}
                  >
                    <input
                      className={inputClassName}
                      value={form.company_name}
                      onChange={(e) =>
                        updateForm({ company_name: normalizeCompanyNameInput(e.target.value) })
                      }
                      onBlur={(e) =>
                        updateForm({ company_name: prepareCompanyNameForCobru(e.target.value) })
                      }
                      placeholder="Trixel S.A.S."
                      autoComplete="organization"
                    />
                  </FormField>
                </div>
                <div className="sm:col-span-2">
                  <FormField label={t("form.nit")} required>
                    <input
                      className={inputClassName}
                      value={form.document_number}
                      onChange={(e) => updateForm({ document_number: e.target.value })}
                      placeholder="900123456"
                      inputMode="numeric"
                    />
                  </FormField>
                </div>
                <div className="sm:col-span-2 border-b border-neutral-200 pb-2 pt-2">
                  <h3 className="text-sm font-semibold text-black">
                    {t("form.legalRepresentativeSection")}
                  </h3>
                </div>
              </>
            )}

            <FormField
              label={isCompany ? t("form.firstNameLegal") : t("form.firstName")}
              required
              hint={t("form.firstNameHint")}
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
              label={isCompany ? t("form.lastNameLegal") : t("form.lastName")}
              required
              hint={t("form.lastNameHint")}
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

            {isCompany ? (
              <>
                <FormField label={t("form.legalDocumentType")} required>
                  <select
                    className={selectClassName}
                    value={form.legal_document_type}
                    onChange={(e) => updateForm({ legal_document_type: e.target.value })}
                  >
                    {DOCUMENT_TYPE_VALUES.filter((v) => v !== "3").map((value) => (
                      <option key={value} value={value}>
                        {t(`documentTypes.${value}`)}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label={t("form.legalDocumentNumber")} required>
                  <input
                    className={inputClassName}
                    value={form.legal_document_number}
                    onChange={(e) => updateForm({ legal_document_number: e.target.value })}
                    placeholder="1234567890"
                  />
                </FormField>
                <FormField label={t("form.legalBirthDate")} required>
                  <input
                    type="date"
                    className={inputClassName}
                    value={form.date_birth}
                    onChange={(e) => updateForm({ date_birth: e.target.value })}
                  />
                </FormField>
                <FormField label={t("form.legalIssueDate")} required>
                  <input
                    type="date"
                    className={inputClassName}
                    value={form.date_expiration}
                    onChange={(e) => updateForm({ date_expiration: e.target.value })}
                  />
                </FormField>
                <FormField label={t("form.legalGender")} required>
                  <select
                    className={selectClassName}
                    value={form.gender}
                    onChange={(e) => updateForm({ gender: parseInt(e.target.value, 10) })}
                  >
                    {GENDER_VALUES.map((value) => (
                      <option key={value} value={value}>
                        {t(`gender.${value}`)}
                      </option>
                    ))}
                  </select>
                </FormField>
              </>
            ) : (
              <>
                <FormField label={t("form.documentType")} required>
                  <select
                    className={selectClassName}
                    value={form.document_type}
                    onChange={(e) => updateForm({ document_type: e.target.value })}
                  >
                    {DOCUMENT_TYPE_VALUES.filter((v) => v !== "3").map((value) => (
                      <option key={value} value={value}>
                        {t(`documentTypes.${value}`)}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label={t("form.documentNumber")} required>
                  <input
                    className={inputClassName}
                    value={form.document_number}
                    onChange={(e) => updateForm({ document_number: e.target.value })}
                    placeholder="1234567890"
                  />
                </FormField>
                <FormField label={t("form.birthDate")} required>
                  <input
                    type="date"
                    className={inputClassName}
                    value={form.date_birth}
                    onChange={(e) => updateForm({ date_birth: e.target.value })}
                  />
                </FormField>
                <FormField label={t("form.issueDate")} required>
                  <input
                    type="date"
                    className={inputClassName}
                    value={form.date_expiration}
                    onChange={(e) => updateForm({ date_expiration: e.target.value })}
                  />
                </FormField>
                <FormField label={t("form.gender")} required>
                  <select
                    className={selectClassName}
                    value={form.gender}
                    onChange={(e) => updateForm({ gender: parseInt(e.target.value, 10) })}
                  >
                    {GENDER_VALUES.map((value) => (
                      <option key={value} value={value}>
                        {t(`gender.${value}`)}
                      </option>
                    ))}
                  </select>
                </FormField>
              </>
            )}

            <FormField label={t("form.category")} required>
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
                    ? t("form.loadingCategories")
                    : categories.length === 0
                      ? t("form.noCategories")
                      : t("form.selectCategory")}
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>
            {form.category > 0 && (
              <FormField label={t("form.subcategory")} required>
                <select
                  className={selectClassName}
                  value={form.subcategory || ""}
                  onChange={(e) => updateForm({ subcategory: parseInt(e.target.value, 10) })}
                >
                  <option value="">{t("form.selectSubcategory")}</option>
                  {subcategories.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </FormField>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <p className="text-sm text-neutral-600">{t("form.documentsIntro")}</p>

            <FileUpload
              label={t("form.profilePhoto")}
              description={t("form.profilePhotoDesc")}
              accept="image/*"
              documentNumber={uploadDocumentNumber}
              nameSuffix="profile"
              value={form.profile_picture}
              onChange={(url) => updateForm({ profile_picture: url })}
              onClear={() => updateForm({ profile_picture: "" })}
            />

            {DOCUMENT_SLOTS.map((slot) => (
              <FileUpload
                key={slot.id}
                label={t(`documentSlots.${slot.key}.label`)}
                description={t(`documentSlots.${slot.key}.description`)}
                accept={slot.accept}
                documentNumber={uploadDocumentNumber}
                nameSuffix={slot.key}
                value={getDocumentUrl(slot.id)}
                onChange={(url) => setDocument(slot.id, url)}
                onClear={() => clearDocument(slot.id)}
              />
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <RegistrationSummary
              form={form}
              categoryName={categoryName}
              subcategoryName={subcategoryName}
            />
            <FormField label={t("form.dialCode")} required>
              <CountrySelect
                className={selectClassName}
                value={form.country_code}
                onChange={(dial) => updateForm({ country_code: dial })}
              />
            </FormField>
            <FormField label={t("form.phone")} required hint={t("form.phoneHint")}>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                className={inputClassName}
                value={form.phone}
                onChange={(e) => updateForm({ phone: e.target.value })}
                placeholder="3001234567"
              />
            </FormField>
            <FormField label={t("form.email")} required>
              <input
                type="email"
                className={inputClassName}
                value={form.email}
                onChange={(e) => updateForm({ email: e.target.value })}
                placeholder="correo@ejemplo.com"
              />
            </FormField>
            <FormField label={t("form.password")} required hint={t("form.passwordHint")}>
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

        {step === 4 && (
          <div className="mx-auto max-w-md space-y-6">
            <div className="border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-black">
              {t("verification.accountCreated")}
              {registeredUser && (
                <span className="mt-1 block text-neutral-600">
                  {t("verification.username")}: {registeredUser.username}
                </span>
              )}
            </div>

            {!codesSent ? (
              <button
                type="button"
                onClick={() => sendConfirmationCodes("both")}
                disabled={submitting}
                className="w-full border border-black bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
              >
                {submitting ? t("verification.sending") : t("verification.sendCodes")}
              </button>
            ) : (
              <>
                {resendNotice && (
                  <div className="border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-black">
                    {resendNotice}
                  </div>
                )}

                <FormField label={t("verification.emailCode")}>
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
                      {emailVerified ? "✓" : t("verification.verify")}
                    </button>
                  </div>
                  {!emailVerified && (
                    <div className="mt-2">{renderResendButton("email")}</div>
                  )}
                </FormField>

                <FormField label={t("verification.phoneCode")}>
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
                      {phoneVerified ? "✓" : t("verification.verify")}
                    </button>
                  </div>
                  {!phoneVerified && (
                    <div className="mt-2">{renderResendButton("phone")}</div>
                  )}
                </FormField>

                {emailVerified && phoneVerified && (
                  <button
                    type="button"
                    onClick={() => setSuccess(true)}
                    className="w-full border border-black bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    {t("verification.finish")}
                  </button>
                )}
              </>
            )}
          </div>
        )}

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
              {t("common.previous")}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              className="border border-black bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
            >
              {submitting
                ? t("common.processing")
                : step === 3
                  ? t("common.createAccount")
                  : t("common.next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
