import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';


const EditProduct = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { productId } = useParams();
    interface Component {
        name: string;
        cost: number;
    }
    interface ProductEdit {
        name: string;
        category: string;
        price: string;
        description: string;
        is_active: boolean;
        image_url: string;
        stock: number;
        components: Component[];
    }
    const [product, setProduct] = useState<ProductEdit>({
        name: '',
        category: '',
        price: '',
        description: '',
        is_active: true,
        image_url: '',
        stock: 0,
        components: [{ name: '', cost: 0 }],
    });
    const navigate = useNavigate();

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
                    ...response.data.product,
                    components: Array.isArray(response.data.cogs)
                        ? response.data.cogs.map((c: any) => ({
                            name: c.component_name,
                            cost: Number(c.cost)
                        }))
                        : [{ name: '', cost: 0 }],
                });
               
            } catch (error) {
                console.error('Error fetching product:', error);
            }
        };
        fetchProduct();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            e.preventDefault();
        const formData = new FormData();
        formData.append('_method',"PUT");
        const price = product.components.reduce((sum, comp) => sum + (Number(comp.cost) || 0), 0);
        formData.append('price', price.toString());
        // Explicitly handle each field in the product object, skip 'price' (already appended)
        (Object.keys(product) as Array<keyof ProductEdit>).forEach((key) => {
            if (key === 'components') {
                formData.append(key, JSON.stringify(product.components));
            } else if (key !== 'price') {
                formData.append(key, String(product[key]));
            }
        });
        await axios.post(
            `/products/${productId}`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            Swal.fire({
                icon: 'success',
                title: 'Produk berhasil diperbarui!',
                showConfirmButton: false,
                timer: 1500
            });
            navigate('/product');
        } catch (error: any) {
            console.error('Error updating product:', error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal memperbarui produk.',
                text: error.response?.data?.message || 'Terjadi kesalahan.',
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProduct((prev) => ({
            ...prev,
            [name]: name === 'is_active' ? value === 'true' : value,
        }));
    };


    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <div className="flex-1 flex flex-col md:flex-row">
                <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
                <div className="flex-1 flex flex-col">
                    <main className="flex-1 p-4 md:p-8 bg-white">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-blue-700">Restock Produk</h2>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={product.name}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border p-2 rounded"
                                    placeholder="Masukkan nama produk"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Harga</label>
                                <input
                                    type="number"
                                 
                                    value={product.components.reduce((sum, comp) => sum + (Number(comp.cost) || 0), 0)}
                                    disabled
                                    className="mt-1 block w-full border p-2 rounded bg-gray-200"
                                    placeholder="Masukkan harga"
                                />
                            </div>

                           
                           <div>
                                <label className="block text-sm font-medium text-gray-700">Stok <span className='text-red-500'>*</span> </label>
                                <input required type="number" name="stock" value={product.stock} onChange={handleChange} className="mt-1 block w-full border p-2 rounded" placeholder="Masukkan stok" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                                <input
                                    type="text"
                                    name="category"
                                    value={product.category}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border p-2 rounded"
                                    placeholder="Masukkan kategori"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                                <textarea
                                    name="description"
                                    value={product.description}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border p-2 rounded"
                                    placeholder="Masukkan deskripsi"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    name="is_active"
                                    value={product.is_active ? 'true' : 'false'}
                                    onChange={(e) => setProduct((prev) => ({
                                        ...prev,
                                        is_active: e.target.value === 'true',
                                    }))}
                                    className="mt-1 block w-full border p-2 rounded"
                                >
                                    <option value="true">Aktif</option>
                                    <option value="false">Tidak Aktif</option>
                                </select>
                            </div>
                            <div>
                                  <img
                                        src={product.image_url || '/placeholder.svg'}
                                        alt={product.name}
                                        className="w-full h-32 object-cover mb-2"
                                    />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gambar Produk</label>
                                <input type="file" name="image" className="mt-1 block w-full border p-2 rounded" />
                                <span className='mt-4 inline-block'>Upload untuk mengubah gambar</span>
                            </div>
                            <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Simpan</button>
                        </form>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;
