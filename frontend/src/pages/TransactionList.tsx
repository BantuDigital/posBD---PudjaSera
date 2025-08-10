
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import rupiah from '../utils/currency';

interface Transaction {
    id: number;
    transaction_date: string;
    buyer_name: string;
    quantity: number;
    total_harga: number;
    status: string;
    harga_jual:number,
    name:string,
    harga_modal:number

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
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-teal-700">Daftar Transaksi</h2>
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
                                        <div key={trx.id } className="border p-4 rounded shadow bg-white flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-xs text-gray-500">{trx.transaction_date}</span>
                                                </div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-gray-700">Total</span>
                                                    <span className="font-bold text-teal-700">{rupiah(trx.harga_jual * trx.quantity)}</span>
                                                </div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-gray-700">Laba Kotor</span>
                                                    <span className="font-bold text-teal-700">{rupiah((trx.harga_jual - trx.harga_modal) * trx.quantity)}</span>
                                                </div>
                                                <hr className='my-2' />
                                                   <div className="flex justify-between mb-2">
                                                    <span className="text-xs text-gray-500">Rincian Item</span>
                                                </div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-bold">{trx.name}</span>
                                                    <span className="text-sm font-bold">{Math.abs(trx.quantity)} x {rupiah(trx.harga_jual)}</span>

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
                                className="px-4 py-2 bg-teal-500 text-white rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <div>
                                Page {page} of {totalPages}
                            </div>
                            <button
                                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={page === totalPages}
                                className="px-4 py-2 bg-teal-500 text-white rounded disabled:opacity-50"
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
                    className=" px-6 py-4  bg-teal-500 text-white rounded-full font-bold  hover:bg-teal-600">
                    Tambah Transaksi
                </button>
            </div>
        </div>
    );
};

export default TransactionList;
