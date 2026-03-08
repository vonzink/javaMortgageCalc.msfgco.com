import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import AuthGuard from '@/components/ui/AuthGuard';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import HubPage from '@/pages/HubPage';
import CalculatorPage from '@/pages/CalculatorPage';
import WorkspacePage from '@/pages/WorkspacePage';
import ReportPage from '@/pages/ReportPage';
import ProcessingPage from '@/pages/ProcessingPage';
import SettingsPage from '@/pages/SettingsPage';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route element={<AuthGuard><Layout /></AuthGuard>}>
        <Route path="/" element={<HubPage />} />
        <Route path="/calculators/:slug" element={<CalculatorPage />} />
        <Route path="/calculators/income/:slug" element={<CalculatorPage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/processing" element={<Navigate to="/processing/title" replace />} />
        <Route path="/processing/:type" element={<ProcessingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
