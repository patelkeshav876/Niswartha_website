import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, EyeOff, UserRound } from 'lucide-react';

import { useUser } from '../context/UserContext';
import { api } from '../lib/api';

export function Signup() {
  const navigate = useNavigate();
  const { login } = useUser();
  const [remember, setRemember] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const resp = await api.register({ name, email, password, role: 'donor' });
      login(resp.user, resp.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 py-10">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80"
          alt="Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/50" />
      </div>

      <div className="relative w-full max-w-sm rounded-[32px] border border-white/35 bg-white/12 p-6 shadow-[0_35px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl text-white">
        <h1 className="text-4xl font-serif font-bold mb-1">Signup</h1>
        <p className="text-white/80 text-sm mb-6">Create your account and start helping</p>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-xs text-center border-solid">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="relative">
            <UserRound className="absolute left-3 top-3.5 h-4 w-4 text-white/70" />
            <Input
              type="text"
              placeholder="Full name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 h-12 bg-black/20 border-white/35 text-white placeholder:text-white/60"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-4 w-4 text-white/70" />
            <Input
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 bg-black/20 border-white/35 text-white placeholder:text-white/60"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-white/70" />
            <EyeOff className="absolute right-3 top-3.5 h-4 w-4 text-white/70" />
            <Input
              type="password"
              placeholder="Create password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12 bg-black/20 border-white/35 text-white placeholder:text-white/60"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-white/85">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-white/40 bg-black/20 accent-lime-400"
            />
            Keep me logged in
          </label>

          <Button
            type="submit"
            disabled={loading}
            className="w-full text-lg h-12 border-0 bg-gradient-to-r from-lime-400 to-emerald-500 text-zinc-950 hover:from-lime-300 hover:to-emerald-400 shadow-lg"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-5 text-center text-sm text-white/80">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-white hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
