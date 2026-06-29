import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Pill, PixelScreen } from '@/components/PixelLayout';
import { sampleEvents, sampleTasks } from '@/constants/sample-data';
import { theme } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <PixelScreen
      title="Chào An"
      subtitle="Thứ hai, 29 tháng 6"
      rightContent={
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>An</Text>
        </View>
      }>
      <View style={styles.bentoGrid}>
        <Card style={[styles.bentoCard, styles.taskBento]}>
          <View style={styles.bentoIcon}>
            <MaterialCommunityIcons color={theme.colors.onPrimaryContainer} name="clipboard-check" size={25} />
          </View>
          <Text style={styles.bentoValue}>4</Text>
          <Text style={styles.bentoLabel}>việc cần làm</Text>
        </Card>
        <Card style={[styles.bentoCard, styles.eventBento]}>
          <View style={styles.bentoIcon}>
            <MaterialCommunityIcons color={theme.colors.onMint} name="calendar-month" size={25} />
          </View>
          <Text style={[styles.bentoValue, { color: theme.colors.onMint }]}>2</Text>
          <Text style={[styles.bentoLabel, { color: theme.colors.onMint }]}>sự kiện</Text>
        </Card>
      </View>

      <Card style={styles.journalBento}>
        <View style={styles.journalIcon}>
          <MaterialCommunityIcons color={theme.colors.onPeach} name="book-open-variant" size={26} />
        </View>
        <Text style={styles.journalTitle}>Chưa viết nhật ký</Text>
        <View style={styles.editCircle}>
          <MaterialCommunityIcons color={theme.colors.peach} name="pencil" size={21} />
        </View>
      </Card>

      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Việc nổi bật</Text>
          <Pill tone="mint">Đang làm</Pill>
        </View>
        {sampleTasks.slice(0, 2).map((task) => (
          <View key={task.id} style={styles.row}>
            <MaterialCommunityIcons
              color={task.status === 'done' ? theme.colors.mint : theme.colors.primary}
              name={task.status === 'done' ? 'check-circle' : 'circle-outline'}
              size={24}
            />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{task.title}</Text>
              <Text style={styles.rowMeta}>{task.time} · {task.tag}</Text>
            </View>
          </View>
        ))}
      </Card>

      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lịch gần nhất</Text>
          <Pill tone="peach">10:00</Pill>
        </View>
        <Text style={styles.eventTitle}>{sampleEvents[0].title}</Text>
        <Text style={styles.rowMeta}>{sampleEvents[0].time}</Text>
      </Card>
    </PixelScreen>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: theme.colors.peach,
    borderRadius: 22,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  avatarText: {
    color: theme.colors.text,
    fontWeight: '900',
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.lavenderSoft,
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  heroText: {
    color: theme.colors.muted,
    lineHeight: 21,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    gap: 4,
  },
  statValue: {
    color: theme.colors.primary,
    fontSize: 30,
    fontWeight: '900',
  },
  statLabel: {
    color: theme.colors.muted,
    fontWeight: '700',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  rowText: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  rowMeta: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  eventTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  bentoCard: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  taskBento: {
    backgroundColor: theme.colors.primaryContainer,
  },
  eventBento: {
    backgroundColor: theme.colors.mint,
  },
  bentoIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: theme.radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  bentoValue: {
    color: theme.colors.onPrimaryContainer,
    fontSize: 32,
    fontWeight: '900',
  },
  bentoLabel: {
    color: theme.colors.onPrimaryContainer,
    fontSize: 13,
    fontWeight: '800',
  },
  journalBento: {
    alignItems: 'center',
    backgroundColor: theme.colors.peach,
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  journalIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: theme.radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  journalTitle: {
    color: theme.colors.onPeach,
    flex: 1,
    fontSize: 19,
    fontWeight: '900',
  },
  editCircle: {
    alignItems: 'center',
    backgroundColor: theme.colors.onPeach,
    borderRadius: theme.radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
});
