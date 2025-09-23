import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface CurriculumOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
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
  if (!isOpen) return null;

  const curriculum = curriculumData[gradeLevel];

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
                📚 <strong>Visão Geral do Currículo:</strong> Conheça os pontos-chave que serão abordados no seu nível de estudo.
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">
                Key Learning Areas
                {isPortugueseHelpVisible && (
                  <span className="block text-sm font-normal text-slate-500 italic">
                    Áreas Principais de Aprendizagem
                  </span>
                )}
              </h4>
              
              <div className="space-y-3">
                {curriculum.keyPoints.slice(0, Math.ceil(curriculum.keyPoints.length / 2)).map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-semibold text-indigo-600">{index + 1}</span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">
                Additional Focus Areas
                {isPortugueseHelpVisible && (
                  <span className="block text-sm font-normal text-slate-500 italic">
                    Áreas Adicionais de Foco
                  </span>
                )}
              </h4>
              
              <div className="space-y-3">
                {curriculum.keyPoints.slice(Math.ceil(curriculum.keyPoints.length / 2)).map((point, index) => (
                  <div key={index + Math.ceil(curriculum.keyPoints.length / 2)} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-semibold text-indigo-600">{index + Math.ceil(curriculum.keyPoints.length / 2) + 1}</span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
            <h4 className="text-lg font-semibold text-indigo-800 mb-3">
              🎯 How Your Personalized Plan Will Work
            </h4>
            <p className="text-indigo-700 text-sm leading-relaxed mb-4">
              Based on these curriculum points and your specific needs, our AI will create a tailored learning plan that:
            </p>
            <ul className="text-indigo-700 text-sm space-y-2">
              <li>• <strong>Prioritizes</strong> the most relevant skills for your goals</li>
              <li>• <strong>Sequences</strong> learning in the optimal order</li>
              <li>• <strong>Adapts</strong> to your current level and learning style</li>
              <li>• <strong>Includes</strong> practical exercises and real-world applications</li>
            </ul>
            {isPortugueseHelpVisible && (
              <p className="text-xs text-indigo-600 italic mt-3">
                Como Seu Plano Personalizado Funcionará: Com base nestes pontos do currículo e suas necessidades específicas, nossa IA criará um plano de aprendizado sob medida.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-slate-600 font-medium hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onContinue}
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
          >
            Create My Personalized Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurriculumOverviewModal;
