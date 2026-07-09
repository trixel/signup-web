export interface CobruCategory {
  id: number;
  name: string;
}

export interface CobruSubcategory {
  id: number;
  name: string;
}

export interface CobruDocument {
  id: number;
  url: string;
}

export interface RegistrationFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  country_code: string;
  document_type: string;
  document_number: string;
  gender: number;
  date_birth: string;
  date_expiration: string;
  type_person: number;
  category: number;
  subcategory: number;
  referal_code: string;
  profile_picture: string;
  documents: CobruDocument[];
}

export interface RegistrationResponse {
  error: boolean;
  message: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    username: string;
  };
  status: number;
}

export type DocumentSlot = {
  id: number;
  label: string;
  description: string;
  accept: string;
  required: boolean;
};

export const DOCUMENT_SLOTS: DocumentSlot[] = [
  {
    id: 1,
    label: "Documento frontal",
    description: "Foto clara del frente de tu cédula o documento de identidad",
    accept: "image/*,.pdf",
    required: true,
  },
  {
    id: 2,
    label: "Documento reverso",
    description: "Foto clara del reverso de tu documento de identidad",
    accept: "image/*,.pdf",
    required: true,
  },
  {
    id: 3,
    label: "Selfie con documento",
    description: "Foto tuya sosteniendo tu documento junto a tu rostro",
    accept: "image/*",
    required: true,
  },
];

export const DOCUMENT_TYPES = [
  { value: "0", label: "Cédula de ciudadanía" },
  { value: "1", label: "Cédula de extranjería" },
  { value: "2", label: "Pasaporte" },
  { value: "3", label: "NIT" },
];

export const GENDER_OPTIONS = [
  { value: 1, label: "Masculino" },
  { value: 2, label: "Femenino" },
  { value: 3, label: "Otro" },
];

export const PERSON_TYPES = [
  { value: 1, label: "Persona natural" },
  { value: 2, label: "Persona jurídica" },
];
