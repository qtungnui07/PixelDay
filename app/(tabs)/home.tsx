import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Pill, PixelScreen } from '@/components/PixelLayout';
import { usePixelTheme } from '@/components/PixelTheme';
import { theme } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { CalendarEvent, Task } from '@/types';

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getDayRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  return { start, end };
}

export default function HomeScreen() {
  const { theme: activeTheme } = usePixelTheme();
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [hasDiary, setHasDiary] = useState(false);
  const today = useMemo(() => new Date(), []);
  const todayRange = useMemo(() => getDayRange(today), [today]);
  const todayKey = getDateKey(today);
  const displayName = user?.displayName.split(' ')[0] ?? 'bạn';
  const activeTasks = tasks.filter((task) => task.status !== 'done');
  const nextEvent = events[0];

  useEffect(() => {
    async function loadHomeData() {
      if (!token) {
        return;
      }

      const [taskResult, eventResult, diaryResult] = await Promise.all([
        api.tasks(token),
        api.events(token, {
          from: todayRange.start.toISOString(),
          to: todayRange.end.toISOString(),
        }),
        api.diary(token, todayKey),
      ]);

      setTasks(taskResult.tasks);
      setEvents(eventResult.events);
      setHasDiary(Boolean(diaryResult.entry?.content.trim() || diaryResult.entry?.photoUris.length));
    }

    loadHomeData().catch(() => undefined);
  }, [todayKey, todayRange.end, todayRange.start, token]);

  return (
    <PixelScreen
      title={`Chào ${displayName}`}
      subtitle={today.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })}
      rightContent={
        <View style={[styles.avatar, { backgroundColor: activeTheme.colors.peach }]}>
          <Text style={[styles.avatarText, { color: activeTheme.colors.onPeach }]}>
            {displayName.slice(0, 2)}
          </Text>
        </View>
      }>
      <View style={styles.bentoGrid}>
        <Card style={[styles.bentoCard, { backgroundColor: activeTheme.colors.primaryContainer }]}>
          <View style={styles.bentoIcon}>
            <MaterialCommunityIcons color={activeTheme.colors.onPrimaryContainer} name="clipboard-check" size={25} />
          </View>
          <Text style={[styles.bentoValue, { color: activeTheme.colors.onPrimaryContainer }]}>{activeTasks.length}</Text>
          <Text style={[styles.bentoLabel, { color: activeTheme.colors.onPrimaryContainer }]}>việc cần làm</Text>
        </Card>
        <Card style={[styles.bentoCard, { backgroundColor: activeTheme.colors.mint }]}>
          <View style={styles.bentoIcon}>
            <MaterialCommunityIcons color={activeTheme.colors.onMint} name="calendar-month" size={25} />
          </View>
          <Text style={[styles.bentoValue, { color: activeTheme.colors.onMint }]}>{events.length}</Text>
          <Text style={[styles.bentoLabel, { color: activeTheme.colors.onMint }]}>sự kiện</Text>
        </Card>
      </View>

      <Card style={[styles.journalBento, { backgroundColor: activeTheme.colors.peach }]}>
        <View style={styles.journalIcon}>
          <MaterialCommunityIcons color={activeTheme.colors.onPeach} name="book-open-variant" size={26} />
        </View>
        <Text style={[styles.journalTitle, { color: activeTheme.colors.onPeach }]}>
          {hasDiary ? 'Đã viết nhật ký' : 'Chưa viết nhật ký'}
        </Text>
        <View style={[styles.editCircle, { backgroundColor: activeTheme.colors.onPeach }]}>
          <MaterialCommunityIcons color={activeTheme.colors.peach} name="pencil" size={21} />
        </View>
      </Card>

      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Việc nổi bật</Text>
          <Pill tone="mint">Đang làm</Pill>
        </View>
        {tasks.slice(0, 2).map((task) => (
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
        <Text style={styles.eventTitle}>{nextEvent?.title ?? 'Chưa có sự kiện hôm nay'}</Text>
        <Text style={styles.rowMeta}>{nextEvent?.time ?? 'Thêm hoặc sync Google Calendar'}</Text>
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
