import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { Card, PixelScreen } from '@/components/PixelLayout';
import { sampleEvents } from '@/constants/sample-data';
import { theme } from '@/constants/theme';

const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const dates = ['29', '30', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'];

export default function CalendarScreen() {
  return (
    <PixelScreen title="Lịch" subtitle="Lịch mẫu, chưa kết nối Google Calendar.">
      <Card style={styles.monthCard}>
        <View style={styles.monthHeader}>
          <Text style={styles.monthTitle}>Tháng 6</Text>
          <View style={styles.monthActions}>
            <MaterialCommunityIcons color={theme.colors.muted} name="chevron-left" size={24} />
            <MaterialCommunityIcons color={theme.colors.muted} name="chevron-right" size={24} />
          </View>
        </View>
        <View style={styles.dayNameRow}>
          {days.map((day) => (
            <Text key={day} style={styles.dayName}>{day}</Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {dates.map((date, index) => (
            <View key={`${date}-${index}`} style={[styles.dateCell, index === 0 && styles.activeDay]}>
              <Text style={[styles.dateText, index === 0 && styles.activeDayText]}>{date}</Text>
              {[2, 9, 16].includes(index) ? <View style={styles.dot} /> : null}
            </View>
          ))}
        </View>
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
  monthActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
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
    gap: 8,
  },
  dateCell: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 40,
    justifyContent: 'center',
    position: 'relative',
    width: '11.5%',
  },
  activeDay: {
    backgroundColor: theme.colors.primary,
  },
  dateText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  activeDayText: {
    color: theme.colors.onPrimary,
  },
  dot: {
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
    bottom: 5,
    height: 4,
    position: 'absolute',
    width: 4,
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
