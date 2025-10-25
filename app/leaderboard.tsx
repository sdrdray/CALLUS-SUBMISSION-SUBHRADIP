import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getLeaderboard } from '../lib/queries';
import { LeaderboardItem } from '../components/LeaderboardItem';

export default function LeaderboardScreen() {
  const router = useRouter();
  const { data, isLoading } = useQuery({ queryKey: ['leaderboard'], queryFn: getLeaderboard });

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>↑</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerEmoji}>🏆</Text>
            <Text style={styles.headerTitle}>Leaderboard</Text>
          </View>
          <View style={styles.spacer} />
        </View>
        <Text style={styles.headerSubtitle}>Top performers this week</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{data?.length || 0}</Text>
            <Text style={styles.statLabel}>Dancers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>Live</Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
        </View>
      </View>

      {/* Leaderboard List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>💃</Text>
          <Text style={styles.loadingText}>Loading rankings...</Text>
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item, index) => `${item.dancer_name}-${item.score}-${index}`}
          renderItem={({ item, index }) => (
            <LeaderboardItem entry={item} rank={index + 1} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4ff',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 20,
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#7c3aed',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerEmoji: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#581c87',
    letterSpacing: -0.5,
  },
  spacer: {
    width: 40,
  },
  headerSubtitle: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginTop: 8,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#9333ea',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
});
