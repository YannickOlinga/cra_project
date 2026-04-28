import './compteRendu.css';
import './compteRenduDetail.css'; 
import { FaEye } from 'react-icons/fa';


export default function client_interface() {
    
  

  function handleLogout() {
    localStorage.removeItem('authSession');
    window.location.href = '/login';
  }

  return (
    <div className="compte-rendu-container cr-layout">
      <aside className="cr-sidebar">
        <div className="cr-sidebar-header">
          <div className="cr-logo">
            <span className="cr-logo-text">Terenick</span>
          </div>
        </div>

        <nav className="cr-sidebar-nav">
          <div className="cr-nav-section">
            <h3 className="cr-nav-title">MENU</h3>
            <ul className="cr-nav-list">
              <li className="cr-nav-item active">
                <a href="/client_interface" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>CRA</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="cr-nav-section cr-nav-section-account">
            <h3 className="cr-nav-title">MON COMPTE</h3>
            <ul className="cr-nav-list">
              <li className="cr-nav-item">
                <a href="/profile" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>Mon compte</span>
                </a>
              </li>
              <li className="cr-nav-item">
                <button type="button" className="cr-nav-link cr-nav-link-button" onClick={handleLogout}>
                  <span className="cr-nav-icon"></span>
                  <span>Déconnexion</span>
                </button>
              </li>
            </ul>
          </div>
        </nav> 

        <div className="cr-sidebar-footer">
          <p className="cr-copyright">© 2026. Propulsé par Terenick</p>
        </div>
      </aside>

      <main className="cr-main-content cr-detail-content">
        <header className="cr-content-header">
          <div> 
            <h1 className="cr-page-title">INFORMATIONS GÉNÉRALES</h1>
             
          </div>
          
        </header>
        <div className="cr-detail-grid">
            <div className="cr-detail-card">
                        <h2>  Mes comptes rendus  </h2>
                       

            </div>
            
          
        </div>

        <div className="tableau">
            <tr>
                <td className="tableau-header">ID</td>
                <td className="tableau-header">Date</td>
                <td className="tableau-header">Missions</td>
                <td className="tableau-header">Noms</td>
                <td className="tableau-header">Statut</td> 
                <td className="tableau-header">Action</td>
            </tr>
            <tr>
                <td className="tableau-cell">1</td>
                <td className="tableau-cell">2026-01-01</td>
                <td className="tableau-cell">Refonte du site web</td>
                <td className="tableau-cell">Terence Mayombo</td>
                <td className="tableau-cell">Terminé</td>
                <td className="tableau-cell">
                  <FaEye />
                </td>
            </tr>
         
        </div>
        
      </main>
    </div>
  );
}
