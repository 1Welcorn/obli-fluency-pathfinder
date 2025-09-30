import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ProgressStep } from '../components/RealTimeProgressBar';

interface ProgressContextType {
  isVisible: boolean;
  steps: ProgressStep[];
  currentStepId: string | null;
  title: string;
  showAccomplishments: boolean;
  
  // Actions
  startProgress: (title: string, steps: ProgressStep[], showAccomplishments?: boolean) => void;
  updateStep: (stepId: string, updates: Partial<ProgressStep>) => void;
  completeStep: (stepId: string) => void;
  errorStep: (stepId: string, error?: string) => void;
  setStepProgress: (stepId: string, progress: number) => void;
  hideProgress: () => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

interface ProgressProviderProps {
  children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [steps, setSteps] = useState<ProgressStep[]>([]);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [title, setTitle] = useState('Processing...');
  const [showAccomplishments, setShowAccomplishments] = useState(true);

  const startProgress = useCallback((newTitle: string, newSteps: ProgressStep[], showAccomplishments = true) => {
    setTitle(newTitle);
    setSteps(newSteps);
    setCurrentStepId(newSteps[0]?.id || null);
    setShowAccomplishments(showAccomplishments);
    setIsVisible(true);
  }, []);

  const updateStep = useCallback((stepId: string, updates: Partial<ProgressStep>) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? { ...step, ...updates, timestamp: new Date() }
          : step
      )
    );
  }, []);

  const completeStep = useCallback((stepId: string) => {
    updateStep(stepId, { 
      status: 'completed',
      progress: 100,
      timestamp: new Date()
    });
    
    // Move to next step
    setSteps(prevSteps => {
      const currentIndex = prevSteps.findIndex(step => step.id === stepId);
      const nextStep = prevSteps[currentIndex + 1];
      if (nextStep) {
        setCurrentStepId(nextStep.id);
        updateStep(nextStep.id, { status: 'in_progress' });
      }
      return prevSteps;
    });
  }, [updateStep]);

  const errorStep = useCallback((stepId: string, error?: string) => {
    updateStep(stepId, { 
      status: 'error',
      description: error || 'An error occurred',
      timestamp: new Date()
    });
  }, [updateStep]);

  const setStepProgress = useCallback((stepId: string, progress: number) => {
    updateStep(stepId, { 
      progress: Math.max(0, Math.min(100, progress)),
      status: 'in_progress'
    });
  }, [updateStep]);

  const hideProgress = useCallback(() => {
    setIsVisible(false);
  }, []);

  const resetProgress = useCallback(() => {
    setIsVisible(false);
    setSteps([]);
    setCurrentStepId(null);
    setTitle('Processing...');
    setShowAccomplishments(true);
  }, []);

  const value: ProgressContextType = {
    isVisible,
    steps,
    currentStepId,
    title,
    showAccomplishments,
    startProgress,
    updateStep,
    completeStep,
    errorStep,
    setStepProgress,
    hideProgress,
    resetProgress,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

