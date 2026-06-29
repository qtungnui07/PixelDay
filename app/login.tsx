import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';
import { ClerkQuickSignInButton, isClerkConfigured } from '@/lib/clerk';
import { useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const { devLogin, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitLogin() {
    setMessage('');
    setIsSubmitting(true);

    try {
      await login({ email, password });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Đăng nhập chưa thành công.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitDevLogin() {
    setMessage('');
    setIsSubmitting(true);

    try {
      await devLogin();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Đăng nhập nhanh chưa thành công.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.illustration}>
        <View style={styles.sun} />
        <View style={styles.hillBack} />
        <View style={styles.hillFront} />
      </View>

      <View style={styles.hero}>
        <Text style={styles.appName}>PixelDay</Text>
        <Text style={styles.tagline}>Sống trọn từng ngày</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Đăng nhập</Text>
        <View style={styles.inputRow}>
          <MaterialCommunityIcons color={theme.colors.outline} name="email-outline" size={22} />
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View style={styles.inputRow}>
          <MaterialCommunityIcons color={theme.colors.outline} name="lock-outline" size={22} />
          <TextInput
            placeholder="Mật khẩu"
            placeholderTextColor={theme.colors.muted}
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          <MaterialCommunityIcons color={theme.colors.outline} name="eye-off-outline" size={22} />
        </View>
        {message ? <Text style={styles.errorText}>{message}</Text> : null}
        <Pressable
          style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
          onPress={submitLogin}
          disabled={isSubmitting}>
          <Text style={styles.primaryText}>{isSubmitting ? 'Đang đăng nhập' : 'Đăng nhập'}</Text>
        </Pressable>
        {isClerkConfigured ? (
          <ClerkQuickSignInButton onMessage={setMessage} />
        ) : (
          <View style={styles.googleButton}>
            <Text style={styles.googleMark}>C</Text>
            <Text style={styles.googleText}>Clerk cần development build</Text>
          </View>
        )}
        <Pressable style={styles.quickButton} onPress={submitDevLogin} disabled={isSubmitting}>
          <MaterialCommunityIcons color={theme.colors.onMint} name="flash" size={20} />
          <Text style={styles.quickText}>Vào nhanh bằng tài khoản dev</Text>
        </Pressable>
        <Link href="/register" asChild>
          <Pressable style={styles.linkButton}>
            <Text style={styles.linkText}>Bạn chưa có tài khoản? Đăng ký ngay</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  illustration: {
    height: 210,
    marginHorizontal: -theme.spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  sun: {
    backgroundColor: theme.colors.peach,
    borderRadius: 50,
    height: 84,
    left: 42,
    position: 'absolute',
    top: 34,
    width: 84,
  },
  hillBack: {
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: 120,
    bottom: 10,
    height: 160,
    left: -40,
    position: 'absolute',
    width: 280,
  },
  hillFront: {
    backgroundColor: theme.colors.mint,
    borderRadius: 150,
    bottom: -58,
    height: 210,
    position: 'absolute',
    right: -70,
    width: 360,
  },
  hero: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  appName: {
    color: theme.colors.primary,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 0,
  },
  tagline: {
    color: theme.colors.muted,
    fontSize: 20,
    fontWeight: '600',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    ...theme.shadow,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  inputRow: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
  },
  input: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 16,
    paddingVertical: 13,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.radius.pill,
    paddingVertical: 16,
  },
  primaryText: {
    color: theme.colors.onPrimaryContainer,
    fontSize: 16,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.55,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: '800',
  },
  googleButton: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    paddingVertical: 15,
  },
  googleMark: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  googleText: {
    color: theme.colors.text,
    fontWeight: '800',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  quickButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.mint,
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    paddingVertical: 15,
  },
  quickText: {
    color: theme.colors.onMint,
    fontWeight: '900',
  },
});
