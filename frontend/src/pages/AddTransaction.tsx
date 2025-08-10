import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import Select from 'react-select';
import axios from 'axios';
import Swal from 'sweetalert2';

const AddTransaction = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]); // Set default to today
    const [isLoading, setIsLoading] = useState(false);
    const [productId, setProductId] = useState<number>();
    const [quantity, setQuantity] = useState<number>(1);
    const [notes, setNotes] = useState<string>('');
    const [productOptions, setProductOptions] = useState<{ value: number; label: string }[]>([]);

    useEffect(() => {
        // Fetch product list for select
        const fetchProducts = async () => {
            try {
                const res = await axios.get('/products', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                // Sesuaikan dengan struktur data produk
                const options = (res.data.data || res.data).map((p: any) => ({ value: p.id, label: p.name }));
                setProductOptions(options);
            } catch (err) {
                setProductOptions([]);
            }
        };
        fetchProducts();
    }, []);

   

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true)
        // Validate that at least one product is selected
     

        // Handle form submission logic here
        const transactionData = {
            date,
            product_id: productId,
            quantity,
            notes
        };
        try {
            await axios.post('/transactions', transactionData, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            Swal.fire({
                icon: 'success',
                title: 'Transaksi berhasil disimpan!',
                showConfirmButton: false,
                timer: 1500
            });
            navigate('/transaction');    
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal menyimpan transaksi.',
                text: error.response?.data?.error || 'Terjadi kesalahan.',
            });
            console.error('Error creating transaction:', error);
        } finally {
            setIsLoading(false)
        }
    };

    return (
        <>
            <div className="min-h-screen flex flex-col bg-white">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <div className="flex-1 flex flex-col md:flex-row">
                    <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
                    <div className="flex-1 flex flex-col">
                        <main className="flex-1 p-4 md:p-8 bg-white">
                            <h2 className="text-xl md:text-2xl font-bold mb-4 text-teal-700">Tambah Transaksi</h2>
                            <form className="space-y-4" onSubmit={handleSubmit}>

                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                                        Tanggal Transaksi <span className='text-red-500'>*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        id="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        max={new Date().toISOString().split('T')[0]} // Prevent future dates
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                        required
                                    />

                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Produk <span className='text-red-500'>*</span></label>
                                        <div  className="flex flex-col md:flex-row items-center gap-2 mb-2">
                                            <div className="w-full flex justify-between items-center">
                                                <Select
                                                    options={productOptions}
                                                    value={productOptions.find(opt => opt.value === productId) || null}
                                                    onChange={selected => setProductId(selected?.value || 0)}
                                                    placeholder="Pilih produk"
                                                    isClearable
                                                    className="w-2/3 "
                                                />
                                                X
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={quantity}
                                                    onChange={e => setQuantity(Number(e.target.value))}
                                                    className="border p-2 rounded w-1/4"
                                                    placeholder="Qty"
                                                    required
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={notes}
                                                onChange={e => setNotes(e.target.value)}
                                                className="border p-2 rounded w-full md:w-1/3"
                                                placeholder="Catatan (opsional)"
                                            />
                                        </div>

                                </div>
                                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 w-full">{isLoading ? 'Loading...' : 'Simpan Transaksi'}</button>
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
                                        <h3 className='mt-4 font-bold'>
                                            Pastikan stok cukup untuk transaksi ini.
                                        </h3>
                                    </li>
                                    <li>
                                        <h3 className='mt-4 font-bold'>
                                            Tanggal transaksi dapat disesuaikan dengan kebutuhan.
                                        </h3>
                                    </li>

                                </ul>

                            </form>
                        </main>

                    </div>


                </div>
            </div>

        </>
    );
}

export default AddTransaction;