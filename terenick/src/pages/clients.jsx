import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './compteRendu.css';
import './clients.css';
import AddCustomerModal from '../components/AddCustomerModal';
import DeleteCustomerModal from '../components/DeleteCustomerModal';
import { exportRowsToCsv } from '../utils/csvExport';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default function Clients() {
  const [session, setSession] = useState(null);
  const [clients, setClients] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);

  useEffect(() => {
    const storedSession = localStorage.getItem('authSession');
    if (!storedSession) {
      setSession(null);
      return;
    }

    try {
      setSession(JSON.parse(storedSession));
    } catch {
      setSession(null);
    }
  }, []);

  useEffect(() => {
    if (!session?.token) {
      return;
    }

    let isCancelled = false;

    async function loadCustomers() {
      try {
        const response = await fetch(`${apiBaseUrl}/customers`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });

        const data = await response.json().catch(() => []);
        if (response.status === 401) {
          localStorage.removeItem('authSession');
          window.location.href = '/login';
          return;
        }
        if (!response.ok || !Array.isArray(data)) {
          throw new Error('Impossible de charger les clients.');
        }

        if (!isCancelled) {
          setClients(data);
        }
      } catch {
        if (!isCancelled) {
          setClients([]);
        }
      }
    }

    loadCustomers();

    return () => {
      isCancelled = true;
    };
  }, [session]);

  const profile = useMemo(() => {
    const firstName = session?.user?.first_name ?? 'Terence';
    const lastName = session?.user?.last_name ?? 'M';
    const email = session?.user?.email ?? 'terence.mayombo@gmail.com';
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'TM';

    return {
      fullName: `${firstName} ${lastName}`.trim(),
      email,
      initials,
    };
  }, [session]);

  function handleCustomerCreated(createdCustomer) {
    setClients((current) => [createdCustomer, ...current]);
  }

  function handleCustomerUpdated(updatedCustomer) {
    setClients((current) =>
      current.map((client) => (client.id === updatedCustomer.id ? updatedCustomer : client)),
    );
  }

  function handleCustomerDeleted(deletedCustomerId) {
    setClients((current) => current.filter((client) => client.id !== deletedCustomerId));
  }

  function handleLogout() {
    localStorage.removeItem('authSession');
    window.location.href = '/login';
  }

  function handleExportCsv() {
    exportRowsToCsv(
      'clients.csv',
      [
        { key: 'nom', label: 'Nom' },
        { key: 'email', label: 'Email' },
        { key: 'entreprise', label: 'Entreprise' },
      ],
      clients.map((client) => ({
        nom:
          `${client.user?.first_name ?? ''} ${client.user?.last_name ?? ''}`.trim() ||
          `Client #${client.id}`,
        email: client.user?.email ?? '-',
        entreprise: client.company || '-',
      })),
    );
  }

  return (
    <div className="compte-rendu-container cr-layout">
      <aside className="cr-sidebar">
        <div className="cr-sidebar-header">
          <Link to="/" className="cr-logo">
            <span className="cr-logo-text">Terenick</span>
          </Link>
        </div>

        <nav className="cr-sidebar-nav">
          <div className="cr-nav-section">
            <h3 className="cr-nav-title">MENU</h3>
            <ul className="cr-nav-list">
              <li className="cr-nav-item active">
                <a href="/clients" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>Clients</span>
                </a>
              </li>
              <li className="cr-nav-item">
                <a href="/missions" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>Missions</span>
                </a>
              </li>
              <li className="cr-nav-item">
                <a href="/compte-rendu" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>CRA</span>
                </a>
              </li>
              <li className="cr-nav-item">
                <a href="#" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>Notes de frais</span>
                </a>
              </li>
              {/* <li className="cr-nav-item">
                <a href="#" className="cr-nav-link">
                  <span className="cr-nav-icon"></span>
                  <span>Reporting</span>
                </a>
              </li> */}
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

      <main className="cr-main-content clients-content">
        <header className="cr-content-header">
          <h1 className="cr-page-title">Clients</h1>
          <div className="cr-user-info">
            <div className="cr-user-details">
              <span className="cr-user-name">{profile.fullName}</span>
              <span className="cr-user-email">{profile.email}</span>
            </div>
            <a href="/profile" className="cr-user-badge-link" title="Profil">
              <span className="cr-user-avatar">{profile.initials}</span>
            </a>
          </div>
        </header>

        <section className="clients-hero">
          <div className="clients-hero-copy">
            <div className="clients-hero-icon-wrap">
              <div className="clients-hero-icon">
                <span className="clients-hero-folder" />
              </div>
            </div>
            <div>
              <h2>Gérez vos clients efficacement</h2>
              <p>Centralisez toutes les informations liées à vos clients.</p>
              <p>Ajoutez et gérez les contacts clés pour chaque compte.</p>
            </div>
          </div>
          <button
            type="button"
            className="clients-add-button"
            onClick={() => setShowAddModal(true)}
          >
            Ajouter un Client
          </button>
        </section>

        <section className="clients-board">
          <div className="clients-toolbar">
            <div />
            <button type="button" className="clients-toolbar-btn" onClick={handleExportCsv}>
              Exporter (.csv)
            </button>
          </div>

          <div className="clients-table-shell">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Entreprise</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="clients-empty-cell">
                      Aucun client trouvé.
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => {
                    const fullName =
                      `${client.user?.first_name ?? ''} ${client.user?.last_name ?? ''}`.trim() ||
                      `Client #${client.id}`;

                    return (
                      <tr key={client.id}>
                        <td className="clients-name-cell">{fullName}</td>
                        <td>{client.user?.email ?? '-'}</td>
                        <td>{client.company || '-'}</td>
                        <td>
                          <div className="clients-actions-cell">
                            <button
                              type="button"
                              className="clients-icon-btn"
                              title="Modifier"
                              onClick={() => setEditingClient(client)}
                            >
                              <span className="clients-edit-icon" />
                            </button>
                            <button
                              type="button"
                              className="clients-icon-btn clients-icon-btn-danger"
                              title="Supprimer"
                              onClick={() => setDeletingClient(client)}
                            >
                              <span className="clients-trash-icon" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <AddCustomerModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onCreated={handleCustomerCreated}
        />
        <AddCustomerModal
          isOpen={Boolean(editingClient)}
          mode="edit"
          customer={editingClient}
          onClose={() => setEditingClient(null)}
          onUpdated={handleCustomerUpdated}
        />
        <DeleteCustomerModal
          isOpen={Boolean(deletingClient)}
          customer={deletingClient}
          onClose={() => setDeletingClient(null)}
          onDeleted={handleCustomerDeleted}
        />
      </main>
    </div>
  );
}
