import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';

// Add an index signature to the product type
interface Product {
    name: string;
    harga_jual: number;
    stockNew: number;
    harga_modal: number;

    [key: string]: any; // Index signature for dynamic key access
}

const ReStockProduct = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { productId } = useParams();
    const [product, setProduct] = useState<Product>({
        name: '',
        harga_jual: 0,
        harga_modal: 0,
        stockNew: 0,

    });
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(
                    `/products/${productId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                setProduct({
                    name: response.data.product.name,
                    harga_jual: response.data.product.harga_jual,
                    harga_modal: response.data.product.harga_modal,
                    stockNew: 0,
                });

            } catch (error) {
                console.error('Error fetching product:', error);
            }
        };
        fetchProduct();
    }, []);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData();
        // Explicitly handle each field in the product object, skip 'price' (already appended)
        formData.append('harga_jual', product.harga_jual.toString());
        formData.append('harga_modal', product.harga_modal.toString());
        formData.append('stockNew', product.stockNew.toString());

        try {
            const token = localStorage.getItem('token');
            await axios.put('/restock/' + productId, formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + token
                },
            });
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Produk berhasil direstock!',
            }).then(() => {
                navigate('/product');
            });
        } catch (error: any) {
            console.error('Error adding product:', error);
            if (error.response && error.response.data && error.response.data.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat().join('\n');
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: errorMessages,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: 'Gagal menambahkan produk : ' + error.response.data.message,
                });
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <div className="flex-1 flex flex-col md:flex-row">
                <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
                <div className="flex-1 flex flex-col">
                    <main className="flex-1 p-4 md:p-8 bg-white">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-blue-700">ReStock Produk</h2>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Produk <span className='text-red-500'>*</span></label>
                                <input required type="text" name="name" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} className="mt-1 block w-full border p-2 rounded" placeholder="Masukkan nama produk" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Harga Jual <span className='text-red-500'>*</span></label>
                                <input
                                    required
                                    type="number"
                                    value={product.harga_jual}
                                    onChange={(e) => setProduct({ ...product, harga_jual: parseFloat(e.target.value) })} className="mt-1 block w-full border p-2 rounded" placeholder="Masukkan harga jual"
                                />
                                <span className='text-sm font-bold'>Baca keterangan dibawah untuk penjelasan</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Harga Modal <span className='text-red-500'>*</span></label>
                                <input
                                    required
                                    type="number"
                                    value={product.harga_modal}
                                    onChange={(e) => setProduct({ ...product, harga_modal: parseFloat(e.target.value) })} className="mt-1 block w-full border p-2 rounded" placeholder="Masukkan harga modal"
                                />
                                <span className='text-sm font-bold'>Baca keterangan dibawah untuk penjelasan</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Jumlah Stok Baru <span className='text-red-500'>*</span> </label>
                                <input required type="number" name="stockNew" value={product.stockNew} onChange={(e) => setProduct({ ...product, stockNew: parseFloat(e.target.value) })} className="mt-1 block w-full border p-2 rounded" placeholder="Masukkan stok" />
                                <span className='text-sm font-bold'>Masukkan jumlah stok baru, BUKAN TOTAL STOK KESELURUHAN</span>
                            </div>



                            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full">Simpan</button>
                        </form>
                        <h3 className='mt-4 font-bold'>
                            Keterangan :
                        </h3>

                        <ul className='list-disc pl-5'>
                            <li>

                                <h3 className='mt-4 font-bold'>
                                    (<span className='text-red-500'>*</span>) Wajib diisi

                                </h3>
                            </li>
                            <li>
                                <span className='text-sm font-bold'>Apabila Harga Jual dan harga modal yang mengalami perubahan, silakan sesuaikan nilainya.</span>
                            </li>
                           <li>
                            <span className='text-sm font-bold'>Apabila stock lama masih ada, dan harga modal mengalami perubahan, Cukup masukkan harga baru, harga modal akan disesuaikan otomatis oleh sistem menggunakan rumus <a href="https://kledo.com/blog/moving-average/" target='_blank' className='text-blue-600'>Moving Average Cost (MAC)</a></span>
                           </li>
                        </ul>

                    </main>
                </div>
            </div>
        </div>
    );
};

export default ReStockProduct;
