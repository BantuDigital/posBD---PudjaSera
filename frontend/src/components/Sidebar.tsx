type SidebarProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
};

import { ArrowLeftRight, BanknoteArrowDown, LayoutDashboard, LogOut, ShoppingCart } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Sidebar({ open, setOpen }: SidebarProps) {
    const navigate = useNavigate();
    const logout = () => {
        localStorage.removeItem('token');
        navigate('login')
    };
    return (
        <>
            {/* Sidebar drawer mobile */}
            <div className={`fixed inset-0 z-40 bg-black/30 transition-opacity md:hidden ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setOpen(false)} />
            <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-100 flex flex-col p-4 transform transition-transform md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} md:w-56 md:min-h-screen md:flex md:p-4 md:bg-white md:border-r md:relative`}>
                <div className="flex items-center justify-between mb-8 md:block">
                    <button className="md:hidden p-2" onClick={() => setOpen(false)} aria-label="Tutup menu">
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <nav className="flex-1 space-y-1">
                    <NavLink to="/dashboard" className={({ isActive }) => `block py-2 px-4 rounded-lg font-medium transition ${isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-teal-50'}`}> <LayoutDashboard /> Dashboard</NavLink>
                    <NavLink to="/product" className={({ isActive }) => `block py-2 px-4 rounded-lg font-medium transition ${isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-teal-50'}`}> <ShoppingCart /> Produk</NavLink>
                    <NavLink to="/transaction" className={({ isActive }) => `block py-2 px-4 rounded-lg font-medium transition ${isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-teal-50'}`}> <ArrowLeftRight /> Transaksi</NavLink>
                    <NavLink to="/operational"  className={({ isActive }) => `block  py-2 px-4 rounded-lg font-medium transition ${isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-teal-50'}`}> <BanknoteArrowDown /> Operasional</NavLink>
                </nav>
                    <div className="flex justify-between  rounded-full bg-teal-700 p-6">
                        <div onClick={logout} className="px-4 h-fit text-white rounded-lg hover:bg-teal-100 transition font-semibold cursor-pointer">Logout</div>
                        <LogOut className='text-white' />
                    </div>
            </aside>
        </>
    );
}
