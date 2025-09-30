import React, { useState, useEffect } from 'react';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { UsersIcon } from './icons/UsersIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { ClockIcon } from './icons/ClockIcon';
import { GraduationCapIcon } from './icons/GraduationCapIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import XCircleIcon from './icons/XCircleIcon';
import { enhancedAnalyticsService, ClassAnalytics, StudentInsights } from '../services/enhancedAnalyticsService';
import { User } from '../types';
import DataMigrationModal from './DataMigrationModal';
import EnhancedCollaboratorModal from './EnhancedCollaboratorModal';

interface EnhancedTeacherDashboardProps {
    currentUser: User;
    onBack: () => void;
}

const EnhancedTeacherDashboard: React.FC<EnhancedTeacherDashboardProps> = ({ currentUser, onBack }) => {
    const [classAnalytics, setClassAnalytics] = useState<ClassAnalytics | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
    const [studentInsights, setStudentInsights] = useState<StudentInsights | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'analytics' | 'insights'>('overview');
    const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
    const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);

    useEffect(() => {
        loadClassAnalytics();
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            loadStudentInsights(selectedStudent);
        }
    }, [selectedStudent]);

    const loadClassAnalytics = async () => {
        try {
            setIsLoading(true);
            const analytics = await enhancedAnalyticsService.generateClassAnalytics(currentUser.uid);
            setClassAnalytics(analytics);
        } catch (error) {
            console.error('Error loading class analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadStudentInsights = async (studentId: string) => {
        try {
            const insights = await enhancedAnalyticsService.generateStudentInsights(studentId);
            setStudentInsights(insights);
        } catch (error) {
            console.error('Error loading student insights:', error);
        }
    };

    const trackLearningMoment = async (studentId: string, type: 'breakthrough' | 'struggle' | 'engagement' | 'achievement', description: string) => {
        try {
            await enhancedAnalyticsService.trackLearningMoment(
                studentId,
                type,
                description,
                'Teacher observation'
            );
            // Refresh insights after tracking
            if (selectedStudent === studentId) {
                loadStudentInsights(studentId);
            }
        } catch (error) {
            console.error('Error tracking learning moment:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading enhanced analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBack}
                                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                ← Back
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">Enhanced Teacher Dashboard</h1>
                                <p className="text-slate-600">Comprehensive student progress and insights</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsMigrationModalOpen(true)}
                                className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors shadow hover:shadow-md"
                            >
                                Migrate Data
                            </button>
                            <button
                                onClick={() => setIsCollaboratorModalOpen(true)}
                                className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow hover:shadow-md"
                            >
                                Manage Collaborators
                            </button>
                            <div className="flex items-center space-x-2">
                                <GraduationCapIcon className="h-8 w-8 text-indigo-600" />
                                <span className="font-semibold text-slate-800">{currentUser.displayName}</span>
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
                            { id: 'students', label: 'Students', icon: UsersIcon },
                            { id: 'analytics', label: 'Analytics', icon: TrendingUpIcon },
                            { id: 'insights', label: 'Insights', icon: LightBulbIcon }
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id as any)}
                                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'overview' && (
                    <OverviewTab classAnalytics={classAnalytics} />
                )}

                {activeTab === 'students' && (
                    <StudentsTab 
                        classAnalytics={classAnalytics}
                        selectedStudent={selectedStudent}
                        setSelectedStudent={setSelectedStudent}
                        studentInsights={studentInsights}
                        onTrackMoment={trackLearningMoment}
                    />
                )}

                {activeTab === 'analytics' && (
                    <AnalyticsTab classAnalytics={classAnalytics} />
                )}

                {activeTab === 'insights' && (
                    <InsightsTab 
                        classAnalytics={classAnalytics}
                        studentInsights={studentInsights}
                        selectedStudent={selectedStudent}
                    />
                )}
            </div>

            {/* Data Migration Modal */}
            <DataMigrationModal
                isOpen={isMigrationModalOpen}
                onClose={() => setIsMigrationModalOpen(false)}
            />

            {/* Enhanced Collaborator Modal */}
            <EnhancedCollaboratorModal
                isOpen={isCollaboratorModalOpen}
                onClose={() => setIsCollaboratorModalOpen(false)}
                currentUser={currentUser}
                onCollaboratorsUpdated={() => {
                    // Refresh any collaborator-related data if needed
                    console.log('Collaborators updated');
                }}
            />
        </div>
    );
};

