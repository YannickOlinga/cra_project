import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Sidebar from './components/sidebar';
import Login from './pages/login';
import CompteRendu from './pages/compteRendu';
import LoginProvider from './pages/login_provider';
import SignupProvider from './pages/signup_provider';
export default function App(){
return (
<Router>
<Routes>
<Route path="/" element={<Home />} />
<Route path="/login" element={<Login />} />
<Route path="/sidebar" element={<Sidebar />} />
<Route path="/login_provider" element={<LoginProvider />} />
<Route path="/signup_provider" element={<SignupProvider />} />
<Route path="/compte-rendu" element={<CompteRendu />} />

</Routes>
</Router>
);
}