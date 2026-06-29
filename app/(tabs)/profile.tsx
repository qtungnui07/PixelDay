import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Pill, PixelScreen } from '@/components/PixelLayout';
import { theme } from '@/constants/theme';
import { api, type ProfileSummary } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type ProfileStats = {
  doneTasks: number;
  events: number;
  diaryCount: number;
};

function getInitials(displayName: string) {
  return displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function ProfileScreen() {
  const { logout, token, user } = useAuth();
  const [stats, setStats] = useState<ProfileStats>({ doneTasks: 0, events: 0, diaryCount: 0 });
  const [heatmap, setHeatmap] = useState<ProfileSummary['heatmap']>([]);
  const [syncMessage, setSyncMessage] = useState('Đang đồng bộ server...');
  const displayName = user?.displayName ?? 'PixelDay';
  const email = user?.email ?? 'Chưa đăng nhập';

  useEffect(() => {
    async function loadStats() {
      if (!token) {
        return;
      }

      const summary = await api.profileSummary(token);

      setStats({
        doneTasks: summary.stats.doneTasks,
        events: summary.stats.events,
        diaryCount: summary.stats.diaryCount,
      });
      setHeatmap(summary.heatmap);
      setSyncMessage('Dữ liệu đã đồng bộ với server PixelDay.');
    }

    loadStats().catch(() => setSyncMessage('Chưa kết nối được server, kéo để thử lại sau.'));
  }, [token]);

  const heatmapByDate = new Map(heatmap.map((item) => [item.dateKey, item.count]));
  const today = new Date();
  const heatmapDays = Array.from({ length: 35 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (34 - index));
    const dateKey = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;

    return {
      dateKey,
      count: heatmapByDate.get(dateKey) ?? 0,
    };
  });

  return (
    <PixelScreen title="Hồ sơ" subtitle={syncMessage}>
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(displayName) || 'PD'}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{email}</Text>
        <Pill tone="mint">Server sync</Pill>
      </Card>

      <View style={styles.statsGrid}>
        {[
          { label: 'Việc xong', value: `${stats.doneTasks}`, tone: theme.colors.primary },
          { label: 'Sự kiện', value: `${stats.events}`, tone: '#2F9C62' },
          { label: 'Nhật ký', value: `${stats.diaryCount}`, tone: '#B56D20' },
        ].map((item) => (
          <Card key={item.label} style={styles.statCard}>
            <Text style={[styles.statValue, { color: item.tone }]}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </Card>
        ))}
      </View>

      <Card style={styles.activityCard}>
        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>Hoạt động</Text>
          <Text style={styles.detailLink}>30 ngày</Text>
        </View>
        <View style={styles.heatmap}>
          {heatmapDays.map((item) => (
            <View
              key={item.dateKey}
              style={[
                styles.heatCell,
                item.count > 0 && styles.heatMid,
                item.count > 1 && styles.heatStrong,
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
        <Text style={styles.sectionTitle}>Tài khoản</Text>
        {[
          { label: 'Email đăng nhập', value: email, icon: 'email-outline' as const },
          { label: 'Đồng bộ lịch', value: 'Chờ Google OAuth', icon: 'calendar-sync-outline' as const },
          { label: 'Ảnh nhật ký', value: 'Lưu trên server PixelDay', icon: 'image-multiple-outline' as const },
        ].map((item) => (
          <View key={item.label} style={styles.settingRow}>
            <MaterialCommunityIcons color={theme.colors.primary} name={item.icon} size={22} />
            <View style={styles.settingCopy}>
              <Text style={styles.settingText}>{item.label}</Text>
              <Text style={styles.settingValue}>{item.value}</Text>
            </View>
          </View>
        ))}
      </Card>

      <Pressable style={styles.logoutButton} onPress={logout}>
        <MaterialCommunityIcons color={theme.colors.danger} name="logout" size={21} />
        <Text style={styles.logoutText}>Đăng xuất</Text>
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
    overflow: 'hidden',
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
  settingCopy: {
    flex: 1,
    gap: 2,
  },
  settingText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  settingValue: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.peachSoft,
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    paddingVertical: 15,
  },
  logoutText: {
    color: theme.colors.danger,
    fontSize: 15,
    fontWeight: '900',
  },
});
