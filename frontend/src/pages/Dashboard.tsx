
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useState, useEffect } from 'react';
import axios from 'axios';
import rupiah from '../utils/currency';
import { useNavigate } from 'react-router-dom';


const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    totalPenjualan: 0,
    jumlahOrder: 0,
    labaKotor: 0,
    produkTerjual: 0,
    orderPending: 0,
    pelangganBaruHariIni: 0,
    pelangganBaruMingguIni: 0,
    warningLowStock: null,
    produkLowStock: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // Ganti endpoint sesuai backend kamu
        const res = await axios.get('/dashboard', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setSummary(res.data);
      } catch (err : any) {
        // Dummy jika gagal
        setSummary({
          totalPenjualan: 0,
          jumlahOrder: 0,
          labaKotor: 0,
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
    fetchSummary();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-4 md:p-8 bg-white">
            <div className="bg-teal-600 rounded-xl shadow p-4 md:p-8 min-h-[200px] md:min-h-[300px] border border-teal-100">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-white">Ringkasan</h2>
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
                    <div className="text-teal-500 text-sm mb-1">Total Penjualan Hari Ini (Rp)</div>
                    <div className="text-2xl font-bold text-teal-700"> {rupiah(summary.totalPenjualan)}</div>
                  </div>
                  <div className="bg-white rounded shadow p-4 border">
                    <div className="text-teal-500 text-sm mb-1">Total Laba Kotor Hari Ini (Rp)</div>
                    <div className="text-2xl font-bold text-teal-700">{rupiah(summary.labaKotor)}</div>
                  </div>
                  
                  <div className="bg-white rounded shadow p-4 border">
                    <div className="text-teal-500 text-sm mb-1">Jumlah Produk Terjual Hari Ini (pcs)</div>
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