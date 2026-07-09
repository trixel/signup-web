const BENEFITS = [
  {
    title: "Pagos locales",
    description: "Acepta PSE, Nequi, Bancolombia, Bre-B y más métodos de pago colombianos.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    ),
  },
  {
    title: "Envíos y retiros",
    description: "Mueve saldo, ejecuta retiros bancarios y gestiona tu dinero desde un solo lugar.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    ),
  },
  {
    title: "Seguridad KYC",
    description: "Verificación de identidad con carga de documentos directamente desde el navegador.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
  },
];

const STEPS = [
  { step: "01", title: "Datos personales", text: "Completa tu información básica y de contacto." },
  { step: "02", title: "Documentos", text: "Sube tu cédula y selfie desde el navegador." },
  { step: "03", title: "Verificación", text: "Confirma tu correo y teléfono con códigos OTP." },
  { step: "04", title: "Listo", text: "Tu cuenta queda activa para operar con Trixel." },
];

export function Features() {
  return (
    <>
      <section id="beneficios" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Todo lo que necesitas para operar
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Trixel integra la infraestructura de Cobru para ofrecerte pagos, envíos y
              verificación de identidad en una experiencia unificada.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-slate-100 bg-slate-50/50 p-8 transition hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#075D9C]/10 text-[#075D9C]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {benefit.icon}
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Cómo funciona el registro
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Un proceso guiado en cuatro pasos para activar tu cuenta de forma rápida y segura.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((item) => (
              <div key={item.step} className="relative rounded-2xl bg-white p-6 shadow-sm">
                <span className="text-4xl font-bold text-blue-100">{item.step}</span>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
