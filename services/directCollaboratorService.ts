// Direct Collaborator Service
// Allows adding collaborators directly by email without invitation process

import { User, Collaborator, CollaboratorPermission } from '../types';
import { isFirebaseConfigured, db } from './firebaseConfig';

export interface DirectCollaboratorRequest {
    email: string;
    permission: CollaboratorPermission;
    displayName?: string;
    role: 'teacher' | 'student';
}

export interface DirectCollaboratorResult {
    success: boolean;
    message: string;
    collaborator?: Collaborator;
    error?: string;
}

export interface CollaboratorManagementResult {
    success: boolean;
    message: string;
    error?: string;
}

class DirectCollaboratorService {
    private static instance: DirectCollaboratorService;
    
    public static getInstance(): DirectCollaboratorService {
        if (!DirectCollaboratorService.instance) {
            DirectCollaboratorService.instance = new DirectCollaboratorService();
        }
        return DirectCollaboratorService.instance;
    }

    /**
     * Add a collaborator directly by email without invitation
     * This creates a user account and grants them teacher access immediately
     */
    async addDirectCollaborator(
        request: DirectCollaboratorRequest,
        addedBy: User
    ): Promise<DirectCollaboratorResult> {
        try {
            if (!isFirebaseConfigured || !db) {
                throw new Error('Firebase not configured');
            }

            // Validate email format
            if (!this.isValidEmail(request.email)) {
                return {
                    success: false,
                    message: 'Invalid email format',
                    error: 'INVALID_EMAIL'
                };
            }

            // Check if user already exists
            const existingUser = await this.findUserByEmail(request.email);
            if (existingUser) {
                // User exists, update their role and permissions
                return await this.updateExistingUserToCollaborator(
                    existingUser,
                    request,
                    addedBy
                );
            } else {
                // User doesn't exist, create new collaborator entry
                return await this.createNewCollaborator(request, addedBy);
            }

        } catch (error) {
            console.error('Error adding direct collaborator:', error);
            return {
                success: false,
                message: 'Failed to add collaborator',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Create a new collaborator entry for a user who doesn't exist yet
     */
    private async createNewCollaborator(
        request: DirectCollaboratorRequest,
        addedBy: User
    ): Promise<DirectCollaboratorResult> {
        try {
            // Create a temporary user document that will be activated when they sign in
            const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const collaboratorData = {
                uid: tempUserId,
                email: request.email,
                displayName: request.displayName || request.email.split('@')[0],
                photoURL: '',
                role: request.role,
                isMainTeacher: false,
                isCollaborator: true,
                collaboratorPermission: request.permission,
                addedBy: addedBy.uid,
                addedAt: new Date(),
                status: 'pending_activation', // Will be activated when they sign in
                createdAt: new Date()
            };

            // Store in a special collection for pending collaborators
            await db.collection('pendingCollaborators').doc(tempUserId).set(collaboratorData);

            // Also add to the main collaborators list
            const collaborator: Collaborator = {
                email: request.email,
                permission: request.permission,
                invitedAt: new Date(),
                invitedBy: addedBy.email || addedBy.uid
            };

            await this.addToCollaboratorsList(collaborator, addedBy);

            console.log(`✅ Created pending collaborator: ${request.email}`);

            return {
                success: true,
                message: `Collaborator ${request.email} has been added. They will be activated when they sign in with their email.`,
                collaborator
            };

        } catch (error) {
            console.error('Error creating new collaborator:', error);
            throw error;
        }
    }

    /**
     * Update an existing user to become a collaborator
     */
    private async updateExistingUserToCollaborator(
        existingUser: any,
        request: DirectCollaboratorRequest,
        addedBy: User
    ): Promise<DirectCollaboratorResult> {
        try {
            // Update the existing user's role and permissions
            await db.collection('users').doc(existingUser.uid).update({
                role: request.role,
                isCollaborator: true,
                collaboratorPermission: request.permission,
                addedBy: addedBy.uid,
                addedAt: new Date(),
                lastUpdated: new Date()
            });

            // Add to collaborators list
            const collaborator: Collaborator = {
                email: request.email,
                permission: request.permission,
                invitedAt: new Date(),
                invitedBy: addedBy.email || addedBy.uid
            };

            await this.addToCollaboratorsList(collaborator, addedBy);

            console.log(`✅ Updated existing user to collaborator: ${request.email}`);

            return {
                success: true,
                message: `Existing user ${request.email} has been granted ${request.permission} access.`,
                collaborator
            };

        } catch (error) {
            console.error('Error updating existing user to collaborator:', error);
            throw error;
        }
    }

    /**
     * Find user by email in the users collection
     */
    private async findUserByEmail(email: string): Promise<any | null> {
        try {
            const usersSnapshot = await db.collection('users')
                .where('email', '==', email)
                .limit(1)
                .get();

            if (!usersSnapshot.empty) {
                const userDoc = usersSnapshot.docs[0];
                return {
                    uid: userDoc.id,
                    ...userDoc.data()
                };
            }

            return null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            return null;
        }
    }

    /**
     * Add collaborator to the main collaborators list
     */
    private async addToCollaboratorsList(collaborator: Collaborator, addedBy: User): Promise<void> {
        try {
            // Store in a global collaborators collection
            await db.collection('collaborators').add({
                ...collaborator,
                addedBy: addedBy.uid,
                addedAt: new Date(),
                status: 'active'
            });

            console.log(`✅ Added collaborator to list: ${collaborator.email}`);
        } catch (error) {
            console.error('Error adding to collaborators list:', error);
            throw error;
        }
    }

    /**
     * Get all collaborators
     */
    async getAllCollaborators(): Promise<Collaborator[]> {
        try {
            if (!isFirebaseConfigured || !db) {
                throw new Error('Firebase not configured');
            }

            const collaboratorsSnapshot = await db.collection('collaborators')
                .orderBy('invitedAt', 'desc')
                .get();

            return collaboratorsSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    email: data.email,
                    permission: data.permission,
                    invitedAt: data.invitedAt?.toDate() || new Date(),
                    invitedBy: data.invitedBy
                };
            });

        } catch (error) {
            console.error('Error getting collaborators:', error);
            return [];
        }
    }

