import { useState } from 'react';
import { Stack, router } from 'expo-router';
import { Alert, Pressable, RefreshControl, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useTheme, type } from '../../theme';
import { useLists } from '../../data/ListsContext';
import ListCard from '../../components/ListCard';
import { Button, EmptyText, SectionHeading } from '../../components/ui';

export default function Home() {
  const { colors } = useTheme();
  const { lists, loading, refresh, setListArchived } = useLists();
  const [refreshing, setRefreshing] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const active   = lists.filter(l => !l.archivedAt);
  const archived = lists.filter(l => l.archivedAt);

  async function onRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  async function restore(list) {
    const { error } = await setListArchived(list.id, false);
    if (error) Alert.alert('Failed to restore list', error.message);
  }

  const newListButton = () => (
    <Pressable onPress={() => router.push('/list-form')} hitSlop={10} style={{ paddingHorizontal: 16 }}>
      <Text style={[type.label, { color: colors.text, fontSize: 13 }]}>+ New</Text>
    </Pressable>
  );

  return (
    <>
      <Stack.Screen options={{ headerRight: newListButton }} />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />}
      >
        {!loading && lists.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📋</Text>
            <Text style={[type.title, { color: colors.text, marginBottom: 8 }]}>No lists yet</Text>
            <Text style={{ color: colors.textMuted, marginBottom: 24, textAlign: 'center' }}>
              Create your first activity list to start tracking.
            </Text>
            <Button title="+ Create a List" onPress={() => router.push('/list-form')} />
          </View>
        ) : (
          <>
            <SectionHeading>Your Lists</SectionHeading>
            {!loading && active.length === 0 && <EmptyText>All your lists are archived.</EmptyText>}
            <View style={styles.grid}>
              {active.map(list => (
                <ListCard key={list.id} list={list} onPress={() => router.push(`/list/${list.id}`)} />
              ))}
            </View>

            {archived.length > 0 && (
              <View style={{ marginTop: 40 }}>
                <Pressable
                  onPress={() => setShowArchived(v => !v)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: showArchived }}
                  style={[styles.archivedToggle, { borderBottomColor: colors.border }]}
                >
                  <Text style={[type.label, { color: colors.textMuted }]}>Archived ({archived.length})</Text>
                  <Text style={{ color: colors.textMuted }}>{showArchived ? '▴' : '▾'}</Text>
                </Pressable>
                {showArchived && (
                  <View style={styles.grid}>
                    {archived.map(list => (
                      <ListCard
                        key={list.id}
                        list={list}
                        onPress={() => router.push(`/list/${list.id}`)}
                        onRestore={() => restore(list)}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  grid: { gap: 12 },
  empty: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: 20 },
  archivedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
