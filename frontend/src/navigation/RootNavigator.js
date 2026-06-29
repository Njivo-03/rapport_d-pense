import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../features/auth/screens/LoginScreen';
import AddExpenseScreen from '../features/expenses/screens/AddExpenseScreen';
import ExpenseDetailScreen from '../features/expenses/screens/ExpenseDetailScreen';
import ManagerApprovalScreen from '../features/reports/screens/ManagerApprovalScreen';
import ReportDetailScreen from '../features/reports/screens/ReportDetailScreen';
import CreateReportScreen from '../features/reports/screens/CreateReportScreen';
import AddToReportScreen from '../features/reports/screens/AddToReportScreen';
import AppTabs from './AppTabs';
import { routes } from './routes';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={routes.LOGIN}
      screenOptions={{
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '800' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name={routes.LOGIN} component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name={routes.APP} component={AppTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name={routes.ADD_EXPENSE}
        component={AddExpenseScreen}
        options={{ title: 'Nouvelle depense' }}
      />
      <Stack.Screen
        name={routes.EXPENSE_DETAIL}
        component={ExpenseDetailScreen}
        options={{ title: 'Detail depense' }}
      />
      <Stack.Screen
        name={routes.REPORT_DETAIL}
        component={ReportDetailScreen}
        options={{ title: 'Detail rapport' }}
      />
      <Stack.Screen
        name={routes.MANAGER_APPROVAL}
        component={ManagerApprovalScreen}
        options={{ title: 'Approbation' }}
      />
      <Stack.Screen
        name={routes.CREATE_REPORT}
        component={CreateReportScreen}
        options={{ title: 'Nouveau rapport' }}
      />
      <Stack.Screen
        name={routes.ADD_TO_REPORT}
        component={AddToReportScreen}
        options={{ title: 'Ajouter à un rapport' }}
      />
    </Stack.Navigator>
  );
}
