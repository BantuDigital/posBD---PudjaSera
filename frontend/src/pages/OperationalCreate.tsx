import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function OperationalCreate() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [name, setName] = useState('');
    const [total, setTotal] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await axios.post('/operationals', { name, total: Number(total), date, description }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Produk berhasil ditambahkan!',
            }).then(() => {
                navigate('/operational');
            });
        } catch (e: any) {
            if (e?.response.status == 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
            setError(e?.response?.data?.message || 'Gagal menyimpan');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <div className="flex-1 flex flex-col md:flex-row">
                <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
                <main className="flex-1 p-4 md:p-8">
                    <form onSubmit={handleSubmit} className="max-w-xl mx-auto grid gap-4">
                        <h1 className="text-2xl font-bold mb-2 text-teal-700">Tambah biaya operasional</h1>
                        {error && <div className="text-red-600">{error}</div>}
                        <label className="grid gap-1">
                            <div className="text-sm text-gray-600">Nama <span className='text-red-500'>*</span> </div>
                            <input className="border rounded p-2" value={name} onChange={(e) => setName(e.target.value)} required />
                        </label>
                        <label className="grid gap-1">
                            <span className="text-sm text-gray-600">Biaya (Rp) <span className='text-red-500'>*</span></span>
                            <input type="number" min={1} className="border rounded p-2" value={total} onChange={(e) => setTotal(e.target.value)} required />
                        </label>
                        <label className="grid gap-1">
                            <span className="text-sm text-gray-600">Tanggal pengeluaran <span className='text-red-500'>*</span></span>
                            <input type="date" className="border rounded p-2" value={date} onChange={(e) => setDate(e.target.value)} required />
                        </label>
                        <label className="grid gap-1">
                            <span className="text-sm text-gray-600">Deskripsi</span>
                            <textarea className="border rounded p-2" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
                        </label>
                        <div className="">
                            <button type="submit" className="px-4 py-2 w-full rounded bg-teal-500 text-white hover:bg-teal-600">Simpan</button>
                        </div>
                        <h6 className='mt-4 font-bold'>
                            Keterangan :
                        </h6>

                        <ul className='list-disc pl-5'>
                            <li>

                                <span className='mt-4 font-bold'>
                                    (<span className='text-red-500'>*</span>) Wajib diisi
                                </span>
                            </li>
                            <li>
                                <span className='mt-4 font-bold'>
                                    Biaya operasional adalah biaya yang dikeluarkan untuk menjalankan bisnis, seperti gaji karyawan, sewa, dan utilitas atau biaya produk yang sulit dibagi per unit seperti Gas, Listrik, dan Air.
                                </span>

                            </li>
                            <li>
                                <span className='mt-4 font-bold'>
                                    Biaya ini akan digunakan untuk menghitung laba bersih bulanan, sehingga jangan sampai salah memasukkan tanggal pengeluaran
                                </span>
                            </li>
                        </ul>
                    </form>
                </main>
            </div>
        </div>
    );
}