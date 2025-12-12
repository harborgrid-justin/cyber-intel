
import React, { useState } from 'react';
import { Badge } from '../Shared/UI';

interface Collaborator {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  permissions: string[];
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  isInternal?: boolean;
  mentions?: string[];
}

interface CollaborationPanelProps {
  caseId: string;
  collaborators: Collaborator[];
  comments: Comment[];
  currentUser: string;
  onAddComment?: (content: string, isInternal: boolean) => void;
  onInviteUser?: (email: string, role: string) => void;
  onRemoveUser?: (userId: string) => void;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  caseId,
  collaborators,
  comments,
  currentUser,
  onAddComment,
  onInviteUser,
  onRemoveUser
}) => {
  const [activeTab, setActiveTab] = useState<'comments' | 'collaborators'>('comments');
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Viewer');

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    onAddComment?.(newComment, isInternal);
    setNewComment('');
    setIsInternal(false);
  };

  const handleInviteUser = () => {
    if (!inviteEmail.trim()) return;

    onInviteUser?.(inviteEmail, inviteRole);
    setInviteEmail('');
    setInviteRole('Viewer');
    setShowInviteForm(false);
  };

  const getStatusColor = (status: Collaborator['status']) => {
    const colors = {
      online: 'bg-green-500',
      offline: 'bg-gray-500',
      away: 'bg-yellow-500'
    };
    return colors[status];
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-800 p-4">
        <h3 className="text-lg font-semibold text-slate-200">Collaboration</h3>
        <p className="text-xs text-slate-500">Team communication and coordination</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'comments'
              ? 'text-blue-400 border-b-2 border-blue-600 bg-blue-600/5'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Comments ({comments.length})
        </button>
        <button
          onClick={() => setActiveTab('collaborators')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'collaborators'
              ? 'text-blue-400 border-b-2 border-blue-600 bg-blue-600/5'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Team ({collaborators.length})
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'comments' ? (
          <div className="space-y-4">
            {/* Comment Input */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment... (use @username to mention)"
                rows={3}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-400">Internal Only</span>
                </label>

                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded text-sm font-medium transition-colors"
                >
                  Post Comment
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500">No comments yet</p>
                  <p className="text-xs text-slate-600 mt-1">Start the conversation</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`bg-slate-800/30 border rounded-lg p-3 ${
                      comment.isInternal
                        ? 'border-yellow-600/30 bg-yellow-600/5'
                        : 'border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-medium text-white">
                          {comment.author[0]}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-200">{comment.author}</span>
                          <span className="text-xs text-slate-500 ml-2">{formatTimestamp(comment.timestamp)}</span>
                        </div>
                      </div>
                      {comment.isInternal && (
                        <Badge color="yellow" className="text-[10px]">Internal</Badge>
                      )}
                    </div>

                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{comment.content}</p>

                    {comment.mentions && comment.mentions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {comment.mentions.map((mention) => (
                          <Badge key={mention} className="text-[10px]">@{mention}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Invite User Button */}
            <button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
            >
              {showInviteForm ? 'Cancel' : '+ Invite Team Member'}
            </button>

            {/* Invite Form */}
            {showInviteForm && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Viewer">Viewer</option>
                    <option value="Analyst">Analyst</option>
                    <option value="Lead">Lead Investigator</option>
                  </select>
                </div>

                <button
                  onClick={handleInviteUser}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                >
                  Send Invitation
                </button>
              </div>
            )}

            {/* Collaborators List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="bg-slate-800/30 border border-slate-700 rounded-lg p-3 hover:border-slate-600 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-medium text-white">
                          {collaborator.name[0]}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${getStatusColor(collaborator.status)}`}></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200">{collaborator.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge className="text-[10px]">{collaborator.role}</Badge>
                          <span className="text-[10px] text-slate-500 capitalize">{collaborator.status}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {collaborator.permissions.map((perm) => (
                            <span key={perm} className="text-[10px] text-slate-600">• {perm}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {collaborator.name !== currentUser && onRemoveUser && (
                      <button
                        onClick={() => onRemoveUser(collaborator.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800">
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{collaborators.filter(c => c.status === 'online').length}</div>
                <div className="text-[10px] text-slate-500">Online</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-400">{collaborators.filter(c => c.status === 'away').length}</div>
                <div className="text-[10px] text-slate-500">Away</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-slate-400">{collaborators.filter(c => c.status === 'offline').length}</div>
                <div className="text-[10px] text-slate-500">Offline</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationPanel;
