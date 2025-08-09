import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import axios from 'axios';
import Swal from 'sweetalert2';

const AddTransaction = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [buyer, setBuyer] = useState({
        name: '',
        phone: '',
        address: '',
        id: 0
    });
    // Store full buyer list for autofill
    const [buyerList, setBuyerList] = useState<any[]>([]);
    const [status, setStatus] = useState('process');

    const [buyerOptions, setBuyerOptions] = useState<{ value: string; label: string }[]>([]);
    useEffect(() => {
        // Fetch buyers for select and autofill
        const fetchBuyers = async () => {
            try {
                const res = await axios.get('/buyers', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const buyers = res.data.data || res.data;
                setBuyerList(buyers);
                const options = buyers.map((b: any) => ({ value: b.name, label: b.name }));
                setBuyerOptions(options);
            } catch (err) {
                setBuyerOptions([]);
                setBuyerList([]);
            }
        };
        fetchBuyers();
    }, []);
    const [products, setProducts] = useState<{ value: number; label: string; qty: number; notes: string }[]>([
        { value: 0, label: '', qty: 1, notes: '' }
    ]);
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

    const handleProductChange = (index: number, selected: any) => {
        const updated = [...products];
        updated[index].value = selected ? selected.value : 0;
        updated[index].label = selected ? selected.label : '';
        setProducts(updated);
    };

    const handleQtyChange = (index: number, qty: number) => {
        const updated = [...products];
        updated[index].qty = qty;
        setProducts(updated);
    };

    const handleNotesChange = (index: number, notes: string) => {
        const updated = [...products];
        updated[index].notes = notes;
        setProducts(updated);
    };

    const handleAddProduct = () => {
        setProducts([...products, { value: 0, label: '', qty: 1, notes: '' }]);
    };

    const handleRemoveProduct = (index: number) => {
        setProducts(products.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Handle form submission logic here
        const transactionData = {
            buyer_id: buyerList.find(b => b.name === buyer.name)?.id || null,
            buyer_name: buyer.name,
            buyer_phone: buyer.phone,
            buyer_address: buyer.address,
            products: products,
            status: status
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
                            <h2 className="text-xl md:text-2xl font-bold mb-4 text-blue-700">Tambah Produk</h2>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nama Pembeli <span className='text-red-500'>*</span></label>
                                    <CreatableSelect
                                        isClearable
                                        options={buyerOptions}
                                        value={buyer.name ? { value: buyer.name, label: buyer.name } : null}
                                        onChange={option => {
                                            if (option) {
                                                // Find buyer in list
                                                const found = buyerList.find(b => b.name === option.value);
                                                if (found) {
                                                    setBuyer({
                                                        name: found.name,
                                                        phone: found.phone || '',
                                                        address: found.address || '',
                                                        id: found.id || 0
                                                    });
                                                } else {
                                                    setBuyer({ name: option.value, phone: '', address: '', id: 0 });
                                                }
                                            } else {
                                                setBuyer({ name: '', phone: '', address: '', id: 0 });
                                            }
                                        }}
                                        onCreateOption={inputValue => setBuyer({ name: inputValue, phone: '', address: '', id: 0 })}
                                        placeholder="Cari atau buat nama pembeli"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Telepon </label>
                                    <input type="text" name="buyer_phone" value={buyer.phone} onChange={e => setBuyer({ ...buyer, phone: e.target.value })} className="mt-1 block w-full border p-2 rounded" placeholder="Masukkan nomor telepon" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Alamat </label>
                                    <textarea name="buyer_address" value={buyer.address} onChange={e => setBuyer({ ...buyer, address: e.target.value })} className="mt-1 block w-full border p-2 rounded" placeholder="Masukkan alamat pembeli"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Produk <span className='text-red-500'>*</span></label>
                                    {products.map((prod, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row items-center gap-2 mb-2">
                                            <div className="w-full flex justify-between items-center">
                                                <Select
                                                    options={productOptions}
                                                    value={productOptions.find(opt => opt.value === prod.value) || null}
                                                    onChange={selected => handleProductChange(idx, selected)}
                                                    placeholder="Pilih produk"
                                                    isClearable
                                                    className="w-2/3 "
                                                />
                                                X
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={prod.qty}
                                                    onChange={e => handleQtyChange(idx, Number(e.target.value))}
                                                    className="border p-2 rounded w-1/4"
                                                    placeholder="Qty"
                                                    required
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={prod.notes}
                                                onChange={e => handleNotesChange(idx, e.target.value)}
                                                className="border p-2 rounded w-full md:w-1/3"
                                                placeholder="Catatan (opsional)"
                                            />
                                            <button type="button" onClick={() => handleRemoveProduct(idx)} className="px-2 py-1 bg-red-500 text-white rounded">Hapus</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={handleAddProduct} className="px-4 py-2 bg-blue-500 text-white rounded mt-2">Tambah Produk</button>
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700">Status <span className='text-red-500'>*</span></label>
                                        <select required name="status" value={status} onChange={e => setStatus(e.target.value)} className="mt-1 block w-full border p-2 rounded">
                                            <option value="process">Proses</option>
                                            <option value="completed">Selesai</option>
                                            <option value="cancelled">Dibatalkan</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full">Simpan Transaksi</button>
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
                                          Jangan lupa mengisi nama pembeli, jika pembeli baru, anda bisa membuatnya dengan mengisi nama pembeli dan memilihnya 
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