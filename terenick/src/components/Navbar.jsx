import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './navbar.css';

export default function Navbar() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [session, setSession] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            setScrolled(isScrolled);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('authSession');
        setSession(null);
        setMobileMenuOpen(false);
        navigate('/');
    };

    const handleProtectedNavigation = (event, path) => {
        event.preventDefault();
        closeMobileMenu();

        if (!session?.token) {
            navigate('/login');
            return;
        }

        navigate(path);
    };

    const initials = (() => {
        const firstName = session?.user?.first_name?.trim?.() ?? '';
        const lastName = session?.user?.last_name?.trim?.() ?? '';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
    })();

    return (
       <>
       <nav className={scrolled ? 'scrolled' : ''}>
        <div className="logo"><span>T</span>erenick</div>
        
        {/* Menu Desktop */}
        <ul className="desktop-menu">
            <li><Link to="/" onClick={closeMobileMenu}>Home</Link></li>
            <li><Link to="/about" onClick={closeMobileMenu}>A Propos</Link></li>
            <li><Link to="/moderation-contact" onClick={closeMobileMenu}>Contact</Link></li>
            <li><a href="/compte-rendu" onClick={(event) => handleProtectedNavigation(event, '/compte-rendu')}>Compte Rendu</a></li>
        </ul>

        {/* Bouton Desktop */}
        {session ? (
            <div className="desktop-only user-actions">
                <a href="/profile" className="user-badge-link" title="Profil">
                    <div className="user-badge">
                        {initials}
                    </div>
                </a>
                <button type="button" className="logout-button" onClick={handleLogout}>
                    Déconnexion
                </button>
            </div>
        ) : (
            <a href="/login" className="desktop-only">
                <button>Se connecter</button>
            </a>
        )}

        {/* Menu Hamburger Mobile */}
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <div className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>

        {/* Menu Mobile */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <ul>
                <li><Link to="/" onClick={closeMobileMenu}>Home</Link></li>
                <li><Link to="/about" onClick={closeMobileMenu}>A Propos</Link></li>
                <li><Link to="/contact" onClick={closeMobileMenu}>Contact</Link></li>
                <li><a href="/compte-rendu" onClick={(event) => handleProtectedNavigation(event, '/compte-rendu')}>Compte Rendu</a></li>
                <li className="mobile-button">
                    {session ? (
                        <div className="mobile-user-actions">
                            <a href="/profile" onClick={closeMobileMenu} className="user-badge-link">
                                <div className="user-badge mobile-user-badge">{initials}</div>
                            </a>
                            <button type="button" className="logout-button mobile-logout-button" onClick={handleLogout}>
                                Déconnexion
                            </button>
                        </div>
                    ) : (
                        <a href="/login" onClick={closeMobileMenu}>
                            <button>Se connecter</button>
                        </a>
                    )}
                </li>
            </ul>
        </div>
       </nav>
       </>
    )
}
