import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/home';
import Sidebar from './components/sidebar';
import Login from './pages/login';
import CompteRendu from './pages/compteRendu';
import CompteRenduDetail from './pages/compteRenduDetail';
import SignupProvider from './pages/signup_provider';
import AboutPage from './pages/aboutPage';
import ModernContact from './pages/modernContactPage';
import ContactPage from './pages/contactPage';
import RegisterForgetPassword from './pages/register_forget_password';
import ResetPassword from './pages/reset_password';
import Profile from './pages/profile';
import ClientInterface from './pages/client_interface';

function getAuthSession() {
  try {
    return JSON.parse(localStorage.getItem('authSession') ?? 'null');
  } catch {
    localStorage.removeItem('authSession');
    return null;
  }
}

function RequireAuth({ children }) {
  const session = getAuthSession();

  if (!session?.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function CompteRenduRoute() {
  const session = getAuthSession();

  if (!session?.token) {
    return <Navigate to="/login" replace />;
  }

  return session.role === 'customer' ? <ClientInterface /> : <CompteRendu />;
}

import Missions from './pages/missions';
import Clients from './pages/clients';
import Taches from './pages/taches';
import NotesFrais from './pages/notesFrais';
import Reporting from './pages/reporting';

export default function App(){
return (
<Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
<Routes>
<Route path="/" element={<Home />} />
<Route path="/login" element={<Login />} />
<Route path="/sidebar" element={<Sidebar />} />
<Route path="/login_provider" element={<Navigate to="/login" replace />} />
<Route path="/signup_provider" element={<SignupProvider />} />
<Route path="/about" element={<AboutPage />} />
<Route path="/about-page" element={<Navigate to="/about" replace />} />
<Route path="/contact" element={<ContactPage />} />
<Route path="/moderncontact" element={<ModernContact />} />
<Route path="/moderation-contact" element={<ModernContact />} />
<Route path="/register_forget_password" element={<RegisterForgetPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />
<Route path="/compte-rendu" element={<CompteRenduRoute />} />
<Route path="/compte-rendu/:id" element={<RequireAuth><CompteRenduDetail /></RequireAuth>} />
<Route path="/missions" element={<RequireAuth><Missions /></RequireAuth>} />
<Route path="/clients" element={<RequireAuth><Clients /></RequireAuth>} />
<Route path="/dashboard" element={<Navigate to="/compte-rendu" replace />} />
<Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
<Route path="/client_interface" element={<Navigate to="/compte-rendu" replace />} />
</Routes>
</Router>
);
}
