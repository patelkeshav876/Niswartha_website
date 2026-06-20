import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Link, useNavigate } from 'react-router';
import { cn } from '../lib/utils';
import { Mail, Lock, EyeOff, UserRound, Heart } from 'lucide-react';

import { useUser } from '../context/UserContext';
import { api } from '../lib/api';

export function Login() {
  const [role, setRole] = useState<'donor' | 'admin'>('donor');
  const [remember, setRemember] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const resp = await api.login({ email, password });
      login(resp.user, resp.token);
      if (resp.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex">
      {/* Left Panel — Hero Image (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80"
          alt="Background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-primary/30" />
        <div className="relative z-10 p-12 text-white max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
              <Heart className="h-6 w-6 text-white" fill="white" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight font-serif">Niswartha</p>
              <p className="-mt-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white/60">Selfless Service</p>
            </div>
          </div>
          <h2 className="text-4xl font-serif font-bold leading-tight mb-4">
            Empowering Every Child With Hope
          </h2>
          <p className="text-white/70 leading-relaxed">
            Join our community of donors and volunteers making a real difference in children's lives through education and care.
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
              <Heart className="h-5 w-5 text-white" fill="white" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight font-serif">Niswartha</p>
              <p className="-mt-1 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">Selfless Service</p>
            </div>
          </div>

          <h1 className="text-3xl font-serif font-bold mb-1 lg:text-4xl">Welcome Back</h1>
          <p className="text-muted-foreground mb-8">Sign in to your account to continue</p>

          <div className="flex space-x-2 mb-6 bg-muted/50 p-1 rounded-xl">
            <button
              onClick={() => setRole('donor')}
              className={cn(
                'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                role === 'donor' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
              type="button"
            >
              Donor
            </button>
            <button
              onClick={() => setRole('admin')}
              className={cn(
                'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                role === 'admin' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
              type="button"
            >
              Admin
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 bg-muted/30 border-border/50 rounded-xl"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <EyeOff className="absolute right-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 bg-muted/30 border-border/50 rounded-xl"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              Remember me
            </label>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-base font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary hover:underline inline-flex items-center gap-1">
              Create Account <UserRound className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}