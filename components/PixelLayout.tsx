import type { PropsWithChildren, ReactNode } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';

type ScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  rightContent?: ReactNode;
}>;

export function PixelScreen({ title, subtitle, rightContent, children }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
