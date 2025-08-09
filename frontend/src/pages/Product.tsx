import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useState, useEffect } from 'react';
import axios from 'axios';
import rupiah from '../utils/currency';
import { NavLink, useNavigate } from 'react-router-dom';
import storageLink from '../main';

type Product = {
    id: number;
    name: string;
    category: string;
    description?: string;
    image_url?: string;
    is_active: boolean;
    harga_jual: number;
    harga_modal: number;
    stock: number;
};

const Product = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchProducts = async () => {
            const response = await axios.get('/products', {
                params: {
                    search,
                    sort_by: sortBy,
                    sort_order: sortOrder,
                    page,
                },
            });
            setProducts(response.data.data);
            setTotalPages(response.data.last_page);
        };
        fetchProducts();
        // console.log('Products fetched:', products);
    }, [search, sortBy, sortOrder, page]);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <div className="flex-1 flex flex-col md:flex-row">
                <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
                <div className="flex-1 flex flex-col">
                    <main className="flex-1 p-4 md:p-8 bg-white">
                        <div className="mb-4 ">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="border p-2 rounded w-full md:w-1/2 mb-3"
                            />
                            <select
                                value={`${sortBy}:${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split(':');
                                    setSortBy(field);
                                    setSortOrder(order);
                                }}
                                className="border p-2 rounded w-full"
                            >
                                <option value="name:asc">Sort by Name (A-Z)</option>
                                <option value="name:desc">Sort by Name (Z-A)</option>
                                <option value="price:asc">Sort by Price (Low to High)</option>
                                <option value="price:desc">Sort by Price (High to Low)</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {!products ? (
                                <div className="col-span-full text-center py-8 text-gray-500 text-lg">
                                    Belum ada produk, tambahkan produk
                                </div>
                            ) : (
                                products?.map((product) => (
                                    <div key={product.id} className="border p-4 rounded shadow">
                                        <img
                                            src={storageLink + product.image_url || '/placeholder.svg'}
                                            alt={product.name}
                                            className="w-full h-32 object-cover mb-2"
                                        />
                                        <div className='flex justify-between'>
                                            <h3 className="text-lg font-bold">{product.name}</h3>
                                            <h3 className="text-lg font-bold">
                                                Stock : {product.stock}
                                            </h3>
                                        </div>
                                        <p className="text-gray-600">Category: {product.category}</p>
                                        <p className="text-gray-600">Harga jual: {rupiah(product.harga_jual)}</p>
                                        <p className="text-gray-600">Harga modal: {rupiah(product.harga_modal)}</p>
                                        <p className={`text-sm ${product.is_active ? 'text-green-500' : 'text-red-500'}`}> 
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </p>
                                        <div className="mt-4 flex justify-between">
                                            <NavLink to={`/restock/${product.id}`} className="text-white w-full text-center bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
                                                Restock
                                            </NavLink>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                            <button
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <div>
                                Page {page} of {totalPages}
                            </div>
                            <button
                                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={page === totalPages}
                                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>

                    </main>
                </div>
            </div>
            <div className="flex justify-end mb-4 fixed bottom-10 right-1/2 translate-x-1/2">
                <button
                    onClick={() => navigate('/product/create')}
                    className=" px-6 py-4  bg-blue-500 text-white rounded-full font-bold  hover:bg-blue-600">
                    Tambah Produk
                </button>
            </div>
        </div>

    );
}

export default Product;
