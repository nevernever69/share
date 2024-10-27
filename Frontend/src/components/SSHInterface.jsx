import React, { useState, useEffect } from 'react';
import { Terminal, Server, Cloud, Shield } from 'lucide-react';
import SSHTerminal from './SSHTerminal';
const LoadingScreen = ({ onLoadingComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const loadingSteps = [
    { text: "Initializing cloud environment...", icon: Cloud },
    { text: "Configuring virtual machine...", icon: Server },
    { text: "Establishing secure connection...", icon: Shield },
    { text: "Preparing terminal interface...", icon: Terminal }
  ];

  const technicalTerms = [
    "SSH Handshake",
    "TCP/IP Configuration",
    "DNS Resolution",
    "Security Groups",
    "VPC Configuration",
    "IAM Authentication",
    "Network ACLs",
    "Subnet Routing",
    "EC2 Instance Launch",
    "Key Pair Validation"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < loadingSteps.length - 1) return prev + 1;
        clearInterval(timer);
        setTimeout(onLoadingComplete, 1000);
        return prev;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Launching Lab Environment
          </h2>
          <p className="text-gray-400">Please wait while we set up your lab</p>
        </div>

        {/* Main loading steps */}
        <div className="space-y-4">
          {loadingSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-500 ${
                  index === currentStep
                    ? 'bg-blue-600/20 text-blue-400'
                    : index < currentStep
                    ? 'text-green-400'
                    : 'text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{step.text}</span>
                {index === currentStep && (
                  <div className="flex-grow flex justify-end">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Technical terms ticker */}
        <div className="mt-8 h-6 overflow-hidden">
          <div className="animate-ticker flex flex-col">
            {[...technicalTerms, ...technicalTerms].map((term, index) => (
              <div
                key={index}
                className="py-1 text-sm text-gray-400 text-center"
              >
                {term}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const LabEnvironment = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div>
      {/* {isLoading ? (
      
      ) : (
        <SSHTerminal />
      )} */}
        <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
    </div>
  );
};

export default LabEnvironment;