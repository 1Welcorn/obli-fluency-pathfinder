import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface CurriculumOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (selectedAreas: string[]) => void;
  gradeLevel: string;
  isPortugueseHelpVisible: boolean;
}

const curriculumData: { [key: string]: { title: string, keyPoints: string[], description: string } } = {
  junior: {
    title: "Junior Level Curriculum (4th - 5th Grade)",
    description: "Foundation building with basic communication skills",
    keyPoints: [
      "Basic vocabulary (family, school, colors, numbers 1-100)",
      "Present tense verbs (be, have, go, like, want)",
      "Simple sentence structure (Subject + Verb + Object)",
      "Question words (what, where, when, who, why)",
      "Basic adjectives (big, small, happy, sad, good, bad)",
      "Simple prepositions (in, on, under, next to)",
      "Basic time expressions (today, yesterday, tomorrow)",
      "Personal information (name, age, where you live)",
      "Simple present continuous (I am eating, she is playing)",
      "Basic plurals and articles (a, an, the)"
    ]
  },
  level1: {
    title: "Level 1 Curriculum (6th - 7th Grade)",
    description: "Expanding communication with past and future tenses",
    keyPoints: [
      "Extended vocabulary (hobbies, food, clothing, weather)",
      "Past tense (regular and irregular verbs)",
      "Future tense with 'will' and 'going to'",
      "Modal verbs (can, could, should, must, may)",
      "Comparative and superlative adjectives",
      "Present perfect tense (have/has + past participle)",
      "Conditional sentences (if + present, will + base)",
      "Adverbs of frequency (always, usually, sometimes, never)",
      "Compound sentences with 'and', 'but', 'or'",
      "Basic phrasal verbs (get up, turn on, look for)"
    ]
  },
  level2: {
    title: "Level 2 Curriculum (8th - 9th Grade)",
    description: "Advanced grammar and complex communication",
    keyPoints: [
      "Academic vocabulary and formal language",
      "Past perfect tense (had + past participle)",
      "Passive voice (is/was + past participle)",
      "Reported speech (he said that...)",
      "Second and third conditionals",
      "Gerunds and infinitives",
      "Advanced phrasal verbs and idioms",
      "Complex sentence structures",
      "Opinion expressions (I believe, in my opinion)",
      "Cause and effect language (because, therefore, as a result)"
    ]
  },
  upper: {
    title: "Upper Level Curriculum (High School & Adults)",
    description: "Mastery of complex language and critical thinking",
    keyPoints: [
      "Sophisticated vocabulary and academic language",
      "Subjunctive mood and advanced conditionals",
      "Complex sentence structures and clauses",
      "Formal and informal register differences",
      "Debate and argumentation skills",
      "Literary analysis and critical thinking",
      "Professional communication skills",
      "Cultural awareness and idiomatic expressions",
      "Advanced grammar structures (inversions, cleft sentences)",
      "Research and presentation skills"
    ]
  }
};

const gradeLabels: { [key: string]: string } = {
  junior: 'Junior (4th - 5th Grade)',
  level1: 'Level 1 (6th - 7th Grade)',
  level2: 'Level 2 (8th - 9th Grade)',
  upper: 'Upper/Free (High School & Adults)'
};

const CurriculumOverviewModal: React.FC<CurriculumOverviewModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  gradeLevel,
  isPortugueseHelpVisible
}) => {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  // Reset selection when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedAreas([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const curriculum = curriculumData[gradeLevel];

  const handleAreaToggle = (area: string) => {
    setSelectedAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleContinue = () => {
    if (selectedAreas.length > 0) {
      onContinue(selectedAreas);
    }
  };

  const isMinimumSelected = selectedAreas.length >= 2;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                {curriculum.title}
              </h3>
              <p className="text-slate-600">{curriculum.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <CloseIcon className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isPortugueseHelpVisible && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                📚 <strong>Selecione as Áreas de Foco:</strong> Escolha pelo menos 2 áreas que mais te interessam para criar seu plano personalizado.
              </p>
            </div>
          )}

          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <h4 className="text-lg font-semibold text-indigo-800 mb-2">
              🎯 Select Your Focus Areas
              {isPortugueseHelpVisible && (
                <span className="block text-sm font-normal text-indigo-600 italic">
                  Selecione suas Áreas de Foco
                </span>
              )}
            </h4>
            <p className="text-indigo-700 text-sm mb-3">
              Choose at least 2 areas that interest you most. Our AI will create a personalized learning plan focused on these areas.
            </p>
            <p className="text-indigo-600 text-xs">
              Selected: {selectedAreas.length} areas {selectedAreas.length >= 2 ? '✅' : '⚠️ (minimum 2 required)'}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">
              Curriculum Areas - Click to Select
              {isPortugueseHelpVisible && (
                <span className="block text-sm font-normal text-slate-500 italic">
                  Áreas do Currículo - Clique para Selecionar
                </span>
              )}
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              {curriculum.keyPoints.map((point, index) => {
                const isSelected = selectedAreas.includes(point);
                return (
                  <div
                    key={index}
                    onClick={() => handleAreaToggle(point)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                        isSelected ? 'bg-indigo-500' : 'bg-slate-200'
                      }`}>
                        {isSelected ? (
                          <span className="text-white text-xs font-bold">✓</span>
                        ) : (
                          <span className="text-slate-500 text-xs font-semibold">{index + 1}</span>
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed ${
                        isSelected ? 'text-indigo-800 font-medium' : 'text-slate-700'
                      }`}>
                        {point}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <h4 className="text-lg font-semibold text-green-800 mb-3">
              🚀 Your Personalized Plan Creation
            </h4>
            <p className="text-green-700 text-sm leading-relaxed mb-4">
              Based on your selected focus areas, our AI will create a tailored learning plan that:
            </p>
            <ul className="text-green-700 text-sm space-y-2">
              <li>• <strong>Focuses</strong> on your selected curriculum areas</li>
              <li>• <strong>Prioritizes</strong> the most relevant skills for your goals</li>
              <li>• <strong>Sequences</strong> learning in the optimal order</li>
              <li>• <strong>Adapts</strong> to your current level and learning style</li>
              <li>• <strong>Includes</strong> practical exercises and real-world applications</li>
            </ul>
            {isPortugueseHelpVisible && (
              <p className="text-xs text-green-600 italic mt-3">
                Criação do Seu Plano Personalizado: Com base nas suas áreas de foco selecionadas, nossa IA criará um plano de aprendizado sob medida.
              </p>
            )}
          </div>

          {/* Selection Summary */}
          {selectedAreas.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="text-blue-800 font-semibold mb-2">
                📋 Your Selected Focus Areas:
              </h5>
              <div className="flex flex-wrap gap-2">
                {selectedAreas.map((area, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-300"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-slate-600 font-medium hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!isMinimumSelected}
            className={`px-8 py-3 font-semibold rounded-lg transition-colors shadow-lg ${
              isMinimumSelected 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isMinimumSelected 
              ? `Create Plan with ${selectedAreas.length} Focus Areas` 
              : 'Select at Least 2 Areas to Continue'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurriculumOverviewModal;
