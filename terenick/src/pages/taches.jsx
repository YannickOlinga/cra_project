import React, { useState } from 'react';
import './compteRendu.css';

export default function Taches() {
  const [taches] = useState([
    {
      id: 1,
      titre: 'Développer API REST',
      mission: 'Création site web TEST',
      priorite: 'haute',
      statut: 'en_cours',
      dateEcheance: '2024-04-15',
      progression: 75,
      description: 'Création des endpoints pour l\'application mobile'
    },
    {
      id: 2,
      titre: 'Réunions client',
      mission: 'Application mobile de gestion',
      priorite: 'moyenne',
      statut: 'en_attente',
      dateEcheance: '2024-04-20',
      progression: 0,
      description: 'Présentation de la nouvelle version de l\'application'
    },
    {
      id: 3,
      titre: 'Tests unitaires',
      mission: 'Application mobile de gestion',
      priorite: 'basse',
      statut: 'termine',
      dateEcheance: '2024-04-10',
      progression: 100,
      description: 'Écriture et exécution des tests automatisés'
    },
    {
      id: 4,
      titre: 'Documentation technique',
      mission: 'Maintenance plateforme existante',
      priorite: 'moyenne',
      statut: 'en_cours',
      dateEcheance: '2024-04-25',
      progression: 30,
      description: 'Rédaction de la documentation pour les développeurs'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTaches = taches.filter(tache => {
    const matchesFilter = filter === 'all' || tache.statut === filter;
    const matchesSearch = tache.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tache.mission.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tache.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: taches.length,
    en_cours: taches.filter(t => t.statut === 'en_cours').length,
    en_attente: taches.filter(t => t.statut === 'en_attente').length,
    termine: taches.filter(t => t.statut === 'termine').length
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
              <li className="nav-item active">
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
          <h1 className="page-title">Tâches</h1>
          
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
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Toutes les tâches</option>
              <option value="en_cours">En cours</option>
              <option value="en_attente">En attente</option>
              <option value="termine">Terminées</option>
            </select>
          </div>
          <button className="btn btn-primary">
            <span className="btn-icon">+</span>
            Nouvelle tâche
          </button>
        </section>

        {/* Liste des tâches */}
        <section className="taches-list">
          <h2>Liste des tâches ({filteredTaches.length})</h2>
          {filteredTaches.length === 0 ? (
            <div className="empty-state">
              <p>Aucune tâche trouvée</p>
            </div>
          ) : (
            <div className="taches-grid">
              {filteredTaches.map(tache => (
                <div key={tache.id} className="tache-card">
                  <div className="card-header">
                    <h3>{tache.titre}</h3>
                    
                  </div>
                  
                  <div className="card-meta">
                    <span className="mission">{tache.mission}</span>
                    <span className={`priority ${getPriorityClass(tache.priorite)}`}>
                      {tache.priorite}
                    </span>
                    <span className="echeance">
                      Échéance: {new Date(tache.dateEcheance).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <p className="description">{tache.description}</p>

                  <div className="progress-section">
                    <div className="progress-label">
                      <span>Progression</span>
                      <span>{tache.progression}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${tache.progression}%` }}
                      />
                    </div>
                  </div>

                  <div className="status-section">
                    <span className={`status ${getStatusClass(tache.statut)}`}>
                      {tache.statut === 'en_cours' ? 'En cours' : 
                       tache.statut === 'en_attente' ? 'En attente' : 'Terminée'}
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
