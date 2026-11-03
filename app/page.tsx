

import Link from "next/link";
import { products } from "@/lib/data/products";
import { getExhibitorData } from "@/lib/data/exhibitors";
import ConsultationForm from "@/components/consultation-form";
export const dynamic = "force-dynamic";

export default async function Home() {


  const exhibitorData = await getExhibitorData();

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="text-gray-950">HUBBLE</span>
            <span className="text-orange-600">.</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
            <a href="#products" className="hover:text-orange-600">
              Products
            </a>
            <a href="#about" className="hover:text-orange-600">
              About
            </a>
            <a href="#exhibitors" className="hover:text-orange-600">
              Exhibitors
            </a>
          </nav>

          <a
            href="#consult"
            className="rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            Consult Now
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gray-950 text-white">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-orange-600/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-28 md:grid-cols-2 md:py-36">
          <div>
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
              Cavli Wireless · Hubble
            </p>

            <h1 className="max-w-2xl text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
              Connect everything.
              <span className="block text-orange-500">
                Imagine beyond.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-8 text-gray-400">
              Discover intelligent cellular IoT modules designed to connect
              devices, industries, and possibilities around the world.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#products"
                className="rounded-full bg-orange-600 px-7 py-3.5 font-semibold text-white hover:bg-orange-700"
              >
                Explore Products
              </a>

              <a
                href="#consult"
                className="rounded-full border border-white/30 px-7 py-3.5 font-semibold text-white hover:bg-white/10"
              >
                Talk to Our Team
              </a>
            </div>
          </div>

          <div className="flex min-h-72 items-center justify-center">
            <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/5 shadow-[0_0_100px_rgba(234,88,12,0.15)] md:h-80 md:w-80">
              <div className="absolute h-52 w-52 rounded-full border border-orange-500/30 md:h-64 md:w-64" />
              <div className="absolute h-40 w-40 rounded-full border border-orange-500/40 md:h-48 md:w-48" />
              <span className="text-5xl font-bold tracking-tighter text-orange-500 md:text-6xl">
                IoT
              </span>
              <span className="absolute -right-2 top-12 h-3 w-3 rounded-full bg-orange-500" />
              <span className="absolute bottom-10 -left-2 h-2 w-2 rounded-full bg-orange-300" />
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-600">
          The Hubble ecosystem
        </p>

        <div className="mt-5 grid gap-8 md:grid-cols-2">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-950 md:text-5xl">
            Connectivity built for a smarter world.
          </h2>

          <p className="text-lg leading-8 text-gray-500">
            From low-power devices to high-speed cellular applications,
            explore connectivity solutions built for the next generation
            of connected products.
          </p>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-600">
                Our portfolio
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-gray-950 md:text-5xl">
                Explore our products
              </h2>
            </div>
            <p className="max-w-sm text-gray-500">
              Cellular modules engineered for different connectivity needs.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.slug}
                className="group rounded-2xl border border-gray-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl"
              >
                <div className="flex h-44 items-center justify-center rounded-xl bg-gray-100">
                  <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <span className="text-2xl font-bold text-gray-900">
                      {product.name}
                    </span>
                  </div>
                </div>

                <p className="mt-7 text-xs font-semibold uppercase tracking-widest text-orange-600">
                  {product.category}
                </p>

                <h3 className="mt-2 text-2xl font-semibold text-gray-950">
                  {product.name}
                </h3>

                <p className="mt-3 min-h-16 leading-7 text-gray-500">
                  {product.description}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
                  <span className="text-sm font-medium text-gray-500">
                    {product.network}
                  </span>

                  <Link
                    href={`/products/${product.slug}`}
                    className="text-sm font-semibold text-orange-600 transition group-hover:text-orange-700"
                  >
                    Explore product →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Exhibitors */}
      <section id="exhibitors" className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-600">
              Our network
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-gray-950">
              Connected through innovation.
            </h2>
          </div>

          <div className="rounded-2xl bg-orange-50 px-7 py-5">
            <p className="text-3xl font-bold text-orange-600">
              {exhibitorData.total}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Exhibitors in our database
            </p>
          </div>
        </div>

        {exhibitorData.featured.length > 0 ? (
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {exhibitorData.featured.map((exhibitor) => (
              <div
                key={exhibitor.id}
                className="flex min-h-28 flex-col justify-center rounded-xl border border-gray-200 bg-white p-5"
              >
                <p className="font-semibold text-gray-900">
                  {exhibitor.companyName}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {exhibitor.country || "Country unavailable"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-gray-500">
            Exhibitor information is currently unavailable.
          </p>
        )}
      </section>

      {/* Consult placeholder */}
      <section id="consult" className="bg-gray-950 px-6 py-24 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-400">
            Let's build something connected
          </p>

          <h2 className="mt-5 text-4xl font-semibold md:text-5xl">
            Have an IoT project in mind?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl leading-8 text-gray-400">
            Speak with our team about your connectivity requirements and
            discover the right solution for your project.
          </p>

        <div className="mt-12">
  <ConsultationForm />
</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black px-6 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-2xl font-bold">
              HUBBLE<span className="text-orange-500">.</span>
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Powered by Cavli Wireless
            </p>
          </div>

          <div className="text-sm text-gray-400">
            <p>{exhibitorData.total} exhibitors in our database</p>
            <p className="mt-1">© 2026 Hubble. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
