import React, { useState } from 'react';
import './compteRendu.css';

export default function NotesFrais() {
  const [notes] = useState([
    {
      id: 1,
      titre: 'Repas déjeuner client',
      categorie: 'repas',
      montant: 45.50,
      date: '2024-04-10',
      statut: 'approuve',
      description: 'Déjeuner d\'affaires avec Client A au restaurant Le Gourmet'
    },
    {
      id: 2,
      titre: 'Transport SNCF',
      categorie: 'transport',
      montant: 28.00,
      date: '2024-04-08',
      statut: 'en_attente',
      description: 'Billet train Paris-Lyon pour mission chez Client B'
    },
    {
      id: 3,
      titre: 'Hôtel nuitée',
      categorie: 'hebergement',
      montant: 120.00,
      date: '2024-04-12',
      statut: 'approuve',
      description: 'Nuit d\'hôtel pour mission Client C à Lyon'
    },
    {
      id: 4,
      titre: 'Fournitures bureau',
      categorie: 'materiel',
      montant: 85.30,
      date: '2024-04-15',
      statut: 'rejeté',
      description: 'Achat de clavier et souris ergonomiques'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotes = notes.filter(note => {
    const matchesFilter = filter === 'all' || note.statut === filter;
    const matchesSearch = note.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.categorie.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: notes.length,
    approuvees: notes.filter(n => n.statut === 'approuve').length,
    en_attente: notes.filter(n => n.statut === 'en_attente').length,
    rejetees: notes.filter(n => n.statut === 'rejeté').length,
    totalMontant: notes.reduce((sum, note) => sum + note.montant, 0)
  };

  const getStatusClass = (statut) => {
    switch(statut) {
      case 'approuve': return 'status-approuve';
      case 'en_attente': return 'status-en-attente';
      case 'rejeté': return 'status-rejete';
      default: return '';
    }
  };

  const getCategorieClass = (categorie) => {
    switch(categorie) {
      case 'repas': return 'categorie-repas';
      case 'transport': return 'categorie-transport';
      case 'hebergement': return 'categorie-hebergement';
      case 'materiel': return 'categorie-materiel';
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
              <li className="nav-item">
                <a href="#" className="nav-link">
                  <span className="nav-icon"></span>
                  <span>Tâches</span>
                </a>
              </li>
              <li className="nav-item active">
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
          <h1 className="page-title">Notes de frais</h1>
          
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
            <div className="stat-number">{stats.approuvees}</div>
            <div className="stat-label">Approuvées</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.en_attente}</div>
            <div className="stat-label">En attente</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.rejetees}</div>
            <div className="stat-label">Rejetées</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalMontant.toFixed(2)}€</div>
            <div className="stat-label">Total montant</div>
          </div>
        </section>

        {/* Filtres et recherche */}
        <section className="controls-section">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Rechercher une note de frais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Toutes les notes</option>
              <option value="approuve">Approuvées</option>
              <option value="en_attente">En attente</option>
              <option value="rejeté">Rejetées</option>
            </select>
          </div>
          <button className="btn btn-primary">
            <span className="btn-icon">+</span>
            Nouvelle note
          </button>
        </section>

        {/* Liste des notes de frais */}
        <section className="notes-list">
          <h2>Liste des notes de frais ({filteredNotes.length})</h2>
          {filteredNotes.length === 0 ? (
            <div className="empty-state">
              <p>Aucune note de frais trouvée</p>
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map(note => (
                <div key={note.id} className="note-card">
                  <div className="card-header">
                    <h3>{note.titre}</h3>
                     
                  </div>
                  
                  <div className="card-meta">
                    <span className={`categorie ${getCategorieClass(note.categorie)}`}>
                      {note.categorie}
                    </span>
                    <span className={`montant ${note.statut === 'rejeté' ? 'montant-rejete' : ''}`}>
                      {note.montant.toFixed(2)}€
                    </span>
                    <span className="date">
                      {new Date(note.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <p className="description">{note.description}</p>

                  <div className="status-section">
                    <span className={`status ${getStatusClass(note.statut)}`}>
                      {note.statut === 'approuve' ? 'Approuvée' : 
                       note.statut === 'en_attente' ? 'En attente' : 'Rejetée'}
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
