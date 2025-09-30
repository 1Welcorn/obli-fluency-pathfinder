import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { dataMigrationService, MigrationReport } from '../services/dataMigrationService';

interface DataMigrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DataMigrationModal: React.FC<DataMigrationModalProps> = ({ isOpen, onClose }) => {
    const [isMigrating, setIsMigrating] = useState(false);
    const [migrationReport, setMigrationReport] = useState<MigrationReport | null>(null);
    const [showBackupWarning, setShowBackupWarning] = useState(true);

    if (!isOpen) return null;

    const handleStartMigration = async () => {
        try {
            setIsMigrating(true);
            setMigrationReport(null);

            // Create backup first
            const backupKey = await dataMigrationService.backupLocalStorageData();
            console.log('Backup created:', backupKey);

            // Start migration
            const report = await dataMigrationService.migrateAllStudentData();
            setMigrationReport(report);
            setShowBackupWarning(false);

        } catch (error) {
            console.error('Migration failed:', error);
            alert('Migration failed. Please check the console for details.');
        } finally {
            setIsMigrating(false);
        }
    };

    const handleRestoreBackup = async () => {
        try {
            // This would normally show a list of available backups
            // For now, we'll use a simple prompt
            const backupKey = prompt('Enter backup key to restore:');
            if (backupKey) {
                await dataMigrationService.restoreFromBackup(backupKey);
                alert('Backup restored successfully!');
                onClose();
            }
        } catch (error) {
            console.error('Restore failed:', error);
            alert('Restore failed. Please check the console for details.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-slate-800"
                    aria-label="Close"
                >
                    <CloseIcon className="h-6 w-6" />
                </button>

                <div className="mb-6">
                    <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Data Migration</h2>
                    <p className="text-slate-600">
                        Migrate student data from localStorage to Firestore for better persistence and analytics.
                    </p>
                </div>

                {showBackupWarning && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important</h3>
                        <p className="text-yellow-700 text-sm">
                            This process will migrate all student data from browser storage to the cloud database. 
                            A backup will be created automatically before migration starts.
                        </p>
                    </div>
                )}

                {!migrationReport && !isMigrating && (
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="font-semibold text-blue-800 mb-2">What will be migrated:</h3>
                            <ul className="text-blue-700 text-sm space-y-1">
                                <li>• Learning progress and session history</li>
                                <li>• Learning moments and achievements</li>
                                <li>• Student notes and preferences</li>
                                <li>• Challenge submissions and scores</li>
                                <li>• Enhanced analytics data</li>
                            </ul>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleStartMigration}
                                className="flex-1 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
                            >
                                Start Migration
                            </button>
                            <button
                                onClick={handleRestoreBackup}
                                className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Restore Backup
                            </button>
                        </div>
                    </div>
                )}

                {isMigrating && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Migrating Data...</h3>
                        <p className="text-slate-600">Please wait while we migrate your student data to the cloud.</p>
                        <div className="mt-4 bg-slate-200 rounded-full h-2">
                            <div className="bg-indigo-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                )}

                {migrationReport && (
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h3 className="font-semibold text-green-800 mb-2">✅ Migration Complete!</h3>
                            <div className="text-green-700 text-sm space-y-1">
                                <p>• Total users processed: {migrationReport.totalUsers}</p>
                                <p>• Successful migrations: {migrationReport.successfulMigrations}</p>
                                <p>• Failed migrations: {migrationReport.failedMigrations}</p>
                                <p>• Total data points migrated: {migrationReport.totalDataPoints}</p>
                                <p>• Migration time: {migrationReport.migrationTime} seconds</p>
                            </div>
                        </div>

                        {migrationReport.errors.length > 0 && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <h3 className="font-semibold text-red-800 mb-2">⚠️ Errors Encountered:</h3>
                                <div className="text-red-700 text-sm space-y-1">
                                    {migrationReport.errors.map((error, index) => (
                                        <p key={index}>• {error.userId}: {error.error}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setMigrationReport(null);
                                    setShowBackupWarning(true);
                                }}
                                className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Run Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataMigrationModal;






