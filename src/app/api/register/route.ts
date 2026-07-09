import { NextRequest, NextResponse } from "next/server";
import { cobruFetch, getCobruApiUrl, getCobruBrand } from "@/lib/cobru";
import { prepareNameForCobru, validateFullName } from "@/lib/validation";
import type { RegistrationFormData, RegistrationResponse } from "@/types/registration";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegistrationFormData;

    const first_name = prepareNameForCobru(body.first_name);
    const last_name = prepareNameForCobru(body.last_name);
    const nameError = validateFullName(first_name, last_name);

    if (nameError) {
      return NextResponse.json({ error: true, message: nameError }, { status: 400 });
    }

    const phone = body.phone.replace(/\D/g, "");
    const payload: Record<string, unknown> = {
      username: phone,
      nombre: first_name,
      apellido: last_name,
      first_name,
      last_name,
      email: body.email.trim(),
      password: body.password,
      phone,
      document_type: body.document_type,
      document_number: body.document_number.trim(),
      country_code: body.country_code,
      gender: body.gender,
      type_person: body.type_person,
      date_expiration: body.date_expiration,
      subcategory: body.subcategory,
      profile_picture: body.profile_picture,
      documents: body.documents,
      category: body.category,
      platform: "web",
      referal_code: body.referal_code || "",
      brand: getCobruBrand(),
    };

    if (body.date_birth) {
      payload.date_birth = body.date_birth;
    }

    const data = await cobruFetch<RegistrationResponse | RegistrationResponse["message"]>("/user/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }, getCobruApiUrl());

    const user = "message" in data && data.message && typeof data.message === "object"
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
