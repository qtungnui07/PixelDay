import type { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePixelTheme } from '@/components/PixelTheme';
import { theme } from '@/constants/theme';
import { api, apiBaseUrl } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type ScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  rightContent?: ReactNode;
}>;

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const themeOptions = [
  { name: 'light' as const, label: 'Light', colors: ['#FCF8FA', '#E6E1FF', '#C3ECD2'] },
  { name: 'dark' as const, label: 'Dark', colors: ['#101014', '#242330', '#7C6F9F'] },
  { name: 'nord' as const, label: 'Nord', colors: ['#2E3440', '#4C566A', '#88C0D0', '#A3BE8C'] },
];

export function PixelScreen({ title, subtitle, rightContent, children }: ScreenProps) {
  const { theme: activeTheme, themeName, setThemeName } = usePixelTheme();
  const { logout, token } = useAuth();
  const [activeSheet, setActiveSheet] = useState<'menu' | 'settings' | null>(null);
  const [lastHealthCheck, setLastHealthCheck] = useState('Chưa check');
  const [serverStatus, setServerStatus] = useState<'good' | 'warn'>('warn');
  const [databaseStatus, setDatabaseStatus] = useState<'good' | 'warn'>('warn');
  const [summary, setSummary] = useState({ todayOpenTasks: 0, todayEvents: 0 });
  const gradientProgress = useSharedValue(0);
  const healthStatusRows = [
    { label: 'App shell', value: 'OK', tone: 'good' as const },
    { label: 'API', value: serverStatus === 'good' ? 'Online' : 'Chưa kết nối', tone: serverStatus },
    { label: 'Database', value: databaseStatus === 'good' ? 'Online' : 'Chờ server', tone: databaseStatus },
    { label: 'Last check', value: lastHealthCheck, tone: 'neutral' as const },
  ];
  const quickActions: { label: string; meta: string; icon: IconName }[] = [
    {
      label: 'Hôm nay',
      meta: `${summary.todayOpenTasks} việc, ${summary.todayEvents} sự kiện`,
      icon: 'view-dashboard-outline',
    },
    { label: 'Tìm kiếm nhanh', meta: 'Task, lịch, nhật ký', icon: 'magnify' },
    {
      label: 'Đồng bộ dữ liệu',
      meta: token ? 'Đang dùng server PixelDay' : 'Cần đăng nhập',
      icon: 'cloud-sync-outline',
    },
    {
      label: 'Server status',
      meta: `${apiBaseUrl}`,
      icon: 'heart-pulse',
    },
  ];

  useEffect(() => {
    gradientProgress.value = withRepeat(
      withTiming(1, {
        duration: 9000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, [gradientProgress]);

  useEffect(() => {
    let ignore = false;

    async function loadShellData() {
      try {
        const health = await api.health();

        if (ignore) {
          return;
        }

        setServerStatus('good');
        setDatabaseStatus(health.database === 'ok' ? 'good' : 'warn');
        setLastHealthCheck(
          `OK ${health.latencyMs}ms · ${new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}`
        );

        if (token) {
          const profileSummary = await api.profileSummary(token);

          if (!ignore) {
            setSummary({
              todayOpenTasks: profileSummary.stats.todayOpenTasks,
              todayEvents: profileSummary.stats.todayEvents,
            });
          }
        }
      } catch {
        if (!ignore) {
          setServerStatus('warn');
          setDatabaseStatus('warn');
        }
      }
    }

    loadShellData();

    return () => {
      ignore = true;
    };
  }, [token]);

  const firstGradientStyle = useAnimatedStyle(() => ({
    opacity: interpolate(gradientProgress.value, [0, 0.5, 1], [0.86, 0.46, 0.86]),
    transform: [
      { translateX: interpolate(gradientProgress.value, [0, 1], [-34, 28]) },
      { translateY: interpolate(gradientProgress.value, [0, 1], [-22, 24]) },
      { scale: interpolate(gradientProgress.value, [0, 1], [1.06, 1.12]) },
    ],
  }));

  const secondGradientStyle = useAnimatedStyle(() => ({
    opacity: interpolate(gradientProgress.value, [0, 0.5, 1], [0.34, 0.82, 0.34]),
    transform: [
      { translateX: interpolate(gradientProgress.value, [0, 1], [32, -28]) },
      { translateY: interpolate(gradientProgress.value, [0, 1], [28, -20]) },
      { scale: interpolate(gradientProgress.value, [0, 1], [1.12, 1.06]) },
    ],
  }));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: activeTheme.colors.background }]} edges={['top']}>
      <View pointerEvents="none" style={styles.gradientLayer}>
        <LinearGradient
          colors={
            themeName === 'nord'
              ? ['#2E3440', '#344154', '#3B4252', '#46556B']
              : themeName === 'dark'
                ? ['#101014', '#1D1B24', '#242330', '#151820']
                : ['#FFF0E7', '#F0EAFF', '#E7F8EF', '#EEF4FF']
          }
          end={{ x: 1, y: 1 }}
          locations={[0, 0.38, 0.72, 1]}
          start={{ x: 0, y: 0 }}
          style={styles.gradientFill}
        />
        <AnimatedLinearGradient
          colors={
            themeName === 'nord'
              ? ['rgba(143, 188, 187, 0.22)', 'rgba(136, 192, 208, 0.16)', 'rgba(94, 129, 172, 0.22)']
              : themeName === 'dark'
                ? ['rgba(124, 111, 159, 0.28)', 'rgba(64, 58, 82, 0.12)', 'rgba(58, 94, 82, 0.18)']
                : ['rgba(230, 225, 255, 0.95)', 'rgba(255, 232, 215, 0.18)', 'rgba(195, 236, 210, 0.78)']
          }
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={[styles.animatedGradientFill, firstGradientStyle]}
        />
        <AnimatedLinearGradient
          colors={
            themeName === 'nord'
              ? ['rgba(191, 97, 106, 0.08)', 'rgba(235, 203, 139, 0.1)', 'rgba(180, 142, 173, 0.14)']
              : themeName === 'dark'
                ? ['rgba(255, 180, 171, 0.08)', 'rgba(246, 241, 255, 0.04)', 'rgba(136, 192, 208, 0.12)']
                : ['rgba(255, 226, 207, 0.82)', 'rgba(246, 241, 255, 0.22)', 'rgba(232, 244, 255, 0.9)']
          }
          end={{ x: 0, y: 1 }}
          start={{ x: 1, y: 0 }}
          style={[styles.animatedGradientFill, secondGradientStyle]}
        />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable style={styles.iconButton} onPress={() => setActiveSheet('menu')}>
            <MaterialCommunityIcons color={activeTheme.colors.muted} name="menu" size={24} />
          </Pressable>
          <Text style={[styles.brand, { color: activeTheme.colors.primary }]}>PixelDay</Text>
          <Pressable style={styles.iconButton} onPress={() => setActiveSheet('settings')}>
            <MaterialCommunityIcons color={activeTheme.colors.muted} name="cog-outline" size={24} />
          </Pressable>
        </View>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: activeTheme.colors.text }]}>{title}</Text>
            {subtitle ? <Text style={[styles.subtitle, { color: activeTheme.colors.muted }]}>{subtitle}</Text> : null}
          </View>
          {rightContent}
        </View>
        {children}
      </ScrollView>
      <Modal animationType="fade" transparent visible={activeSheet !== null}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setActiveSheet(null)}>
          <Pressable
            style={[
              styles.sheet,
              {
                backgroundColor: activeTheme.colors.surface,
                borderColor: activeTheme.colors.border,
              },
            ]}
            onPress={(event) => event.stopPropagation()}>
            {activeSheet === 'settings' ? (
              <>
                <View style={styles.sheetHeader}>
                  <Text style={[styles.sheetTitle, { color: activeTheme.colors.text }]}>Cài đặt</Text>
                  <Pressable style={styles.smallIconButton} onPress={() => setActiveSheet(null)}>
                    <MaterialCommunityIcons color={activeTheme.colors.muted} name="close" size={22} />
                  </Pressable>
                </View>

                <Text style={[styles.sheetSection, { color: activeTheme.colors.muted }]}>Theme</Text>
                <View style={styles.themeGrid}>
                  {themeOptions.map((option) => (
                    <Pressable
                      key={option.name}
                      style={[
                        styles.themeOption,
                        {
                          borderColor:
                            themeName === option.name ? activeTheme.colors.primary : activeTheme.colors.border,
                          backgroundColor:
                            themeName === option.name ? activeTheme.colors.surfaceHigh : activeTheme.colors.surfaceContainer,
                        },
                      ]}
                      onPress={() => setThemeName(option.name)}>
                      <View style={styles.swatchRow}>
                        {option.colors.map((color) => (
                          <View key={color} style={[styles.swatch, { backgroundColor: color }]} />
                        ))}
                      </View>
                      <Text style={[styles.themeLabel, { color: activeTheme.colors.text }]}>{option.label}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={[styles.sheetSection, { color: activeTheme.colors.muted }]}>Health</Text>
                {healthStatusRows.map((row) => (
                  <View key={row.label} style={styles.healthRow}>
                    <View
                      style={[
                        styles.healthDot,
                        {
                          backgroundColor:
                            row.tone === 'good'
                              ? activeTheme.colors.mint
                              : row.tone === 'warn'
                                ? activeTheme.colors.peach
                                : activeTheme.colors.surfaceHigh,
                        },
                      ]}
                    />
                    <Text style={[styles.healthLabel, { color: activeTheme.colors.text }]}>{row.label}</Text>
                    <Text style={[styles.healthValue, { color: activeTheme.colors.muted }]}>{row.value}</Text>
                  </View>
                ))}

                <Pressable
                  style={[styles.checkButton, { borderColor: activeTheme.colors.border }]}
                  onPress={() => {
                    api
                      .health()
                      .then((health) =>
                        {
                          setServerStatus('good');
                          setDatabaseStatus(health.database === 'ok' ? 'good' : 'warn');
                          setLastHealthCheck(
                            `OK ${health.latencyMs}ms · ${new Date().toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}`
                          );
                        }
                      )
                      .catch(() => {
                        setServerStatus('warn');
                        setDatabaseStatus('warn');
                        setLastHealthCheck(`Fail · ${apiBaseUrl}`);
                      });
                  }}>
                  <MaterialCommunityIcons color={activeTheme.colors.primary} name="refresh" size={20} />
                  <Text style={[styles.checkText, { color: activeTheme.colors.primary }]}>Check health</Text>
                </Pressable>

                <Pressable
                  style={[styles.logoutButton, { backgroundColor: activeTheme.colors.errorContainer }]}
                  onPress={() => {
                    setActiveSheet(null);
                    logout();
                  }}>
                  <MaterialCommunityIcons color={activeTheme.colors.danger} name="logout" size={21} />
                  <Text style={[styles.logoutText, { color: activeTheme.colors.danger }]}>Log out</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.sheetHeader}>
                  <Text style={[styles.sheetTitle, { color: activeTheme.colors.text }]}>Đồng bộ hôm nay</Text>
                  <Pressable style={styles.smallIconButton} onPress={() => setActiveSheet(null)}>
                    <MaterialCommunityIcons color={activeTheme.colors.muted} name="close" size={22} />
                  </Pressable>
                </View>
                <View style={[styles.cockpitCard, { backgroundColor: activeTheme.colors.primaryContainer }]}>
                  <Text style={[styles.cockpitValue, { color: activeTheme.colors.onPrimaryContainer }]}>
                    {summary.todayOpenTasks + summary.todayEvents}
                  </Text>
                  <View style={styles.cockpitCopy}>
                    <Text style={[styles.cockpitTitle, { color: activeTheme.colors.onPrimaryContainer }]}>
                      Dữ liệu đang đồng bộ
                    </Text>
                    <Text style={[styles.cockpitMeta, { color: activeTheme.colors.onPrimaryContainer }]}>
                      {summary.todayOpenTasks} task còn mở, {summary.todayEvents} sự kiện hôm nay
                    </Text>
                  </View>
                </View>
                {quickActions.map((action) => (
                  <Pressable
                    key={action.label}
                    style={[styles.quickRow, { borderColor: activeTheme.colors.border }]}
                    onPress={() => setActiveSheet(null)}>
                    <View style={[styles.quickIcon, { backgroundColor: activeTheme.colors.surfaceContainer }]}>
                      <MaterialCommunityIcons color={activeTheme.colors.primary} name={action.icon} size={22} />
                    </View>
                    <View style={styles.quickText}>
                      <Text style={[styles.quickLabel, { color: activeTheme.colors.text }]}>{action.label}</Text>
                      <Text style={[styles.quickMeta, { color: activeTheme.colors.muted }]}>{action.meta}</Text>
                    </View>
                    <MaterialCommunityIcons color={activeTheme.colors.muted} name="chevron-right" size={22} />
                  </Pressable>
                ))}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

export function Card({ children, style }: PropsWithChildren<{ style?: object }>) {
  const { theme: activeTheme } = usePixelTheme();
  const cardBackgroundColor =
    activeTheme.name === 'nord'
      ? '#ECEFF4'
      : activeTheme.name === 'light'
        ? activeTheme.colors.surface
        : '#F4EFF4';
  const cardBorderColor = activeTheme.name === 'nord' ? '#D8DEE9' : activeTheme.colors.border;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardBackgroundColor,
          borderColor: cardBorderColor,
          shadowColor: activeTheme.shadow.shadowColor,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

export function Pill({
  children,
  tone = 'primary',
}: PropsWithChildren<{ tone?: 'primary' | 'mint' | 'peach' }>) {
  const backgroundColor =
    tone === 'mint' ? theme.colors.mintSoft : tone === 'peach' ? theme.colors.peachSoft : theme.colors.lavenderSoft;
  const color = tone === 'mint' ? '#247348' : tone === 'peach' ? '#94622A' : theme.colors.primary;

  return <Text style={[styles.pill, { backgroundColor, color }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  gradientLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  },
  gradientFill: {
    ...StyleSheet.absoluteFillObject,
  },
  animatedGradientFill: {
    bottom: -40,
    left: -40,
    position: 'absolute',
    right: -40,
    top: -40,
  },
  content: {
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
    paddingBottom: 120,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  brand: {
    color: theme.colors.primary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: theme.colors.text,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: 'rgba(201, 197, 205, 0.35)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.lg,
    ...theme.shadow,
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    fontSize: 13,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  sheetBackdrop: {
    backgroundColor: 'rgba(18, 18, 20, 0.18)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '900',
  },
  smallIconButton: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  sheetSection: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  themeGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  themeOption: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flex: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  swatchRow: {
    flexDirection: 'row',
  },
  swatch: {
    borderRadius: theme.radius.pill,
    height: 22,
    marginRight: -4,
    width: 22,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '900',
  },
  healthRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minHeight: 36,
  },
  healthDot: {
    borderRadius: theme.radius.pill,
    height: 10,
    width: 10,
  },
  healthLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  healthValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  checkButton: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    paddingVertical: 13,
  },
  checkText: {
    fontSize: 14,
    fontWeight: '900',
  },
  logoutButton: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
    paddingVertical: 15,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '900',
  },
  cockpitCard: {
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  cockpitValue: {
    fontSize: 42,
    fontWeight: '900',
  },
  cockpitCopy: {
    flex: 1,
    gap: 3,
  },
  cockpitTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  cockpitMeta: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.82,
  },
  quickRow: {
    alignItems: 'center',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  quickIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  quickText: {
    flex: 1,
    gap: 3,
  },
  quickLabel: {
    fontSize: 15,
    fontWeight: '900',
  },
  quickMeta: {
    fontSize: 12,
    fontWeight: '700',
  },
});
