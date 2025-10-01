// Enhanced Analytics Service
// Provides comprehensive student progress tracking and insights for better learning outcomes

import { 
    LearningProgress, 
    SessionSummary, 
    LearningMemory, 
    User, 
    ChallengeSubmission,
    Module 
} from '../types';

export interface FluencyMetrics {
    readingSpeed: number; // words per minute
    comprehensionScore: number; // 0-100
    vocabularyGrowth: number; // new words learned
    grammarAccuracy: number; // 0-100
    speakingConfidence: number; // 0-100 (based on challenge performance)
    writingQuality: number; // 0-100
    overallFluency: number; // 0-100
}

export interface LearningMoment {
    id: string;
    type: 'breakthrough' | 'struggle' | 'engagement' | 'achievement';
    description: string;
    timestamp: Date;
    moduleId?: string;
    challengeId?: string;
    emotionalState: 'excited' | 'focused' | 'frustrated' | 'proud' | 'curious';
    learningValue: number; // 1-10
    context: string;
}

export interface StudentInsights {
    strengths: string[];
    areasForImprovement: string[];
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
    optimalStudyTime: string;
    motivationLevel: 'high' | 'medium' | 'low';
    engagementPatterns: {
        peakHours: number[];
        preferredModules: string[];
        challengePreferences: string[];
    };
    fluencyTrends: {
        daily: FluencyMetrics[];
        weekly: FluencyMetrics[];
        monthly: FluencyMetrics[];
    };
}

export interface ClassAnalytics {
    totalStudents: number;
    averageFluency: number;
    topPerformers: Array<{
        studentId: string;
        name: string;
        fluencyScore: number;
    }>;
    strugglingStudents: Array<{
        studentId: string;
        name: string;
        areas: string[];
    }>;
    classProgress: {
        modulesCompleted: number;
        challengesSolved: number;
        totalLearningTime: number;
    };
    engagementMetrics: {
        averageSessionLength: number;
        dailyActiveUsers: number;
        retentionRate: number;
    };
}

class EnhancedAnalyticsService {
    private static instance: EnhancedAnalyticsService;
    
    public static getInstance(): EnhancedAnalyticsService {
        if (!EnhancedAnalyticsService.instance) {
            EnhancedAnalyticsService.instance = new EnhancedAnalyticsService();
        }
        return EnhancedAnalyticsService.instance;
    }

    // Calculate comprehensive fluency metrics
    async calculateFluencyMetrics(userId: string, sessionData: any[]): Promise<FluencyMetrics> {
        try {
            // Analyze reading speed from text interactions
            const readingSpeed = this.calculateReadingSpeed(sessionData);
            
            // Calculate comprehension from quiz/challenge results
            const comprehensionScore = this.calculateComprehensionScore(userId);
            
            // Track vocabulary growth from new words learned
            const vocabularyGrowth = this.calculateVocabularyGrowth(sessionData);
            
            // Assess grammar accuracy from written responses
            const grammarAccuracy = this.calculateGrammarAccuracy(sessionData);
            
            // Measure speaking confidence from challenge performance
            const speakingConfidence = this.calculateSpeakingConfidence(userId);
            
            // Evaluate writing quality from text submissions
            const writingQuality = this.calculateWritingQuality(sessionData);
            
            // Calculate overall fluency score
            const overallFluency = this.calculateOverallFluency({
                readingSpeed,
                comprehensionScore,
                vocabularyGrowth,
                grammarAccuracy,
                speakingConfidence,
                writingQuality
            });

            return {
                readingSpeed,
                comprehensionScore,
                vocabularyGrowth,
                grammarAccuracy,
                speakingConfidence,
                writingQuality,
                overallFluency
            };
        } catch (error) {
            console.error('Error calculating fluency metrics:', error);
            return this.getDefaultFluencyMetrics();
        }
    }

