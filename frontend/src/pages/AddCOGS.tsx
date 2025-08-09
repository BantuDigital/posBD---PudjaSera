import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import axios from 'axios';

const AddCOGS = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { productId } = useParams();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await axios.post(
        `/api/products/${productId}/cogs`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      alert('COGS berhasil ditambahkan!');
      window.location.href = `/products/${productId}`;
    } catch (error) {
      console.error('Error adding COGS:', error);
      alert('Gagal menambahkan COGS.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-4 md:p-8 bg-white">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-blue-700">Tambah HPP</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Komponen</label>
                <input type="text" name="nama_komponen" className="mt-1 block w-full border p-2 rounded" placeholder="Masukkan nama komponen" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <input type="text" name="unit" className="mt-1 block w-full border p-2 rounded" placeholder="Masukkan unit" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kuantitas</label>
                <input type="number" name="kuantitas" className="mt-1 block w-full border p-2 rounded" placeholder="Masukkan kuantitas" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Biaya per Unit</label>
                <input type="number" name="biaya_per_unit" className="mt-1 block w-full border p-2 rounded" placeholder="Masukkan biaya per unit" />
              </div>
              <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Tambahkan</button>
            </form>
            <NavLink className="mt-5 inline-block text-center w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" to={`/product`}>Tidak jadi</NavLink>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AddCOGS;
