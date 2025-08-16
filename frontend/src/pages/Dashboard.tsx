
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useState, useEffect, type SyntheticEvent } from 'react';
import axios from 'axios';
import rupiah from '../utils/currency';
import { useNavigate } from 'react-router-dom';
import { DateRangePicker } from 'rsuite';
type DateRange = [Date, Date];

// Format ke "YYYY-MM-DD"
function formatDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const today = new Date();

  const [summary, setSummary] = useState({
    totalPenjualan: 0,
    jumlahOrder: 0,
    labaKotor: 0,
    operationalCost: 0,
    produkTerjual: 0,
    orderPending: 0,
    pelangganBaruHariIni: 0,
    pelangganBaruMingguIni: 0,
    warningLowStock: null,
    produkLowStock: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary(today, today);
  }, []);

  const fetchSummary = async (start_date: Date, end_date: Date) => {
    try {
      // Ganti endpoint sesuai backend kamu
      const res = await axios.get(`/dashboard?start_date=${formatDateLocal(start_date)}&end_date=${formatDateLocal(end_date)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setSummary(res.data);
    } catch (err: any) {
      // Dummy jika gagal
      setSummary({
        totalPenjualan: 0,
        jumlahOrder: 0,
        labaKotor: 0,
        operationalCost: 0,
        produkTerjual: 0,
        orderPending: 0,
        pelangganBaruHariIni: 0,
        pelangganBaruMingguIni: 0,
        warningLowStock: null,
        produkLowStock: [],
      });
      if (err.status == 401) {
        // Jika token tidak valid, redirect ke login
        localStorage.removeItem('token');
        navigate('/login');

      }
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (
    value: DateRange | null,
    _event: SyntheticEvent
  ) => {
    if (value) {
      const [start, end] = value;
      fetchSummary(start, end);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-4 md:p-8 bg-white">
            <div className="bg-teal-600 rounded-xl shadow p-4 md:p-8 min-h-[200px] md:min-h-[300px] border border-teal-100">
              <div className="flex justify-between mb-4 items-end">
                <h2 className="text-xl md:text-2xl font-bold  text-white">Ringkasan</h2>
                <DateRangePicker
                  appearance="subtle"
                  showOneCalendar
                  placement="bottomEnd"
                  size="sm"
                  onChange={handleDateRangeChange}
                  defaultValue={[new Date(),new Date()]}
                  className='w-1/2'
                  placeholder="Pilih tanggal"
                />
              </div>

              {/* Warning stok rendah */}
              {!loading && summary.warningLowStock && (
                <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded">
                  <div className="font-semibold">{summary.warningLowStock}</div>
                  {Array.isArray(summary.produkLowStock) && summary.produkLowStock.length > 0 && (
                    <ul className="mt-2 list-disc list-inside text-sm">
                      {summary.produkLowStock.map((p: any) => (
                        <li key={p.id}>{p.name} (stok: {p.stock})</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {loading ? (
                <div>Loading...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded shadow p-4 border">
                    <div className="text-teal-500 text-sm mb-1">Total Penjualan  (Rp)</div>
                    <div className="text-2xl font-bold text-teal-700"> {rupiah(summary.totalPenjualan)}</div>
                  </div>
                  <div className="bg-white rounded shadow p-4 border">
                    <div className="text-teal-500 text-sm mb-1">Total Laba Kotor  (Rp)</div>
                    <div className="text-2xl font-bold text-teal-700">{rupiah(summary.labaKotor)}</div>
                  </div>
                  <div className="bg-white rounded shadow p-4 border">
                    <div className="text-teal-500 text-sm mb-1">Total Laba Bersih  (Rp)</div>
                    <div className="text-2xl font-bold text-teal-700">{rupiah(summary.labaKotor - summary.operationalCost)}</div>
                  </div>

                  <div className="bg-white rounded shadow p-4 border">
                    <div className="text-teal-500 text-sm mb-1">Jumlah Produk Terjual  (pcs)</div>
                    <div className="text-2xl font-bold text-teal-700">{Math.abs(summary.produkTerjual)}</div>
                  </div>


                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;