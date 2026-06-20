import { Home, Heart, Calendar, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router';
import { cn } from '../lib/utils';

const PROFILE_SECTION_PREFIXES = [
  '/profile',
  '/settings',
  '/donation-history',
  '/my-bookings',
  '/help',
] as const;

function pathMatchesItem(pathname: string, itemPath: string): boolean {
  if (itemPath === '/') {
    return pathname === '/' || pathname === '';
  }
  if (itemPath === '/profile') {
    return PROFILE_SECTION_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    );
  }
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

export function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Heart, label: 'Needs', path: '/needs' },
    { icon: Calendar, label: 'Events', path: '/events' },
    { icon: User, label: 'Profile', path: '/profile' },
  ] as const;

  const activeIndex = Math.max(
    0,
    navItems.findIndex((item) => pathMatchesItem(pathname, item.path)),
  );

  const indicatorLeftPercent = ((activeIndex + 0.5) / 4) * 100;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-auto w-full max-w-[480px] px-3 pb-2">
        <div className="relative h-16 overflow-visible rounded-[18px] bg-black text-white shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[18px]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />
          </div>

          {/* Single floating pill behind active tab — aligned to grid column center */}
          <div
            className="pointer-events-none absolute left-0 top-0 z-0 h-full w-full"
            aria-hidden
          >
            <div
              className="absolute -top-3 h-[52px] w-[52px] -translate-x-1/2 rounded-full border-[5px] border-black bg-white shadow-md transition-[left] duration-300 ease-out"
              style={{ left: `${indicatorLeftPercent}%` }}
            />
          </div>

          <div className="relative z-10 grid h-16 grid-cols-4">
            {navItems.map((item) => {
              const isActive = pathMatchesItem(pathname, item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className="flex flex-col items-center justify-center text-xs font-medium transition-colors"
                >
                  <div
                    className={cn(
                      'mb-0.5 flex items-center justify-center transition-all duration-300',
                      isActive
                        ? 'relative z-10 -mt-5 h-10 w-10 rounded-full bg-transparent'
                        : 'h-7 w-7',
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-5 w-5',
                        isActive ? 'text-black' : 'text-white/80',
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-[10px] transition-opacity duration-200',
                      isActive ? 'opacity-0' : 'opacity-100 text-white/70',
                    )}
                  >
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
