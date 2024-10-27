import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Book, Server, Cpu, Cloud, Users, Shield, Award, ChevronRight, Grid } from 'lucide-react';

// Reusable Card Component
const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="p-6 bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full">
    <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-600 rounded-lg">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

// Homepage Component
const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Navigation */}
      <nav className="h-16 w-full px-6 bg-gray-800 border-b border-gray-700">
        <div className="h-full w-full flex justify-between items-center max-w-screen-2xl mx-auto">
          <div className="flex items-center space-x-3">
            <Grid className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-white hover:cursor-pointer" onClick={() => navigate('/')}>
              SkillsDA
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <button className="text-gray-300 hover:text-white transition-colors">Home</button>
            <button 
              onClick={() => navigate('/labs')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Virtual Labs
            </button>
            <button className="text-gray-300 hover:text-white transition-colors">About</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow flex flex-col gap-24">
        {/* Hero Section */}
        <div className="w-full min-h-[600px] bg-gray-900 flex items-start pt-24">
          <div className="w-full max-w-screen-2xl mx-auto px-6">
            <div className="max-w-2xl">
              <h1 className="text-6xl font-bold text-white mb-8">
                Master Cloud Security and
                <span className="text-blue-500"> Digital Forensics</span>
              </h1>
              <p className="text-xl text-gray-400 mb-12">
                Experience hands-on learning with our state-of-the-art virtual labs. 
                Practice real-world scenarios in a secure environment.
              </p>
              <button 
                onClick={() => navigate('/labs')}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
              >
                Launch Virtual Labs
                <ChevronRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="w-full bg-gray-900 pb-24">
          <div className="w-full max-w-screen-2xl mx-auto px-6">
            <div className="max-w-2xl mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Why Choose SkillSDA?</h2>
              <p className="text-xl text-gray-400">
                Comprehensive cloud security and digital forensics training platform
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={Cloud}
                title="Cloud-Native Labs"
                description="Practice on real cloud environments with hands-on exercises and scenarios"
              />
              <FeatureCard
                icon={Shield}
                title="Security Focus"
                description="Learn industry-standard security practices and forensic techniques"
              />
              <FeatureCard
                icon={Terminal}
                title="Interactive Console"
                description="Access cloud resources through our secure web-based terminal"
              />
              <FeatureCard
                icon={Users}
                title="Collaborative Learning"
                description="Work on team projects and share knowledge with peers"
              />
              <FeatureCard
                icon={Award}
                title="Certifications"
                description="Prepare for industry-recognized certifications with guided labs"
              />
              <FeatureCard
                icon={Cpu}
                title="Virtual Machines"
                description="Access dedicated VMs for hands-on practice and experimentation"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
