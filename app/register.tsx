import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';
import { ClerkQuickSignInButton, isClerkConfigured } from '@/lib/clerk';
import { useAuth } from '@/lib/auth';

export default function RegisterScreen() {
  const { devLogin, register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitRegister() {
    setMessage('');
    setIsSubmitting(true);

    try {
      await register({ displayName, email, password });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Đăng ký chưa thành công.');
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
        <View style={styles.blobOne} />
        <View style={styles.blobTwo} />
        <View style={styles.blobThree} />
      </View>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.eyebrow}>PixelDay</Text>
          <Text style={styles.title}>Tạo tài khoản</Text>
        </View>
        <View style={styles.iconBubble}>
          <MaterialCommunityIcons color={theme.colors.primary} name="creation" size={28} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Bắt đầu với một không gian nhẹ nhàng cho việc, lịch và nhật ký.</Text>
        <View style={styles.inputRow}>
          <MaterialCommunityIcons color={theme.colors.outline} name="account-outline" size={22} />
          <TextInput
            placeholder="Tên của bạn"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
          />
        </View>
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
        </View>
        {message ? <Text style={styles.errorText}>{message}</Text> : null}
        <Pressable
          style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
          onPress={submitRegister}
          disabled={isSubmitting}>
          <Text style={styles.primaryText}>{isSubmitting ? 'Đang tạo' : 'Bắt đầu'}</Text>
        </Pressable>
        {isClerkConfigured ? (
          <ClerkQuickSignInButton onMessage={setMessage} />
        ) : (
          <View style={styles.clerkHint}>
            <Text style={styles.clerkHintText}>Clerk cần development build</Text>
          </View>
        )}
        <Pressable style={styles.quickButton} onPress={submitDevLogin} disabled={isSubmitting}>
          <MaterialCommunityIcons color={theme.colors.onMint} name="flash" size={20} />
          <Text style={styles.quickText}>Vào nhanh bằng tài khoản dev</Text>
        </Pressable>
        <Link href="/login" asChild>
          <Pressable style={styles.linkButton}>
            <Text style={styles.linkText}>Đã có tài khoản? Đăng nhập</Text>
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
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  illustration: {
    height: 150,
    marginBottom: theme.spacing.lg,
    position: 'relative',
  },
  blobOne: {
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: 70,
    height: 120,
    left: 8,
    position: 'absolute',
    top: 8,
    width: 120,
  },
  blobTwo: {
    backgroundColor: theme.colors.mint,
    borderRadius: 80,
    height: 130,
    position: 'absolute',
    right: 28,
    top: 0,
    width: 130,
  },
  blobThree: {
    backgroundColor: theme.colors.peach,
    borderRadius: 60,
    bottom: 0,
    height: 92,
    left: 118,
    position: 'absolute',
    width: 92,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  title: {
    color: theme.colors.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
  },
  iconBubble: {
    alignItems: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: 24,
    height: 58,
    justifyContent: 'center',
    width: 58,
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
  subtitle: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
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
  clerkHint: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    paddingVertical: 15,
  },
  clerkHintText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
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
  linkButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
});
