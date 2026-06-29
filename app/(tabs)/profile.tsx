import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Pill, PixelScreen } from '@/components/PixelLayout';
import { theme } from '@/constants/theme';

const stats = [
  { label: 'Việc xong', value: '18', tone: theme.colors.primary },
  { label: 'Sự kiện', value: '7', tone: '#2F9C62' },
  { label: 'Nhật ký', value: '12', tone: '#B56D20' },
];

export default function ProfileScreen() {
  return (
    <PixelScreen title="Hồ sơ" subtitle="Không có auth thật, chỉ là giao diện mẫu.">
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AN</Text>
        </View>
        <Text style={styles.name}>An Nhiên</Text>
        <Text style={styles.email}>an.nhien@pixelday.app</Text>
        <Pill tone="mint">MVP preview</Pill>
      </Card>

      <View style={styles.statsGrid}>
        {stats.map((item) => (
          <Card key={item.label} style={styles.statCard}>
            <Text style={[styles.statValue, { color: item.tone }]}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </Card>
        ))}
      </View>

      <Card style={styles.activityCard}>
        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>Hoạt động</Text>
          <Text style={styles.detailLink}>Chi tiết</Text>
        </View>
        <View style={styles.heatmap}>
          {Array.from({ length: 35 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.heatCell,
                index % 3 === 0 && styles.heatMid,
                index % 5 === 0 && styles.heatStrong,
              ]}
            />
          ))}
        </View>
        <View style={styles.heatLabels}>
          <Text style={styles.heatLabel}>Tháng trước</Text>
          <Text style={styles.heatLabel}>Hôm nay</Text>
        </View>
      </Card>

      <Card style={styles.settingsCard}>
        <Text style={styles.sectionTitle}>Cài đặt mẫu</Text>
        {['Thông báo dịu nhẹ', 'Đồng bộ lịch sau này', 'Sao lưu nhật ký sau này'].map((item) => (
          <View key={item} style={styles.settingRow}>
            <MaterialCommunityIcons color={theme.colors.primary} name="auto-fix" size={22} />
            <Text style={styles.settingText}>{item}</Text>
            <MaterialCommunityIcons color={theme.colors.muted} name="chevron-right" size={22} />
          </View>
        ))}
      </Card>

      <Pressable style={styles.logoutButton}>
        <Text style={styles.logoutText}>Đăng xuất mẫu</Text>
      </Pressable>
    </PixelScreen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: theme.colors.lavenderSoft,
    borderColor: theme.colors.surface,
    borderRadius: 36,
    borderWidth: 4,
    height: 86,
    justifyContent: 'center',
    width: 86,
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: '900',
  },
  name: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  email: {
    color: theme.colors.muted,
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    padding: theme.spacing.md,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
  },
  statLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  settingsCard: {
    gap: theme.spacing.sm,
  },
  activityCard: {
    gap: theme.spacing.sm,
  },
  activityHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLink: {
    color: theme.colors.primary,
    fontWeight: '900',
  },
  heatmap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heatCell: {
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: 5,
    height: 18,
    width: 18,
  },
  heatMid: {
    backgroundColor: theme.colors.primaryContainer,
  },
  heatStrong: {
    backgroundColor: theme.colors.primary,
  },
  heatLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heatLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: theme.spacing.xs,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  settingText: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.peachSoft,
    borderRadius: theme.radius.pill,
    paddingVertical: 15,
  },
  logoutText: {
    color: theme.colors.danger,
    fontSize: 15,
    fontWeight: '900',
  },
});