    // Identify and track learning moments
    async trackLearningMoment(
        userId: string, 
        type: LearningMoment['type'],
        description: string,
        context: string,
        moduleId?: string,
        challengeId?: string
    ): Promise<LearningMoment> {
        const moment: LearningMoment = {
            id: `moment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            description,
            timestamp: new Date(),
            moduleId,
            challengeId,
            emotionalState: this.inferEmotionalState(type, description),
            learningValue: this.calculateLearningValue(type, description),
            context
        };

        // Store in Firestore for persistence
        await this.saveLearningMoment(userId, moment);
        
        // Also store locally for immediate access
        await this.saveLearningMomentLocal(userId, moment);

        console.log('🎯 Learning moment tracked:', moment);
        return moment;
    }

    // Generate comprehensive student insights
    async generateStudentInsights(userId: string): Promise<StudentInsights> {
        try {
            const progress = await this.getLearningProgress(userId);
            const moments = await this.getLearningMoments(userId);
            const challenges = await this.getChallengeSubmissions(userId);

            // Analyze strengths and weaknesses
            const strengths = this.identifyStrengths(progress, moments, challenges);
            const areasForImprovement = this.identifyImprovementAreas(progress, moments, challenges);

            // Determine learning style
            const learningStyle = this.determineLearningStyle(moments, progress);

            // Find optimal study time
            const optimalStudyTime = this.findOptimalStudyTime(progress);

            // Assess motivation level
            const motivationLevel = this.assessMotivationLevel(progress, moments);

            // Analyze engagement patterns
            const engagementPatterns = this.analyzeEngagementPatterns(progress, moments);

            // Calculate fluency trends
            const fluencyTrends = await this.calculateFluencyTrends(userId);

            return {
                strengths,
                areasForImprovement,
                learningStyle,
                optimalStudyTime,
                motivationLevel,
                engagementPatterns,
                fluencyTrends
            };
        } catch (error) {
            console.error('Error generating student insights:', error);
            return this.getDefaultStudentInsights();
        }
    }

    // Generate class-level analytics for teachers
    async generateClassAnalytics(teacherId: string): Promise<ClassAnalytics> {
        try {
            const students = await this.getStudentsByTeacher(teacherId);
            const studentInsights = await Promise.all(
                students.map(student => this.generateStudentInsights(student.uid))
            );

            // Calculate class averages
            const averageFluency = studentInsights.reduce(
                (sum, insight) => sum + insight.fluencyTrends.monthly[0]?.overallFluency || 0, 0
            ) / studentInsights.length;

            // Identify top performers
            const topPerformers = students
                .map(student => ({
                    studentId: student.uid,
                    name: student.name,
                    fluencyScore: studentInsights.find(insight => 
                        insight.fluencyTrends.monthly[0]?.overallFluency
                    )?.fluencyTrends.monthly[0]?.overallFluency || 0
                }))
                .sort((a, b) => b.fluencyScore - a.fluencyScore)
                .slice(0, 5);

            // Identify struggling students
            const strugglingStudents = students
                .filter(student => {
                    const insight = studentInsights.find(i => 
                        i.fluencyTrends.monthly[0]?.overallFluency
                    );
                    return (insight?.fluencyTrends.monthly[0]?.overallFluency || 0) < 60;
                })
                .map(student => ({
                    studentId: student.uid,
                    name: student.name,
                    areas: studentInsights.find(insight => 
                        insight.fluencyTrends.monthly[0]?.overallFluency
                    )?.areasForImprovement || []
                }));

            // Calculate class progress
            const classProgress = await this.calculateClassProgress(students);

            // Calculate engagement metrics
            const engagementMetrics = await this.calculateEngagementMetrics(students);

            return {
                totalStudents: students.length,
                averageFluency,
                topPerformers,
                strugglingStudents,
                classProgress,
                engagementMetrics
            };
        } catch (error) {
            console.error('Error generating class analytics:', error);
            return this.getDefaultClassAnalytics();
        }
    }

    // Create personalized learning recommendations
    async generateLearningRecommendations(userId: string): Promise<{
        immediateActions: string[];
        weeklyGoals: string[];
        monthlyObjectives: string[];
        suggestedModules: string[];
        challengeRecommendations: string[];
    }> {
        try {
            const insights = await this.generateStudentInsights(userId);
            const progress = await this.getLearningProgress(userId);

            // Generate immediate actions based on current struggles
            const immediateActions = this.generateImmediateActions(insights);

            // Set weekly goals based on improvement areas
            const weeklyGoals = this.generateWeeklyGoals(insights, progress);

            // Create monthly objectives for long-term growth
            const monthlyObjectives = this.generateMonthlyObjectives(insights);

            // Suggest relevant modules
            const suggestedModules = this.suggestModules(insights, progress);

            // Recommend appropriate challenges
            const challengeRecommendations = this.recommendChallenges(insights);

            return {
                immediateActions,
                weeklyGoals,
                monthlyObjectives,
                suggestedModules,
                challengeRecommendations
            };
        } catch (error) {
            console.error('Error generating learning recommendations:', error);
            return this.getDefaultRecommendations();
        }
    }

    // Helper methods for calculations
    private calculateReadingSpeed(sessionData: any[]): number {
        // Analyze text interaction patterns to estimate reading speed
        // This is a simplified calculation - in reality, you'd track actual reading metrics
        const textInteractions = sessionData.filter(data => data.type === 'text_read');
        const totalWords = textInteractions.reduce((sum, interaction) => sum + (interaction.wordCount || 0), 0);
        const totalTime = textInteractions.reduce((sum, interaction) => sum + (interaction.duration || 0), 0);
        
        return totalTime > 0 ? Math.round((totalWords / totalTime) * 60) : 150; // Default 150 WPM
    }

    private calculateComprehensionScore(userId: string): number {
        // This would analyze quiz results, challenge performance, etc.
        // For now, return a mock score based on challenge performance
        return Math.random() * 40 + 60; // 60-100 range
    }

    private calculateVocabularyGrowth(sessionData: any[]): number {
        // Count new vocabulary words learned in sessions
        const vocabularySessions = sessionData.filter(data => data.type === 'vocabulary_learned');
        return vocabularySessions.length * 5; // Assume 5 new words per session
    }

    private calculateGrammarAccuracy(sessionData: any[]): number {
        // Analyze grammar in written responses
        const writtenResponses = sessionData.filter(data => data.type === 'written_response');
        if (writtenResponses.length === 0) return 75; // Default score
        
        const totalErrors = writtenResponses.reduce((sum, response) => sum + (response.grammarErrors || 0), 0);
        const totalWords = writtenResponses.reduce((sum, response) => sum + (response.wordCount || 0), 0);
        
        return totalWords > 0 ? Math.max(0, 100 - (totalErrors / totalWords) * 100) : 75;
    }

    private calculateSpeakingConfidence(userId: string): number {
        // Analyze challenge performance, especially speaking challenges
        // This would be based on actual speaking challenge data
        return Math.random() * 30 + 70; // 70-100 range
    }

    private calculateWritingQuality(sessionData: any[]): number {
        // Analyze writing samples for quality metrics
        const writingSamples = sessionData.filter(data => data.type === 'writing_sample');
        if (writingSamples.length === 0) return 70; // Default score
        
        // This would analyze actual writing quality metrics
        return Math.random() * 25 + 75; // 75-100 range
    }

    private calculateOverallFluency(metrics: Omit<FluencyMetrics, 'overallFluency'>): number {
        // Weighted average of all fluency components
        const weights = {
            readingSpeed: 0.15,
            comprehensionScore: 0.25,
            vocabularyGrowth: 0.15,
            grammarAccuracy: 0.20,
            speakingConfidence: 0.15,
            writingQuality: 0.10
        };

        const normalizedReadingSpeed = Math.min(100, (metrics.readingSpeed / 200) * 100);
        const normalizedVocabularyGrowth = Math.min(100, metrics.vocabularyGrowth);

        return Math.round(
            normalizedReadingSpeed * weights.readingSpeed +
            metrics.comprehensionScore * weights.comprehensionScore +
            normalizedVocabularyGrowth * weights.vocabularyGrowth +
            metrics.grammarAccuracy * weights.grammarAccuracy +
            metrics.speakingConfidence * weights.speakingConfidence +
            metrics.writingQuality * weights.writingQuality
        );
    }

    private inferEmotionalState(type: LearningMoment['type'], description: string): LearningMoment['emotionalState'] {
        const positiveKeywords = ['excited', 'proud', 'amazing', 'great', 'wonderful', 'fantastic'];
        const focusedKeywords = ['concentrated', 'focused', 'determined', 'studying'];
        const frustratedKeywords = ['difficult', 'hard', 'struggling', 'confused', 'stuck'];
        const curiousKeywords = ['curious', 'interested', 'wondering', 'exploring'];

        const lowerDesc = description.toLowerCase();

        if (positiveKeywords.some(keyword => lowerDesc.includes(keyword))) return 'excited';
        if (focusedKeywords.some(keyword => lowerDesc.includes(keyword))) return 'focused';
        if (frustratedKeywords.some(keyword => lowerDesc.includes(keyword))) return 'frustrated';
        if (curiousKeywords.some(keyword => lowerDesc.includes(keyword))) return 'curious';
        
        return type === 'achievement' ? 'proud' : 'focused';
    }

    private calculateLearningValue(type: LearningMoment['type'], description: string): number {
        const baseValues = {
            breakthrough: 9,
            achievement: 8,
            engagement: 7,
            struggle: 6
        };

        return baseValues[type] || 5;
    }

    // Placeholder methods for Firestore operations
    private async saveLearningMoment(userId: string, moment: LearningMoment): Promise<void> {
        // TODO: Implement Firestore save
        console.log('Saving learning moment to Firestore:', moment);
    }

    private async saveLearningMomentLocal(userId: string, moment: LearningMoment): Promise<void> {
        try {
            const key = `learning_moments_${userId}`;
            const existingMoments = JSON.parse(localStorage.getItem(key) || '[]');
            existingMoments.push(moment);
            
            // Keep only last 50 moments
            if (existingMoments.length > 50) {
                existingMoments.splice(0, existingMoments.length - 50);
            }
            
            localStorage.setItem(key, JSON.stringify(existingMoments));
        } catch (error) {
            console.error('Error saving learning moment locally:', error);
        }
    }

    private async getLearningMoments(userId: string): Promise<LearningMoment[]> {
        try {
            const key = `learning_moments_${userId}`;
            const moments = JSON.parse(localStorage.getItem(key) || '[]');
            return moments.map((moment: any) => ({
                ...moment,
                timestamp: new Date(moment.timestamp)
            }));
        } catch (error) {
            console.error('Error getting learning moments:', error);
            return [];
        }
    }

    // Placeholder methods for other operations
    private async getLearningProgress(userId: string): Promise<LearningProgress> {
        // This would integrate with the existing learningProgressService
        return {
            userId,
            lastSessionId: '',
            lastSessionDate: new Date(),
            totalSessions: 0,
            totalMessages: 0,
            topicsLearned: [],
            currentTopics: [],
            learningStreak: 0,
            lastActivity: new Date(),
            sessionHistory: [],
            learningGoals: [],
            achievements: []
        };
    }

    private async getChallengeSubmissions(userId: string): Promise<ChallengeSubmission[]> {
        // TODO: Implement challenge submissions retrieval
        return [];
    }

    private identifyStrengths(progress: LearningProgress, moments: LearningMoment[], challenges: ChallengeSubmission[]): string[] {
        // Analyze data to identify student strengths
        return ['Reading Comprehension', 'Vocabulary Building', 'Grammar Usage'];
    }

    private identifyImprovementAreas(progress: LearningProgress, moments: LearningMoment[], challenges: ChallengeSubmission[]): string[] {
        // Analyze data to identify areas for improvement
        return ['Speaking Confidence', 'Writing Fluency', 'Listening Skills'];
    }

    private determineLearningStyle(moments: LearningMoment[], progress: LearningProgress): StudentInsights['learningStyle'] {
        // Analyze learning patterns to determine style
        return 'mixed';
    }

    private findOptimalStudyTime(progress: LearningProgress): string {
        // Analyze session times to find optimal study periods
        return 'Morning (9-11 AM)';
    }

    private assessMotivationLevel(progress: LearningProgress, moments: LearningMoment[]): StudentInsights['motivationLevel'] {
        // Analyze engagement patterns to assess motivation
        return 'high';
    }

    private analyzeEngagementPatterns(progress: LearningProgress, moments: LearningMoment[]): StudentInsights['engagementPatterns'] {
        return {
            peakHours: [9, 10, 14, 15],
            preferredModules: ['Grammar', 'Vocabulary'],
            challengePreferences: ['word_hunt', 'logic_puzzle']
        };
    }

    private async calculateFluencyTrends(userId: string): Promise<StudentInsights['fluencyTrends']> {
        return {
            daily: [this.getDefaultFluencyMetrics()],
            weekly: [this.getDefaultFluencyMetrics()],
            monthly: [this.getDefaultFluencyMetrics()]
        };
    }

    private async getStudentsByTeacher(teacherId: string): Promise<any[]> {
        // TODO: Implement student retrieval by teacher
        return [];
    }

    private async calculateClassProgress(students: any[]): Promise<ClassAnalytics['classProgress']> {
        return {
            modulesCompleted: 0,
            challengesSolved: 0,
            totalLearningTime: 0
        };
    }

    private async calculateEngagementMetrics(students: any[]): Promise<ClassAnalytics['engagementMetrics']> {
        return {
            averageSessionLength: 0,
            dailyActiveUsers: 0,
            retentionRate: 0
        };
    }

    private generateImmediateActions(insights: StudentInsights): string[] {
        return [
            'Focus on speaking practice for 15 minutes daily',
            'Review grammar rules from last week',
            'Try a new vocabulary challenge'
        ];
    }

    private generateWeeklyGoals(insights: StudentInsights, progress: LearningProgress): string[] {
        return [
            'Complete 3 grammar modules',
            'Practice speaking for 30 minutes total',
            'Learn 20 new vocabulary words'
        ];
    }

    private generateMonthlyObjectives(insights: StudentInsights): string[] {
        return [
            'Improve overall fluency score by 10 points',
            'Complete advanced level challenges',
            'Build confidence in speaking'
        ];
    }

    private suggestModules(insights: StudentInsights, progress: LearningProgress): string[] {
        return ['Advanced Grammar', 'Business English', 'Conversation Practice'];
    }

    private recommendChallenges(insights: StudentInsights): string[] {
        return ['Speaking Challenge', 'Writing Challenge', 'Listening Challenge'];
    }

    // Default values
    private getDefaultFluencyMetrics(): FluencyMetrics {
        return {
            readingSpeed: 150,
            comprehensionScore: 75,
            vocabularyGrowth: 0,
            grammarAccuracy: 75,
            speakingConfidence: 70,
            writingQuality: 70,
            overallFluency: 72
        };
    }

    private getDefaultStudentInsights(): StudentInsights {
        return {
            strengths: [],
            areasForImprovement: [],
            learningStyle: 'mixed',
            optimalStudyTime: 'Morning',
            motivationLevel: 'medium',
            engagementPatterns: {
                peakHours: [],
                preferredModules: [],
                challengePreferences: []
            },
            fluencyTrends: {
                daily: [],
                weekly: [],
                monthly: []
            }
        };
    }

    private getDefaultClassAnalytics(): ClassAnalytics {
        return {
            totalStudents: 0,
            averageFluency: 0,
            topPerformers: [],
            strugglingStudents: [],
            classProgress: {
                modulesCompleted: 0,
                challengesSolved: 0,
                totalLearningTime: 0
            },
            engagementMetrics: {
                averageSessionLength: 0,
                dailyActiveUsers: 0,
                retentionRate: 0
            }
        };
    }

    private getDefaultRecommendations() {
        return {
            immediateActions: [],
            weeklyGoals: [],
            monthlyObjectives: [],
            suggestedModules: [],
            challengeRecommendations: []
        };
    }
}

// Export singleton instance
export const enhancedAnalyticsService = EnhancedAnalyticsService.getInstance();







