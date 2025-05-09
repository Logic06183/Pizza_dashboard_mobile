import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Avatar, Button, Divider, List, Surface, Switch, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { logoutUser } from '../../src/firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const confirmLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: handleLogout, style: 'destructive' }
      ]
    );
  };
  
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>Not logged in</Text>
        <Button 
          mode="contained" 
          onPress={() => router.replace('/auth/login')}
          style={{ marginTop: 16 }}
        >
          Go to Login
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={getInitials(user.displayName)}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text variant="headlineSmall" style={styles.name}>
            {user.displayName || 'User'}
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            {user.email}
          </Text>
          <Button 
            mode="outlined" 
            style={styles.editButton}
            onPress={() => router.push('/profile/edit')}
          >
            Edit Profile
          </Button>
        </View>
      </Surface>
      
      <List.Section>
        <List.Subheader>Account Settings</List.Subheader>
        
        <List.Item
          title="Personal Information"
          left={props => <List.Icon {...props} icon="account-circle" />}
          onPress={() => router.push('/profile/personal-info')}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        
        <List.Item
          title="Notification Settings"
          left={props => <List.Icon {...props} icon="bell" />}
          onPress={() => router.push('/profile/notifications')}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        
        <Divider />
        
        <List.Subheader>Preferences</List.Subheader>
        
        <List.Item
          title="Order Notifications"
          description="Receive notifications about your orders"
          left={props => <List.Icon {...props} icon="local-shipping" />}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              color={theme.colors.primary}
            />
          )}
        />
        
        <List.Item
          title="Address Book"
          left={props => <List.Icon {...props} icon="location-on" />}
          onPress={() => router.push('/profile/addresses')}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        
        <Divider />
        
        <List.Subheader>Support</List.Subheader>
        
        <List.Item
          title="Help Center"
          left={props => <List.Icon {...props} icon="help" />}
          onPress={() => router.push('/help')}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        
        <List.Item
          title="Contact Support"
          left={props => <List.Icon {...props} icon="contact-support" />}
          onPress={() => router.push('/support')}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        
        <Divider />
        
        <List.Item
          title="Logout"
          left={props => <List.Icon {...props} icon="exit-to-app" color="#F44336" />}
          onPress={confirmLogout}
          titleStyle={{ color: '#F44336' }}
        />
      </List.Section>
      
      <View style={styles.version}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    padding: 24,
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'white',
  },
  avatar: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    opacity: 0.7,
    marginBottom: 12,
  },
  editButton: {
    alignSelf: 'flex-start',
  },
  version: {
    alignItems: 'center',
    padding: 24,
  },
  versionText: {
    opacity: 0.5,
  },
});
