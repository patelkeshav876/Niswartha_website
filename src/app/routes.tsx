import React, { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './layout';
import { UserProvider, useUser } from './context/UserContext';
import { PageSkeleton } from './components/PageSkeleton';

// Code-split dynamic page imports for optimal bundle performance
const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const Events = lazy(() => import('./pages/Events').then((m) => ({ default: m.Events })));
const Needs = lazy(() => import('./pages/Needs').then((m) => ({ default: m.Needs })));
const GalleryPage = lazy(() => import('./pages/GalleryPage').then((m) => ({ default: m.GalleryPage })));
const SchemesPage = lazy(() => import('./pages/SchemesPage').then((m) => ({ default: m.SchemesPage })));
const AshramDetail = lazy(() => import('./pages/AshramDetail').then((m) => ({ default: m.AshramDetail })));
const Help = lazy(() => import('./pages/Help').then((m) => ({ default: m.Help })));
const Donation = lazy(() => import('./pages/Donation').then((m) => ({ default: m.Donation })));
const DonationFlow = lazy(() => import('./pages/DonationFlow').then((m) => ({ default: m.DonationFlow })));
const EventBooking = lazy(() => import('./pages/EventBooking').then((m) => ({ default: m.EventBooking })));
const VisitBooking = lazy(() => import('./pages/VisitBooking').then((m) => ({ default: m.VisitBooking })));
const SuggestEvent = lazy(() => import('./pages/SuggestEvent').then((m) => ({ default: m.SuggestEvent })));
const Profile = lazy(() => import('./pages/Profile').then((m) => ({ default: m.Profile })));
const MyBookings = lazy(() => import('./pages/MyBookings').then((m) => ({ default: m.MyBookings })));
const DonationHistory = lazy(() => import('./pages/DonationHistory').then((m) => ({ default: m.DonationHistory })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/Signup').then((m) => ({ default: m.Signup })));
const Onboarding = lazy(() => import('./pages/Onboarding').then((m) => ({ default: m.Onboarding })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

// Layouts
const UserLayout = lazy(() => import('./components/UserLayout').then((m) => ({ default: m.UserLayout })));

import { ErrorBoundary, RouteErrorFallback } from './components/ErrorBoundary';

// External Admin Portal Redirect Component
function ExternalAdminRedirect({ path = '' }: { path?: string }) {
  useEffect(() => {
    const targetUrl = `https://deafanddumbschool.vercel.app${path || '/admin'}`;
    window.location.href = targetUrl;
  }, [path]);

  return (
    <div className="flex h-96 flex-col items-center justify-center gap-3 text-[#0F6D4E]">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#0F6D4E] border-t-transparent" />
      <p className="text-sm font-bold font-serif">Opening Niswartha Admin Portal...</p>
    </div>
  );
}

// Helper wrapper for Lazy components in routes with ErrorBoundary
function SuspenseWrap({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

// Wrapper component to provide UserContext to all routes
function RootLayout({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useUser();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    element: (
      <ErrorBoundary>
        <RootLayout>
          <Layout />
        </RootLayout>
      </ErrorBoundary>
    ),
    errorElement: <RouteErrorFallback />,
    children: [
      // Public pages
      { index: true, path: '/', element: <SuspenseWrap><Home /></SuspenseWrap> },
      { path: 'about', element: <SuspenseWrap><About /></SuspenseWrap> },
      { path: 'help', element: <SuspenseWrap><Help /></SuspenseWrap> },
      { path: 'events', element: <SuspenseWrap><Events /></SuspenseWrap> },
      { path: 'needs', element: <SuspenseWrap><Needs /></SuspenseWrap> },
      { path: 'gallery', element: <SuspenseWrap><GalleryPage /></SuspenseWrap> },
      { path: 'schemes', element: <SuspenseWrap><SchemesPage /></SuspenseWrap> },
      { path: 'ashram/:id', element: <SuspenseWrap><AshramDetail /></SuspenseWrap> },

      // Protected pages
      { path: 'events/suggest', element: <ProtectedRoute><SuspenseWrap><SuggestEvent /></SuspenseWrap></ProtectedRoute> },
      { path: 'events/book/:id', element: <ProtectedRoute><SuspenseWrap><EventBooking /></SuspenseWrap></ProtectedRoute> },
      { path: 'visit-book/:ashramId', element: <ProtectedRoute><SuspenseWrap><VisitBooking /></SuspenseWrap></ProtectedRoute> },
      { path: 'donate/:id', element: <ProtectedRoute><SuspenseWrap><Donation /></SuspenseWrap></ProtectedRoute> },
      { path: 'donate-flow/:ashramId/:needId', element: <ProtectedRoute><SuspenseWrap><DonationFlow /></SuspenseWrap></ProtectedRoute> },

      // User dashboard routes wrapped in UserLayout
      {
        element: <ProtectedRoute><SuspenseWrap><UserLayout /></SuspenseWrap></ProtectedRoute>,
        children: [
          { path: 'profile', element: <SuspenseWrap><Profile /></SuspenseWrap> },
          { path: 'my-bookings', element: <SuspenseWrap><MyBookings /></SuspenseWrap> },
          { path: 'donation-history', element: <SuspenseWrap><DonationHistory /></SuspenseWrap> },
          { path: 'settings', element: <SuspenseWrap><Settings /></SuspenseWrap> },
          { path: 'notifications', element: <SuspenseWrap><NotificationsPage /></SuspenseWrap> },
        ],
      },

      // Admin & SuperAdmin routes seamlessly redirected to dedicated Admin Portal
      { path: 'admin/*', element: <ExternalAdminRedirect path="/admin" /> },
      { path: 'super-admin/*', element: <ExternalAdminRedirect path="/super-admin" /> },

      { path: '*', element: <SuspenseWrap><NotFound /></SuspenseWrap> },
    ],
  },
  {
    path: '/login',
    element: <RootLayout><Layout /></RootLayout>,
    children: [{ index: true, element: <SuspenseWrap><Login /></SuspenseWrap> }],
  },
  {
    path: '/signup',
    element: <RootLayout><Layout /></RootLayout>,
    children: [{ index: true, element: <SuspenseWrap><Signup /></SuspenseWrap> }],
  },
  {
    path: '/onboarding',
    element: <RootLayout><Layout /></RootLayout>,
    children: [{ index: true, element: <SuspenseWrap><Onboarding /></SuspenseWrap> }],
  },
]);