    /**
     * Remove a collaborator
     */
    async removeCollaborator(email: string, removedBy: User): Promise<CollaboratorManagementResult> {
        try {
            if (!isFirebaseConfigured || !db) {
                throw new Error('Firebase not configured');
            }

            // Remove from collaborators collection
            const collaboratorsSnapshot = await db.collection('collaborators')
                .where('email', '==', email)
                .get();

            if (!collaboratorsSnapshot.empty) {
                const batch = db.batch();
                collaboratorsSnapshot.docs.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
            }

            // Update user document if they exist
            const user = await this.findUserByEmail(email);
            if (user) {
                await db.collection('users').doc(user.uid).update({
                    isCollaborator: false,
                    collaboratorPermission: null,
                    removedBy: removedBy.uid,
                    removedAt: new Date(),
                    lastUpdated: new Date()
                });
            }

            // Remove from pending collaborators if they exist
            const pendingSnapshot = await db.collection('pendingCollaborators')
                .where('email', '==', email)
                .get();

            if (!pendingSnapshot.empty) {
                const batch = db.batch();
                pendingSnapshot.docs.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
            }

            console.log(`✅ Removed collaborator: ${email}`);

            return {
                success: true,
                message: `Collaborator ${email} has been removed successfully.`
            };

        } catch (error) {
            console.error('Error removing collaborator:', error);
            return {
                success: false,
                message: 'Failed to remove collaborator',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Update collaborator permission
     */
    async updateCollaboratorPermission(
        email: string,
        newPermission: CollaboratorPermission,
        updatedBy: User
    ): Promise<CollaboratorManagementResult> {
        try {
            if (!isFirebaseConfigured || !db) {
                throw new Error('Firebase not configured');
            }

            // Update in collaborators collection
            const collaboratorsSnapshot = await db.collection('collaborators')
                .where('email', '==', email)
                .get();

            if (!collaboratorsSnapshot.empty) {
                const batch = db.batch();
                collaboratorsSnapshot.docs.forEach(doc => {
                    batch.update(doc.ref, {
                        permission: newPermission,
                        updatedBy: updatedBy.uid,
                        updatedAt: new Date()
                    });
                });
                await batch.commit();
            }

            // Update user document if they exist
            const user = await this.findUserByEmail(email);
            if (user) {
                await db.collection('users').doc(user.uid).update({
                    collaboratorPermission: newPermission,
                    updatedBy: updatedBy.uid,
                    updatedAt: new Date(),
                    lastUpdated: new Date()
                });
            }

            console.log(`✅ Updated collaborator permission: ${email} -> ${newPermission}`);

            return {
                success: true,
                message: `Collaborator ${email} permission updated to ${newPermission}.`
            };

        } catch (error) {
            console.error('Error updating collaborator permission:', error);
            return {
                success: false,
                message: 'Failed to update collaborator permission',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Activate a pending collaborator when they sign in
     */
    async activatePendingCollaborator(userEmail: string, userUid: string): Promise<void> {
        try {
            if (!isFirebaseConfigured || !db) {
                return;
            }

            // Find pending collaborator
            const pendingSnapshot = await db.collection('pendingCollaborators')
                .where('email', '==', userEmail)
                .limit(1)
                .get();

            if (!pendingSnapshot.empty) {
                const pendingDoc = pendingSnapshot.docs[0];
                const pendingData = pendingDoc.data();

                // Create user document with collaborator permissions
                await db.collection('users').doc(userUid).set({
                    uid: userUid,
                    email: userEmail,
                    displayName: pendingData.displayName,
                    photoURL: pendingData.photoURL,
                    role: pendingData.role,
                    isMainTeacher: false,
                    isCollaborator: true,
                    collaboratorPermission: pendingData.collaboratorPermission,
                    addedBy: pendingData.addedBy,
                    addedAt: pendingData.addedAt,
                    status: 'active',
                    activatedAt: new Date(),
                    createdAt: pendingData.createdAt
                });

                // Remove from pending collaborators
                await pendingDoc.ref.delete();

                console.log(`✅ Activated pending collaborator: ${userEmail}`);
            }

        } catch (error) {
            console.error('Error activating pending collaborator:', error);
        }
    }

    /**
     * Get pending collaborators
     */
    async getPendingCollaborators(): Promise<any[]> {
        try {
            if (!isFirebaseConfigured || !db) {
                return [];
            }

            const pendingSnapshot = await db.collection('pendingCollaborators')
                .orderBy('addedAt', 'desc')
                .get();

            return pendingSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        } catch (error) {
            console.error('Error getting pending collaborators:', error);
            return [];
        }
    }

    /**
     * Validate email format
     */
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Check if email is already a collaborator
     */
    async isEmailCollaborator(email: string): Promise<boolean> {
        try {
            const collaborators = await this.getAllCollaborators();
            return collaborators.some(c => c.email === email);
        } catch (error) {
            console.error('Error checking if email is collaborator:', error);
            return false;
        }
    }

    /**
     * Bulk add collaborators
     */
    async bulkAddCollaborators(
        requests: DirectCollaboratorRequest[],
        addedBy: User
    ): Promise<{
        successful: DirectCollaboratorResult[];
        failed: DirectCollaboratorResult[];
    }> {
        const successful: DirectCollaboratorResult[] = [];
        const failed: DirectCollaboratorResult[] = [];

        for (const request of requests) {
            try {
                const result = await this.addDirectCollaborator(request, addedBy);
                if (result.success) {
                    successful.push(result);
                } else {
                    failed.push(result);
                }
            } catch (error) {
                failed.push({
                    success: false,
                    message: 'Failed to add collaborator',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        return { successful, failed };
    }
}

// Export singleton instance
export const directCollaboratorService = DirectCollaboratorService.getInstance();






