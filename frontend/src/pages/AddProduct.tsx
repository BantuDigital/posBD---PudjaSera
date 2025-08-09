import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

// Add an index signature to the product type
interface Product {
    name: string;
    harga_jual: number;
    stock: number;
    harga_modal: number;
    category: string;
    description: string;
    image: File | null;
    [key: string]: any; // Index signature for dynamic key access
}

const AddProduct = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [product, setProduct] = useState<Product>({
        name: '',
        harga_jual: 0,
        harga_modal: 0,
        stock: 0,
        cogs_price: 0,
        category: '',
        description: '',
        image: null,
        components: [{ name: '', cost: 0 }],
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData();
        // Explicitly handle each field in the product object, skip 'price' (already appended)
        formData.append('name', product.name);
        formData.append('harga_jual', product.harga_jual.toString());
        formData.append('harga_modal', product.harga_modal.toString());
        formData.append('stock', product.stock.toString());
        formData.append('category', product.category);
        formData.append('description', product.description);
        if (product.image) {
            formData.append('image', product.image);
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post('/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': "Bearer " + token
                },
            });
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Produk berhasil ditambahkan!',
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
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-blue-700">Tambah Produk</h2>
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
                                <span className='text-sm font-bold'>Harga Jual adalah harga yang anda berikan kepada konsumen / tertera di pembelian</span>
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
                                <label className="block text-sm font-medium text-gray-700">Stok <span className='text-red-500'>*</span> </label>
                                <input required type="number" name="stock" value={product.stock} onChange={(e) => setProduct({ ...product, stock: parseFloat(e.target.value) })} className="mt-1 block w-full border p-2 rounded" placeholder="Masukkan stok" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                                <input type="text" name="category" value={product.category} onChange={(e) => setProduct({ ...product, category: e.target.value })} className="mt-1 block w-full border p-2 rounded" placeholder="Masukkan kategori" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                                <textarea name="description" value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} className="mt-1 block w-full border p-2 rounded" placeholder="Masukkan deskripsi"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gambar Produk</label>
                                <input type="file" name="image" onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        setProduct({ ...product, image: e.target.files?.[0] || null });
                                    }
                                }} className="mt-1 block w-full border p-2 rounded" />
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
                                <span className='text-sm font-bold'>Harga Modal adalah harga yang anda keluarkan untuk memproduksi barang tersebut.
                                    jika anda tidak mau menghitung biaya produksi dengan detail,
                                    cukup isi dengan harga bahan baku utama produk ini.
                                    biaya lain lain seperti gas, air, listrik dan tenaga kerja dapat dimasukkan dimenu <span className='font-bold'>operasional</span></span>
                            </li>
                            <li>
                                <span className='text-sm font-bold'>Harga Jual adalah harga yang anda berikan kepada konsumen / tertera di pembelian</span>

                            </li>
                        </ul>

                    </main>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;
