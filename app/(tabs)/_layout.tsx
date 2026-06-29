import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import { Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { usePixelTheme } from '@/components/PixelTheme';
import { useAuth } from '@/lib/auth';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const tabs: Record<string, { title: string; icon: IconName; activeIcon: IconName }> = {
  home: { title: 'Hôm nay', icon: 'view-dashboard-outline', activeIcon: 'view-dashboard' },
  tasks: { title: 'Công việc', icon: 'checkbox-marked-circle-outline', activeIcon: 'checkbox-marked-circle' },
  calendar: { title: 'Lịch', icon: 'calendar-month-outline', activeIcon: 'calendar-month' },
  diary: { title: 'Nhật ký', icon: 'book-heart-outline', activeIcon: 'book-heart' },
  profile: { title: 'Hồ sơ', icon: 'account-circle-outline', activeIcon: 'account-circle' },
};

export default function TabLayout() {
  const { theme: activeTheme } = usePixelTheme();
  const { isReady } = useAuth();

  if (!isReady) {
    return (
      <View style={{ alignItems: 'center', backgroundColor: activeTheme.colors.background, flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator color={activeTheme.colors.primary} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: { backgroundColor: activeTheme.colors.background },
        tabBarActiveTintColor: activeTheme.colors.primary,
        tabBarInactiveTintColor: activeTheme.colors.muted,
        tabBarButton: HapticTab,
        tabBarIcon: ({ color, focused, size }) => {
          const tab = tabs[route.name];
          return (
            <MaterialCommunityIcons
              color={color}
              name={focused ? tab.activeIcon : tab.icon}
              size={size + 2}
              style={{
                backgroundColor: focused ? activeTheme.colors.primaryContainer : 'transparent',
                borderRadius: 999,
                overflow: 'hidden',
                paddingHorizontal: focused ? 18 : 0,
                paddingVertical: focused ? 4 : 0,
              }}
            />
          );
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '800',
          letterSpacing: 0,
        },
        tabBarStyle: {
          backgroundColor: activeTheme.colors.surfaceLow,
          borderTopColor: activeTheme.colors.border,
          height: 78,
          paddingBottom: 12,
          paddingTop: 8,
        },
      })}>
      <Tabs.Screen name="home" options={{ title: tabs.home.title }} />
      <Tabs.Screen name="tasks" options={{ title: tabs.tasks.title }} />
      <Tabs.Screen name="calendar" options={{ title: tabs.calendar.title }} />
      <Tabs.Screen name="diary" options={{ title: tabs.diary.title }} />
      <Tabs.Screen name="profile" options={{ title: tabs.profile.title }} />
    </Tabs>
  );
}
