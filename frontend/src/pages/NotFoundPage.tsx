import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
    <p className="text-7xl font-display font-bold gradient-text">404</p>
    <p className="mt-2 text-slate-300">This polling booth doesn't exist.</p>
    <Link to="/" className="btn-primary mt-6">
      <Home size={16} /> Back to home
    </Link>
  </div>
);
