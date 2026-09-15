import { Link } from 'react-router-dom';
import { Home, HardHat } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold mb-8">
        <HardHat className="w-12 h-12 text-black" />
      </div>
      <h1 className="text-6xl sm:text-8xl font-black text-gradient-gold mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white mb-3">PAGE NOT FOUND</h2>
      <p className="text-slate-400 text-sm mb-8 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="px-8 py-4 bg-gradient-gold text-black font-bold rounded-xl hover:shadow-gold-lg transition-all flex items-center gap-2">
        <Home className="w-5 h-5" /> GO HOME
      </Link>
    </div>
  );
}
