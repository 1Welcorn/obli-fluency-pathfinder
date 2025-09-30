import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import { directCollaboratorService, DirectCollaboratorRequest, DirectCollaboratorResult } from '../services/directCollaboratorService';
import { Collaborator, CollaboratorPermission, User } from '../types';

interface EnhancedCollaboratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
    onCollaboratorsUpdated: () => void;
}

const EnhancedCollaboratorModal: React.FC<EnhancedCollaboratorModalProps> = ({
    isOpen,
    onClose,
    currentUser,
    onCollaboratorsUpdated
}) => {
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [selectedPermission, setSelectedPermission] = useState<CollaboratorPermission>('viewer');
    const [selectedRole, setSelectedRole] = useState<'teacher' | 'student'>('teacher');
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [pendingCollaborators, setPendingCollaborators] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(true);
    const [activeTab, setActiveTab] = useState<'add' | 'manage' | 'pending'>('add');
    const [results, setResults] = useState<DirectCollaboratorResult[]>([]);
    const [bulkEmails, setBulkEmails] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadCollaborators();
        }
    }, [isOpen]);

    const loadCollaborators = async () => {
        try {
            setIsLoadingCollaborators(true);
            const [activeCollaborators, pending] = await Promise.all([
                directCollaboratorService.getAllCollaborators(),
                directCollaboratorService.getPendingCollaborators()
            ]);
            setCollaborators(activeCollaborators);
            setPendingCollaborators(pending);
        } catch (error) {
            console.error('Error loading collaborators:', error);
        } finally {
            setIsLoadingCollaborators(false);
        }
    };

    const handleAddCollaborator = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsLoading(true);
        try {
            const request: DirectCollaboratorRequest = {
                email: email.trim(),
                permission: selectedPermission,
                displayName: displayName.trim() || undefined,
                role: selectedRole
            };

            const result = await directCollaboratorService.addDirectCollaborator(request, currentUser);
            setResults([result]);
            
            if (result.success) {
                setEmail('');
                setDisplayName('');
                setSelectedPermission('viewer');
                setSelectedRole('teacher');
                await loadCollaborators();
                onCollaboratorsUpdated();
            }
        } catch (error) {
            console.error('Error adding collaborator:', error);
            setResults([{
                success: false,
                message: 'Failed to add collaborator',
                error: error instanceof Error ? error.message : 'Unknown error'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBulkAdd = async () => {
        if (!bulkEmails.trim()) return;

        const emailList = bulkEmails
            .split('\n')
            .map(email => email.trim())
            .filter(email => email.length > 0);

        if (emailList.length === 0) return;

        setIsLoading(true);
        try {
            const requests: DirectCollaboratorRequest[] = emailList.map(email => ({
                email,
                permission: selectedPermission,
                role: selectedRole
            }));

            const { successful, failed } = await directCollaboratorService.bulkAddCollaborators(requests, currentUser);
            setResults([...successful, ...failed]);
            
            if (successful.length > 0) {
                setBulkEmails('');
                await loadCollaborators();
                onCollaboratorsUpdated();
            }
        } catch (error) {
            console.error('Error bulk adding collaborators:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveCollaborator = async (email: string) => {
        if (!window.confirm(`Are you sure you want to remove ${email} as a collaborator?`)) {
            return;
        }

        try {
            const result = await directCollaboratorService.removeCollaborator(email, currentUser);
            if (result.success) {
                await loadCollaborators();
                onCollaboratorsUpdated();
                alert(result.message);
            } else {
                alert(`Failed to remove collaborator: ${result.message}`);
            }
        } catch (error) {
            console.error('Error removing collaborator:', error);
            alert('Failed to remove collaborator');
        }
    };

    const handleUpdatePermission = async (email: string, newPermission: CollaboratorPermission) => {
        try {
            const result = await directCollaboratorService.updateCollaboratorPermission(email, newPermission, currentUser);
            if (result.success) {
                await loadCollaborators();
                onCollaboratorsUpdated();
                alert(result.message);
            } else {
                alert(`Failed to update permission: ${result.message}`);
            }
        } catch (error) {
            console.error('Error updating permission:', error);
            alert('Failed to update permission');
        }
    };

    const getPermissionBadgeColor = (permission: CollaboratorPermission) => {
        return permission === 'editor' 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : 'bg-blue-100 text-blue-800 border-blue-200';
    };

    const getPermissionDescription = (permission: CollaboratorPermission) => {
        return permission === 'editor' 
            ? 'Can view and edit student progress' 
            : 'Can only view student progress';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-slate-800"
                    aria-label="Close"
                >
                    <CloseIcon className="h-6 w-6" />
                </button>

                <div className="mb-6">
                    <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Enhanced Collaborator Management</h2>
                    <p className="text-slate-600">
                        Add teachers directly by email or manage existing collaborators.
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-1 mb-6 bg-slate-100 p-1 rounded-lg">
                    {[
                        { id: 'add', label: 'Add Collaborators', icon: UserPlusIcon },
                        { id: 'manage', label: 'Manage Active', icon: CheckCircleIcon },
                        { id: 'pending', label: 'Pending Activation', icon: XCircleIcon }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id as any)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                                activeTab === id
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-800'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {/* Add Collaborators Tab */}
                {activeTab === 'add' && (
                    <div className="space-y-6">
                        {/* Single Collaborator Form */}
                        <div className="bg-slate-50 p-6 rounded-xl">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Add Single Collaborator</h3>
                            
                            <form onSubmit={handleAddCollaborator} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="teacher@example.com"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Display Name (Optional)</label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                                        <select
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value as 'teacher' | 'student')}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="teacher">Teacher</option>
                                            <option value="student">Student</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Permission Level</label>
                                        <select
                                            value={selectedPermission}
                                            onChange={(e) => setSelectedPermission(e.target.value as CollaboratorPermission)}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="viewer">Viewer (Read Only)</option>
                                            <option value="editor">Editor (Read & Write)</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !email.trim()}
                                    className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
                                >
                                    {isLoading ? 'Adding...' : 'Add Collaborator'}
                                </button>
                            </form>
                        </div>

                        {/* Bulk Add Section */}
                        <div className="bg-slate-50 p-6 rounded-xl">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Bulk Add Collaborators</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Email Addresses (one per line)
                                    </label>
                                    <textarea
                                        value={bulkEmails}
                                        onChange={(e) => setBulkEmails(e.target.value)}
                                        placeholder="teacher1@example.com&#10;teacher2@example.com&#10;teacher3@example.com"
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Default Role</label>
                                        <select
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value as 'teacher' | 'student')}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="teacher">Teacher</option>
                                            <option value="student">Student</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Default Permission</label>
                                        <select
                                            value={selectedPermission}
                                            onChange={(e) => setSelectedPermission(e.target.value as CollaboratorPermission)}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="viewer">Viewer (Read Only)</option>
                                            <option value="editor">Editor (Read & Write)</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={handleBulkAdd}
                                    disabled={isLoading || !bulkEmails.trim()}
                                    className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
                                >
                                    {isLoading ? 'Adding...' : 'Bulk Add Collaborators'}
                                </button>
                            </div>
                        </div>

                        {/* Results */}
                        {results.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-slate-800">Results:</h4>
                                {results.map((result, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-lg ${
                                            result.success
                                                ? 'bg-green-50 border border-green-200 text-green-800'
                                                : 'bg-red-50 border border-red-200 text-red-800'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            {result.success ? (
                                                <CheckCircleIcon className="h-5 w-5" />
                                            ) : (
                                                <XCircleIcon className="h-5 w-5" />
                                            )}
                                            <span className="font-medium">{result.message}</span>
                                        </div>
                                        {result.error && (
                                            <div className="text-sm mt-1 opacity-75">{result.error}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Manage Active Collaborators Tab */}
                {activeTab === 'manage' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800">Active Collaborators</h3>
                        
                        {isLoadingCollaborators ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                <p className="text-slate-600">Loading collaborators...</p>
                            </div>
                        ) : collaborators.length === 0 ? (
                            <div className="text-center py-8 text-slate-600">
                                <UserPlusIcon className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                                <p>No active collaborators found.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {collaborators.map((collaborator, index) => (
                                    <div key={index} className="bg-white border border-slate-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <h4 className="font-medium text-slate-800">{collaborator.email}</h4>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPermissionBadgeColor(collaborator.permission)}`}>
                                                        {collaborator.permission}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 mt-1">
                                                    {getPermissionDescription(collaborator.permission)}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Added by {collaborator.invitedBy} on {collaborator.invitedAt.toLocaleDateString()}
                                                </p>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                <select
                                                    value={collaborator.permission}
                                                    onChange={(e) => handleUpdatePermission(collaborator.email, e.target.value as CollaboratorPermission)}
                                                    className="text-sm border border-slate-300 rounded px-2 py-1"
                                                >
                                                    <option value="viewer">Viewer</option>
                                                    <option value="editor">Editor</option>
                                                </select>
                                                
                                                <button
                                                    onClick={() => handleRemoveCollaborator(collaborator.email)}
                                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove collaborator"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Pending Collaborators Tab */}
                {activeTab === 'pending' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800">Pending Activation</h3>
                        
                        {isLoadingCollaborators ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                <p className="text-slate-600">Loading pending collaborators...</p>
                            </div>
                        ) : pendingCollaborators.length === 0 ? (
                            <div className="text-center py-8 text-slate-600">
                                <CheckCircleIcon className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                                <p>No pending collaborators.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingCollaborators.map((pending, index) => (
                                    <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <h4 className="font-medium text-slate-800">{pending.email}</h4>
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                        Pending
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 mt-1">
                                                    {pending.displayName} • {pending.role} • {pending.collaboratorPermission}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Added by {pending.addedBy} on {new Date(pending.addedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            
                                            <div className="text-sm text-yellow-700">
                                                Waiting for sign-in
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnhancedCollaboratorModal;

