import { View, Text, StyleSheet } from 'react-native';
import type { LeaderboardEntry } from '../lib/queries';

type LeaderboardItemProps = {
  entry: LeaderboardEntry;
  rank: number;
};

export function LeaderboardItem({ entry, rank }: LeaderboardItemProps) {
  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const medal = getMedalEmoji(rank);
  const isTopThree = rank <= 3;
  const isFirst = rank === 1;

  return (
    <View style={[
      styles.container, 
      isFirst ? styles.firstPlace : isTopThree ? styles.topThree : styles.normal
    ]}>
      <View style={styles.leftSection}>
        <View style={[
          styles.badge, 
          isFirst ? styles.badgeFirst : isTopThree ? styles.badgeTop : styles.badgeNormal
        ]}>
          <Text style={[styles.badgeText, isFirst && styles.badgeTextFirst]}>
            {medal || `#${rank}`}
          </Text>
        </View>
        
        <View style={styles.nameSection}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, isTopThree ? styles.nameTop : styles.nameNormal]}>
              {entry.dancer_name}
            </Text>
            {isFirst && <Text style={styles.crownEmoji}>👑</Text>}
          </View>
          {isTopThree && (
            <View style={styles.badgeLabel}>
              <Text style={styles.badgeLabelText}>✨ Top Performer</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.scoreSection}>
        <Text style={[styles.score, isTopThree ? styles.scoreTop : styles.scoreNormal]}>
          {entry.score}
        </Text>
        <Text style={styles.pointsLabel}>points</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  firstPlace: {
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  topThree: {
    backgroundColor: '#faf5ff',
    borderWidth: 2,
    borderColor: '#e9d5ff',
  },
  normal: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  badgeFirst: {
    backgroundColor: '#fbbf24',
  },
  badgeTop: {
    backgroundColor: '#9333ea',
  },
  badgeNormal: {
    backgroundColor: '#6b7280',
  },
  badgeText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  badgeTextFirst: {
    fontSize: 18,
  },
  nameSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontWeight: '700',
    fontSize: 17,
  },
  nameTop: {
    color: '#581c87',
  },
  nameNormal: {
    color: '#111827',
  },
  crownEmoji: {
    fontSize: 18,
  },
  badgeLabel: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#f3e8ff',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeLabelText: {
    fontSize: 11,
    color: '#7c3aed',
    fontWeight: '600',
  },
  scoreSection: {
    alignItems: 'flex-end',
  },
  score: {
    fontWeight: '800',
    fontSize: 24,
  },
  scoreTop: {
    color: '#9333ea',
  },
  scoreNormal: {
    color: '#374151',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
});
