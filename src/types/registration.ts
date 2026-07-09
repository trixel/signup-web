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

export type ValidationErrorCode =
  | "NAME_REQUIRED"
  | "LAST_REQUIRED"
  | "NAME_SAME"
  | "WORD_MIN_LENGTH"
  | "WORD_MAX_LENGTH"
  | "LETTERS_ONLY"
  | "REPEATED_CHARS";

export type DocumentSlotKey = "front" | "back" | "selfie";

export type DocumentSlot = {
  id: number;
  key: DocumentSlotKey;
  accept: string;
  required: boolean;
};

export const DOCUMENT_SLOTS: DocumentSlot[] = [
  {
    id: 1,
    key: "front",
    accept: "image/*,.pdf",
    required: true,
  },
  {
    id: 2,
    key: "back",
    accept: "image/*,.pdf",
    required: true,
  },
  {
    id: 3,
    key: "selfie",
    accept: "image/*",
    required: true,
  },
];

export const DOCUMENT_TYPE_VALUES = ["0", "1", "2", "3"] as const;

export const GENDER_VALUES = [1, 2, 3] as const;

export const PERSON_TYPE_VALUES = [1, 2] as const;
