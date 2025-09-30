import React, { useState, useEffect } from 'react';

export interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  progress?: number; // 0-100
  timestamp?: Date;
}

interface RealTimeProgressBarProps {
  steps: ProgressStep[];
  currentStepId?: string;
  isVisible: boolean;
  title?: string;
  onComplete?: () => void;
  showAccomplishments?: boolean;
  className?: string;
}

const RealTimeProgressBar: React.FC<RealTimeProgressBarProps> = ({
  steps,
  currentStepId,
  isVisible,
  title = "Processing...",
  onComplete,
  showAccomplishments = true,
  className = ""
}) => {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [accomplishments, setAccomplishments] = useState<string[]>([]);

  // Calculate overall progress
  useEffect(() => {
    const totalSteps = steps.length;
    const completedCount = steps.filter(step => step.status === 'completed').length;
    const inProgressStep = steps.find(step => step.status === 'in_progress');
    
    let progress = (completedCount / totalSteps) * 100;
    
    // Add partial progress for current step
    if (inProgressStep && inProgressStep.progress !== undefined) {
      progress += (inProgressStep.progress / totalSteps);
    }
    
    setCurrentProgress(Math.min(100, Math.max(0, progress)));
  }, [steps]);

  // Track completed steps and show accomplishments
  useEffect(() => {
    const newCompletedSteps = steps
      .filter(step => step.status === 'completed' && !completedSteps.includes(step.id))
      .map(step => step.id);

    if (newCompletedSteps.length > 0) {
      setCompletedSteps(prev => [...prev, ...newCompletedSteps]);
      
      if (showAccomplishments) {
        newCompletedSteps.forEach(stepId => {
          const step = steps.find(s => s.id === stepId);
          if (step) {
            setAccomplishments(prev => [...prev, step.title]);
            // Auto-remove accomplishment after 3 seconds
            setTimeout(() => {
              setAccomplishments(prev => prev.filter(acc => acc !== step.title));
            }, 3000);
          }
        });
      }
    }
  }, [steps, completedSteps, showAccomplishments]);

  // Check if all steps are completed
  useEffect(() => {
    const allCompleted = steps.every(step => step.status === 'completed');
    if (allCompleted && onComplete) {
      setTimeout(() => onComplete(), 500); // Small delay for visual feedback
    }
  }, [steps, onComplete]);

  if (!isVisible) return null;

  const currentStep = steps.find(step => step.id === currentStepId) || 
                     steps.find(step => step.status === 'in_progress');

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="w-full h-full border-4 border-blue-200 rounded-full"></div>
            <div 
              className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
              style={{ 
                animationDuration: '1s',
                transform: `rotate(${currentProgress * 3.6}deg)`
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {Math.round(currentProgress)}%
              </span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          {currentStep && (
            <p className="text-gray-600 text-sm">
              {currentStep.description || currentStep.title}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${currentProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0%</span>
            <span className="font-medium">{Math.round(currentProgress)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3 mb-6">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                step.status === 'completed' 
                  ? 'bg-green-50 border border-green-200' 
                  : step.status === 'in_progress'
                  ? 'bg-blue-50 border border-blue-200'
                  : step.status === 'error'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              {/* Step Icon */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step.status === 'completed' 
                  ? 'bg-green-500 text-white' 
                  : step.status === 'in_progress'
                  ? 'bg-blue-500 text-white animate-pulse'
                  : step.status === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {step.status === 'completed' ? '✓' : 
                 step.status === 'error' ? '✕' : 
                 index + 1}
              </div>
              
              {/* Step Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    step.status === 'completed' ? 'text-green-800' :
                    step.status === 'in_progress' ? 'text-blue-800' :
                    step.status === 'error' ? 'text-red-800' :
                    'text-gray-600'
                  }`}>
                    {step.title}
                  </span>
                  {step.status === 'in_progress' && step.progress !== undefined && (
                    <span className="text-xs text-blue-600 font-medium">
                      {step.progress}%
                    </span>
                  )}
                </div>
                {step.description && (
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Accomplishments */}
        {showAccomplishments && accomplishments.length > 0 && (
          <div className="space-y-2">
            <div className="text-center">
              <span className="text-sm font-medium text-green-600">✨ Accomplishments</span>
            </div>
            {accomplishments.map((accomplishment, index) => (
              <div 
                key={index}
                className="bg-green-100 border border-green-200 rounded-lg p-2 text-center animate-slide-in"
              >
                <span className="text-sm text-green-800 font-medium">
                  ✓ {accomplishment}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Current Activity Indicator */}
        {currentStep && currentStep.status === 'in_progress' && (
          <div className="text-center mt-4">
            <div className="inline-flex items-center space-x-2 text-blue-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeProgressBar;

