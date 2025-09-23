// [FE-FIX] Implemented the student dashboard to display learning plan progress and navigation.
import React from 'react';
import type { LearningPlan, Module } from '../types';
import { CountdownMilestone } from './CountdownMilestone';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface DashboardProps {
  plan: LearningPlan;
  onSelectModule: (module: Module) => void;
  onViewNotes: () => void;
  onViewChallenges: () => void;
  onViewStudyMaterials: () => void;
  onViewProgress: () => void;
  isPortugueseHelpVisible: boolean;
}

const ModuleCard: React.FC<{ module: Module; onSelect: () => void; isPortugueseHelpVisible: boolean; }> = ({ module, onSelect, isPortugueseHelpVisible }) => {
    const totalLessons = module.lessons.length;
    const completedLessons = module.lessons.filter(l => l.status === 'completed').length;
    const isModuleComplete = totalLessons > 0 && totalLessons === completedLessons;
    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return (
        <div className="group bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl shadow-lg border border-slate-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-indigo-300">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">
                        {module.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{module.description}</p>
                </div>
                {isModuleComplete && (
                    <div className="flex-shrink-0 ml-4 p-2 bg-green-100 rounded-full">
                        <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    </div>
                )}
            </div>
            
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2 text-sm text-slate-600">
                    <span className="font-medium">Progress</span>
                    <span className="font-semibold">{completedLessons} / {totalLessons} lessons</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-700 ease-out" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="text-right mt-1">
                    <span className="text-xs font-medium text-slate-500">{Math.round(progress)}% complete</span>
                </div>
            </div>
            
            <button
                onClick={onSelect}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
                {isModuleComplete ? 'Review Module' : 'Start Learning'}
                <ArrowRightIcon className="h-5 w-5" />
            </button>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ plan, onSelectModule, onViewNotes, onViewChallenges, onViewStudyMaterials, onViewProgress, isPortugueseHelpVisible }) => {
  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-slate-900 mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Your Learning Journey
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Goal: <span className="font-bold text-indigo-700">{plan.goal}</span>
        </p>
        {isPortugueseHelpVisible && (
          <p className="text-sm text-slate-500 mt-3 italic max-w-xl mx-auto">
            Este é o seu plano de estudos personalizado. Explore as ferramentas abaixo para começar sua jornada de aprendizado!
          </p>
        )}
      </div>
      
      {/* Countdown Milestone */}
      <div className="mb-12">
        <CountdownMilestone plan={plan} isPortugueseHelpVisible={isPortugueseHelpVisible} />
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {/* Study Materials */}
        <div className="group">
          <button 
            onClick={onViewStudyMaterials} 
            className="w-full h-48 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-teal-50 to-emerald-50 p-8 rounded-3xl shadow-lg border border-teal-100 hover:shadow-2xl hover:border-teal-300 transition-all duration-300 hover:-translate-y-2"
          >
            <div className="p-4 bg-teal-100 rounded-2xl group-hover:bg-teal-200 transition-colors">
              <BookOpenIcon className="h-12 w-12 text-teal-600" />
            </div>
            <div className="text-center">
              <span className="font-bold text-xl text-slate-800">Study Materials</span>
              {isPortugueseHelpVisible && (
                <p className="text-sm text-slate-600 mt-1 italic">Materiais de Estudo</p>
              )}
            </div>
          </button>
        </div>
        
        {/* Challenge Arena */}
        <div className="group">
          <button 
            onClick={onViewChallenges} 
            className="w-full h-48 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-yellow-50 to-amber-50 p-8 rounded-3xl shadow-lg border border-yellow-100 hover:shadow-2xl hover:border-yellow-300 transition-all duration-300 hover:-translate-y-2"
          >
            <div className="p-4 bg-yellow-100 rounded-2xl group-hover:bg-yellow-200 transition-colors">
              <TrophyIcon className="h-12 w-12 text-yellow-600" />
            </div>
            <div className="text-center">
              <span className="font-bold text-xl text-slate-800">Challenge Arena</span>
              {isPortugueseHelpVisible && (
                <p className="text-sm text-slate-600 mt-1 italic">Arena de Desafios</p>
              )}
            </div>
          </button>
        </div>
        
        {/* My Notes */}
        <div className="group">
          <button 
            onClick={onViewNotes} 
            className="w-full h-48 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-fuchsia-50 to-pink-50 p-8 rounded-3xl shadow-lg border border-fuchsia-100 hover:shadow-2xl hover:border-fuchsia-300 transition-all duration-300 hover:-translate-y-2"
          >
            <div className="p-4 bg-fuchsia-100 rounded-2xl group-hover:bg-fuchsia-200 transition-colors">
              <DocumentTextIcon className="h-12 w-12 text-fuchsia-600" />
            </div>
            <div className="text-center">
              <span className="font-bold text-xl text-slate-800">My Notes</span>
              {isPortugueseHelpVisible && (
                <p className="text-sm text-slate-600 mt-1 italic">Minhas Anotações</p>
              )}
            </div>
          </button>
        </div>

        {/* Progress Dashboard */}
        <div className="group">
          <button 
            onClick={onViewProgress} 
            className="w-full h-48 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-3xl shadow-lg border border-indigo-100 hover:shadow-2xl hover:border-indigo-300 transition-all duration-300 hover:-translate-y-2"
          >
            <div className="p-4 bg-indigo-100 rounded-2xl group-hover:bg-indigo-200 transition-colors">
              <svg className="h-12 w-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-center">
              <span className="font-bold text-xl text-slate-800">Progress</span>
              {isPortugueseHelpVisible && (
                <p className="text-sm text-slate-600 mt-1 italic">Progresso</p>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Learning Plan Overview */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Learning Plan Overview</h2>
          <p className="text-slate-600">Your personalized learning modules and progress</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {plan.modules.map((module, index) => (
            <ModuleCard key={index} module={module} onSelect={() => onSelectModule(module)} isPortugueseHelpVisible={isPortugueseHelpVisible} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
