import { Link } from 'react-router-dom';
import './dashboard.css';

function Dashboard() {
  const session = JSON.parse(localStorage.getItem('authSession') ?? 'null');
  const firstName = session?.user?.first_name ?? 'Utilisateur';
  const lastName = session?.user?.last_name ?? '';
  const role = session?.role ?? 'account';
  const roleLabel =
    role === 'provider'
      ? 'Prestataire'
      : role === 'customer'
        ? 'Client'
        : 'Compte';

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <Link to="/" className="dashboard-back">
          Retour
        </Link>
        <p className="dashboard-kicker">Espace connecté</p>
        <h1 className="dashboard-title">
          Bonjour {firstName} {lastName}
        </h1>
        <p className="dashboard-subtitle">
          Vous êtes connecté en tant que {roleLabel}.
        </p>
      </section>

      <section className="dashboard-grid">
        <Link to="/profile" className="dashboard-card dashboard-card-link">
          <article>
            <h2>Mon profil</h2>
            <p>Consultez vos informations et votre rôle.</p>
          </article>
        </Link>
        <Link to="/compte-rendu" className="dashboard-card dashboard-card-link">
          <article>
            <h2>Compte rendu</h2>
            <p>Accédez rapidement à la gestion de vos comptes rendus.</p>
          </article>
        </Link>
      </section>
    </div>
  );
}

export default Dashboard;
