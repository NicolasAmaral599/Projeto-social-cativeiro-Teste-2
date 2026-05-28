import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { FamilyList } from './pages/FamilyList';
import { FamilyRegistration } from './pages/FamilyRegistration';
import { FamilyDetail } from './pages/FamilyDetail';
import { Volunteers } from './pages/Volunteers';
import { Settings } from './pages/Settings';
import { auth, logoutUser } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('cativeiro_auth') === 'true';
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        localStorage.setItem('cativeiro_auth', 'true');
        localStorage.setItem('cativeiro_user_name', user.displayName || 'Sara Freitas');
        localStorage.setItem('cativeiro_user_email', user.email || 'admin@projeto.org');
        localStorage.setItem('cativeiro_user_avatar', user.photoURL || '');
      } else {
        // If not using standard credential override
        if (localStorage.getItem('cativeiro_mock_login') !== 'true') {
          setIsAuthenticated(false);
          localStorage.removeItem('cativeiro_auth');
          localStorage.removeItem('cativeiro_user_name');
          localStorage.removeItem('cativeiro_user_email');
          localStorage.removeItem('cativeiro_user_avatar');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (userData?: any) => {
    setIsAuthenticated(true);
    localStorage.setItem('cativeiro_auth', 'true');
    if (userData) {
      localStorage.setItem('cativeiro_user_name', userData.name);
      localStorage.setItem('cativeiro_user_email', userData.email);
      localStorage.setItem('cativeiro_user_avatar', userData.avatarUrl);
      localStorage.removeItem('cativeiro_mock_login');
    } else {
      localStorage.setItem('cativeiro_mock_login', 'true');
      localStorage.setItem('cativeiro_user_name', 'Sara Freitas');
      localStorage.setItem('cativeiro_user_email', 'admin@projeto.org');
      localStorage.setItem('cativeiro_user_avatar', '');
    }
  };

  const handleLogout = async () => {
    try {
      if (localStorage.getItem('cativeiro_mock_login') !== 'true') {
        await logoutUser();
      }
    } catch (e) {
      console.error('Logout error:', e);
    }
    setIsAuthenticated(false);
    localStorage.removeItem('cativeiro_auth');
    localStorage.removeItem('cativeiro_mock_login');
    localStorage.removeItem('cativeiro_user_name');
    localStorage.removeItem('cativeiro_user_email');
    localStorage.removeItem('cativeiro_user_avatar');
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500 mt-4">Iniciando sistema...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <AppLayout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/families" element={<FamilyList />} />
          <Route path="/families/new" element={<FamilyRegistration />} />
          <Route path="/families/:id" element={<FamilyDetail />} />
          <Route path="/families/edit/:id" element={<FamilyRegistration />} />
          <Route path="/volunteers" element={<Volunteers />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
