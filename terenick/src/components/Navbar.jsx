import React, { useState, useEffect } from 'react';
import './navbar.css';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            setScrolled(isScrolled);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
       <>
       <nav className={scrolled ? 'scrolled' : ''}>
        <div className="logo"><span>T</span>erenick</div>
        
        {/* Menu Desktop */}
        <ul className="desktop-menu">
            <li><a href="#home" onClick={closeMobileMenu}>Home</a></li>
            <li><a href="#about" onClick={closeMobileMenu}>A Propos</a></li>
            <li><a href="#contact" onClick={closeMobileMenu}>Contact</a></li>
            <li><a href="/compte-rendu" onClick={closeMobileMenu}>Compte Rendu</a></li>
        </ul>

        {/* Bouton Desktop */}
        <a href="/login" className="desktop-only">
            <button>Se connecter</button>
        </a>

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
                <li><a href="#home" onClick={closeMobileMenu}>Home</a></li>
                <li><a href="#about" onClick={closeMobileMenu}>A Propos</a></li>
                <li><a href="#contact" onClick={closeMobileMenu}>Contact</a></li>
                <li><a href="/compte-rendu" onClick={closeMobileMenu}>Compte Rendu</a></li>
                <li className="mobile-button">
                    <a href="/login" onClick={closeMobileMenu}>
                        <button>Se connecter</button>
                    </a>
                </li>
            </ul>
        </div>
       </nav>
       </>
    )
}
