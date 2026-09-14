import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
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
import './styles.css';

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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard {...pageProps} />} />
          <Route path="/adverse-events" element={<AdverseEvents {...pageProps} />} />
          <Route path="/patients" element={<PatientDetail {...pageProps} />} />
          <Route path="/patients/:id" element={<PatientDetail {...pageProps} />} />
          <Route path="/demo-patient" element={<PatientDetail {...pageProps} />} />
          <Route path="/demo-data" element={<PatientDetail {...pageProps} />} />
          <Route path="/demo-analysis" element={<DemoAnalysis {...pageProps} />} />
          <Route path="/signal-analysis" element={<SignalAnalysis {...pageProps} />} />
          <Route path="/ctd-documents" element={<CTDDocuments {...pageProps} />} />
          <Route path="/gap-detection" element={<GapDetection {...pageProps} />} />
          <Route path="/reports" element={<Reports {...pageProps} />} />
          <Route path="/settings" element={<Settings {...pageProps} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
        {/* Redirect any legacy auth routes directly to dashboard */}
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/register" element={<Navigate to="/dashboard" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/dashboard" replace />} />
        <Route path="/reset-password" element={<Navigate to="/dashboard" replace />} />

        {/* Application Workspace — no authentication required */}
        <Route path="/*" element={<WorkspaceShell />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
