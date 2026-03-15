import { useState } from 'react';
import ChoreRow from './ChoreRow';
import WhoDidItModal from './WhoDidItModal';
import { FREQUENCY_LABELS, FREQUENCY_ORDER } from '../data/chores';

export default function ChoreList({ chores, completions, filter, crimsonDayOff, onAddCompletion }) {
  const [pendingChore, setPendingChore] = useState(null);
  // All sections open by default
  const [collapsed, setCollapsed] = useState({});

  // Build map: choreId -> last completion
  const lastCompletionMap = {};
  const choreCompletionsMap = {};
  for (const c of completions) {
    if (!choreCompletionsMap[c.choreId]) choreCompletionsMap[c.choreId] = [];
    choreCompletionsMap[c.choreId].push(c);
    if (!lastCompletionMap[c.choreId] || c.timestamp > lastCompletionMap[c.choreId].timestamp) {
      lastCompletionMap[c.choreId] = c;
    }
  }

  // Filter by person
  const filteredChores = chores.filter((chore) => {
    if (filter === 'all') return true;
    if (chore.owner === filter) return true;
    if (chore.owner === 'both' || chore.owner === 'flexible') return true;
    return false;
  });

  // Group by frequency
  const grouped = {};
  for (const freq of FREQUENCY_ORDER) {
    grouped[freq] = filteredChores.filter((c) => c.frequency === freq);
  }

  const handleMarkDone = (chore) => {
    const needsPrompt = chore.owner === 'both' || chore.owner === 'flexible';
    if (needsPrompt) {
      setPendingChore(chore);
    } else {
      let completedBy = chore.owner;
      if (chore.id === 'litter-box' && crimsonDayOff) {
        completedBy = 'crimson';
      }
      onAddCompletion(chore.id, completedBy);
    }
  };

  const handleWhoDidIt = (person) => {
    if (pendingChore) {
      onAddCompletion(pendingChore.id, person);
      setPendingChore(null);
    }
  };

  const toggleCollapsed = (freq) => {
    setCollapsed((prev) => ({ ...prev, [freq]: !prev[freq] }));
  };

  const renderGroup = (freq) => {
    const group = grouped[freq];
    if (!group || group.length === 0) return null;
    const isCollapsed = !!collapsed[freq];
    return (
      <section key={freq} className="chore-group">
        <button
          className={`chore-group__heading chore-group__heading--btn ${isCollapsed ? 'chore-group__heading--collapsed' : ''}`}
          onClick={() => toggleCollapsed(freq)}
          aria-expanded={!isCollapsed}
        >
          <span>{FREQUENCY_LABELS[freq]}</span>
          <span className="chore-group__count">{group.length}</span>
          <span className="chore-group__chevron">{isCollapsed ? '›' : '‹'}</span>
        </button>
        {!isCollapsed && (
          <div className="chore-group__rows">
            {group.map((chore) => (
              <ChoreRow
                key={chore.id}
                chore={chore}
                lastCompletion={lastCompletionMap[chore.id] || null}
                choreCompletions={choreCompletionsMap[chore.id] || []}
                onMarkDone={handleMarkDone}
              />
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="chore-list">
      {pendingChore && (
        <WhoDidItModal
          choreName={pendingChore.name}
          onSelect={handleWhoDidIt}
          onCancel={() => setPendingChore(null)}
        />
      )}

      <div className="chore-columns">
        <div className="chore-col">
          {renderGroup('daily')}
          {renderGroup('weekly')}
        </div>
        <div className="chore-col">
          {renderGroup('biweekly')}
          {renderGroup('monthly')}
        </div>
      </div>
    </div>
  );
}
