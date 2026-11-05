import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { palette } from '@/components/ui';
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: palette.page },
        headerTintColor: palette.text,
        sceneStyle: { backgroundColor: palette.page },
        tabBarStyle: {
          backgroundColor: palette.panel,
          borderTopColor: palette.line,
        },
        tabBarActiveTintColor: '#c4b3ff',
        tabBarInactiveTintColor: palette.muted,
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Oppdag',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>⌕</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title: 'Min filmliste',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>☷</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>○</Text>
          ),
        }}
      />
    </Tabs>
  );
}
