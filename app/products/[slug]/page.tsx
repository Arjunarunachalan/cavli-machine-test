
import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/lib/data/products";
import ProductModelViewer from "@/components/product-model-viewer";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const MODEL_URL = "/api/model";

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            HUBBLE<span className="text-orange-600">.</span>
          </Link>

          <Link
            href="/#products"
            className="text-sm font-medium text-gray-600 hover:text-orange-600"
          >
            ← Back to products
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <ProductModelViewer
          src={MODEL_URL}
          alt={`${product.name} cellular IoT module 3D model`}
        />

        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-600">
            {product.category}
          </p>

          <h1 className="mt-4 text-5xl font-bold tracking-tight text-gray-950 md:text-6xl">
            {product.name}
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-500">
            {product.description}
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Connectivity</p>
              <p className="mt-2 font-semibold text-gray-950">
                {product.network}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Product category</p>
              <p className="mt-2 font-semibold text-gray-950">
                {product.category}
              </p>
            </div>
          </div>

          <Link
            href="/#consult"
            className="mt-10 inline-flex w-fit rounded-full bg-orange-600 px-8 py-4 font-semibold text-white transition hover:bg-orange-700"
          >
            Discuss this product →
          </Link>
        </div>
      </section>
    </main>
  );
}
