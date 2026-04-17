import React, { useState } from 'react';
import './compteRendu.css';

export default function Missions() {
  const [missions] = useState([
    {
      id: 1,
      titre: 'Création de site web TEST',
      client: 'Client A',
      statut: 'en_cours',
      priorite: 'haute',
      dateDebut: '2024-04-01',
      dateFin: '2024-06-30',
      progression: 65,
      description: 'Développement complet d\'un site web responsive avec React et Node.js'
    },
    {
      id: 2,
      titre: 'Application mobile de gestion',
      client: 'Client B',
      statut: 'en_attente',
      priorite: 'moyenne',
      dateDebut: '2024-05-01',
      dateFin: '2024-08-31',
      progression: 0,
      description: 'Application iOS et Android pour la gestion de projet'
    },
    {
      id: 3,
      titre: 'Maintenance plateforme existante',
      client: 'Client C',
      statut: 'termine',
      priorite: 'basse',
      dateDebut: '2024-03-01',
      dateFin: '2024-03-15',
      progression: 100,
      description: 'Mise à jour et correction de bugs sur la plateforme'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMissions = missions.filter(mission => {
    const matchesFilter = filter === 'all' || mission.statut === filter;
    const matchesSearch = mission.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mission.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mission.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: missions.length,
    en_cours: missions.filter(m => m.statut === 'en_cours').length,
    en_attente: missions.filter(m => m.statut === 'en_attente').length,
    termine: missions.filter(m => m.statut === 'termine').length
  };

  const getStatusClass = (statut) => {
    switch(statut) {
      case 'en_cours': return 'status-en-cours';
      case 'en_attente': return 'status-en-attente';
      case 'termine': return 'status-termine';
      default: return '';
    }
  };

  const getPriorityClass = (priorite) => {
    switch(priorite) {
      case 'haute': return 'priority-haute';
      case 'moyenne': return 'priority-moyenne';
      case 'basse': return 'priority-basse';
      default: return '';
    }
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
              <li className="nav-item active">
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
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          <h1 className="page-title">Missions</h1>
          
          <div className="user-info">
            <div className="user-details">
              <span className="user-name">Sylvestre Yannick Noah Olinga</span>
              <span className="user-email">yannickolinga213@gmail.com</span>
            </div>
            <div className="user-avatar">SN</div>
          </div>
        </header>

        {/* Statistiques */}
        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.en_cours}</div>
            <div className="stat-label">En cours</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.en_attente}</div>
            <div className="stat-label">En attente</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.termine}</div>
            <div className="stat-label">Terminées</div>
          </div>
        </section>

        {/* Filtres et recherche */}
        <section className="controls-section">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Rechercher une mission..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Toutes les missions</option>
              <option value="en_cours">En cours</option>
              <option value="en_attente">En attente</option>
              <option value="termine">Terminées</option>
            </select>
          </div>
          <button className="btn btn-primary">
            <span className="btn-icon">+</span>
            Nouvelle mission
          </button>
        </section>

        {/* Liste des missions */}
        <section className="missions-list">
          <h2>Liste des missions ({filteredMissions.length})</h2>
          {filteredMissions.length === 0 ? (
            <div className="empty-state">
              <p>Aucune mission trouvée</p>
            </div>
          ) : (
            <div className="missions-grid">
              {filteredMissions.map(mission => (
                <div key={mission.id} className="mission-card">
                  <div className="card-header">
                    <h3>{mission.titre}</h3>
                   
                  </div>
                  
                  <div className="card-meta">
                    <span className="client">{mission.client}</span>
                    <span className={`priority ${getPriorityClass(mission.priorite)}`}>
                      {mission.priorite}
                    </span>
                  </div>

                  <p className="description">{mission.description}</p>

                  <div className="dates-section">
                    <div className="date-info">
                      <span className="date-label">Début:</span>
                      <span className="date-value">{new Date(mission.dateDebut).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="date-info">
                      <span className="date-label">Fin:</span>
                      <span className="date-value">{new Date(mission.dateFin).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  <div className="progress-section">
                    <div className="progress-label">
                      <span>Progression</span>
                      <span>{mission.progression}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${mission.progression}%` }}
                      />
                    </div>
                  </div>

                  <div className="status-section">
                    <span className={`status ${getStatusClass(mission.statut)}`}>
                      {mission.statut === 'en_cours' ? 'En cours' : 
                       mission.statut === 'en_attente' ? 'En attente' : 'Terminée'}
                    </span>
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
