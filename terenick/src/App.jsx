import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/home';
import Sidebar from './components/sidebar';
import Login from './pages/login';
import CompteRendu from './pages/compteRendu';
import LoginProvider from './pages/login_provider';
import SignupProvider from './pages/signup_provider';
import AboutPage from './pages/aboutPage';
import ModernContact from './pages/modernContactPage';
import ContactPage from './pages/contactPage';
import RegisterForgetPassword from './pages/register_forget_password';
import Dashboard from './pages/dashboard';
import Profile from './pages/profile';

function RequireAuth({ children }) {
  const session = JSON.parse(localStorage.getItem('authSession') ?? 'null');

  if (!session?.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App(){
return (
<Router>
<Routes>
<Route path="/" element={<Home />} />
<Route path="/login" element={<Login />} />
<Route path="/sidebar" element={<Sidebar />} />
<Route path="/login_provider" element={<LoginProvider />} />
<Route path="/signup_provider" element={<SignupProvider />} />
<Route path="/about" element={<ModernContact />} />
<Route path="/contact" element={<ContactPage />} />
<Route path="/moderncontact" element={<ModernContact />} />
<Route path="/moderation-contact" element={<ModernContact />} />
<Route path="/register_forget_password" element={<RegisterForgetPassword />} />
<Route path="/compte-rendu" element={<RequireAuth><CompteRendu /></RequireAuth>} />
<Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
<Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

</Routes>
</Router>
);
}
