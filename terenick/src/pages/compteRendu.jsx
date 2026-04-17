import React, { useState } from 'react';
import './compteRendu.css';
import AddCRAModal from '../components/AddCRAModal';

export default function CompteRendu() {
  const [activities] = useState([
    {
      id: 1,
      periode: 'Mai 2026',
      mission: 'creation de cite web TEST',
      prestataire: 'Terenick',
      tempsTotal: '0 j.',
      etat: '3/5 Complété',
      etatClass: 'in-progress'
    }
  ]);

  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    console.log('Bouton Ajouter un CRA cliqué');
    setShowModal(true);
    
    // Test pour vérifier si le modal est bien dans le DOM
    setTimeout(() => {
      const modal = document.querySelector('.modal-overlay');
      if (modal) {
        console.log('Modal trouvé dans le DOM:', modal);
        console.log('Modal visible:', window.getComputedStyle(modal).display !== 'none');
        console.log('Modal z-index:', window.getComputedStyle(modal).zIndex);
      } else {
        console.log('Modal NON trouvé dans le DOM!');
      }
    }, 100);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleGenerateCRA = () => {
    // Logique pour générer le CRA
    console.log('Génération du CRA...');
    setShowModal(false);
  };

  return (
    <div className="compte-rendu-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-text">Terenick</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-section-title">MENU</h3>
            <ul className="nav-list">
              <li className="nav-item active">
                <a href="#" className="nav-link">
                  <span className="nav-icon"></span>
                  <span>CRA</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">
                  <span className="nav-icon"></span>
                  <span>Missions</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">
                  <span className="nav-icon"></span>
                  <span>Clients</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">
                  <span className="nav-icon"></span>
                  <span>Tâches</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">
                  <span className="nav-icon"></span>
                  <span>Notes de frais</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">
                  <span className="nav-icon"></span>
                  <span>Reporting</span>
                </a>
              </li>
            </ul>
          </div>
          
          <div className="nav-section">
            <h3 className="nav-section-title">MON COMPTE</h3>
            <ul className="nav-list">
              <li className="nav-item">
                <a href="#" className="nav-link">
                  <span className="nav-icon"></span>
                  <span>Mon compte</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">
                  <span className="nav-icon"></span>
                  <span>Paramètres</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">
                  <span className="nav-icon"></span>
                  <span>Abonnement</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">
                  <span className="nav-icon"></span>
                  <span>Intégrations</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">
                  <span className="nav-icon"></span>
                  <span>Assistance</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">
                  <span className="nav-icon"></span>
                  <span>Déconnexion</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <p className="copyright">© 2026. Propulsé par Timizer</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          <h1 className="page-title">Mes comptes rendus d'activités</h1>
          <div className="user-info">
            <div className="user-details">
              <span className="user-name">Sylvestre Yannick Noah Olinga</span>
              <span className="user-email">yannickolinga213@gmail.com</span>
            </div>
            <div className="user-avatar">SN</div>
          </div>
        </header>

        <div className="content-actions">
          <button 
            className="btn btn-primary" 
            onClick={handleOpenModal}
          >
            <span className="btn-icon">+</span>
            Ajouter un CRA
          </button>
          <button className="btn btn-secondary">
            Éditions multiples
          </button>
        </div>

        <div className="tabs">
          <button className="tab active">
            Actifs <span className="tab-count">1</span>
          </button>
          <button className="tab">
            Traités <span className="tab-count">0</span>
          </button>
        </div>

        <div className="table-controls">
          <button className="btn btn-outline">Réinitialiser les filtres</button>
          <button className="btn btn-outline">Exporter (.csv)</button>
          <div className="view-toggle">
            <button className="view-btn active"></button>
            <button className="view-btn"></button>
          </div>
        </div>

        <div className="table-container">
          <table className="activities-table">
            <thead>
              <tr>
                <th>Période</th>
                <th>Missions</th>
                <th>Prestataire</th>
                <th>Temps total</th>
                <th>État</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map(activity => (
                <tr key={activity.id}>
                  <td>{activity.periode}</td>
                  <td>{activity.mission}</td>
                  <td>{activity.prestataire}</td>
                  <td>{activity.tempsTotal}</td>
                  <td>
                    <span className={`status ${activity.etatClass}`}>
                      {activity.etat}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn" title="Voir/Modifier">
                      </button>
                      <button className="action-btn" title="Copier">
                      </button>
                      <button className="action-btn" title="Supprimer">
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      <AddCRAModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onGenerate={handleGenerateCRA}
      />
    </div>
  );
}
