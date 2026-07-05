import { Link } from '@inertiajs/react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { formatRupiah, storefrontProducts } from './storefrontProducts';

type ProductDetailPageProps = {
    slug: string;
};

export default function ProductDetailPage({ slug }: ProductDetailPageProps) {
    const product = storefrontProducts.find((item) => item.slug === slug);

    if (!product) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-800">
                <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                    <h1 className="text-2xl font-black">Produk mock tidak ditemukan</h1>
                    <p className="mt-3 text-slate-500">Pilih produk yang tersedia dari halaman katalog.</p>
                    <Link href="/katalog" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-indigo-600">
                        <ArrowLeft size={17} /> Kembali ke katalog
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-800 sm:px-8">
            <div className="mx-auto flex max-w-4xl flex-col gap-6">
                <Link href="/katalog" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                    <ArrowLeft size={16} /> Kembali ke katalog
                </Link>

                <section className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:grid-cols-2">
                    <div className={`flex min-h-72 items-center justify-center bg-gradient-to-br ${product.accent}`}>
                        <ShoppingBag size={72} className="text-white/90" />
                    </div>
                    <div className="flex flex-col justify-center gap-5 p-8 sm:p-10">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">{product.category}</p>
                            <h1 className="mt-2 text-3xl font-black tracking-tight">{product.name}</h1>
                        </div>
                        <p className="leading-7 text-slate-500">{product.description}</p>
                        <p className="text-2xl font-black text-slate-900">{formatRupiah(product.price)}</p>
                        <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-800">
                            Produk ini adalah data mock frontend dan belum terhubung ke transaksi.
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
