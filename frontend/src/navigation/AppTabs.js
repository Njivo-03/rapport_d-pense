import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import ExpensesListScreen from '../features/expenses/screens/ExpensesListScreen';
import NotificationsScreen from '../features/notifications/screens/NotificationsScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import ReportsListScreen from '../features/reports/screens/ReportsListScreen';
import { routes } from './routes';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

function TabIcon(name) {
  return ({ color, size }) => <MaterialCommunityIcons name={name} color={color} size={size} />;
}

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        component={DashboardScreen}
        name={routes.DASHBOARD}
        options={{ title: 'Accueil', tabBarIcon: TabIcon('view-dashboard-outline') }}
      />
      <Tab.Screen
        component={ExpensesListScreen}
        name={routes.EXPENSES}
        options={{ title: 'Depenses', tabBarIcon: TabIcon('receipt-text-outline') }}
      />
      <Tab.Screen
        component={ReportsListScreen}
        name={routes.REPORTS}
        options={{ title: 'Rapports', tabBarIcon: TabIcon('file-document-outline') }}
      />
      <Tab.Screen
        component={NotificationsScreen}
        name={routes.NOTIFICATIONS}
        options={{ title: 'Alertes', tabBarIcon: TabIcon('bell-outline') }}
      />
      <Tab.Screen
        component={ProfileScreen}
        name={routes.PROFILE}
        options={{ title: 'Profil', tabBarIcon: TabIcon('account-outline') }}
      />
    </Tab.Navigator>
  );
}
