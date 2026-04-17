import React, { useState } from 'react';
import './compteRendu.css';

export default function Clients() {
  const [clients] = useState([
    {
      id: 1,
      nom: 'Client A',
      email: 'contact@client-a.com',
      telephone: '+33 1 23 45 67 89',
      adresse: '123 Rue de la République, 75001 Paris',
      statut: 'actif',
      projets: 3,
      dateCreation: '2024-01-15',
      derniereActivite: '2024-04-10'
    },
    {
      id: 2,
      nom: 'Client B',
      email: 'contact@client-b.com',
      telephone: '+33 1 23 45 67 90',
      adresse: '456 Avenue des Champs-Élysées, 75008 Paris',
      statut: 'inactif',
      projets: 1,
      dateCreation: '2024-02-20',
      derniereActivite: '2024-03-25'
    },
    {
      id: 3,
      nom: 'Client C',
      email: 'contact@client-c.com',
      telephone: '+33 1 23 45 67 12',
      adresse: '789 Boulevard Saint-Germain, 69000 Lyon',
      statut: 'actif',
      projets: 5,
      dateCreation: '2024-03-10',
      derniereActivite: '2024-04-12'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client => {
    const matchesFilter = filter === 'all' || client.statut === filter;
    const matchesSearch = client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.adresse.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: clients.length,
    actifs: clients.filter(c => c.statut === 'actif').length,
    inactifs: clients.filter(c => c.statut === 'inactif').length
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
              <li className="nav-item active">
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
          <h1 className="page-title">Clients</h1>
          
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
            <div className="stat-number">{stats.actifs}</div>
            <div className="stat-label">Actifs</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.inactifs}</div>
            <div className="stat-label">Inactifs</div>
          </div>
        </section>

        {/* Filtres et recherche */}
        <section className="controls-section">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tous les clients</option>
              <option value="actif">Actifs</option>
              <option value="inactif">Inactifs</option>
            </select>
          </div>
          <button className="btn btn-primary">
            <span className="btn-icon">+</span>
            Nouveau client
          </button>
        </section>

        {/* Liste des clients */}
        <section className="clients-list">
          <h2>Liste des clients ({filteredClients.length})</h2>
          {filteredClients.length === 0 ? (
            <div className="empty-state">
              <p>Aucun client trouvé</p>
            </div>
          ) : (
            <div className="clients-grid">
              {filteredClients.map(client => (
                <div key={client.id} className="client-card">
                  <div className="card-header">
                    <h3>{client.nom}</h3>
                    <div className="card-actions">
                      <button className="action-btn" title="Modifier">
                        ✏️
                      </button>
                      <button className="action-btn" title="Supprimer">
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="card-info">
                    <div className="info-row">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{client.email}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Téléphone:</span>
                      <span className="info-value">{client.telephone}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Adresse:</span>
                      <span className="info-value">{client.adresse}</span>
                    </div>
                  </div>

                  <div className="card-meta">
                    <span className={`status ${client.statut === 'actif' ? 'status-actif' : 'status-inactif'}`}>
                      {client.statut === 'actif' ? 'Actif' : 'Inactif'}
                    </span>
                    <span className="projects-count">
                      {client.projets} projet{client.projets > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="dates-section">
                    <div className="date-info">
                      <span className="date-label">Création:</span>
                      <span className="date-value">{new Date(client.dateCreation).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="date-info">
                      <span className="date-label">Dernière activité:</span>
                      <span className="date-value">{new Date(client.derniereActivite).toLocaleDateString('fr-FR')}</span>
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
