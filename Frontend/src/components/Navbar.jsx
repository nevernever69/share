import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="fixed w-full bg-gray-800 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-teal-400">SkillsDA</Link>
        <div className="space-x-6">
          <Link to="/" className="hover:text-teal-400 transition duration-200">Home</Link>
          <Link to="/about" className="hover:text-teal-400 transition duration-200">About</Link>
          <Link to="/contact" className="hover:text-teal-400 transition duration-200">Contact</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

