export const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
export const isClerkNativeEnabled = process.env.EXPO_PUBLIC_ENABLE_CLERK_NATIVE === 'true';
export const isClerkConfigured = clerkPublishableKey.startsWith('pk_') && isClerkNativeEnabled;

export async function signOutClerkSession() {
  return;
}
