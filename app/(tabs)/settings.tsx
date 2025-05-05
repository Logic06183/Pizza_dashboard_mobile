import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking, Platform } from 'react-native';
import { 
  Text, 
  Card, 
  List, 
  Switch, 
  Divider, 
  Button, 
  useTheme,
  MD3Theme,
  TextInput,
  ActivityIndicator,
  Dialog,
  Portal
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AppSettings {
  darkTheme: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  apiUrl: string;
}

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  darkTheme: false,
  soundEnabled: true,
  notificationsEnabled: true,
  autoRefresh: true,
  refreshInterval: 30,
  apiUrl: 'https://pizza-inventory-system.nw.r.appspot.com',
};

export default function SettingsScreen() {
  const theme = useTheme();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [testingApi, setTestingApi] = useState(false);
  const [intervalInput, setIntervalInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [appVersion, setAppVersion] = useState('1.0.0');

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
    getAppVersionInfo();
  }, []);

  // Get app version information
  const getAppVersionInfo = async () => {
    try {
      if (Platform.OS === 'ios') {
        const version = Application.nativeApplicationVersion || '1.0.0';
        const build = Application.nativeBuildVersion || '1';
        setAppVersion(`${version} (${build})`);
      } else if (Platform.OS === 'android') {
        const version = Application.nativeApplicationVersion || '1.0.0';
        setAppVersion(version);
      } else {
        setAppVersion('1.0.0 (Web)');
      }
    } catch (error) {
      console.error('Error getting app version:', error);
      setAppVersion('1.0.0');
    }
  };

  // Load settings from AsyncStorage
  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings) as AppSettings;
        setSettings(parsedSettings);
        setIntervalInput(parsedSettings.refreshInterval.toString());
        setUrlInput(parsedSettings.apiUrl);
      } else {
        setIntervalInput(DEFAULT_SETTINGS.refreshInterval.toString());
        setUrlInput(DEFAULT_SETTINGS.apiUrl);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save settings to AsyncStorage
  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  // Update a specific setting
  const updateSetting = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  // Handle refresh interval change
  const handleRefreshIntervalChange = () => {
    const interval = parseInt(intervalInput, 10);
    if (isNaN(interval) || interval < 5) {
      Alert.alert('Invalid Value', 'Please enter a number of seconds (minimum 5)');
      setIntervalInput(settings.refreshInterval.toString());
      return;
    }
    updateSetting('refreshInterval', interval);
  };

  // Test API Connection
  const testApiConnection = async () => {
    setTestingApi(true);
    try {
      const response = await fetch(`${urlInput}/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        Alert.alert('Success', 'Successfully connected to the API');
      } else {
        Alert.alert('Error', `API test failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('API test error:', error);
      Alert.alert('Connection Error', 'Could not connect to the API. Please check the URL and your internet connection.');
    } finally {
      setTestingApi(false);
    }
  };

  // Save API URL
  const saveApiUrl = () => {
    if (!urlInput || !urlInput.startsWith('http')) {
      Alert.alert('Invalid URL', 'Please enter a valid URL starting with http:// or https://');
      return;
    }
    
    updateSetting('apiUrl', urlInput);
    setShowApiDialog(false);
  };

  // Reset all settings
  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            saveSettings(DEFAULT_SETTINGS);
            setIntervalInput(DEFAULT_SETTINGS.refreshInterval.toString());
            setUrlInput(DEFAULT_SETTINGS.apiUrl);
            Alert.alert('Settings Reset', 'All settings have been reset to default values');
          }
        }
      ]
    );
  };

  // Open support email
  const openSupportEmail = () => {
    Linking.openURL('mailto:support@johndoughspizzeria.com?subject=Mobile App Support Request');
  };

  // Visit website
  const visitWebsite = () => {
    Linking.openURL('https://johndoughspizzeria.com');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16 }}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.section}>
          <Card.Title title="App Preferences" />
          <Card.Content>
            <List.Item
              title="Dark Theme"
              description="Use dark color scheme throughout the app"
              left={props => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={settings.darkTheme}
                  onValueChange={value => updateSetting('darkTheme', value)}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Sound Effects"
              description="Play sounds for notifications and actions"
              left={props => <List.Icon {...props} icon="volume-high" />}
              right={() => (
                <Switch
                  value={settings.soundEnabled}
                  onValueChange={value => updateSetting('soundEnabled', value)}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Push Notifications"
              description="Receive notifications for new orders"
              left={props => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={settings.notificationsEnabled}
                  onValueChange={value => updateSetting('notificationsEnabled', value)}
                />
              )}
            />
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Title title="Data & Refresh" />
          <Card.Content>
            <List.Item
              title="Auto Refresh"
              description="Automatically refresh data at regular intervals"
              left={props => <List.Icon {...props} icon="refresh" />}
              right={() => (
                <Switch
                  value={settings.autoRefresh}
                  onValueChange={value => updateSetting('autoRefresh', value)}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Refresh Interval"
              description={`Update data every ${settings.refreshInterval} seconds`}
              left={props => <List.Icon {...props} icon="timer" />}
              right={() => (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.numberInput}
                    keyboardType="number-pad"
                    value={intervalInput}
                    onChangeText={setIntervalInput}
                    onBlur={handleRefreshIntervalChange}
                    disabled={!settings.autoRefresh}
                  />
                </View>
              )}
            />
            <Divider />
            <List.Item
              title="API Endpoint"
              description={settings.apiUrl}
              left={props => <List.Icon {...props} icon="api" />}
              onPress={() => setShowApiDialog(true)}
            />
            <Button 
              mode="outlined" 
              icon="connection"
              loading={testingApi}
              onPress={testApiConnection}
              style={styles.button}
            >
              Test API Connection
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Title title="Support & Info" />
          <Card.Content>
            <List.Item
              title="Contact Support"
              description="Email our support team"
              left={props => <List.Icon {...props} icon="email" />}
              onPress={openSupportEmail}
            />
            <Divider />
            <List.Item
              title="Visit Website"
              description="Go to John Dough's Pizzeria website"
              left={props => <List.Icon {...props} icon="web" />}
              onPress={visitWebsite}
            />
            <Divider />
            <List.Item
              title="App Version"
              description={appVersion}
              left={props => <List.Icon {...props} icon="information" />}
            />
            <Button 
              mode="outlined" 
              icon="refresh"
              onPress={resetSettings}
              style={[styles.button, styles.resetButton]}
              textColor="#f44336"
            >
              Reset All Settings
            </Button>
          </Card.Content>
        </Card>

        {/* API URL Dialog */}
        <Portal>
          <Dialog visible={showApiDialog} onDismiss={() => setShowApiDialog(false)}>
            <Dialog.Title>API Endpoint URL</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="API URL"
                mode="outlined"
                value={urlInput}
                onChangeText={setUrlInput}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={styles.dialogHelper}>
                Enter the full URL of the Pizza Dashboard API server
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowApiDialog(false)}>Cancel</Button>
              <Button onPress={saveApiUrl}>Save</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberInput: {
    width: 70,
    height: 40,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
  },
  resetButton: {
    borderColor: '#f44336',
  },
  dialogHelper: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
});
