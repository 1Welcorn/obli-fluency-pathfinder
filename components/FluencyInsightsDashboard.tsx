import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { fluencyInsightsService, FluencyProfile, PersonalizedLearningPath } from '../services/fluencyInsightsService';

interface FluencyInsightsDashboardProps {
    onBack: () => void;
    currentUser: { uid: string; email: string | null; displayName: string | null; photoURL: string | null } | null;
}

const FluencyInsightsDashboard: React.FC<FluencyInsightsDashboardProps> = ({ onBack, currentUser }) => {
    const [profile, setProfile] = useState<FluencyProfile | null>(null);
    const [learningPath, setLearningPath] = useState<PersonalizedLearningPath | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<'overview' | 'insights' | 'path' | 'progress'>('overview');

    useEffect(() => {
        if (currentUser?.uid) {
            loadFluencyData();
        }
    }, [currentUser]);

    const loadFluencyData = async () => {
        if (!currentUser?.uid) return;
        
        setIsLoading(true);
        try {
            const fluencyProfile = await fluencyInsightsService.generateFluencyProfile(currentUser.uid);
            const personalizedPath = await fluencyInsightsService.generatePersonalizedLearningPath(fluencyProfile);
            
            setProfile(fluencyProfile);
            setLearningPath(personalizedPath);
        } catch (error) {
            console.error('Error loading fluency data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getFluencyColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getPriorityColor = (priority: number) => {
        if (priority >= 8) return 'text-red-600 bg-red-100';
        if (priority >= 6) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Analyzing your learning data...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-600">Unable to load fluency insights. Please try again.</p>
                    <button
                        onClick={onBack}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={onBack}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors mr-4"
                            >
                                <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Fluency Insights</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getFluencyColor(profile.overallFluency)}`}>
                                {profile.currentLevel.charAt(0).toUpperCase() + profile.currentLevel.slice(1)} Level
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                            { id: 'insights', label: 'Insights', icon: LightBulbIcon },
                            { id: 'path', label: 'Learning Path', icon: TrendingUpIcon },
                            { id: 'progress', label: 'Progress', icon: TrophyIcon }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id as any)}
                                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                                    selectedTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <tab.icon className="h-5 w-5" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {selectedTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Overall Fluency Score */}
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Your English Fluency</h2>
                                <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            className="text-gray-200"
                                        />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray={`${profile.overallFluency * 2.51} 251`}
                                            className="text-blue-500"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-3xl font-bold text-gray-900">{profile.overallFluency}</span>
                                    </div>
                                </div>
                                <p className="text-lg text-gray-600 mb-6">
                                    Based on your learning data, you're at a <strong>{profile.currentLevel}</strong> level
                                </p>
                            </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-center">
                                    <TrendingUpIcon className="h-8 w-8 text-green-500 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Learning Velocity</p>
                                        <p className="text-2xl font-bold text-gray-900">{Math.round(profile.learningVelocity * 100)}%</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-center">
                                    <TrophyIcon className="h-8 w-8 text-blue-500 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Engagement</p>
                                        <p className="text-2xl font-bold text-gray-900">{Math.round(profile.engagementScore * 100)}%</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-center">
                                    <ChartBarIcon className="h-8 w-8 text-purple-500 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Consistency</p>
                                        <p className="text-2xl font-bold text-gray-900">{Math.round(profile.consistencyScore * 100)}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedTab === 'insights' && (
                    <div className="space-y-6">
                        {/* Strengths */}
                        {profile.strengths.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center">
                                    <TrophyIcon className="h-6 w-6 mr-2" />
                                    Your Strengths
                                </h3>
                                <div className="space-y-4">
                                    {profile.strengths.map((strength) => (
                                        <div key={strength.id} className="border-l-4 border-green-500 pl-4 py-2">
                                            <h4 className="font-semibold text-gray-900">{strength.title}</h4>
                                            <p className="text-gray-600 text-sm">{strength.description}</p>
                                            {strength.suggestedActions.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs font-medium text-gray-500 mb-1">Keep doing:</p>
                                                    <ul className="text-xs text-gray-600 space-y-1">
                                                        {strength.suggestedActions.slice(0, 2).map((action, index) => (
                                                            <li key={index}>• {action}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Areas for Improvement */}
                        {profile.weaknesses.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center">
                                    <LightBulbIcon className="h-6 w-6 mr-2" />
                                    Areas for Improvement
                                </h3>
                                <div className="space-y-4">
                                    {profile.weaknesses.map((weakness) => (
                                        <div key={weakness.id} className="border-l-4 border-red-500 pl-4 py-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-gray-900">{weakness.title}</h4>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(weakness.priority)}`}>
                                                    Priority {weakness.priority}/10
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-2">{weakness.description}</p>
                                            {weakness.suggestedActions.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs font-medium text-gray-500 mb-1">Action steps:</p>
                                                    <ul className="text-xs text-gray-600 space-y-1">
                                                        {weakness.suggestedActions.slice(0, 3).map((action, index) => (
                                                            <li key={index}>• {action}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Opportunities */}
                        {profile.opportunities.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center">
                                    <TrendingUpIcon className="h-6 w-6 mr-2" />
                                    Growth Opportunities
                                </h3>
                                <div className="space-y-4">
                                    {profile.opportunities.map((opportunity) => (
                                        <div key={opportunity.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                            <h4 className="font-semibold text-gray-900">{opportunity.title}</h4>
                                            <p className="text-gray-600 text-sm">{opportunity.description}</p>
                                            {opportunity.suggestedActions.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs font-medium text-gray-500 mb-1">Try these:</p>
                                                    <ul className="text-xs text-gray-600 space-y-1">
                                                        {opportunity.suggestedActions.slice(0, 2).map((action, index) => (
                                                            <li key={index}>• {action}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {selectedTab === 'path' && learningPath && (
                    <div className="space-y-6">
                        {/* Daily Goals */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Daily Goals</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {learningPath.dailyGoals.map((goal, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold text-gray-900 capitalize">{goal.type}</h4>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                goal.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                                                goal.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                                'bg-red-100 text-red-600'
                                            }`}>
                                                {goal.difficulty}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-2">{goal.description}</p>
                                        <p className="text-xs text-gray-500">{goal.timeRequired} minutes</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weekly Milestones */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Weekly Milestones</h3>
                            <div className="space-y-4">
                                {learningPath.weeklyMilestones.map((milestone, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">Week {milestone.week}</h4>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-1">Goals:</p>
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    {milestone.goals.map((goal, goalIndex) => (
                                                        <li key={goalIndex}>• {goal}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-1">Success Metrics:</p>
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    {milestone.successMetrics.map((metric, metricIndex) => (
                                                        <li key={metricIndex}>• {metric}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {selectedTab === 'progress' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Progress Tracking</h3>
                            <p className="text-gray-600">Detailed progress tracking will be implemented here.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FluencyInsightsDashboard;
