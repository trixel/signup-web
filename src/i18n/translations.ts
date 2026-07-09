import type { Locale } from "./types";

export type TranslationKey = keyof typeof translations.es;

const es = {
  meta: {
    title: "Trixel — Registro de cuenta",
    description:
      "Crea tu cuenta en Trixel. Registro seguro con verificación de identidad y carga de documentos integrada con Cobru.",
  },
  header: {
    brand: "Trixel",
  },
  hero: {
    title: "Crear cuenta",
    subtitle: "Completa el formulario y sube tus documentos para activar tu cuenta.",
  },
  footer: {
    copyright: "© {{year}} Trixel",
  },
  lang: {
    es: "Español",
    en: "English",
    switch: "Idioma",
  },
  steps: {
    type: "Tipo",
    personal: "Persona",
    personalLegal: "Representante legal",
    documents: "Documentos",
    account: "Cuenta",
    verification: "Validación",
  },
  common: {
    previous: "Anterior",
    next: "Siguiente",
    processing: "Procesando...",
    createAccount: "Crear cuenta",
    change: "Cambiar",
    uploading: "Subiendo...",
    fileLoaded: "Archivo cargado",
    selectFile: "Seleccionar archivo · JPG, PNG, WEBP o PDF",
    pending: "Pendiente",
    loaded: "Cargado",
    uploaded: "Cargada",
    dash: "—",
    toComplete: "Por completar",
  },
  typeStep: {
    question: "¿Cómo deseas registrarte?",
    person: "Persona",
    personDesc: "Registro como persona natural",
    company: "Empresa",
    companyDesc: "Registro como persona jurídica",
    selectType: "Selecciona si registras una persona o una empresa",
  },
  form: {
    firstName: "Nombres",
    firstNameLegal: "Nombres del representante",
    lastName: "Apellidos",
    lastNameLegal: "Apellidos del representante",
    firstNameHint: "Tal como aparece en tu cédula, distinto al apellido",
    lastNameHint: "Tal como aparece en tu cédula, distinto al nombre",
    documentType: "Tipo de documento",
    documentTypeCompany: "Tipo de documento (empresa)",
    documentNumber: "Número de documento",
    nit: "NIT",
    birthDate: "Fecha de nacimiento",
    issueDate: "Fecha de expedición",
    gender: "Género",
    phone: "Celular",
    phoneHint: "Se usará como nombre de usuario",
    category: "Categoría",
    subcategory: "Subcategoría",
    email: "Correo electrónico",
    password: "Contraseña",
    passwordHint: "Mínimo 8 caracteres",
    loadingCategories: "Cargando categorías...",
    noCategories: "Sin categorías disponibles",
    selectCategory: "Seleccionar categoría",
    selectSubcategory: "Seleccionar subcategoría",
    documentsIntro: "Sube documentos claros y legibles.",
    profilePhoto: "Foto de perfil",
    profilePhotoDesc: "Selfie o foto reciente de tu rostro",
    companySection: "Datos de la empresa",
    companyName: "Nombre de la empresa",
    companyNameHint: "Razón social tal como aparece en el RUT o cámara de comercio",
    legalRepresentativeSection: "Representante legal",
    legalDocumentType: "Tipo de documento del representante",
    legalDocumentNumber: "Número de documento del representante",
    legalBirthDate: "Fecha de nacimiento del representante",
    legalIssueDate: "Fecha de expedición del documento",
    legalGender: "Género del representante",
  },
  documentTypes: {
    "0": "Cédula de ciudadanía",
    "1": "Cédula de extranjería",
    "2": "Pasaporte",
    "3": "NIT",
  },
  gender: {
    "1": "Masculino",
    "2": "Femenino",
    "3": "Otro",
  },
  documentSlots: {
    front: {
      label: "Documento frontal",
      description: "Foto clara del frente de tu cédula o documento de identidad",
    },
    back: {
      label: "Documento reverso",
      description: "Foto clara del reverso de tu documento de identidad",
    },
    selfie: {
      label: "Selfie con documento",
      description: "Foto tuya sosteniendo tu documento junto a tu rostro",
    },
  },
  summary: {
    title: "Resumen del registro",
    type: "Tipo",
    person: "Persona",
    company: "Empresa",
    fullName: "Nombre completo",
    representative: "Representante",
    companyName: "Nombre de la empresa",
    nit: "NIT",
    legalDocumentType: "Documento del representante",
    legalDocumentNumber: "Número de documento del representante",
    documentType: "Tipo de documento",
    documentNumber: "Número de documento",
    birthDate: "Fecha de nacimiento",
    issueDate: "Fecha de expedición",
    gender: "Género",
    phone: "Celular",
    category: "Categoría",
    subcategory: "Subcategoría",
    profilePhoto: "Foto de perfil",
    email: "Correo electrónico",
  },
  verification: {
    accountCreated: "Cuenta creada",
    username: "Usuario",
    sendCodes: "Enviar códigos de verificación",
    sending: "Enviando...",
    emailCode: "Código de correo electrónico",
    phoneCode: "Código de celular",
    verify: "Verificar",
    finish: "Finalizar",
    resendEmail: "Reenviar código al correo",
    resendPhone: "Reenviar código al celular",
    resending: "Reenviando...",
    resendIn: "Reenviar en {{seconds}}s",
    codeResentEmail: "Código reenviado al correo.",
    codeResentPhone: "Código reenviado al celular.",
    accountVerified: "Cuenta verificada",
    accountReady: "Tu cuenta Trixel está lista para operar.",
  },
  validation: {
    NAME_REQUIRED: "El nombre es requerido",
    LAST_REQUIRED: "El apellido es requerido",
    NAME_SAME:
      "El nombre y el apellido no pueden ser iguales ni repetirse entre ambos campos",
    WORD_MIN_LENGTH: "Cada nombre y apellido debe tener al menos 2 caracteres",
    WORD_MAX_LENGTH: "Cada nombre y apellido debe tener máximo {{max}} caracteres",
    LETTERS_ONLY: "Usa solo letras en nombres y apellidos",
    REPEATED_CHARS: "Ingresa un nombre real, sin caracteres repetidos",
    documentRequired: "El número de documento es requerido",
    birthRequired: "La fecha de nacimiento es requerida",
    issueRequired: "La fecha de expedición es requerida",
    phoneRequired: "El celular es requerido",
    categoryRequired: "Selecciona una categoría",
    subcategoryRequired: "Selecciona una subcategoría",
    uploadRequired: "Debes cargar: {{label}}",
    profileRequired: "Debes cargar tu foto de perfil",
    emailRequired: "El correo es requerido",
    passwordMin: "La contraseña debe tener al menos 8 caracteres",
    categoriesLoadError: "No se pudieron cargar las categorías",
    registerError: "Error al crear la cuenta",
    sendCodesError: "Error al enviar códigos",
    invalidCode: "Código inválido",
    uploadError: "Error al subir el archivo",
    companyNameRequired: "El nombre de la empresa es requerido",
    companyNameMinLength: "El nombre de la empresa debe tener al menos 2 caracteres",
    companyNameInvalid: "El nombre de la empresa contiene caracteres no permitidos",
    legalDocumentRequired: "El documento del representante es requerido",
  },
} ;

