import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AdverseEvents from './pages/AdverseEvents';
import SignalAnalysis from './pages/SignalAnalysis';
import CTDDocuments from './pages/CTDDocuments';
import GapDetection from './pages/GapDetection';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import PatientDetail from './pages/PatientDetail';
import DemoAnalysis from './pages/DemoAnalysis';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import './styles.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#07101f',
        color: 'var(--text-secondary)',
        fontSize: 14,
      }}>
        Loading PharmaGuard AI…
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicAuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function WorkspaceShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageProps = { onMobileMenuOpen: () => setMobileOpen(true) };

  return (
    <div className="app-layout">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <main className="app-main">
        <Routes>
          <Route path="/"                element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"       element={<Dashboard        {...pageProps} />} />
          <Route path="/adverse-events"  element={<AdverseEvents    {...pageProps} />} />
          <Route path="/patients"        element={<PatientDetail    {...pageProps} />} />
          <Route path="/patients/:id"    element={<PatientDetail    {...pageProps} />} />
          <Route path="/demo-patient"    element={<PatientDetail    {...pageProps} />} />
          <Route path="/demo-data"       element={<PatientDetail    {...pageProps} />} />
          <Route path="/demo-analysis"   element={<DemoAnalysis     {...pageProps} />} />
          <Route path="/signal-analysis" element={<SignalAnalysis   {...pageProps} />} />
          <Route path="/ctd-documents"   element={<CTDDocuments     {...pageProps} />} />
          <Route path="/gap-detection"   element={<GapDetection     {...pageProps} />} />
          <Route path="/reports"         element={<Reports          {...pageProps} />} />
          <Route path="/settings"        element={<Settings         {...pageProps} />} />
          <Route path="*"                element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function AppContent() {
  const { state } = useAppContext();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Pages */}
        <Route path="/login" element={<PublicAuthRoute><Login /></PublicAuthRoute>} />
        <Route path="/register" element={<PublicAuthRoute><Register /></PublicAuthRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Workspace Pages */}
        <Route path="/*" element={
          <ProtectedRoute>
            <WorkspaceShell />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AppProvider>
  );
}
