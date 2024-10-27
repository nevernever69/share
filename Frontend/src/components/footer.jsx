import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 text-gray-300">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          {/* Logo and Description */}
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h3 className="text-teal-400 text-xl font-semibold">SkillsDA</h3>
            <p className="mt-1 text-gray-400">Empowering your cybersecurity skills with hands-on labs.</p>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-6 mb-4 md:mb-0">
            <Link to="/" className="hover:text-teal-400 transition duration-200">Home</Link>
            <Link to="/about" className="hover:text-teal-400 transition duration-200">About</Link>
            <Link to="/contact" className="hover:text-teal-400 transition duration-200">Contact</Link>
            <Link to="/privacy" className="hover:text-teal-400 transition duration-200">Privacy Policy</Link>
          </div>

          {/* Social Media Icons */}
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition duration-200">
              <Facebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition duration-200">
              <Twitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition duration-200">
              <Instagram />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition duration-200">
              <Linkedin />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} SkillsDA. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
