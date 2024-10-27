import React from 'react';

function HeroSection() {
  return (
    <section className="pt-20 pb-10 text-center bg-gray-900">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-teal-400 leading-tight mb-4">Empowering Cybersecurity Skills</h1>
        <p className="text-lg sm:text-xl text-gray-300 mb-8">
          Learn cloud security, digital forensics, and more with our immersive, hands-on virtual labs.
        </p>
        <a href="/labs" className="px-8 py-4 bg-teal-400 text-gray-900 rounded-md text-lg font-semibold hover:bg-teal-500 transition duration-200">
          Get Started
        </a>
      </div>
    </section>
  );
}

export default HeroSection;

