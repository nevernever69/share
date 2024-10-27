import React from 'react';
import { Cloud, Shield, Code, Server, FileLock, Users } from 'lucide-react';

const features = [
  { icon: <Cloud className="text-teal-400" />, title: 'Cloud Security', description: 'Comprehensive cloud security training.' },
  { icon: <Shield className="text-teal-400" />, title: 'Digital Forensics', description: 'Hands-on digital forensics labs.' },
  { icon: <Code className="text-teal-400" />, title: 'Secure Coding', description: 'Best practices in secure coding.' },
  { icon: <Server className="text-teal-400" />, title: 'Infrastructure', description: 'Understanding secure infrastructures.' },
  { icon: <FileLock className="text-teal-400" />, title: 'Data Privacy', description: 'Ensuring data privacy in systems.' },
  { icon: <Users className="text-teal-400" />, title: 'Collaboration', description: 'Group exercises for teamwork.' },
];

function FeaturesGrid() {
  return (
    <section className="bg-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-semibold text-teal-400 mb-8">Platform Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-700 p-6 rounded-lg shadow-lg hover:bg-gray-600 transition duration-200">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-teal-400 mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesGrid;

