'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import clsx from 'clsx';
import { Pill, Mail, Lock, User, KeyRound } from 'lucide-react';

type AuthMode = 'LOGIN' | 'REGISTER' | 'OTP_REQUEST' | 'OTP_VERIFY';

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      let endpoint = '';
      let payload = {};

      switch (authMode) {
        case 'LOGIN':
          endpoint = '/auth/login';
          payload = { email: formData.email, password: formData.password };
          break;
        case 'REGISTER':
          endpoint = '/auth/register';
          payload = { name: formData.name, email: formData.email, password: formData.password };
          break;
        case 'OTP_REQUEST':
          endpoint = '/auth/otp/request';
          payload = { email: formData.email };
          break;
        case 'OTP_VERIFY':
          endpoint = '/auth/otp/verify';
          payload = { email: formData.email, otp: formData.otp };
          break;
      }

      const { data } = await api.post(endpoint, payload);

      if (data.success) {
        if (authMode === 'OTP_REQUEST') {
          setMessage('OTP sent to your email.');
          setAuthMode('OTP_VERIFY');
        } else {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      if (err.response?.data?.data && Array.isArray(err.response.data.data)) {
        const validationErrors = err.response.data.data.map((e: any) => e.message).join(', ');
        setError(validationErrors);
      } else {
        setError(err.response?.data?.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setError('');
    setMessage('');
    if (authMode === 'LOGIN') {
      setAuthMode('REGISTER');
    } else if (authMode === 'REGISTER') {
      setAuthMode('LOGIN');
    } else {
      // From OTP modes or any other state, go back to Login
      setAuthMode('LOGIN');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="bg-white/80 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center mb-6 text-sky-600">
          <Pill size={48} />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2 text-slate-800">
          {authMode === 'LOGIN' && 'Welcome Back'}
          {authMode === 'REGISTER' && 'Create Account'}
          {authMode === 'OTP_REQUEST' && 'Login with OTP'}
          {authMode === 'OTP_VERIFY' && 'Verify OTP'}
        </h1>
        <p className="text-slate-500 text-center mb-6">
          {authMode === 'LOGIN' && 'Login to manage your pharmacy'}
          {authMode === 'REGISTER' && 'Start tracking your inventory today'}
          {authMode === 'OTP_REQUEST' && 'Enter your email to receive a code'}
          {authMode === 'OTP_VERIFY' && 'Enter the code sent to your email'}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 text-green-600 border border-green-100 p-3 rounded-lg mb-4 text-sm text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'REGISTER' && (
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Pharmacy Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  required
                  className="input-field pl-10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
          )}

          {(authMode === 'LOGIN' || authMode === 'REGISTER' || authMode === 'OTP_REQUEST' || authMode === 'OTP_VERIFY') && (
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  required
                  className="input-field pl-10"
                  value={formData.email}
                  disabled={authMode === 'OTP_VERIFY'} // Lock email during verify
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          )}

          {(authMode === 'LOGIN' || authMode === 'REGISTER') && (
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  required
                  className="input-field pl-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
          )}

          {authMode === 'OTP_VERIFY' && (
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">OTP Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  className="input-field pl-10 tracking-widest text-center text-lg"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
            {loading ? 'Processing...' : (
              <>
                {authMode === 'LOGIN' && 'Sign In'}
                {authMode === 'REGISTER' && 'Create Account'}
                {authMode === 'OTP_REQUEST' && 'Send Code'}
                {authMode === 'OTP_VERIFY' && 'Verify & Login'}
              </>
            )}
          </button>
        </form>

        {(authMode === 'LOGIN' || authMode === 'OTP_REQUEST') && (
          <div className="mt-4 text-center">
            {authMode === 'LOGIN' ? (
              <button type="button" onClick={() => setAuthMode('OTP_REQUEST')} className="text-sm text-sky-600 hover:text-sky-700">
                Login with OTP instead
              </button>
            ) : (
              <button type="button" onClick={() => setAuthMode('LOGIN')} className="text-sm text-sky-600 hover:text-sky-700">
                Login with Password
              </button>
            )}
          </div>
        )}

        {(authMode === 'LOGIN' || authMode === 'REGISTER') && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-50 px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
              className="w-full flex items-center justify-center gap-2 border border-slate-200 bg-white p-2 rounded-lg hover:bg-slate-50 transition-colors mb-6 text-slate-700"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
          </>
        )}

        <div className="mt-6 text-center text-sm">
          <button
            onClick={toggleMode}
            className="text-sky-600 hover:text-sky-700 font-medium"
          >
            {authMode === 'REGISTER'
              ? "Already have an account? Sign in"
              : (authMode === 'LOGIN' ? "Don't have an account? Sign up" : "Back to Login")}
          </button>
        </div>
      </div>
    </div>
  );
}
