import { NextRequest, NextResponse } from "next/server";
import { cobruFetch, getCobruApiUrl, getCobruBrand } from "@/lib/cobru";
import {
  prepareCompanyNameForCobru,
  prepareNameForCobru,
  validateCompanyName,
  validateFullName,
} from "@/lib/validation";
import type { RegistrationFormData, RegistrationResponse } from "@/types/registration";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegistrationFormData;
    const isCompany = body.type_person === 2;

    const legalFirstName = prepareNameForCobru(body.first_name);
    const legalLastName = prepareNameForCobru(body.last_name);
    const nameError = validateFullName(legalFirstName, legalLastName);

    if (nameError) {
      return NextResponse.json(
        { error: true, message: nameError, code: nameError },
        { status: 400 },
      );
    }

    const phone = body.phone.replace(/\D/g, "");
    const payload: Record<string, unknown> = {
      username: phone,
      email: body.email.trim(),
      password: body.password,
      phone,
      country_code: body.country_code,
      type_person: body.type_person,
      subcategory: body.subcategory,
      profile_picture: body.profile_picture,
      documents: body.documents,
      category: body.category,
      platform: "web",
      referal_code: body.referal_code || "",
      brand: getCobruBrand(),
    };

    if (isCompany) {
      const company_name = prepareCompanyNameForCobru(body.company_name);
      const companyError = validateCompanyName(company_name);

      if (companyError) {
        return NextResponse.json(
          { error: true, message: companyError, code: companyError },
          { status: 400 },
        );
      }

      if (!body.legal_document_number.trim()) {
        return NextResponse.json(
          { error: true, message: "LEGAL_DOCUMENT_REQUIRED" },
          { status: 400 },
        );
      }

      // Cobru: first_name = razón social, last_name vacío, document_* = NIT.
      // Campos *_legal = representante legal.
      payload.first_name = company_name;
      payload.last_name = "";
      payload.nombre = company_name;
      payload.apellido = "";
      payload.document_type = "3";
      payload.document_number = body.document_number.trim();
      payload.gender = body.gender;
      payload.date_birth = body.date_birth;
      payload.date_expiration = body.date_expiration;
      payload.gender_legal = body.gender;
      payload.document_type_legal = body.legal_document_type;
      payload.document_number_legal = body.legal_document_number.trim();
      payload.name_legal = legalFirstName;
      payload.last_name_legal = legalLastName;
      payload.date_birth_legal = body.date_birth;
      payload.date_expiration_legal = body.date_expiration;
    } else {
      payload.first_name = legalFirstName;
      payload.last_name = legalLastName;
      payload.nombre = legalFirstName;
      payload.apellido = legalLastName;
      payload.document_type = body.document_type;
      payload.document_number = body.document_number.trim();
      payload.gender = body.gender;
      payload.date_birth = body.date_birth;
      payload.date_expiration = body.date_expiration;
    }

    const data = await cobruFetch<RegistrationResponse | RegistrationResponse["message"]>(
      "/user/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      getCobruApiUrl(),
    );

    const user =
      "message" in data && data.message && typeof data.message === "object"
        ? data.message
        : data;

    return NextResponse.json({ error: false, message: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: (error as Error).message },
      { status: 500 },
    );
  }
}
