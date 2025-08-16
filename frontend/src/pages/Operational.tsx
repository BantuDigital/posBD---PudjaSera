import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import rupiah from '../utils/currency';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Keep types lean and aligned to backend
export type Operational = {
  id: number;
  name: string;
  total: number; // decimal(10,2)
  date: string; // YYYY-MM-DD
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

const PAGE_SIZE = 12; // for UX calculations (server paginates too)

export default function OperationalPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<Operational[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const navigate = useNavigate();

  const queryParams = useMemo(() => {
    const p: Record<string, string | number> = { page };
    if (startDate) p.start_date = startDate;
    if (endDate) p.end_date = endDate;
    return p;
  }, [page, startDate, endDate]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/operationals', { params: queryParams, headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        if (cancelled) return;
        setItems(res.data.data ?? []);
        setLastPage(res.data.last_page ?? 1);
      } catch (e: any) {
        if (e?.response.status == 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        setError(e?.response?.data?.message || 'Gagal memuat data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [queryParams]);

  const totalAmount = useMemo(() => {
    return items.reduce((acc, it) => acc + Number(it.total || 0), 0);
  }, [items]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-4 md:p-8 bg-white">
            {/* Filters */}
            <section className="mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setPage(1);
                      setStartDate(e.target.value);
                    }}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setPage(1);
                      setEndDate(e.target.value);
                    }}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={() => setPage(1)}
                    className="w-full sm:w-auto px-4 py-2 rounded bg-teal-500 text-white hover:bg-teal-600"
                  >
                    Terapkan
                  </button>
                  <button
                    onClick={() => { setStartDate(''); setEndDate(''); setPage(1); }}
                    className="w-full sm:w-auto px-4 py-2 rounded border hover:bg-gray-50"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl shadow border">
                  <p className="text-sm text-gray-500">Total Operational (halaman ini)</p>
                  <p className="text-2xl font-bold mt-1">{rupiah(totalAmount)}</p>
                </div>
                <div className="p-4 rounded-2xl shadow border">
                  <p className="text-sm text-gray-500">Jumlah Item</p>
                  <p className="text-2xl font-bold mt-1">{items.length}</p>
                </div>
                <div className="p-4 rounded-2xl shadow border">
                  <p className="text-sm text-gray-500">Periode</p>
                  <p className="text-base font-semibold mt-1">
                    {startDate || '—'} — {endDate || '—'}
                  </p>
                </div>
              </div>
            </section>

            {/* List */}
            {loading && (
              <div className="text-center py-12 text-gray-500">Memuat...</div>
            )}
            {error && (
              <div className="text-center py-4 text-red-600">{error}</div>
            )}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.length === 0 ? (
                  <div className="col-span-full text-center py-16 text-gray-500">
                    Belum ada data operational.
                  </div>
                ) : (
                  items.map((op) => (
                    <article key={op.id} className="border rounded-2xl shadow p-4 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-bold leading-tight">{op.name}</h3>
                        <span className="px-3 py-1 rounded-full text-sm bg-gray-100">{op.date}</span>
                      </div>
                      {op.description && (
                        <p className="text-gray-600 text-sm line-clamp-3">{op.description}</p>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-gray-500 text-sm">Total</span>
                        <span className="text-xl font-extrabold">{rupiah(Number(op.total))}</span>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          onClick={() => navigate(`/operationals/${op.id}/edit`)}
                          className="px-3 py-2 rounded-full border hover:bg-gray-50 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            const result = await Swal.fire({
                              title: 'Hapus item ini?',
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonText: 'Hapus',
                              cancelButtonText: 'Batal'
                            });
                            if (!result.isConfirmed) return;
                            try {
                              await axios.delete(`/operationals/${op.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                                Swal.fire({
                                title: 'Berhasil dihapus',
                                icon: 'success',
                                timer: 1200,
                                showConfirmButton: false,
                                });
                              setItems((prev) => prev.filter((x) => x.id !== op.id));
                            } catch (e: any) {
                              Swal.fire({
                                title: 'Gagal menghapus',
                                icon: 'error',
                                text: e.response?.data?.message || 'Terjadi kesalahan',
                                confirmButtonText: 'OK'
                              });
                            }
                          }}
                          className="px-3 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 text-sm"
                        >
                          Hapus
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-teal-500 text-white rounded disabled:opacity-50"
              >
                Previous
              </button>
              <div>Page {page} of {lastPage}</div>
              <button
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page === lastPage}
                className="px-4 py-2 bg-teal-500 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="flex justify-end mb-4 fixed bottom-10 right-1/2 translate-x-1/2">
        <button
          onClick={() => navigate('/operational/create')}
          className="px-6 py-4 bg-teal-500 text-white rounded-full font-bold hover:bg-teal-600"
        >
          Tambah Operational
        </button>
      </div>
    </div>
  );
}