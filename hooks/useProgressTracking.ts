import { useCallback } from 'react';
import { useProgress } from '../contexts/ProgressContext';
import { ProgressStep } from '../components/RealTimeProgressBar';

export const useProgressTracking = () => {
  const {
    startProgress,
    updateStep,
    completeStep,
    errorStep,
    setStepProgress,
    hideProgress,
    resetProgress
  } = useProgress();

  // Track an async operation with progress steps
  const trackAsyncOperation = useCallback(async <T>(
    operationName: string,
    steps: ProgressStep[],
    operation: (progressCallback: (stepId: string, progress: number) => void) => Promise<T>,
    showAccomplishments = true
  ): Promise<T> => {
    try {
      // Start progress tracking
      startProgress(operationName, steps, showAccomplishments);
      
      // Execute the operation with progress callback
      const result = await operation((stepId: string, progress: number) => {
        setStepProgress(stepId, progress);
      });
      
      // Complete all remaining steps
      steps.forEach(step => {
        if (step.status !== 'completed') {
          completeStep(step.id);
        }
      });
      
      return result;
    } catch (error) {
      // Mark current step as error
      const currentStep = steps.find(step => step.status === 'in_progress');
      if (currentStep) {
        errorStep(currentStep.id, error instanceof Error ? error.message : 'Unknown error');
      }
      throw error;
    }
  }, [startProgress, setStepProgress, completeStep, errorStep]);

  // Track a simple loading operation
  const trackLoading = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T>,
    showAccomplishments = true
  ): Promise<T> => {
    const steps: ProgressStep[] = [
      {
        id: 'loading',
        title: operationName,
        description: 'Please wait...',
        status: 'in_progress'
      }
    ];

    return trackAsyncOperation(operationName, steps, async (progressCallback) => {
      progressCallback('loading', 50);
      const result = await operation();
      progressCallback('loading', 100);
      return result;
    }, showAccomplishments);
  }, [trackAsyncOperation]);

  // Track API calls with detailed steps
  const trackAPICall = useCallback(async <T>(
    apiName: string,
    steps: ProgressStep[],
    apiCall: (progressCallback: (stepId: string, progress: number) => void) => Promise<T>,
    showAccomplishments = true
  ): Promise<T> => {
    return trackAsyncOperation(apiName, steps, apiCall, showAccomplishments);
  }, [trackAsyncOperation]);

  // Track file operations
  const trackFileOperation = useCallback(async <T>(
    operationName: string,
    steps: ProgressStep[],
    operation: (progressCallback: (stepId: string, progress: number) => void) => Promise<T>,
    showAccomplishments = true
  ): Promise<T> => {
    return trackAsyncOperation(operationName, steps, operation, showAccomplishments);
  }, [trackAsyncOperation]);

  // Track data processing
  const trackDataProcessing = useCallback(async <T>(
    processName: string,
    steps: ProgressStep[],
    process: (progressCallback: (stepId: string, progress: number) => void) => Promise<T>,
    showAccomplishments = true
  ): Promise<T> => {
    return trackAsyncOperation(processName, steps, process, showAccomplishments);
  }, [trackAsyncOperation]);

  return {
    trackAsyncOperation,
    trackLoading,
    trackAPICall,
    trackFileOperation,
    trackDataProcessing,
    hideProgress,
    resetProgress,
    // Direct access to context methods
    startProgress,
    updateStep,
    completeStep,
    errorStep,
    setStepProgress
  };
};

// Predefined step templates for common operations
export const ProgressSteps = {
  // Learning plan generation
  learningPlanGeneration: (): ProgressStep[] => [
    {
      id: 'analyze_requirements',
      title: 'Analyzing Requirements',
      description: 'Understanding your learning goals and level',
      status: 'pending'
    },
    {
      id: 'generate_curriculum',
      title: 'Generating Curriculum',
      description: 'Creating personalized learning modules',
      status: 'pending'
    },
    {
      id: 'create_exercises',
      title: 'Creating Exercises',
      description: 'Building interactive learning activities',
      status: 'pending'
    },
    {
      id: 'finalize_plan',
      title: 'Finalizing Plan',
      description: 'Preparing your personalized learning path',
      status: 'pending'
    }
  ],

  // AI Response generation
  aiResponseGeneration: (): ProgressStep[] => [
    {
      id: 'process_input',
      title: 'Processing Input',
      description: 'Understanding your question',
      status: 'pending'
    },
    {
      id: 'generate_response',
      title: 'Generating Response',
      description: 'Creating personalized answer',
      status: 'pending'
    },
    {
      id: 'format_output',
      title: 'Formatting Output',
      description: 'Preparing response for display',
      status: 'pending'
    }
  ],

  // Data loading
  dataLoading: (): ProgressStep[] => [
    {
      id: 'connect_database',
      title: 'Connecting to Database',
      description: 'Establishing secure connection',
      status: 'pending'
    },
    {
      id: 'fetch_data',
      title: 'Fetching Data',
      description: 'Retrieving your information',
      status: 'pending'
    },
    {
      id: 'process_data',
      title: 'Processing Data',
      description: 'Organizing and preparing data',
      status: 'pending'
    }
  ],

  // File upload
  fileUpload: (): ProgressStep[] => [
    {
      id: 'validate_file',
      title: 'Validating File',
      description: 'Checking file format and size',
      status: 'pending'
    },
    {
      id: 'upload_file',
      title: 'Uploading File',
      description: 'Transferring file to server',
      status: 'pending'
    },
    {
      id: 'process_file',
      title: 'Processing File',
      description: 'Analyzing and storing content',
      status: 'pending'
    }
  ],

  // Challenge generation
  challengeGeneration: (): ProgressStep[] => [
    {
      id: 'select_topic',
      title: 'Selecting Topic',
      description: 'Choosing appropriate challenge topic',
      status: 'pending'
    },
    {
      id: 'create_questions',
      title: 'Creating Questions',
      description: 'Generating engaging questions',
      status: 'pending'
    },
    {
      id: 'validate_answers',
      title: 'Validating Answers',
      description: 'Ensuring correct solutions',
      status: 'pending'
    }
  ]
};

