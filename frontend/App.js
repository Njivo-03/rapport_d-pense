import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { ExpensesProvider } from './src/features/expenses/contexts/ExpensesContext';
import RootNavigator from './src/navigation/RootNavigator';
import { queryClient } from './src/services/queryClient';
import { paperTheme } from './src/theme';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={paperTheme}>
        <ExpensesProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </ExpensesProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
