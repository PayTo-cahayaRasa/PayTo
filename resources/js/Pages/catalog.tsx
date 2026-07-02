import { Link } from '@inertiajs/react';
import { ArrowLeft, Search, ShoppingBag } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatRupiah, storefrontProducts } from './storefrontProducts';

export default function CatalogPage() {
    const [search, setSearch] = useState('');

    const filteredProducts = useMemo(() => {
        const keyword = search.trim().toLocaleLowerCase('id-ID');

        if (!keyword) {
            return storefrontProducts;
        }

        return storefrontProducts.filter((product) =>
            `${product.name} ${product.category}`.toLocaleLowerCase('id-ID').includes(keyword),
        );
    }, [search]);

    return (
        <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-800 sm:px-8 lg:px-12">
            <div className="mx-auto flex max-w-6xl flex-col gap-8">
                <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex flex-col gap-3">
                        <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                            <ArrowLeft size={16} /> Kembali ke beranda
                        </Link>
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Mock Catalog</p>
                            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Pilihan produk PayTo</h1>
                            <p className="mt-2 text-slate-500">Data berikut hanya contoh tampilan frontend.</p>
                        </div>
                    </div>

                    <label className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:max-w-sm">
                        <Search size={18} className="text-slate-400" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari produk..."
                            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                        />
                    </label>
                </header>

                {filteredProducts.length > 0 ? (
                    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredProducts.map((product) => (
                            <article key={product.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                                <div className={`flex h-36 items-center justify-center bg-gradient-to-br ${product.accent}`}>
                                    <ShoppingBag size={42} className="text-white/90" />
                                </div>
                                <div className="flex flex-col gap-4 p-6">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">{product.category}</p>
                                        <h2 className="mt-1 text-xl font-bold">{product.name}</h2>
                                        <p className="mt-2 text-sm leading-6 text-slate-500">{product.description}</p>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="font-bold text-slate-900">{formatRupiah(product.price)}</span>
                                        <Link href={`/katalog/${product.slug}`} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-600">
                                            Detail
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                ) : (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
                        Produk mock tidak ditemukan.
                    </div>
                )}
            </div>
        </main>
    );
}
