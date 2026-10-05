import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getProgress, getListActivityType } from '../lib/progress';
import { useSession } from './SessionContext';

// Supabase queries ported one-for-one from the web app's app.js.
// Every action returns { error } (or extra data) so screens decide how to report failures.

function mapEntry(e) {
  return { id: e.id, text: e.text, completed: e.completed, createdAt: e.created_at };
}

function mapList(list) {
  return {
    id: list.id,
    name: list.name,
    activityType: list.activity_type,
    icon: list.icon,
    countMode: list.count_mode || 'up',
    target: list.target ?? null,
    archivedAt: list.archived_at ?? null,
    createdAt: list.created_at,
    entries: (list.entries || []).map(mapEntry),
  };
}

async function fetchLists() {
  const { data, error } = await supabase
    .from('lists')
    .select('*, entries(*)')
    .order('created_at', { ascending: true });
  if (error) console.error(error);
  return { data, error };
}

// On failure keep whatever this user already has (or an empty list) so loading ends
function applyFetch(prev, userId, { data, error }) {
  if (error) return prev.userId === userId ? prev : { userId, lists: [] };
  return { userId, lists: data.map(mapList) };
}

const ListsContext = createContext(null);

export function ListsProvider({ children }) {
  const { session } = useSession();
  const userId = session?.user?.id ?? null;

  // Lists are tagged with the user they were loaded for, so after logging out or
  // switching accounts nobody ever sees the previous user's lists.
  const [loaded, setLoaded] = useState({ userId: null, lists: [] });
  const lists = useMemo(
    () => (userId && loaded.userId === userId ? loaded.lists : []),
    [userId, loaded]
  );
  const loading = !!userId && loaded.userId !== userId;

  // Initial load whenever the signed-in user changes. The cancel flag stops a slow
  // response for a previous user from landing after a newer one.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetchLists().then(result => {
      if (!cancelled) setLoaded(prev => applyFetch(prev, userId, result));
    });
    return () => { cancelled = true; };
  }, [userId]);

  // Pull-to-refresh
  const refresh = useCallback(async () => {
    if (!userId) return {};
    const result = await fetchLists();
    setLoaded(prev => applyFetch(prev, userId, result));
    return { error: result.error };
  }, [userId]);

  const actions = useMemo(() => {
    const setLists = fn => setLoaded(prev => ({ ...prev, lists: fn(prev.lists) }));
    const updateListInState = (id, fn) =>
      setLists(prev => prev.map(l => (l.id === id ? fn(l) : l)));

    return {
    async createList({ name, activityType, icon, countMode, target }) {
      const { data, error } = await supabase
        .from('lists')
        .insert({
          user_id: userId,
          name,
          activity_type: activityType,
          icon,
          count_mode: countMode,
          target,
        })
        .select()
        .single();
      if (error) return { error };
      const list = mapList(data);
      setLists(prev => [...prev, list]);
      return { list };
    },

    // .single() errors if no row came back, which is what happens when RLS blocks the update
    async updateList(id, { name, activityType, icon, countMode, target }) {
      const { data, error } = await supabase
        .from('lists')
        .update({ name, activity_type: activityType, icon, count_mode: countMode, target })
        .eq('id', id)
        .select()
        .single();
      if (error) return { error };
      updateListInState(id, l => ({ ...mapList(data), entries: l.entries }));
      return {};
    },

    async setListArchived(id, archive) {
      const { data, error } = await supabase
        .from('lists')
        .update({ archived_at: archive ? new Date().toISOString() : null })
        .eq('id', id)
        .select()
        .single();
      if (error) return { error };
      updateListInState(id, l => ({ ...l, archivedAt: data.archived_at }));
      return {};
    },

    async deleteList(id) {
      const { error } = await supabase.from('lists').delete().eq('id', id);
      if (error) return { error };
      setLists(prev => prev.filter(l => l.id !== id));
      return {};
    },

    // Returns reachedGoal: true only for the entry that crosses the goal line
    async addEntry(list) {
      const wasReached = getProgress(list).reached;
      const { data, error } = await supabase
        .from('entries')
        .insert({ list_id: list.id, text: `${getListActivityType(list)} completed`, completed: true })
        .select()
        .single();
      if (error) return { error };
      const updated = { ...list, entries: [...list.entries, mapEntry(data)] };
      updateListInState(list.id, () => updated);
      return { reachedGoal: !wasReached && getProgress(updated).reached };
    },

    async deleteEntry(listId, entryId) {
      const { error } = await supabase.from('entries').delete().eq('id', entryId);
      if (error) return { error };
      updateListInState(listId, l => ({ ...l, entries: l.entries.filter(e => e.id !== entryId) }));
      return {};
    },
    };
  }, [userId]);

  const value = useMemo(
    () => ({ lists, loading, refresh, getList: id => lists.find(l => String(l.id) === String(id)), ...actions }),
    [lists, loading, refresh, actions]
  );

  return <ListsContext.Provider value={value}>{children}</ListsContext.Provider>;
}

export function useLists() {
  return useContext(ListsContext);
}
