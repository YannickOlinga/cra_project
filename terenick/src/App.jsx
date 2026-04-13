import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Sidebar from './components/sidebar';
import Login from './pages/login';
import CompteRendu from './pages/compteRendu';
export default function App(){
return (
<Router>
<Routes>
<Route path="/" element={<Home />} />
<Route path="/login" element={<Login />} />
<Route path="/sidebar" element={<Sidebar />} />
<Route path="/compte-rendu" element={<CompteRendu />} />

</Routes>
</Router>
);
}