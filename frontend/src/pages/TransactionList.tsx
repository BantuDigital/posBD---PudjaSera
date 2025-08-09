
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import rupiah from '../utils/currency';
import Swal from 'sweetalert2';

interface Transaction {
    id: number;
    transaction_number: string;
    transaction_date: string;
    buyer_name: string;
    quantity: number;
    total_harga: number;
    status: string;
}

const TransactionList = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [order, setOrder] = useState<'desc' | 'asc'>('desc');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const handleUpdateStatus = async (id: number, status: 'completed' | 'cancelled') => {
        try {
            const result = await Swal.fire({
                title: 'Apakah Anda yakin?',
                text: `Status transaksi akan diubah menjadi ${status === 'completed' ? 'Selesai' : 'Batal'}.`,
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, ubah!',
                cancelButtonText: 'Batal'
            });
            if (!result.isConfirmed) return;
            const token = localStorage.getItem('token');
            await axios.post(`/transactions/${id}/status`, { status }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchTransactions();
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: `Status transaksi berhasil diubah menjadi ${status === 'completed' ? 'Selesai' : 'Batal'}.`,
            });
            // setTransactions(transactions.map(trx => trx.id === id ? { ...trx, status } : trx));
        } catch (error : any) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: `Gagal mengubah status transaksi: ${error.response?.data?.message || error.message}`,
            });
            console.error('Error updating transaction status:', error);
        }
    };

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/transactions', {
                params: {
                    search,
                    order,
                    page,
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setTransactions(response.data.data);
            setTotalPages(response.data.last_page);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchTransactions();
    }, [search, order, page]);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <div className="flex-1 flex flex-col md:flex-row">
                <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
                <div className="flex-1 flex flex-col">
                    <main className="flex-1 p-4 md:p-8 bg-white">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-blue-700">Daftar Transaksi</h2>
                        <div className="mb-4 flex flex-col md:flex-row gap-2">
                            <input
                                type="text"
                                placeholder="Cari transaksi atau pembeli..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                className="border p-2 rounded w-full md:w-1/2"
                            />
                            <select
                                value={order}
                                onChange={e => { setOrder(e.target.value as 'desc' | 'asc'); setPage(1); }}
                                className="border p-2 rounded w-full md:w-1/4"
                            >
                                <option value="desc">Terbaru</option>
                                <option value="asc">Terlama</option>
                            </select>
                        </div>
                        {loading ? (
                            <div>Loading...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {transactions.length === 0 ? (
                                    <div className="col-span-full text-center py-4">Tidak ada transaksi</div>
                                ) : (
                                    transactions.map((trx) => (
                                        <div key={trx.transaction_number } className="border p-4 rounded shadow bg-white flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-xs text-gray-500">{trx.transaction_date}</span>
                                                    <span className="text-xs text-gray-500">No: {trx.transaction_number}</span>
                                                </div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-gray-700"> Qty: {Math.abs(trx.quantity)}</span>
                                                    <span className="font-bold text-blue-700">{rupiah(trx.total_harga)}</span>
                                                </div>
                                                <div className='flex justify-between mb-1'>
                                                    <div className="text-gray-600 text-sm mb-1">Pembeli: {trx.buyer_name || '-'}</div>
                                                    {trx.status != 'completed' ? (
                                                        <div className='flex gap-2'>
                                                            <button onClick={() => handleUpdateStatus(trx.id, 'completed')} className='bg-blue-500 text-white rounded px-2 py-1'>Selesai</button>
                                                            <button onClick={() => handleUpdateStatus(trx.id, 'cancelled')} className='bg-red-500 text-white rounded px-2 py-1'>Batal</button>
                                                        </div>
                                                    ): (
                                                        <span className={`text-sm font-bold ${trx.status === 'completed' ? 'text-green-500' : 'text-red-500'}`}>{trx.status}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
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
                    onClick={() => navigate('/transaction/create')}
                    className=" px-6 py-4  bg-blue-500 text-white rounded-full font-bold  hover:bg-blue-600">
                    Tambah Transaksi
                </button>
            </div>
        </div>
    );
};

export default TransactionList;
