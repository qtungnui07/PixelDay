import { useState, type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '@/constants/theme';
import { isClerkConfigured, isClerkNativeEnabled } from '@/lib/clerk-config';

export { isClerkConfigured };

export function PixelClerkProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
}

type ClerkQuickSignInButtonProps = {
  onMessage: (message: string) => void;
};

export function ClerkQuickSignInButton({ onMessage }: ClerkQuickSignInButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function signInWithClerk() {
    setIsSubmitting(true);

    if (!isClerkNativeEnabled) {
      onMessage('Clerk native cần development build. Expo Go đang dùng đăng nhập nhanh server ở nút bên dưới.');
      setIsSubmitting(false);
      return;
    }

    onMessage('Clerk native đã bật, cần build development để dùng module ClerkExpo.');
    setIsSubmitting(false);
  }

  return (
    <Pressable style={[styles.button, isSubmitting && styles.disabled]} onPress={signInWithClerk} disabled={isSubmitting}>
      <Text style={styles.mark}>C</Text>
      <Text style={styles.text}>{isSubmitting ? 'Đang mở Clerk' : 'Đăng nhập bằng Clerk'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    paddingVertical: 15,
  },
  disabled: {
    opacity: 0.55,
  },
  mark: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  text: {
    color: theme.colors.text,
    fontWeight: '800',
  },
});
