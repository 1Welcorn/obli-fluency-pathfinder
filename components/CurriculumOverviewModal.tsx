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

const curriculumData: { [key: string]: { title: string, keyPoints: { english: string, portuguese: string }[], description: string } } = {
  junior: {
    title: "Junior Level Curriculum (4th - 5th Grade)",
    description: "Foundation building with basic communication skills",
    keyPoints: [
      {
        english: "Basic vocabulary (family, school, colors, numbers 1-100)",
        portuguese: "Vocabulário básico (família, escola, cores, números 1-100)"
      },
      {
        english: "Present tense verbs (be, have, go, like, want)",
        portuguese: "Verbos no presente (ser, ter, ir, gostar, querer)"
      },
      {
        english: "Simple sentence structure (Subject + Verb + Object)",
        portuguese: "Estrutura simples de frases (Sujeito + Verbo + Objeto)"
      },
      {
        english: "Question words (what, where, when, who, why)",
        portuguese: "Palavras interrogativas (o que, onde, quando, quem, por que)"
      },
      {
        english: "Basic adjectives (big, small, happy, sad, good, bad)",
        portuguese: "Adjetivos básicos (grande, pequeno, feliz, triste, bom, ruim)"
      },
      {
        english: "Simple prepositions (in, on, under, next to)",
        portuguese: "Preposições simples (em, sobre, embaixo, ao lado de)"
      },
      {
        english: "Basic time expressions (today, yesterday, tomorrow)",
        portuguese: "Expressões de tempo básicas (hoje, ontem, amanhã)"
      },
      {
        english: "Personal information (name, age, where you live)",
        portuguese: "Informações pessoais (nome, idade, onde você mora)"
      },
      {
        english: "Simple present continuous (I am eating, she is playing)",
        portuguese: "Presente contínuo simples (eu estou comendo, ela está brincando)"
      },
      {
        english: "Basic plurals and articles (a, an, the)",
        portuguese: "Plurais e artigos básicos (um, uma, o, a)"
      }
    ]
  },
  level1: {
    title: "Level 1 Curriculum (6th - 7th Grade)",
    description: "Expanding communication with past and future tenses",
    keyPoints: [
      {
        english: "Extended vocabulary (hobbies, food, clothing, weather)",
        portuguese: "Vocabulário estendido (hobbies, comida, roupas, clima)"
      },
      {
        english: "Past tense (regular and irregular verbs)",
        portuguese: "Passado (verbos regulares e irregulares)"
      },
      {
        english: "Future tense with 'will' and 'going to'",
        portuguese: "Futuro com 'will' e 'going to'"
      },
      {
        english: "Modal verbs (can, could, should, must, may)",
        portuguese: "Verbos modais (pode, poderia, deveria, deve, pode)"
      },
      {
        english: "Comparative and superlative adjectives",
        portuguese: "Adjetivos comparativos e superlativos"
      },
      {
        english: "Present perfect tense (have/has + past participle)",
        portuguese: "Presente perfeito (have/has + particípio passado)"
      },
      {
        english: "Conditional sentences (if + present, will + base)",
        portuguese: "Frases condicionais (se + presente, will + base)"
      },
      {
        english: "Adverbs of frequency (always, usually, sometimes, never)",
        portuguese: "Advérbios de frequência (sempre, geralmente, às vezes, nunca)"
      },
      {
        english: "Compound sentences with 'and', 'but', 'or'",
        portuguese: "Frases compostas com 'e', 'mas', 'ou'"
      },
      {
        english: "Basic phrasal verbs (get up, turn on, look for)",
        portuguese: "Phrasal verbs básicos (levantar, ligar, procurar)"
      }
    ]
  },
  level2: {
    title: "Level 2 Curriculum (8th - 9th Grade)",
    description: "Advanced grammar and complex communication",
    keyPoints: [
      {
        english: "Academic vocabulary and formal language",
        portuguese: "Vocabulário acadêmico e linguagem formal"
      },
      {
        english: "Past perfect tense (had + past participle)",
        portuguese: "Mais-que-perfeito (had + particípio passado)"
      },
      {
        english: "Passive voice (is/was + past participle)",
        portuguese: "Voz passiva (is/was + particípio passado)"
      },
      {
        english: "Reported speech (he said that...)",
        portuguese: "Discurso indireto (ele disse que...)"
      },
      {
        english: "Second and third conditionals",
        portuguese: "Segunda e terceira condicionais"
      },
      {
        english: "Gerunds and infinitives",
        portuguese: "Gerúndios e infinitivos"
      },
      {
        english: "Advanced phrasal verbs and idioms",
        portuguese: "Phrasal verbs e expressões idiomáticas avançadas"
      },
      {
        english: "Complex sentence structures",
        portuguese: "Estruturas complexas de frases"
      },
      {
        english: "Opinion expressions (I believe, in my opinion)",
        portuguese: "Expressões de opinião (eu acredito, na minha opinião)"
      },
      {
        english: "Cause and effect language (because, therefore, as a result)",
        portuguese: "Linguagem de causa e efeito (porque, portanto, como resultado)"
      }
    ]
  },
  upper: {
    title: "Upper Level Curriculum (High School & Adults)",
    description: "Mastery of complex language and critical thinking",
    keyPoints: [
      {
        english: "Sophisticated vocabulary and academic language",
        portuguese: "Vocabulário sofisticado e linguagem acadêmica"
      },
      {
        english: "Subjunctive mood and advanced conditionals",
        portuguese: "Modo subjuntivo e condicionais avançadas"
      },
      {
        english: "Complex sentence structures and clauses",
        portuguese: "Estruturas complexas de frases e orações"
      },
      {
        english: "Formal and informal register differences",
        portuguese: "Diferenças entre registro formal e informal"
      },
      {
        english: "Debate and argumentation skills",
        portuguese: "Habilidades de debate e argumentação"
      },
      {
        english: "Literary analysis and critical thinking",
        portuguese: "Análise literária e pensamento crítico"
      },
      {
        english: "Professional communication skills",
        portuguese: "Habilidades de comunicação profissional"
      },
      {
        english: "Cultural awareness and idiomatic expressions",
        portuguese: "Consciência cultural e expressões idiomáticas"
      },
      {
        english: "Advanced grammar structures (inversions, cleft sentences)",
        portuguese: "Estruturas gramaticais avançadas (inversões, frases clivadas)"
      },
      {
        english: "Research and presentation skills",
        portuguese: "Habilidades de pesquisa e apresentação"
      }
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
              <span className="block text-sm font-normal text-indigo-600 italic">
                🇧🇷 Selecione suas Áreas de Foco
              </span>
            </h4>
            <p className="text-indigo-700 text-sm mb-3">
              Choose at least 2 areas that interest you most. Our AI will create a personalized learning plan focused on these areas.
              <br />
              <span className="text-indigo-600 text-xs">
                🇧🇷 Escolha pelo menos 2 áreas que mais te interessam. Nossa IA criará um plano de aprendizado personalizado focado nessas áreas.
              </span>
            </p>
            <p className="text-indigo-600 text-xs">
              Selected: {selectedAreas.length} areas {selectedAreas.length >= 2 ? '✅' : '⚠️ (minimum 2 required)'}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">
              Curriculum Areas - Click to Select
              <span className="block text-sm font-normal text-slate-500 italic">
                🇧🇷 Áreas do Currículo - Clique para Selecionar
              </span>
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              {curriculum.keyPoints.map((point, index) => {
                const isSelected = selectedAreas.includes(point.english);
                return (
                  <div
                    key={index}
                    onClick={() => handleAreaToggle(point.english)}
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
                      <div className="flex-1">
                        <p className={`text-sm leading-relaxed ${
                          isSelected ? 'text-indigo-800 font-medium' : 'text-slate-700'
                        }`}>
                          {point.english}
                        </p>
                        <p className={`text-xs mt-1 leading-relaxed ${
                          isSelected ? 'text-indigo-600' : 'text-slate-500'
                        }`}>
                          🇧🇷 {point.portuguese}
                        </p>
                      </div>
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
              <div className="space-y-2">
                {selectedAreas.map((area, index) => {
                  const point = curriculum.keyPoints.find(p => p.english === area);
                  return (
                    <div key={index} className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-300">
                        {area}
                      </span>
                      {point && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full border border-green-300">
                          🇧🇷 {point.portuguese}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-slate-600 font-medium hover:text-slate-800 transition-colors order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!isMinimumSelected}
            className={`px-6 py-3 font-semibold rounded-lg transition-colors shadow-lg text-center min-w-[280px] order-1 sm:order-2 ${
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
