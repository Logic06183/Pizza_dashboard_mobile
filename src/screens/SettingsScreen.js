import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { Text, List, Switch, Button, Divider, Card, Dialog, Portal, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../api/ApiService';

const SettingsScreen = () => {
  // App settings
  const [settings, setSettings] = useState({
    refreshInterval: '30',
    useSound: true,
    darkTheme: false,
    apiUrl: 'https://pizza-inventory-system.nw.r.appspot.com',
  });
  
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState('unknown');
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [tempApiUrl, setTempApiUrl] = useState('');
  
  // Load settings on component mount
  useEffect(() => {
    loadSettings();
    checkServerStatus();
  }, []);
  
  // Load settings from AsyncStorage
  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoading(false);
    }
  };
  
  // Save settings to AsyncStorage
  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };
  
  // Toggle a boolean setting
  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };
  
  // Update a setting value
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };
  
  // Check server connection status
  const checkServerStatus = async () => {
    try {
      setServerStatus('checking');
      const result = await ApiService.pingServer();
      setServerStatus(result.success ? 'connected' : 'disconnected');
    } catch (error) {
      console.error('Error checking server status:', error);
      setServerStatus('disconnected');
    }
  };
  
  // Open API URL dialog
  const openApiDialog = () => {
    setTempApiUrl(settings.apiUrl);
    setShowApiDialog(true);
  };
  
  // Save API URL
  const saveApiUrl = async () => {
    try {
      // Validate URL format
      if (!tempApiUrl.startsWith('http')) {
        Alert.alert('Invalid URL', 'URL must start with http:// or https://');
        return;
      }
      
      // Save new API URL
      const newSettings = { ...settings, apiUrl: tempApiUrl };
      await saveSettings(newSettings);
      setShowApiDialog(false);
      
      // Check server status with new URL
      checkServerStatus();
    } catch (error) {
      console.error('Error saving API URL:', error);
      Alert.alert('Error', 'Failed to save API URL');
    }
  };
  
  // Get status color
  const getStatusColor = () => {
    switch (serverStatus) {
      case 'connected':
        return '#4CAF50';
      case 'checking':
        return '#FF9800';
      case 'disconnected':
      default:
        return '#F44336';
    }
  };
  
  // Get status text
  const getStatusText = () => {
    switch (serverStatus) {
      case 'connected':
        return 'Connected';
      case 'checking':
        return 'Checking...';
      case 'disconnected':
      default:
        return 'Disconnected';
    }
  };
  
  // Visit the web dashboard
  const openWebDashboard = () => {
    Linking.openURL(settings.apiUrl);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Server Connection</Text>
          
          <View style={styles.serverStatusContainer}>
            <Text style={styles.serverStatusLabel}>Status:</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
          </View>
          
          <Text style={styles.serverUrl}>{settings.apiUrl}</Text>
          
          <View style={styles.buttonRow}>
            <Button 
              mode="outlined" 
              onPress={checkServerStatus}
              style={styles.button}
            >
              Refresh Status
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={openApiDialog}
              style={styles.button}
            >
              Change URL
            </Button>
          </View>
          
          <Button 
            mode="contained" 
            onPress={openWebDashboard}
            style={styles.webButton}
            icon="open-in-new"
          >
            Open Web Dashboard
          </Button>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>App Settings</Text>
          
          <List.Item
            title="Auto-refresh interval"
            description={`${settings.refreshInterval} seconds`}
            left={props => <List.Icon {...props} icon="refresh" />}
            right={() => (
              <View style={styles.settingControl}>
                <Button 
                  compact 
                  mode="text" 
                  onPress={() => {
                    const current = parseInt(settings.refreshInterval);
                    if (current > 15) {
                      updateSetting('refreshInterval', (current - 15).toString());
                    }
                  }}
                  disabled={parseInt(settings.refreshInterval) <= 15}
                >
                  -
                </Button>
                <Text>{settings.refreshInterval}s</Text>
                <Button 
                  compact 
                  mode="text" 
                  onPress={() => {
                    const current = parseInt(settings.refreshInterval);
                    updateSetting('refreshInterval', (current + 15).toString());
                  }}
                  disabled={parseInt(settings.refreshInterval) >= 120}
                >
                  +
                </Button>
              </View>
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Play sounds for new orders"
            description="Play notification sound when new orders arrive"
            left={props => <List.Icon {...props} icon="volume-high" />}
            right={() => (
              <Switch
                value={settings.useSound}
                onValueChange={() => toggleSetting('useSound')}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Dark theme"
            description="Use dark theme throughout the app"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={settings.darkTheme}
                onValueChange={() => toggleSetting('darkTheme')}
              />
            )}
          />
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>About</Text>
          
          <Text style={styles.aboutText}>
            John Dough's Sourdough Pizzeria Dashboard Mobile
          </Text>
          
          <Text style={styles.versionText}>Version 1.0.0</Text>
          
          <Text style={styles.copyrightText}>
            © 2025 John Dough's Pizzeria. All rights reserved.
          </Text>
        </Card.Content>
      </Card>
      
      {/* API URL Dialog */}
      <Portal>
        <Dialog visible={showApiDialog} onDismiss={() => setShowApiDialog(false)}>
          <Dialog.Title>API Server URL</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Server URL"
              value={tempApiUrl}
              onChangeText={setTempApiUrl}
              mode="outlined"
              autoCapitalize="none"
              keyboardType="url"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowApiDialog(false)}>Cancel</Button>
            <Button onPress={saveApiUrl}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#e76f51',
  },
  serverStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serverStatusLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  serverUrl: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  webButton: {
    backgroundColor: '#e76f51',
  },
  settingControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aboutText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default SettingsScreen;
