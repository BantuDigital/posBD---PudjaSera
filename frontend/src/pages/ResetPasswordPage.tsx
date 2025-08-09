import React, {  useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    let [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const token = searchParams.get('token') || '';


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            setError('Email tidak valid');
            return;
        }
        if (!token) {
            setError('Token wajib diisi');
            return;
        }

        if (password !== passwordConfirmation) {
            setError('Konfirmasi password tidak sama');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`/reset-password`, {
                email,
                token,
                password,
                password_confirmation: passwordConfirmation,
            });
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Password berhasil direset. Silakan login.',
            });
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Gagal reset password');

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
            <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-10">
                <div className="flex flex-col items-center mb-8">
                    <span className="text-blue-700 text-3xl font-extrabold tracking-widest select-none mb-2">mealikmu</span>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Reset Password</h2>
                    <p className="text-gray-400 text-sm mb-2">Masukkan email, OTP, dan password baru Anda</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">


                    <div>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-400 bg-gray-50"
                            placeholder="Password baru"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-400 bg-gray-50"
                            placeholder="Konfirmasi password baru"
                            value={passwordConfirmation}
                            onChange={e => setPasswordConfirmation(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                    {success && <div className="text-green-600 text-sm text-center">{success}</div>}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Memproses...' : 'Reset Password'}
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <a href="/mealikmu/login" className="text-blue-600 hover:underline text-sm">Kembali ke login</a>
                </div>
            </div>
        </div>
    );
}
