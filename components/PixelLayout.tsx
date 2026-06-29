import type { PropsWithChildren, ReactNode } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';

type ScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  rightContent?: ReactNode;
}>;

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export function PixelScreen({ title, subtitle, rightContent, children }: ScreenProps) {
  const gradientProgress = useSharedValue(0);

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View pointerEvents="none" style={styles.gradientLayer}>
        <LinearGradient
          colors={['#FFF0E7', '#F0EAFF', '#E7F8EF', '#EEF4FF']}
          end={{ x: 1, y: 1 }}
          locations={[0, 0.38, 0.72, 1]}
          start={{ x: 0, y: 0 }}
          style={styles.gradientFill}
        />
        <AnimatedLinearGradient
          colors={['rgba(230, 225, 255, 0.95)', 'rgba(255, 232, 215, 0.18)', 'rgba(195, 236, 210, 0.78)']}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={[styles.animatedGradientFill, firstGradientStyle]}
        />
        <AnimatedLinearGradient
          colors={['rgba(255, 226, 207, 0.82)', 'rgba(246, 241, 255, 0.22)', 'rgba(232, 244, 255, 0.9)']}
          end={{ x: 0, y: 1 }}
          start={{ x: 1, y: 0 }}
          style={[styles.animatedGradientFill, secondGradientStyle]}
        />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.iconButton}>
            <MaterialCommunityIcons color={theme.colors.muted} name="menu" size={24} />
          </View>
          <Text style={styles.brand}>PixelDay</Text>
          <View style={styles.iconButton}>
            <MaterialCommunityIcons color={theme.colors.muted} name="cog-outline" size={24} />
          </View>
        </View>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {rightContent}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({ children, style }: PropsWithChildren<{ style?: object }>) {
  return <View style={[styles.card, style]}>{children}</View>;
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
});
