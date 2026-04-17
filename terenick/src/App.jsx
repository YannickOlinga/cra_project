import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Sidebar from './components/sidebar';
import Login from './pages/login';
import CompteRendu from './pages/compteRendu';
import LoginProvider from './pages/login_provider';
import SignupProvider from './pages/signup_provider';
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
<Route path="/login_provider" element={<LoginProvider />} />
<Route path="/signup_provider" element={<SignupProvider />} />
<Route path="/compte-rendu" element={<CompteRendu />} />
<Route path="/missions" element={<Missions />} />
<Route path="/clients" element={<Clients />} />
<Route path="/taches" element={<Taches />} />
<Route path="/notes-frais" element={<NotesFrais />} />
<Route path="/reporting" element={<Reporting />} />

</Routes>
</Router>
);
}