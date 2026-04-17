import React, { useState } from 'react';
import './compteRendu.css';

export default function Reporting() {
  const [periode, setPeriode] = useState('mois');
  const [annee, setAnnee] = useState(new Date().getFullYear());

  const stats = {
    caTotal: 12,
    caApprouves: 8,
    caEnAttente: 3,
    caRejetees: 1,
    totalMontant: 4567.89,
    montantMoyen: 380.66,
    missionsCompletees: 15,
    tempsTotal: 240
  };

  const rapports = [
    {
      id: 1,
      titre: 'Rapport mensuel Avril 2026',
      periode: 'Avril 2026',
      statut: 'termine',
      caCount: 12,
      montantTotal: 2340.50,
      dateGeneration: '2024-05-05'
    },
    {
      id: 2,
      titre: 'Rapport mensuel Mars 2026',
      periode: 'Mars 2026',
      statut: 'termine',
      caCount: 10,
      montantTotal: 1890.25,
      dateGeneration: '2024-04-05'
    },
    {
      id: 3,
      titre: 'Rapport mensuel Février 2026',
      periode: 'Février 2026',
      statut: 'en_cours',
      caCount: 8,
      montantTotal: 1567.14,
      dateGeneration: '2024-03-05'
    }
  ];

  const filteredRapports = rapports.filter(rapport => {
    return rapport.titre.toLowerCase().includes(periode.toLowerCase()) ||
           rapport.periode.toLowerCase().includes(periode.toLowerCase());
  });

  const exportData = () => {
    const data = filteredRapports.map(rapport => ({
      'Titre': rapport.titre,
      'Période': rapport.periode,
      'Statut': rapport.statut,
      'Nombre de CRAs': rapport.caCount,
      'Montant total': `${rapport.montantTotal.toFixed(2)}€`,
      'Date de génération': rapport.dateGeneration
    }));
    
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapports_${periode}_${annee}.csv`;
    link.click();
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
              <li className="nav-item">
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
              <li className="nav-item active">
                <a href="#" className="nav-link">
                  <span className="nav-icon"></span>
                  <span>Reporting</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          <h1 className="page-title">Reporting</h1>
          
          <div className="user-info">
            <div className="user-details">
              <span className="user-name">Sylvestre Yannick Noah Olinga</span>
              <span className="user-email">yannickolinga213@gmail.com</span>
            </div>
            <div className="user-avatar">SN</div>
          </div>
        </header>

        {/* Statistiques globales */}
        <section className="stats-section">
          <h2>Statistiques globales</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.caTotal}</div>
              <div className="stat-label">CRAs totaux</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.caApprouves}</div>
              <div className="stat-label">Approuvées</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.caEnAttente}</div>
              <div className="stat-label">En attente</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.caRejetees}</div>
              <div className="stat-label">Rejetées</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalMontant.toFixed(2)}€</div>
              <div className="stat-label">Montant total</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.missionsCompletees}</div>
              <div className="stat-label">Missions terminées</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.tempsTotal}h</div>
              <div className="stat-label">Temps total</div>
            </div>
          </div>
        </section>

        {/* Filtres et contrôles */}
        <section className="controls-section">
          <div className="filter-controls">
            <select 
              value={periode} 
              onChange={(e) => setPeriode(e.target.value)}
              className="filter-select"
            >
              <option value="mois">Ce mois</option>
              <option value="trimestre">Ce trimestre</option>
              <option value="annee">Cette année</option>
            </select>
            <input
              type="number"
              value={annee}
              onChange={(e) => setAnnee(parseInt(e.target.value))}
              placeholder="Année"
              className="year-input"
              min="2020"
              max={new Date().getFullYear() + 1}
            />
          </div>
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={exportData}>
               
              Exporter CSV
            </button>
            <button className="btn btn-secondary">
              
              Générer PDF
            </button>
          </div>
        </section>

        {/* Liste des rapports */}
        <section className="rapports-list">
          <h2>Rapports générés ({filteredRapports.length})</h2>
          {filteredRapports.length === 0 ? (
            <div className="empty-state">
              <p>Aucun rapport trouvé pour cette période</p>
            </div>
          ) : (
            <div className="rapports-grid">
              {filteredRapports.map(rapport => (
                <div key={rapport.id} className="rapport-card">
                  <div className="card-header">
                    <h3>{rapport.titre}</h3> 
                  </div>
                  
                  <div className="card-info">
                    <div className="info-row">
                      <span className="info-label">Période:</span>
                      <span className="info-value">{rapport.periode}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Statut:</span>
                      <span className={`info-value status-${rapport.statut}`}>
                        {rapport.statut === 'termine' ? 'Terminé' : 'En cours'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">CRAs:</span>
                      <span className="info-value">{rapport.caCount}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Montant:</span>
                      <span className="info-value">{rapport.montantTotal.toFixed(2)}€</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Génération:</span>
                      <span className="info-value">{new Date(rapport.dateGeneration).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
