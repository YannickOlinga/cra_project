import React, { useState, useEffect } from 'react';
import './navbar.css';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            setScrolled(isScrolled);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
       <>
       <nav className={scrolled ? 'scrolled' : ''}>
        <div className="logo"><span>T</span>erenick</div>
        <ul>
            <li>Home</li>
            <li>A Propos</li>
            <li>Contact</li> 
        </ul>
        <a href="/login"> <button>Se connecter</button> </a>
       </nav>
       </>
    )
}
