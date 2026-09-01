// apps/renderer/src/surfaces/MainAppView.tsx
import React, { useState } from 'react';
import { useGoals } from '../hooks/useGoals';
import { Goal, GoalDraft, GoalStatus, GoalUpdateDraft } from '@shared/types';
import { GoalCard } from '../components/GoalCard';
import { GoalEditorModal } from '../components/GoalEditorModal';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { GoalProgressRing } from '../components/GoalProgressRing';
import { Plus, Undo2, Redo2, Layers, CheckCircle2, Archive, Activity, Compass } from 'lucide-react';

export const MainAppView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GoalStatus | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const {
    goals,
    stats,
    history,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    archiveGoal,
    incrementProgress,
    addMilestone,
    toggleMilestone,
    deleteMilestone,
    undo,
    redo,
  } = useGoals(activeTab === 'all' ? undefined : activeTab);

  const filteredGoals = goals.filter((g) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return g.name.toLowerCase().includes(q) || (g.category && g.category.toLowerCase().includes(q));
  });

  const handleOpenCreate = () => {
    setEditingGoal(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsEditorOpen(true);
  };

  const handleSaveGoal = async (payload: GoalDraft | GoalUpdateDraft) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, payload);
    } else {
      await createGoal(payload as GoalDraft);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--bg-app)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
      }}
    >
      {/* Titlebar / Drag Region */}
      <div
        className="drag-region"
        style={{
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px 0 80px', // Offset for macOS traffic light buttons
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '-0.2px' }}>Beacon</span>
        </div>

        <div className="no-drag" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => undo()} className="btn-ghost" title="Undo (⌘Z)">
            <Undo2 size={14} />
          </button>
          <button onClick={() => redo()} className="btn-ghost" title="Redo (⌘⇧Z)">
            <Redo2 size={14} />
          </button>
          <button onClick={handleOpenCreate} className="btn-primary" style={{ padding: '5px 12px', fontSize: '12px' }}>
            <Plus size={14} />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Goals Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '16px 20px',
            gap: '14px',
          }}
        >
          {/* Tabs & Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
              <button
                onClick={() => setActiveTab('active')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 500,
                  backgroundColor: activeTab === 'active' ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === 'active' ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Layers size={12} />
                <span>Active</span>
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 500,
                  backgroundColor: activeTab === 'completed' ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === 'completed' ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <CheckCircle2 size={12} />
                <span>Completed</span>
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 500,
                  backgroundColor: activeTab === 'archived' ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === 'archived' ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Archive size={12} />
                <span>Archived</span>
              </button>
              <button
                onClick={() => setActiveTab('all')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 500,
                  backgroundColor: activeTab === 'all' ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === 'all' ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                All
              </button>
            </div>

            <input
              type="text"
              placeholder="Search goals or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '220px',
                padding: '6px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '12px',
              }}
            />
          </div>

          {/* Goal Cards Grid */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>
                Loading goals...
              </div>
            ) : filteredGoals.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  gap: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                <Layers size={36} strokeWidth={1.2} opacity={0.3} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>No goals found</p>
                  <p style={{ fontSize: '12px', marginTop: '2px' }}>Create a goal to start tracking progress</p>
                </div>
                <button onClick={handleOpenCreate} className="btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>
                  <Plus size={14} />
                  <span>Create First Goal</span>
                </button>
              </div>
            ) : (
              filteredGoals.map((g) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  onIncrement={incrementProgress}
                  onToggleMilestone={toggleMilestone}
                  onAddMilestone={addMilestone}
                  onDeleteMilestone={deleteMilestone}
                  onComplete={completeGoal}
                  onArchive={archiveGoal}
                  onDelete={deleteGoal}
                  onEdit={handleOpenEdit}
                />
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Stats & Activity Stream */}
        <div
          style={{
            width: '280px',
            borderLeft: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            gap: '16px',
            overflowY: 'auto',
          }}
        >
          {/* Aggregated Overview */}
          {stats && (
            <div
              style={{
                padding: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <GoalProgressRing progressFraction={stats.overallProgressFraction} size={52} strokeWidth={4.5} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Overall Progress</span>
                <span style={{ fontSize: '18px', fontWeight: 700 }}>{Math.round(stats.overallProgressFraction * 100)}%</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {stats.activeGoals} active • {stats.completedGoals} completed
                </span>
              </div>
            </div>
          )}

          {/* Activity Stream */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <Activity size={14} color="var(--accent-primary)" />
              <span>Today's Activity</span>
            </div>

            <ActivityTimeline events={history} goals={goals} />
          </div>
        </div>
      </div>

      {/* Goal Creation / Edit Modal */}
      <GoalEditorModal
        goal={editingGoal}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveGoal}
      />
    </div>
  );
};
