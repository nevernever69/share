import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Book, Server, Cpu, Cloud, Users, Shield, Award, ChevronRight, Grid } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './footer';
const LabsPage = () => {
  const navigate = useNavigate();
  const labs = [
    {
      title: "Cloud Security Lab - AWS",
      description: "Practice security configurations and forensics in AWS environment",
      icon: Cloud,
      difficulty: "Intermediate",
      duration: "2 hours",
      machineType: "t2.micro",
      status: "launch"
    },
    {
      title: "Digital Forensics Lab",
      description: "Learn incident response and forensic investigation techniques",
      icon: Shield,
      difficulty: "Advanced",
      duration: "3 hours",
      machineType: "t2.small",
      status: "upcoming"
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold py-8 text-white mb-8 text-center">Virtual Labs</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {labs.map((lab, index) => (
            <div 
              key={index} 
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <lab.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-white">{lab.title}</h3>
                    <p className="text-sm text-gray-400">{lab.difficulty} • {lab.duration}</p>
                  </div>
                </div>
                <p className="text-gray-400 mb-6 flex-grow">{lab.description}</p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Server className="w-4 h-4" />
                    <span>{lab.machineType}</span>
                  </div>
                  {lab.status === "launch" ? (
                    <button 
                      onClick={() => navigate('/labenv')}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      Launch Lab
                      <ChevronRight className="ml-2 w-5 h-5" />
                    </button>
                  ) : (
                    <div className="w-full py-2 bg-gray-600 text-white rounded-lg flex items-center justify-center cursor-not-allowed">
                      Upcoming...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
  


export default LabsPage;