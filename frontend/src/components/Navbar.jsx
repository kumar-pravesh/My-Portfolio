import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = ({ activeSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'About', href: '#about', id: 'about' },
    { name: 'Services', href: '#services', id: 'services' },
    { name: 'Projects', href: '#projects', id: 'projects' },
  ];

  return (
    <header className={`header ${isSticky ? 'sticky glass' : ''}`}>
      <a href="#" className="logo">Portfolio</a>

      <div id="menu-icon" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={36} /> : <Menu size={36} />}
      </div>

      <nav className={`navbar ${isOpen ? 'active glass' : ''}`}>
        {navLinks.map((link) => (
          <a
            key={link.id}
            href={link.href}
            className={activeSection === link.id ? 'active' : ''}
            onClick={() => setIsOpen(false)}
          >
            {link.name}
          </a>
        ))}
        <a href="#contact" className="btn" style={{ marginLeft: '4rem', padding: '1rem 2rem' }} onClick={() => setIsOpen(false)}>Contact Us</a>
      </nav>
    </header>
  );
};

export default Navbar;
