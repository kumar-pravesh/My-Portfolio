import React from 'react';
import { Github, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-content">
        <p>Copyright © {new Date().getFullYear()} by <span>Pravesh Kumar</span> | All Rights Reserved</p>
        
        <div className="footer-socials">
          <a href="https://github.com/kumar-pravesh" target="_blank" rel="noopener noreferrer"><Github size={20} /></a>
          <a href="https://www.linkedin.com/in/pravesh-kumar-38b1422a7" target="_blank" rel="noopener noreferrer"><Linkedin size={20} /></a>
          <a href="mailto:praveshkumar5502@gmail.com"><Mail size={20} /></a>
        </div>

        <p className="made-with">
          Made with <Heart size={16} fill="red" color="red" /> in India
        </p>
      </div>
    </footer>
  );
};

export default Footer;
