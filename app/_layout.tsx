import React, { useEffect, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Provider as PaperProvider, DefaultTheme as PaperDefaultTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// John Dough's Pizzeria custom theme
const pizzaTheme = {
  ...PaperDefaultTheme,
  colors: {
    ...PaperDefaultTheme.colors,
    primary: '#e76f51',       // Primary brand color
    accent: '#2a2d3e',        // Secondary brand color
    background: '#f5f5f5',    // Background color
    surface: '#ffffff',       // Surface color for cards, sheets, etc.
    error: '#f44336',         // Error color
    text: '#333333',          // Primary text color
    placeholder: '#9e9e9e',    // Placeholder text color
  },
};

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#e76f51',
    background: '#f5f5f5',
    card: '#ffffff',
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  
  // Track dark mode preference
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Load dark mode preference
    const loadThemePreference = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('appSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setIsDarkMode(settings.darkTheme || false);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };
    
    loadThemePreference();
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav isDarkMode={isDarkMode} />;
}

function RootLayoutNav({ isDarkMode }) {
  const theme = isDarkMode ? DarkTheme : navigationTheme;
  const paperTheme = isDarkMode 
    ? { ...pizzaTheme, colors: { ...pizzaTheme.colors, background: '#121212', surface: '#1e1e1e', text: '#ffffff' }} 
    : pizzaTheme;
  
  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={theme}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="order-details" options={{ title: 'Order Details' }} />
          <Stack.Screen name="new-order" options={{ title: 'New Order' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}
