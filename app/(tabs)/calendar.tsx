import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { Card, PixelScreen } from '@/components/PixelLayout';
import { sampleEvents } from '@/constants/sample-data';
import { theme } from '@/constants/theme';

const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

type CalendarDay = {
  day: number;
  key: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasEvent: boolean;
};

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getMondayFirstIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function createCalendarDays(visibleMonth: Date): CalendarDay[] {
  const todayKey = getDateKey(new Date());
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startOffset = getMondayFirstIndex(firstDayOfMonth);
  const gridStart = new Date(year, month, 1 - startOffset);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekCount = Math.ceil((startOffset + daysInMonth) / 7);
  const cellCount = Math.max(35, weekCount * 7);
  const eventDays = new Set([8, 16, 29]);

  return Array.from({ length: cellCount }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const isCurrentMonth = date.getMonth() === month;
    const key = getDateKey(date);

    return {
      day: date.getDate(),
      key,
      isCurrentMonth,
      isToday: key === todayKey,
      hasEvent: isCurrentMonth && eventDays.has(date.getDate()),
    };
  });
}

export default function CalendarScreen() {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const calendarDays = useMemo(() => createCalendarDays(visibleMonth), [visibleMonth]);
  const monthTitle = `Tháng ${visibleMonth.getMonth() + 1}`;
  const yearTitle = `${visibleMonth.getFullYear()}`;

  function goToPreviousMonth() {
    setVisibleMonth((currentMonth) => addMonths(currentMonth, -1));
  }

  function goToNextMonth() {
    setVisibleMonth((currentMonth) => addMonths(currentMonth, 1));
  }

  return (
    <PixelScreen title="Lịch" subtitle="Theo dõi ngày tháng và những việc sắp tới.">
      <Card style={styles.monthCard}>
        <View style={styles.monthHeader}>
          <View>
            <Text style={styles.monthTitle}>{monthTitle}</Text>
            <Text style={styles.yearTitle}>{yearTitle}</Text>
          </View>
          <View style={styles.monthActions}>
            <Pressable
              accessibilityLabel="Tháng trước"
              style={styles.iconButton}
              onPress={goToPreviousMonth}>
              <MaterialCommunityIcons color={theme.colors.muted} name="chevron-left" size={24} />
            </Pressable>
            <Pressable
              accessibilityLabel="Tháng sau"
              style={styles.iconButton}
              onPress={goToNextMonth}>
              <MaterialCommunityIcons color={theme.colors.muted} name="chevron-right" size={24} />
            </Pressable>
          </View>
        </View>

        <View style={styles.dayNameRow}>
          {days.map((day) => (
            <Text key={day} style={styles.dayName}>
              {day}
            </Text>
          ))}
        </View>

        <Animated.View
          key={getDateKey(visibleMonth)}
          entering={FadeInDown.duration(260).springify().damping(18)}
          layout={LinearTransition.springify().damping(18)}
          style={styles.calendarGrid}>
          {calendarDays.map((calendarDay, index) => (
            <Animated.View
              key={calendarDay.key}
              entering={FadeInDown.duration(220).delay((index % 7) * 18)}
              layout={LinearTransition.springify().damping(20)}
              style={[
                styles.dateCell,
                !calendarDay.isCurrentMonth && styles.outsideMonthCell,
              ]}>
              <View style={[styles.datePill, calendarDay.isToday && styles.todayCell]}>
                <Text
                  style={[
                    styles.dateText,
                    calendarDay.isToday && styles.todayText,
                    !calendarDay.isCurrentMonth && styles.outsideMonthText,
                  ]}>
                  {`${calendarDay.day}`.padStart(2, '0')}
                </Text>
                {calendarDay.hasEvent ? (
                  <View style={[styles.dot, calendarDay.isToday && styles.todayDot]} />
                ) : null}
              </View>
            </Animated.View>
          ))}
        </Animated.View>
      </Card>

      <Text style={styles.sectionTitle}>Sự kiện hôm nay</Text>
      {sampleEvents.map((event) => (
        <Card key={event.id} style={styles.eventCard}>
          <View style={[styles.eventDot, { backgroundColor: event.color }]} />
          <View style={styles.eventText}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventTime}>{event.time}</Text>
          </View>
        </Card>
      ))}
    </PixelScreen>
  );
}

const styles = StyleSheet.create({
  monthCard: {
    gap: theme.spacing.lg,
  },
  monthHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthTitle: {
    color: theme.colors.text,
    fontSize: 34,
    fontWeight: '900',
  },
  yearTitle: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  monthActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  dayNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayName: {
    color: theme.colors.muted,
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 6,
  },
  dateCell: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: '14.285%',
  },
  datePill: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 36,
    justifyContent: 'center',
    maxWidth: 52,
    position: 'relative',
    width: '100%',
  },
  todayCell: {
    backgroundColor: theme.colors.primary,
  },
  outsideMonthCell: {
    opacity: 0.45,
  },
  dateText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  todayText: {
    color: theme.colors.onPrimary,
  },
  outsideMonthText: {
    color: theme.colors.muted,
  },
  dot: {
    backgroundColor: theme.colors.text,
    borderRadius: 2,
    bottom: 5,
    height: 4,
    position: 'absolute',
    width: 4,
  },
  todayDot: {
    backgroundColor: theme.colors.onPrimary,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  eventCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  eventDot: {
    borderRadius: 8,
    height: 52,
    width: 8,
  },
  eventText: {
    flex: 1,
    gap: 5,
  },
  eventTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  eventTime: {
    color: theme.colors.muted,
    fontSize: 13,
  },
});
