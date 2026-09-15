import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HardHat, Lock, Mail, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function AdminLoginPage() {
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Please enter email and password.', 'error');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      showToast(error, 'error');
    } else {
      showToast('Login successful!', 'success');
      navigate('/admin/dashboard');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-charcoal">
      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-gold text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to website
        </Link>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-gold items-center justify-center shadow-gold-lg mb-4">
            <HardHat className="w-9 h-9 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-gradient-gold">Admin Login</h1>
          <p className="text-slate-400 text-sm mt-2">Sri Ramligeshwara Building Materials</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-gradient-dark border border-gold/20 p-6 sm:p-8 shadow-dark-lg">
          <div className="space-y-5">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sriramligeshwara.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-gold"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3.5 bg-gradient-gold text-black font-bold rounded-xl hover:shadow-gold-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> LOGGING IN...</>
              ) : (
                'LOGIN'
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-slate-500 text-xs mt-6">
          Authorized personnel only. All actions are logged.
        </p>
      </div>
    </div>
  );
}
