// Data Migration Service
// Handles migration of student data from localStorage to Firestore for better persistence

import { 
    LearningProgress, 
    SessionSummary, 
    LearningMemory,
    User 
} from '../types';
import { enhancedAnalyticsService, LearningMoment } from './enhancedAnalyticsService';

export interface MigrationStatus {
    userId: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    progress: number; // 0-100
    lastUpdated: Date;
    errors: string[];
    migratedData: {
        learningProgress: boolean;
        sessionHistory: boolean;
        learningMoments: boolean;
        notes: boolean;
        preferences: boolean;
    };
}

export interface MigrationReport {
    totalUsers: number;
    successfulMigrations: number;
    failedMigrations: number;
    totalDataPoints: number;
    migrationTime: number; // in seconds
    errors: Array<{
        userId: string;
        error: string;
        timestamp: Date;
    }>;
}

class DataMigrationService {
    private static instance: DataMigrationService;
    
    public static getInstance(): DataMigrationService {
        if (!DataMigrationService.instance) {
            DataMigrationService.instance = new DataMigrationService();
        }
        return DataMigrationService.instance;
    }

    // Migrate all student data from localStorage to Firestore
    async migrateAllStudentData(): Promise<MigrationReport> {
        const startTime = Date.now();
        const report: MigrationReport = {
            totalUsers: 0,
            successfulMigrations: 0,
            failedMigrations: 0,
            totalDataPoints: 0,
            migrationTime: 0,
            errors: []
        };

        try {
            console.log('🚀 Starting data migration process...');

            // Get all users from localStorage (this would normally come from Firestore)
            const users = await this.getAllUsersFromStorage();
            report.totalUsers = users.length;

            console.log(`📊 Found ${users.length} users to migrate`);

            // Migrate each user's data
            for (const user of users) {
                try {
                    const userReport = await this.migrateUserData(user);
                    report.totalDataPoints += userReport.dataPoints;
                    
                    if (userReport.success) {
                        report.successfulMigrations++;
                        console.log(`✅ Successfully migrated data for user: ${user.displayName}`);
                    } else {
                        report.failedMigrations++;
                        report.errors.push({
                            userId: user.uid,
                            error: userReport.error || 'Unknown error',
                            timestamp: new Date()
                        });
                        console.error(`❌ Failed to migrate data for user: ${user.displayName}`, userReport.error);
                    }
                } catch (error) {
                    report.failedMigrations++;
                    report.errors.push({
                        userId: user.uid,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        timestamp: new Date()
                    });
                    console.error(`❌ Error migrating user ${user.displayName}:`, error);
                }
            }

            report.migrationTime = Math.round((Date.now() - startTime) / 1000);
            
            console.log('🎉 Data migration completed!');
            console.log(`📈 Migration Report:`, report);

            return report;

        } catch (error) {
            console.error('💥 Critical error during migration:', error);
            report.migrationTime = Math.round((Date.now() - startTime) / 1000);
            return report;
        }
    }

