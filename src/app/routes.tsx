import React, { lazy, Suspense } from 'react';
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
const AdminLayout = lazy(() => import('./components/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const SuperAdminLayout = lazy(() => import('./components/SuperAdminLayout').then((m) => ({ default: m.SuperAdminLayout })));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const ManageNeeds = lazy(() => import('./pages/admin/ManageNeeds').then((m) => ({ default: m.ManageNeeds })));
const ManageEvents = lazy(() => import('./pages/admin/ManageEvents').then((m) => ({ default: m.ManageEvents })));
const CreateEvent = lazy(() => import('./pages/admin/CreateEvent').then((m) => ({ default: m.CreateEvent })));
const EventBookings = lazy(() => import('./pages/admin/EventBookings').then((m) => ({ default: m.EventBookings })));
const FeedManagement = lazy(() => import('./pages/admin/FeedManagement').then((m) => ({ default: m.FeedManagement })));
const AdminSettings = lazy(() => import('./pages/admin/Settings').then((m) => ({ default: m.Settings })));
const ManageGallery = lazy(() => import('./pages/admin/ManageGallery').then((m) => ({ default: m.ManageGallery })));
const ManageSchemes = lazy(() => import('./pages/admin/ManageSchemes').then((m) => ({ default: m.ManageSchemes })));
const ManageChildren = lazy(() => import('./pages/admin/ManageChildren').then((m) => ({ default: m.ManageChildren })));
const ManageTeam = lazy(() => import('./pages/admin/ManageTeam').then((m) => ({ default: m.ManageTeam })));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers').then((m) => ({ default: m.ManageUsers })));
const ManageBookings = lazy(() => import('./pages/admin/ManageBookings').then((m) => ({ default: m.ManageBookings })));

// Super Admin Pages
const SuperAdminDashboard = lazy(() => import('./pages/super-admin/SuperAdminDashboard').then((m) => ({ default: m.SuperAdminDashboard })));

import { ErrorBoundary, RouteErrorFallback } from './components/ErrorBoundary';

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

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading, isAdmin } = useUser();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading, isSuperAdmin } = useUser();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isSuperAdmin) return <Navigate to="/" replace />;
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

      // Admin routes wrapped in AdminLayout
      {
        path: 'admin',
        element: <AdminRoute><SuspenseWrap><AdminLayout /></SuspenseWrap></AdminRoute>,
        children: [
          { index: true, element: <SuspenseWrap><AdminDashboard /></SuspenseWrap> },
          { path: 'needs', element: <SuspenseWrap><ManageNeeds /></SuspenseWrap> },
          { path: 'events', element: <SuspenseWrap><ManageEvents /></SuspenseWrap> },
          { path: 'events/bookings/:id', element: <SuspenseWrap><EventBookings /></SuspenseWrap> },
          { path: 'events/create', element: <SuspenseWrap><CreateEvent /></SuspenseWrap> },
          { path: 'feed', element: <SuspenseWrap><FeedManagement /></SuspenseWrap> },
          { path: 'settings', element: <SuspenseWrap><AdminSettings /></SuspenseWrap> },
          { path: 'gallery', element: <SuspenseWrap><ManageGallery /></SuspenseWrap> },
          { path: 'schemes', element: <SuspenseWrap><ManageSchemes /></SuspenseWrap> },
          { path: 'children', element: <SuspenseWrap><ManageChildren /></SuspenseWrap> },
          { path: 'team', element: <SuspenseWrap><ManageTeam /></SuspenseWrap> },
          { path: 'users', element: <SuspenseWrap><ManageUsers /></SuspenseWrap> },
          { path: 'bookings', element: <SuspenseWrap><ManageBookings /></SuspenseWrap> },
        ],
      },

      // Super Admin routes wrapped in SuperAdminLayout
      {
        path: 'super-admin',
        element: <SuperAdminRoute><SuspenseWrap><SuperAdminLayout /></SuspenseWrap></SuperAdminRoute>,
        children: [
          { index: true, element: <SuspenseWrap><SuperAdminDashboard /></SuspenseWrap> },
          { path: 'media', element: <SuspenseWrap><SuperAdminDashboard /></SuspenseWrap> },
          { path: 'hero', element: <SuspenseWrap><SuperAdminDashboard /></SuspenseWrap> },
          { path: 'users', element: <SuspenseWrap><SuperAdminDashboard /></SuspenseWrap> },
          { path: 'ads', element: <SuspenseWrap><SuperAdminDashboard /></SuspenseWrap> },
          { path: 'logs', element: <SuspenseWrap><SuperAdminDashboard /></SuspenseWrap> },
          { path: 'configs', element: <SuspenseWrap><SuperAdminDashboard /></SuspenseWrap> },
          { path: 'backup', element: <SuspenseWrap><SuperAdminDashboard /></SuspenseWrap> },
        ],
      },

      { path: '*', element: <SuspenseWrap><NotFound /></SuspenseWrap> },
    ],
  },
  {
    path: '/login',
    element: <RootLayout><Layout /></RootLayout>,
    children: [{ index: true, element: <SuspenseWrap><Login /></SuspenseWrap> }],
  },
  {
    path: '/onboarding',
    element: <RootLayout><Layout /></RootLayout>,
    children: [{ index: true, element: <SuspenseWrap><Onboarding /></SuspenseWrap> }],
  },
  {
    path: '/signup',
    element: <RootLayout><Layout /></RootLayout>,
    children: [{ index: true, element: <SuspenseWrap><Signup /></SuspenseWrap> }],
  }
]);