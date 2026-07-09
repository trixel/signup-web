import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { RegistrationForm } from "@/components/RegistrationForm";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <section id="registro" className="bg-white py-10">
          <div className="mx-auto max-w-2xl px-6">
            <RegistrationForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