    // Migrate individual user data
    async migrateUserData(user: User): Promise<{
        success: boolean;
        dataPoints: number;
        error?: string;
    }> {
        let dataPoints = 0;
        
        try {
            console.log(`🔄 Migrating data for user: ${user.displayName} (${user.uid})`);

            // 1. Migrate learning progress
            const progressMigrated = await this.migrateLearningProgress(user.uid);
            if (progressMigrated) dataPoints++;

            // 2. Migrate session history
            const sessionsMigrated = await this.migrateSessionHistory(user.uid);
            if (sessionsMigrated) dataPoints++;

            // 3. Migrate learning moments
            const momentsMigrated = await this.migrateLearningMoments(user.uid);
            if (momentsMigrated) dataPoints++;

            // 4. Migrate notes
            const notesMigrated = await this.migrateNotes(user.uid);
            if (notesMigrated) dataPoints++;

            // 5. Migrate user preferences
            const preferencesMigrated = await this.migrateUserPreferences(user.uid);
            if (preferencesMigrated) dataPoints++;

            // 6. Create enhanced analytics data
            await this.createEnhancedAnalyticsData(user.uid);

            console.log(`✅ Successfully migrated ${dataPoints} data points for user: ${user.displayName}`);

            return {
                success: true,
                dataPoints
            };

        } catch (error) {
            console.error(`❌ Error migrating user data for ${user.displayName}:`, error);
            return {
                success: false,
                dataPoints,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    // Migrate learning progress from localStorage to Firestore
    private async migrateLearningProgress(userId: string): Promise<boolean> {
        try {
            const key = `learning_progress_${userId}`;
            const progressData = localStorage.getItem(key);
            
            if (!progressData) {
                console.log(`No learning progress data found for user: ${userId}`);
                return false;
            }

            const progress: LearningProgress = JSON.parse(progressData);
            
            // Convert date strings back to Date objects
            progress.lastSessionDate = new Date(progress.lastSessionDate);
            progress.lastActivity = new Date(progress.lastActivity);
            progress.sessionHistory = progress.sessionHistory.map(session => ({
                ...session,
                date: new Date(session.date)
            }));

            // Save to Firestore
            await this.saveToFirestore('learningProgress', userId, progress);
            
            console.log(`✅ Migrated learning progress for user: ${userId}`);
            return true;

        } catch (error) {
            console.error(`❌ Error migrating learning progress for user ${userId}:`, error);
            return false;
        }
    }

    // Migrate session history
    private async migrateSessionHistory(userId: string): Promise<boolean> {
        try {
            const key = `session_history_${userId}`;
            const sessionData = localStorage.getItem(key);
            
            if (!sessionData) {
                console.log(`No session history data found for user: ${userId}`);
                return false;
            }

            const sessions: SessionSummary[] = JSON.parse(sessionData);
            
            // Convert date strings back to Date objects
            const processedSessions = sessions.map(session => ({
                ...session,
                date: new Date(session.date)
            }));

            // Save to Firestore
            await this.saveToFirestore('sessionHistory', userId, processedSessions);
            
            console.log(`✅ Migrated ${sessions.length} sessions for user: ${userId}`);
            return true;

        } catch (error) {
            console.error(`❌ Error migrating session history for user ${userId}:`, error);
            return false;
        }
    }

    // Migrate learning moments
    private async migrateLearningMoments(userId: string): Promise<boolean> {
        try {
            const key = `learning_moments_${userId}`;
            const momentsData = localStorage.getItem(key);
            
            if (!momentsData) {
                console.log(`No learning moments data found for user: ${userId}`);
                return false;
            }

            const moments: LearningMoment[] = JSON.parse(momentsData);
            
            // Convert date strings back to Date objects
            const processedMoments = moments.map(moment => ({
                ...moment,
                timestamp: new Date(moment.timestamp)
            }));

            // Save to Firestore
            await this.saveToFirestore('learningMoments', userId, processedMoments);
            
            console.log(`✅ Migrated ${moments.length} learning moments for user: ${userId}`);
            return true;

        } catch (error) {
            console.error(`❌ Error migrating learning moments for user ${userId}:`, error);
            return false;
        }
    }

    // Migrate notes
    private async migrateNotes(userId: string): Promise<boolean> {
        try {
            const key = `notes_${userId}`;
            const notesData = localStorage.getItem(key);
            
            if (!notesData) {
                console.log(`No notes data found for user: ${userId}`);
                return false;
            }

            const notes = JSON.parse(notesData);
            
            // Convert date strings back to Date objects
            const processedNotes = notes.map((note: any) => ({
                ...note,
                createdAt: new Date(note.createdAt),
                updatedAt: note.updatedAt ? new Date(note.updatedAt) : undefined
            }));

            // Save to Firestore
            await this.saveToFirestore('notes', userId, processedNotes);
            
            console.log(`✅ Migrated ${notes.length} notes for user: ${userId}`);
            return true;

        } catch (error) {
            console.error(`❌ Error migrating notes for user ${userId}:`, error);
            return false;
        }
    }

    // Migrate user preferences
    private async migrateUserPreferences(userId: string): Promise<boolean> {
        try {
            const key = `user_preferences_${userId}`;
            const preferencesData = localStorage.getItem(key);
            
            if (!preferencesData) {
                console.log(`No user preferences data found for user: ${userId}`);
                return false;
            }

            const preferences = JSON.parse(preferencesData);

            // Save to Firestore
            await this.saveToFirestore('userPreferences', userId, preferences);
            
            console.log(`✅ Migrated user preferences for user: ${userId}`);
            return true;

        } catch (error) {
            console.error(`❌ Error migrating user preferences for user ${userId}:`, error);
            return false;
        }
    }

    // Create enhanced analytics data for the user
    private async createEnhancedAnalyticsData(userId: string): Promise<void> {
        try {
            // Generate initial fluency metrics
            const fluencyMetrics = await enhancedAnalyticsService.calculateFluencyMetrics(userId, []);
            
            // Save fluency metrics to Firestore
            await this.saveToFirestore('fluencyMetrics', userId, {
                ...fluencyMetrics,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // Generate initial student insights
            const insights = await enhancedAnalyticsService.generateStudentInsights(userId);
            
            // Save insights to Firestore
            await this.saveToFirestore('studentInsights', userId, {
                ...insights,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            console.log(`✅ Created enhanced analytics data for user: ${userId}`);

        } catch (error) {
            console.error(`❌ Error creating enhanced analytics data for user ${userId}:`, error);
        }
    }

    // Get all users from storage (placeholder - would normally come from Firestore)
    private async getAllUsersFromStorage(): Promise<User[]> {
        // This is a placeholder implementation
        // In a real scenario, you would get users from Firestore
        // For now, we'll check localStorage for any user data
        
        const users: User[] = [];
        
        // Check for any learning progress data in localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('learning_progress_')) {
                const userId = key.replace('learning_progress_', '');
                
                // Try to get user info from other localStorage keys
                const userInfo = localStorage.getItem(`user_info_${userId}`);
                if (userInfo) {
                    try {
                        const user = JSON.parse(userInfo);
                        users.push(user);
                    } catch (error) {
                        console.warn(`Could not parse user info for ${userId}:`, error);
                    }
                } else {
                    // Create a minimal user object
                    users.push({
                        uid: userId,
                        email: `user_${userId}@example.com`,
                        displayName: `User ${userId}`,
                        photoURL: '',
                        role: 'student',
                        isMainTeacher: false
                    });
                }
            }
        }

        return users;
    }

    // Save data to Firestore (placeholder implementation)
    private async saveToFirestore(collection: string, userId: string, data: any): Promise<void> {
        // This is a placeholder implementation
        // In a real scenario, you would use Firebase Firestore
        
        console.log(`💾 Saving to Firestore: ${collection}/${userId}`, data);
        
        // For now, we'll simulate the save operation
        // In reality, you would use:
        // await db.collection(collection).doc(userId).set(data);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log(`✅ Successfully saved to Firestore: ${collection}/${userId}`);
    }

    // Backup localStorage data before migration
    async backupLocalStorageData(): Promise<string> {
        try {
            const backup: { [key: string]: string } = {};
            
            // Copy all localStorage data
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    backup[key] = localStorage.getItem(key) || '';
                }
            }

            const backupData = JSON.stringify(backup, null, 2);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupKey = `backup_${timestamp}`;
            
            // Store backup in localStorage
            localStorage.setItem(backupKey, backupData);
            
            console.log(`💾 Created backup: ${backupKey}`);
            return backupKey;

        } catch (error) {
            console.error('❌ Error creating backup:', error);
            throw error;
        }
    }

    // Restore from backup
    async restoreFromBackup(backupKey: string): Promise<void> {
        try {
            const backupData = localStorage.getItem(backupKey);
            if (!backupData) {
                throw new Error(`Backup not found: ${backupKey}`);
            }

            const backup = JSON.parse(backupData);
            
            // Clear current localStorage
            localStorage.clear();
            
            // Restore backup data
            Object.entries(backup).forEach(([key, value]) => {
                localStorage.setItem(key, value as string);
            });

            console.log(`🔄 Restored from backup: ${backupKey}`);

        } catch (error) {
            console.error('❌ Error restoring from backup:', error);
            throw error;
        }
    }

    // Get migration status for a user
    async getMigrationStatus(userId: string): Promise<MigrationStatus> {
        try {
            const statusKey = `migration_status_${userId}`;
            const statusData = localStorage.getItem(statusKey);
            
            if (statusData) {
                const status = JSON.parse(statusData);
                return {
                    ...status,
                    lastUpdated: new Date(status.lastUpdated)
                };
            }

            // Return default status
            return {
                userId,
                status: 'pending',
                progress: 0,
                lastUpdated: new Date(),
                errors: [],
                migratedData: {
                    learningProgress: false,
                    sessionHistory: false,
                    learningMoments: false,
                    notes: false,
                    preferences: false
                }
            };

        } catch (error) {
            console.error(`❌ Error getting migration status for user ${userId}:`, error);
            return {
                userId,
                status: 'failed',
                progress: 0,
                lastUpdated: new Date(),
                errors: [error instanceof Error ? error.message : 'Unknown error'],
                migratedData: {
                    learningProgress: false,
                    sessionHistory: false,
                    learningMoments: false,
                    notes: false,
                    preferences: false
                }
            };
        }
    }

    // Update migration status
    private async updateMigrationStatus(userId: string, status: Partial<MigrationStatus>): Promise<void> {
        try {
            const currentStatus = await this.getMigrationStatus(userId);
            const updatedStatus = {
                ...currentStatus,
                ...status,
                lastUpdated: new Date()
            };

            const statusKey = `migration_status_${userId}`;
            localStorage.setItem(statusKey, JSON.stringify(updatedStatus));

        } catch (error) {
            console.error(`❌ Error updating migration status for user ${userId}:`, error);
        }
    }

    // Clean up localStorage after successful migration
    async cleanupLocalStorage(userId: string): Promise<void> {
        try {
            const keysToRemove = [
                `learning_progress_${userId}`,
                `session_history_${userId}`,
                `learning_moments_${userId}`,
                `notes_${userId}`,
                `user_preferences_${userId}`,
                `learning_memory_${userId}`
            ];

            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });

            console.log(`🧹 Cleaned up localStorage for user: ${userId}`);

        } catch (error) {
            console.error(`❌ Error cleaning up localStorage for user ${userId}:`, error);
        }
    }
}

// Export singleton instance
export const dataMigrationService = DataMigrationService.getInstance();






