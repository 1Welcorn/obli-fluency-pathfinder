import React from 'react';
import { useProgressTracking, ProgressSteps } from '../hooks/useProgressTracking';

interface ProgressBarDemoProps {
  onBack: () => void;
}

const ProgressBarDemo: React.FC<ProgressBarDemoProps> = ({ onBack }) => {
  const { trackAsyncOperation, trackLoading } = useProgressTracking();

  const testLearningPlanGeneration = async () => {
    const steps = ProgressSteps.learningPlanGeneration();
    
    await trackAsyncOperation(
      'Demo: Learning Plan Generation',
      steps,
      async (progressCallback) => {
        // Simulate each step with realistic delays
        progressCallback('analyze_requirements', 10);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        progressCallback('analyze_requirements', 50);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        progressCallback('generate_curriculum', 20);
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        progressCallback('generate_curriculum', 60);
        await new Promise(resolve => setTimeout(resolve, 900));
        
        progressCallback('create_exercises', 30);
        await new Promise(resolve => setTimeout(resolve, 1100));
        
        progressCallback('create_exercises', 80);
        await new Promise(resolve => setTimeout(resolve, 700));
        
        progressCallback('finalize_plan', 40);
        await new Promise(resolve => setTimeout(resolve, 600));
        
        progressCallback('finalize_plan', 100);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    );
  };

  const testAIGeneration = async () => {
    const steps = ProgressSteps.aiResponseGeneration();
    
    await trackAsyncOperation(
      'Demo: AI Response Generation',
      steps,
      async (progressCallback) => {
        progressCallback('process_input', 20);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        progressCallback('process_input', 60);
        await new Promise(resolve => setTimeout(resolve, 600));
        
        progressCallback('generate_response', 30);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        progressCallback('generate_response', 80);
        await new Promise(resolve => setTimeout(resolve, 700));
        
        progressCallback('format_output', 50);
        await new Promise(resolve => setTimeout(resolve, 400));
        
        progressCallback('format_output', 100);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    );
  };

  const testDataLoading = async () => {
    const steps = ProgressSteps.dataLoading();
    
    await trackAsyncOperation(
      'Demo: Data Loading',
      steps,
      async (progressCallback) => {
        progressCallback('connect_database', 25);
        await new Promise(resolve => setTimeout(resolve, 600));
        
        progressCallback('fetch_data', 30);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        progressCallback('fetch_data', 70);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        progressCallback('process_data', 40);
        await new Promise(resolve => setTimeout(resolve, 700));
        
        progressCallback('process_data', 100);
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    );
  };

  const testSimpleLoading = async () => {
    await trackLoading(
      'Demo: Simple Loading',
      async () => {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return 'Loading complete!';
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Real-Time Progress Bar Demo
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Test the new real-time accomplishment bar system. Click any button below to see progress tracking in action!
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to App
          </button>
        </div>

        {/* Demo Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              🎓 Learning Plan Generation
            </h3>
            <p className="text-gray-600 mb-4">
              Simulates the complete learning plan creation process with detailed progress steps.
            </p>
            <button
              onClick={testLearningPlanGeneration}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Start Learning Plan Demo
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              🤖 AI Response Generation
            </h3>
            <p className="text-gray-600 mb-4">
              Shows how AI responses are processed with real-time progress updates.
            </p>
            <button
              onClick={testAIGeneration}
              className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
            >
              Start AI Response Demo
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              📊 Data Loading
            </h3>
            <p className="text-gray-600 mb-4">
              Demonstrates database connection and data retrieval progress.
            </p>
            <button
              onClick={testDataLoading}
              className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Start Data Loading Demo
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              ⚡ Simple Loading
            </h3>
            <p className="text-gray-600 mb-4">
              Basic loading operation with automatic progress tracking.
            </p>
            <button
              onClick={testSimpleLoading}
              className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Start Simple Loading Demo
            </button>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            ✨ Progress Bar Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Real-time Progress</h3>
              <p className="text-sm text-gray-600">Live progress updates with smooth animations</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Accomplishments</h3>
              <p className="text-sm text-gray-600">Celebrate completed steps with visual feedback</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Easy Integration</h3>
              <p className="text-sm text-gray-600">Simple hooks for any async operation</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Step Tracking</h3>
              <p className="text-sm text-gray-600">Detailed step-by-step progress monitoring</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Error Handling</h3>
              <p className="text-sm text-gray-600">Graceful error states and recovery</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Beautiful UI</h3>
              <p className="text-sm text-gray-600">Modern, responsive design with animations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBarDemo;