// Overview Tab Component
const OverviewTab: React.FC<{ classAnalytics: ClassAnalytics | null }> = ({ classAnalytics }) => {
    if (!classAnalytics) return <div>No data available</div>;

    return (
        <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Total Students</p>
                            <p className="text-3xl font-bold text-slate-900">{classAnalytics.totalStudents}</p>
                        </div>
                        <UsersIcon className="h-8 w-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Average Fluency</p>
                            <p className="text-3xl font-bold text-slate-900">{Math.round(classAnalytics.averageFluency)}%</p>
                        </div>
                        <TrendingUpIcon className="h-8 w-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Modules Completed</p>
                            <p className="text-3xl font-bold text-slate-900">{classAnalytics.classProgress.modulesCompleted}</p>
                        </div>
                        <GraduationCapIcon className="h-8 w-8 text-purple-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Challenges Solved</p>
                            <p className="text-3xl font-bold text-slate-900">{classAnalytics.classProgress.challengesSolved}</p>
                        </div>
                        <TrophyIcon className="h-8 w-8 text-yellow-600" />
                    </div>
                </div>
            </div>

            {/* Top Performers and Struggling Students */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <TrophyIcon className="h-5 w-5 text-yellow-600 mr-2" />
                        Top Performers
                    </h3>
                    <div className="space-y-3">
                        {classAnalytics.topPerformers.map((student, index) => (
                            <div key={student.studentId} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold text-yellow-800">#{index + 1}</span>
                                    </div>
                                    <span className="font-medium text-slate-800">{student.name}</span>
                                </div>
                                <span className="text-sm font-semibold text-yellow-700">{student.fluencyScore}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                        Students Needing Support
                    </h3>
                    <div className="space-y-3">
                        {classAnalytics.strugglingStudents.map((student) => (
                            <div key={student.studentId} className="p-3 bg-red-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-slate-800">{student.name}</span>
                                </div>
                                <div className="text-sm text-red-700">
                                    Areas: {student.areas.join(', ')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Students Tab Component
const StudentsTab: React.FC<{
    classAnalytics: ClassAnalytics | null;
    selectedStudent: string | null;
    setSelectedStudent: (id: string) => void;
    studentInsights: StudentInsights | null;
    onTrackMoment: (studentId: string, type: 'breakthrough' | 'struggle' | 'engagement' | 'achievement', description: string) => void;
}> = ({ classAnalytics, selectedStudent, setSelectedStudent, studentInsights, onTrackMoment }) => {
    const [momentDescription, setMomentDescription] = useState('');
    const [momentType, setMomentType] = useState<'breakthrough' | 'struggle' | 'engagement' | 'achievement'>('engagement');

    const handleTrackMoment = () => {
        if (selectedStudent && momentDescription.trim()) {
            onTrackMoment(selectedStudent, momentType, momentDescription);
            setMomentDescription('');
        }
    };

    if (!classAnalytics) return <div>No data available</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student List */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Students</h3>
                    <div className="space-y-2">
                        {classAnalytics.topPerformers.concat(classAnalytics.strugglingStudents).map((student) => (
                            <button
                                key={student.studentId}
                                onClick={() => setSelectedStudent(student.studentId)}
                                className={`w-full text-left p-3 rounded-lg transition-colors ${
                                    selectedStudent === student.studentId
                                        ? 'bg-indigo-100 border border-indigo-200'
                                        : 'hover:bg-slate-50 border border-transparent'
                                }`}
                            >
                                <div className="font-medium text-slate-800">{student.name}</div>
                                <div className="text-sm text-slate-600">
                                    Fluency: {student.fluencyScore || 0}%
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Student Details */}
            <div className="lg:col-span-2 space-y-6">
                {selectedStudent && studentInsights ? (
                    <>
                        {/* Student Insights */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Student Insights</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-slate-700 mb-2">Strengths</h4>
                                    <div className="space-y-1">
                                        {studentInsights.strengths.map((strength, index) => (
                                            <div key={index} className="text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full inline-block mr-2 mb-1">
                                                {strength}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-slate-700 mb-2">Areas for Improvement</h4>
                                    <div className="space-y-1">
                                        {studentInsights.areasForImprovement.map((area, index) => (
                                            <div key={index} className="text-sm text-orange-700 bg-orange-50 px-3 py-1 rounded-full inline-block mr-2 mb-1">
                                                {area}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-slate-50 rounded-lg">
                                    <div className="text-sm text-slate-600">Learning Style</div>
                                    <div className="font-semibold text-slate-800 capitalize">{studentInsights.learningStyle}</div>
                                </div>
                                <div className="text-center p-4 bg-slate-50 rounded-lg">
                                    <div className="text-sm text-slate-600">Optimal Study Time</div>
                                    <div className="font-semibold text-slate-800">{studentInsights.optimalStudyTime}</div>
                                </div>
                                <div className="text-center p-4 bg-slate-50 rounded-lg">
                                    <div className="text-sm text-slate-600">Motivation Level</div>
                                    <div className="font-semibold text-slate-800 capitalize">{studentInsights.motivationLevel}</div>
                                </div>
                            </div>
                        </div>

                        {/* Track Learning Moment */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Track Learning Moment</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Moment Type</label>
                                    <select
                                        value={momentType}
                                        onChange={(e) => setMomentType(e.target.value as any)}
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="breakthrough">Breakthrough</option>
                                        <option value="achievement">Achievement</option>
                                        <option value="engagement">Engagement</option>
                                        <option value="struggle">Struggle</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                    <textarea
                                        value={momentDescription}
                                        onChange={(e) => setMomentDescription(e.target.value)}
                                        placeholder="Describe what you observed..."
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        rows={3}
                                    />
                                </div>

                                <button
                                    onClick={handleTrackMoment}
                                    disabled={!momentDescription.trim()}
                                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Track Learning Moment
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 text-center">
                        <UsersIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">Select a student to view detailed insights</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Analytics Tab Component
const AnalyticsTab: React.FC<{ classAnalytics: ClassAnalytics | null }> = ({ classAnalytics }) => {
    if (!classAnalytics) return <div>No data available</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Engagement Metrics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <ClockIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-800">
                            {Math.round(classAnalytics.engagementMetrics.averageSessionLength)} min
                        </div>
                        <div className="text-sm text-blue-600">Average Session Length</div>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <UsersIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-800">
                            {classAnalytics.engagementMetrics.dailyActiveUsers}
                        </div>
                        <div className="text-sm text-green-600">Daily Active Users</div>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <TrendingUpIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-800">
                            {Math.round(classAnalytics.engagementMetrics.retentionRate)}%
                        </div>
                        <div className="text-sm text-purple-600">Retention Rate</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Class Progress</h3>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-700">Total Learning Time</span>
                        <span className="text-lg font-bold text-slate-800">
                            {Math.round(classAnalytics.classProgress.totalLearningTime / 60)} hours
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-700">Modules Completed</span>
                        <span className="text-lg font-bold text-slate-800">
                            {classAnalytics.classProgress.modulesCompleted}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-700">Challenges Solved</span>
                        <span className="text-lg font-bold text-slate-800">
                            {classAnalytics.classProgress.challengesSolved}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Insights Tab Component
const InsightsTab: React.FC<{
    classAnalytics: ClassAnalytics | null;
    studentInsights: StudentInsights | null;
    selectedStudent: string | null;
}> = ({ classAnalytics, studentInsights, selectedStudent }) => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Class Insights</h3>
                
                {classAnalytics && (
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">Overall Performance</h4>
                            <p className="text-blue-700">
                                Your class has an average fluency score of {Math.round(classAnalytics.averageFluency)}%. 
                                {classAnalytics.averageFluency > 80 && " Excellent work! Your students are performing very well."}
                                {classAnalytics.averageFluency > 60 && classAnalytics.averageFluency <= 80 && " Good progress! Consider focusing on areas where students need more support."}
                                {classAnalytics.averageFluency <= 60 && " Consider additional support and targeted interventions for struggling students."}
                            </p>
                        </div>

                        {classAnalytics.strugglingStudents.length > 0 && (
                            <div className="p-4 bg-orange-50 rounded-lg">
                                <h4 className="font-medium text-orange-800 mb-2">Students Needing Support</h4>
                                <p className="text-orange-700">
                                    {classAnalytics.strugglingStudents.length} student(s) may benefit from additional support. 
                                    Focus on their specific areas of difficulty: {classAnalytics.strugglingStudents[0]?.areas.join(', ')}.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selectedStudent && studentInsights && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Individual Student Insights</h3>
                    
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-medium text-green-800 mb-2">Learning Recommendations</h4>
                            <ul className="text-green-700 space-y-1">
                                <li>• Focus on {studentInsights.areasForImprovement[0] || 'general improvement'}</li>
                                <li>• Optimal study time: {studentInsights.optimalStudyTime}</li>
                                <li>• Learning style: {studentInsights.learningStyle}</li>
                                <li>• Motivation level: {studentInsights.motivationLevel}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnhancedTeacherDashboard;