const en = {
  meta: {
    title: "Trixel — Account registration",
    description:
      "Create your Trixel account. Secure registration with identity verification and document upload integrated with Cobru.",
  },
  header: {
    brand: "Trixel",
  },
  hero: {
    title: "Create account",
    subtitle: "Complete the form and upload your documents to activate your account.",
  },
  footer: {
    copyright: "© {{year}} Trixel",
  },
  lang: {
    es: "Español",
    en: "English",
    switch: "Language",
  },
  steps: {
    type: "Type",
    personal: "Person",
    personalLegal: "Legal representative",
    documents: "Documents",
    account: "Account",
    verification: "Validation",
  },
  common: {
    previous: "Back",
    next: "Next",
    processing: "Processing...",
    createAccount: "Create account",
    change: "Change",
    uploading: "Uploading...",
    fileLoaded: "File uploaded",
    selectFile: "Select file · JPG, PNG, WEBP or PDF",
    pending: "Pending",
    loaded: "Uploaded",
    uploaded: "Uploaded",
    dash: "—",
    toComplete: "To be completed",
  },
  typeStep: {
    question: "How would you like to register?",
    person: "Individual",
    personDesc: "Register as a natural person",
    company: "Company",
    companyDesc: "Register as a legal entity",
    selectType: "Select whether you are registering as an individual or a company",
  },
  form: {
    firstName: "First name(s)",
    firstNameLegal: "Representative first name(s)",
    lastName: "Last name(s)",
    lastNameLegal: "Representative last name(s)",
    firstNameHint: "As shown on your ID, different from last name",
    lastNameHint: "As shown on your ID, different from first name",
    documentType: "Document type",
    documentTypeCompany: "Document type (company)",
    documentNumber: "Document number",
    nit: "Tax ID (NIT)",
    birthDate: "Date of birth",
    issueDate: "Issue date",
    gender: "Gender",
    phone: "Mobile phone",
    phoneHint: "Will be used as your username",
    category: "Category",
    subcategory: "Subcategory",
    email: "Email address",
    password: "Password",
    passwordHint: "Minimum 8 characters",
    loadingCategories: "Loading categories...",
    noCategories: "No categories available",
    selectCategory: "Select category",
    selectSubcategory: "Select subcategory",
    documentsIntro: "Upload clear, legible documents.",
    profilePhoto: "Profile photo",
    profilePhotoDesc: "Selfie or recent photo of your face",
    companySection: "Company information",
    companyName: "Company name",
    companyNameHint: "Legal name as shown on tax or chamber of commerce records",
    legalRepresentativeSection: "Legal representative",
    legalDocumentType: "Representative document type",
    legalDocumentNumber: "Representative document number",
    legalBirthDate: "Representative date of birth",
    legalIssueDate: "Representative document issue date",
    legalGender: "Representative gender",
  },
  documentTypes: {
    "0": "National ID card",
    "1": "Foreign ID card",
    "2": "Passport",
    "3": "Tax ID (NIT)",
  },
  gender: {
    "1": "Male",
    "2": "Female",
    "3": "Other",
  },
  documentSlots: {
    front: {
      label: "Front of document",
      description: "Clear photo of the front of your ID document",
    },
    back: {
      label: "Back of document",
      description: "Clear photo of the back of your ID document",
    },
    selfie: {
      label: "Selfie with document",
      description: "Photo of you holding your document next to your face",
    },
  },
  summary: {
    title: "Registration summary",
    type: "Type",
    person: "Individual",
    company: "Company",
    fullName: "Full name",
    representative: "Representative",
    companyName: "Company name",
    nit: "Tax ID (NIT)",
    legalDocumentType: "Representative document type",
    legalDocumentNumber: "Representative document number",
    documentType: "Document type",
    documentNumber: "Document number",
    birthDate: "Date of birth",
    issueDate: "Issue date",
    gender: "Gender",
    phone: "Mobile phone",
    category: "Category",
    subcategory: "Subcategory",
    profilePhoto: "Profile photo",
    email: "Email address",
  },
  verification: {
    accountCreated: "Account created",
    username: "Username",
    sendCodes: "Send verification codes",
    sending: "Sending...",
    emailCode: "Email verification code",
    phoneCode: "Mobile verification code",
    verify: "Verify",
    finish: "Finish",
    resendEmail: "Resend code to email",
    resendPhone: "Resend code to mobile",
    resending: "Resending...",
    resendIn: "Resend in {{seconds}}s",
    codeResentEmail: "Code resent to your email.",
    codeResentPhone: "Code resent to your mobile.",
    accountVerified: "Account verified",
    accountReady: "Your Trixel account is ready to use.",
  },
  validation: {
    NAME_REQUIRED: "First name is required",
    LAST_REQUIRED: "Last name is required",
    NAME_SAME:
      "First and last name cannot be the same or repeated across both fields",
    WORD_MIN_LENGTH: "Each name and last name must be at least 2 characters",
    WORD_MAX_LENGTH: "Each name and last name must be at most {{max}} characters",
    LETTERS_ONLY: "Use letters only in names",
    REPEATED_CHARS: "Enter a real name without repeated characters",
    documentRequired: "Document number is required",
    birthRequired: "Date of birth is required",
    issueRequired: "Issue date is required",
    phoneRequired: "Mobile phone is required",
    categoryRequired: "Select a category",
    subcategoryRequired: "Select a subcategory",
    uploadRequired: "You must upload: {{label}}",
    profileRequired: "You must upload your profile photo",
    emailRequired: "Email is required",
    passwordMin: "Password must be at least 8 characters",
    categoriesLoadError: "Could not load categories",
    registerError: "Error creating account",
    sendCodesError: "Error sending codes",
    invalidCode: "Invalid code",
    uploadError: "Error uploading file",
    companyNameRequired: "Company name is required",
    companyNameMinLength: "Company name must be at least 2 characters",
    companyNameInvalid: "Company name contains invalid characters",
    legalDocumentRequired: "Representative document number is required",
  },
};

export const translations: Record<Locale, typeof es> = { es, en };

type NestedKeyOf<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], Prefix extends "" ? K : `${Prefix}.${K}`>
        : Prefix extends "" ? K : `${Prefix}.${K}`;
    }[keyof T & string]
  : never;

export type TranslationPath = NestedKeyOf<typeof es>;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);

  return typeof value === "string" ? value : path;
}

export function translate(
  locale: Locale,
  key: TranslationPath,
  params?: Record<string, string | number>,
): string {
  let text = getNestedValue(
    translations[locale] as unknown as Record<string, unknown>,
    key,
  );

  if (params) {
    for (const [param, value] of Object.entries(params)) {
      text = text.replaceAll(`{{${param}}}`, String(value));
    }
  }

  return text;
}
