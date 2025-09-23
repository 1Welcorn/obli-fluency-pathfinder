import React, { useState } from 'react';
import { suggestGoal } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { BeakerIcon } from './icons/BeakerIcon';
import { DecorativeBlobs } from './DecorativeBlobs';
import PlacementTestModal from './PlacementTestModal';
import CurriculumOverviewModal from './CurriculumOverviewModal';

interface WelcomeScreenProps {
  onStart: (studentNeeds: string, gradeLevel: string) => void;
  isPortugueseHelpVisible: boolean;
}

const gradeLevels = [
  { value: 'junior', label: 'Junior (4th - 5th Grade)' },
  { value: 'level1', label: 'Level 1 (6th - 7th Grade)' },
  { value: 'level2', label: 'Level 2 (8th - 9th Grade)' },
  { value: 'upper', label: 'Upper/Free (High School & Adults)' },
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, isPortugueseHelpVisible }) => {
  const [grade, setGrade] = useState('');
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [isPlacementTestOpen, setIsPlacementTestOpen] = useState(false);
  const [isCurriculumOverviewOpen, setIsCurriculumOverviewOpen] = useState(false);


  const handleSuggestGoal = () => {
    if (!grade) return;
    setIsCurriculumOverviewOpen(true);
  };

  const handleCurriculumOverviewContinue = async (selectedAreas: string[]) => {
    setIsCurriculumOverviewOpen(false);
    setIsSuggestionLoading(true);
    setSuggestionError(null);
    
    try {
        const goal = await suggestGoal(grade, selectedAreas);
        // Automatically proceed to create the plan
        onStart(goal, grade);
    } catch (err) {
        console.error('Error suggesting goal:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        
        // Provide more specific error messages based on the error type
        if (errorMessage.includes('API_KEY') || errorMessage.includes('API key')) {
            setSuggestionError("AI service is not configured. Please contact your teacher to set up the AI features.");
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
            setSuggestionError("Network error. Please check your internet connection and try again.");
        } else {
            setSuggestionError("Sorry, I couldn't come up with a suggestion right now. Please try again.");
        }
    } finally {
        setIsSuggestionLoading(false);
    }
  };

  const handlePlacementTestComplete = (recommendedGrade: string) => {
    setGrade(recommendedGrade);
    setIsPlacementTestOpen(false);
  };

  return (
    <div className="relative flex items-center justify-center min-h-full animate-fade-in py-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <DecorativeBlobs />
        </div>
        <div className="relative z-10 w-full max-w-2xl">
             <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-slate-200 text-center">
                <h1 className="text-5xl font-extrabold text-slate-800 mb-2">Welcome to the OBLI Pathfinder!</h1>
                <p className="text-lg text-slate-600 mb-8">
                    Your journey to English fluency starts here. Let's create your unique learning path!
                </p>
                <div className="w-full text-left space-y-6">
                    <div>
                        <label htmlFor="grade-level" className="block text-lg font-medium text-slate-700 mb-2">
                            Select your competition level
                        </label>
                        {isPortugueseHelpVisible && (
                            <p className="text-sm text-slate-500 italic mb-3">
                                🇧🇷 Selecione o nível da sua competição
                            </p>
                        )}
                        <select
                            id="grade-level"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="w-full p-4 text-lg border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white shadow-lg hover:shadow-xl"
                        >
                            <option value="" disabled>Choose your level...</option>
                            {gradeLevels.map(level => (
                                <option key={level.value} value={level.value}>{level.label}</option>
                            ))}
                        </select>
                    </div>

                    {grade && (
                        <div className="text-center">
                            <button
                                onClick={handleSuggestGoal}
                                disabled={isSuggestionLoading}
                                className={`w-full flex items-center justify-center gap-3 font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg ${
                                    isSuggestionLoading
                                        ? 'bg-slate-400 text-white cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                            >
                                <SparklesIcon className="h-7 w-7" />
                                {isSuggestionLoading ? 'Creating Your Plan...' : 'Continue to Learning Plan'}
                            </button>
                            {isPortugueseHelpVisible && (
                                <p className="text-sm text-slate-500 italic mt-2">
                                    🇧🇷 {isSuggestionLoading ? 'Criando Seu Plano...' : 'Continuar para o Plano de Aprendizado'}
                                </p>
                            )}
                            {suggestionError && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-600 text-sm">{suggestionError}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
        
        {/* Placement Test Modal */}
        <PlacementTestModal
          isOpen={isPlacementTestOpen}
          onClose={() => setIsPlacementTestOpen(false)}
          onComplete={handlePlacementTestComplete}
          isPortugueseHelpVisible={isPortugueseHelpVisible}
        />
        
        {/* Curriculum Overview Modal */}
        <CurriculumOverviewModal
          isOpen={isCurriculumOverviewOpen}
          onClose={() => setIsCurriculumOverviewOpen(false)}
          onContinue={handleCurriculumOverviewContinue}
          gradeLevel={grade}
          isPortugueseHelpVisible={isPortugueseHelpVisible}
        />
    </div>
  );
};

export default WelcomeScreen;