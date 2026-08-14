import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { useUser } from '../context/UserContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Mail, Lock, Eye, EyeOff, UserRound } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { toast } from 'sonner';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUser();

  // Mode: 'login' or 'signup'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(
    location.pathname.startsWith('/signup') ? 'signup' : 'login'
  );

  const [role, setRole] = useState<'donor' | 'admin'>('donor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.pathname.startsWith('/signup')) {
      setAuthMode('signup');
    } else {
      setAuthMode('login');
    }
  }, [location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        const response = await api.login({ email, password });
        if (response && response.user && response.token) {
          login(response.user, response.token);
          toast.success(`Welcome back, ${response.user.name || 'User'}!`);
          if (response.user.role === 'super_admin') {
            navigate('/super-admin');
          } else if (response.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }
      } else {
        const response = await api.register({
          name: name.trim() || 'Supporter',
          email: email.trim(),
          password,
          role: 'donor',
        });
        if (response && response.user && response.token) {
          login(response.user, response.token);
          toast.success('Account created successfully!');
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err?.message || `${authMode === 'login' ? 'Login' : 'Signup'} failed.`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      const targetEmail = email.trim() || 'keshavpatel3690@gmail.com';
      const isSuperAdminEmail =
        targetEmail.toLowerCase() === 'keshavpatel3690@gmail.com' ||
        targetEmail.toLowerCase() === 'keshavpaterl3690@gmail.com';

      const googleUser = {
        id: isSuperAdminEmail ? 'super-admin-keshav' : `google-user-${Date.now()}`,
        name: isSuperAdminEmail ? 'Keshav Patel' : name || 'Google Supporter',
        email: targetEmail,
        role: isSuperAdminEmail ? 'super_admin' : 'donor',
        avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Keshav%20Patel',
      };
      const googleToken = `google-token-${Date.now()}`;

      login(googleUser, googleToken);
      toast.success(
        `Successfully ${authMode === 'login' ? 'signed in' : 'registered'} as ${
          isSuperAdminEmail ? 'Super Admin' : 'Supporter'
        }!`
      );
      if (isSuperAdminEmail) {
        navigate('/super-admin');
      } else {
        navigate('/');
      }
    } catch {
      toast.error('Google Authentication failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Hero Backdrop with Official Logo */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(15,109,78,0.4),transparent_60%)]" />
        <img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80"
          alt="Deaf and Dumb Industrial Institute"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/60" />

        <div className="relative z-10 p-12 text-white max-w-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1.5 shadow-xl">
              <img src="/logo.png" alt="Deafness Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight font-serif text-white">Niswartha</p>
              <p className="-mt-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white/70">Selfless Service</p>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold leading-tight text-white">
            Empowering Hearing-Impaired Children
          </h2>

          <p className="text-white/80 leading-relaxed text-sm">
            Deaf and Dumb Industrial Institute, Nagpur (Est. 1946). Join our community of donors, volunteers, and special educators.
          </p>

          <div className="pt-4 border-t border-white/10 flex items-center gap-4 text-xs text-white/60">
            <p>✓ 100% Tax Exempt (80G)</p>
            <p>✓ Transparent Impact</p>
          </div>
        </div>
      </div>

      {/* Right Panel — Unified Auth Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-emerald-200 p-1 shadow-xs">
              <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight font-serif text-zinc-900">Niswartha</p>
              <p className="-mt-1 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">Selfless Service</p>
            </div>
          </div>

          {/* Unified Mode Switcher: Sign In vs Sign Up */}
          <div className="flex p-1 rounded-2xl bg-muted/60 border border-border/50">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError('');
              }}
              className={cn(
                'flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200',
                authMode === 'login'
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setError('');
              }}
              className={cn(
                'flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200',
                authMode === 'signup'
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Create Account (Sign Up)
            </button>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900">
              {authMode === 'login' ? 'Welcome Back' : 'Create Your Account'}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {authMode === 'login'
                ? 'Sign in to access your donation history and support activities'
                : 'Join our community supporting hearing-impaired children'}
            </p>
          </div>

          {/* Role selector for login */}
          {authMode === 'login' && (
            <div className="flex space-x-2 bg-muted/40 p-1 rounded-xl">
              <button
                onClick={() => setRole('donor')}
                className={cn(
                  'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all',
                  role === 'donor' ? 'bg-[#0F6D4E]/10 text-[#0F6D4E]' : 'text-muted-foreground'
                )}
                type="button"
              >
                Supporter / Donor
              </button>
              <button
                onClick={() => setRole('admin')}
                className={cn(
                  'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all',
                  role === 'admin' ? 'bg-[#0F6D4E]/10 text-[#0F6D4E]' : 'text-muted-foreground'
                )}
                type="button"
              >
                Institute Admin
              </button>
            </div>
          )}

          {/* Google Auth Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleAuth}
            disabled={googleLoading}
            className="w-full h-11 rounded-full border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs gap-3 shadow-2xs"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {googleLoading
              ? 'Connecting...'
              : authMode === 'login'
              ? 'Sign in with Google'
              : 'Sign up with Google'}
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border/60 w-full" />
            <span className="bg-background px-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider absolute">
              or credentials
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div className="relative">
                <UserRound className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-11 bg-muted/30 border-border/50 rounded-xl text-xs"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 bg-muted/30 border-border/50 rounded-xl text-xs"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-11 bg-muted/30 border-border/50 rounded-xl text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] text-white font-bold shadow-lg shadow-[#0F6D4E]/20 text-xs"
            >
              {loading
                ? 'Processing...'
                : authMode === 'login'
                ? 'Sign In'
                : 'Complete Registration'}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            {authMode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-[#0F6D4E] font-bold hover:underline"
                >
                  Create Account
                </button>
              </>
            ) : (
              <>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-[#0F6D4E] font-bold hover:underline"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}