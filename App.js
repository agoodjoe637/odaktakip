import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';
import { Platform, AppState, LogBox } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import ReportsScreen from './src/screens/ReportsScreen';

// Edge-to-Edge uyarılarını terminalde gizle
LogBox.ignoreLogs(['is not supported with edge-to-edge enabled']);

const Tab = createBottomTabNavigator();

export default function App() {

  useEffect(() => {
    if (Platform.OS === 'android') {
      const hideNavBar = async () => {
        try {
          await NavigationBar.setVisibilityAsync("hidden");
          await NavigationBar.setBehaviorAsync("overlay-swipe"); 
        } catch (e) {
          // Hata yutulur
        }
      };

      hideNavBar();

      const subscription = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') {
          hideNavBar();
        }
      });

      return () => subscription.remove();
    }
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          // KRİTİK: Alt barın yukarı kaymasını engelleyen kod
          safeAreaInsets: { bottom: 0 }, 
          
          tabBarStyle: {
            borderTopWidth: 2,
            borderTopColor: 'tomato',
            height: 60,
            backgroundColor: '#fff',
            position: 'absolute', 
            bottom: 0, 
            left: 0,
            right: 0,
            elevation: 0, 
            paddingBottom: 0, 
            paddingTop: 0,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Ana Sayfa') {
              iconName = focused ? 'timer' : 'timer-outline';
            } else if (route.name === 'Raporlar') {
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          tabBarItemStyle: {
            paddingVertical: 5,
          }
        })}
      >
        <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
        <Tab.Screen name="Raporlar" component={ReportsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}