import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { BeakerIcon } from './icons/BeakerIcon';

interface PlacementTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (recommendedGrade: string) => void;
  isPortugueseHelpVisible: boolean;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  gradeLevel: string;
}

const questions: Question[] = [
  // Junior level questions (4th-5th grade)
  {
    id: 1,
    question: "What is the past tense of 'go'?",
    options: ["goed", "went", "gone", "going"],
    correctAnswer: 1,
    gradeLevel: "junior"
  },
  {
    id: 2,
    question: "Choose the correct sentence:",
    options: ["I am go to school", "I go to school", "I goes to school", "I going to school"],
    correctAnswer: 1,
    gradeLevel: "junior"
  },
  {
    id: 3,
    question: "What is the opposite of 'big'?",
    options: ["large", "small", "huge", "tall"],
    correctAnswer: 1,
    gradeLevel: "junior"
  },

  // Level 1 questions (6th-7th grade)
  {
    id: 4,
    question: "Which sentence is correct?",
    options: ["She don't like pizza", "She doesn't like pizza", "She not like pizza", "She no like pizza"],
    correctAnswer: 1,
    gradeLevel: "level1"
  },
  {
    id: 5,
    question: "What is the plural of 'child'?",
    options: ["childs", "children", "childes", "childrens"],
    correctAnswer: 1,
    gradeLevel: "level1"
  },
  {
    id: 6,
    question: "Choose the correct form: 'I _____ my homework yesterday.'",
    options: ["do", "did", "done", "doing"],
    correctAnswer: 1,
    gradeLevel: "level1"
  },

  // Level 2 questions (8th-9th grade)
  {
    id: 7,
    question: "Which sentence uses the present perfect correctly?",
    options: ["I have seen this movie", "I have saw this movie", "I have see this movie", "I have seeing this movie"],
    correctAnswer: 0,
    gradeLevel: "level2"
  },
  {
    id: 8,
    question: "What does 'procrastinate' mean?",
    options: ["To work hard", "To delay or postpone", "To celebrate", "To communicate"],
    correctAnswer: 1,
    gradeLevel: "level2"
  },
  {
    id: 9,
    question: "Choose the correct conditional: 'If I _____ enough money, I would buy a car.'",
    options: ["have", "had", "will have", "would have"],
    correctAnswer: 1,
    gradeLevel: "level2"
  },

  // Upper level questions (High School & Adults)
  {
    id: 10,
    question: "Which sentence demonstrates proper use of the subjunctive mood?",
    options: ["I wish I was taller", "I wish I were taller", "I wish I am taller", "I wish I will be taller"],
    correctAnswer: 1,
    gradeLevel: "upper"
  },
  {
    id: 11,
    question: "What is the meaning of 'ubiquitous'?",
    options: ["Rare", "Present everywhere", "Expensive", "Beautiful"],
    correctAnswer: 1,
    gradeLevel: "upper"
  },
  {
    id: 12,
    question: "Choose the correct complex sentence structure:",
    options: ["Although it was raining, we went for a walk", "It was raining, we went for a walk", "It was raining and we went for a walk", "It was raining so we went for a walk"],
    correctAnswer: 0,
    gradeLevel: "upper"
  }
];

const PlacementTestModal: React.FC<PlacementTestModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  isPortugueseHelpVisible
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [recommendedGrade, setRecommendedGrade] = useState<string>('');

  if (!isOpen) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Test completed, calculate results
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateResults = () => {
    const gradeScores: { [key: string]: number } = {
      junior: 0,
      level1: 0,
      level2: 0,
      upper: 0
    };

    // Calculate scores for each grade level
    questions.forEach(question => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        gradeScores[question.gradeLevel]++;
      }
    });

    // Determine recommended grade based on highest score
    const maxScore = Math.max(...Object.values(gradeScores));
    const recommendedGrade = Object.keys(gradeScores).find(
      grade => gradeScores[grade] === maxScore
    ) || 'junior';

    setRecommendedGrade(recommendedGrade);
    setIsCompleted(true);
  };

  const handleComplete = () => {
    onComplete(recommendedGrade);
    onClose();
  };

  const resetTest = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsCompleted(false);
    setRecommendedGrade('');
  };

  const gradeLabels: { [key: string]: string } = {
    junior: 'Junior (4th - 5th Grade)',
    level1: 'Level 1 (6th - 7th Grade)',
    level2: 'Level 2 (8th - 9th Grade)',
    upper: 'Upper/Free (High School & Adults)'
  };

  if (isCompleted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <BeakerIcon className="h-8 w-8 text-green-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              Test Complete! 🎉
            </h3>
            
            <p className="text-slate-600 mb-4">
              Based on your answers, we recommend:
            </p>
            
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 mb-6">
              <h4 className="text-xl font-bold text-indigo-800">
                {gradeLabels[recommendedGrade]}
              </h4>
              {isPortugueseHelpVisible && (
                <p className="text-sm text-indigo-600 italic mt-1">
                  {recommendedGrade === 'junior' && 'Nível Júnior (4º - 5º Ano)'}
                  {recommendedGrade === 'level1' && 'Nível 1 (6º - 7º Ano)'}
                  {recommendedGrade === 'level2' && 'Nível 2 (8º - 9º Ano)'}
                  {recommendedGrade === 'upper' && 'Nível Superior (Ensino Médio e Adultos)'}
                </p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={resetTest}
                className="flex-1 bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Use This Level
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-800">
            Quick Placement Test
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <CloseIcon className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {isPortugueseHelpVisible && (
          <p className="text-sm text-slate-500 italic mb-4">
            Teste Rápido de Nivelamento
          </p>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">
            {currentQuestion.question}
          </h4>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  answers[currentQuestion.id] === index
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={index}
                  checked={answers[currentQuestion.id] === index}
                  onChange={() => handleAnswerSelect(index)}
                  className="sr-only"
                />
                <span className="flex-1 text-slate-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 text-slate-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:text-slate-800 transition-colors"
          >
            Previous
          </button>
          
          <button
            onClick={handleNext}
            disabled={answers[currentQuestion.id] === undefined}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
          >
            {currentQuestionIndex === questions.length - 1 ? 'Finish Test' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlacementTestModal;
