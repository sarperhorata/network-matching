# 📱 React Native Migration Guide - Oniki.net

Complete guide for migrating Oniki.net from PWA to React Native mobile apps (iOS & Android).

---

## 📋 Table of Contents

- [Overview](#overview)
- [Phase 1: Setup](#phase-1-setup)
- [Phase 2: Project Structure](#phase-2-project-structure)
- [Phase 3: Shared Services](#phase-3-shared-services)
- [Phase 4: Navigation](#phase-4-navigation)
- [Phase 5: Screen Migration](#phase-5-screen-migration)
- [Phase 6: Native Features](#phase-6-native-features)
- [Phase 7: Testing](#phase-7-testing)
- [Phase 8: Deployment](#phase-8-deployment)

---

## 🎯 Overview

### Why React Native?

- **Native Performance**: Better UX than PWA
- **Native Features**: Biometric auth, push notifications, camera, etc.
- **App Store Presence**: Discover ability on App Store & Play Store
- **Offline-First**: Better offline capabilities
- **Code Sharing**: ~80% code shared between iOS & Android

### Migration Strategy

**Approach**: Expo (Managed Workflow)
- ✅ Faster development
- ✅ OTA updates
- ✅ Easy native module integration
- ✅ Simplified build process

**Timeline**: 6-8 weeks
- Week 1-2: Setup & Core Infrastructure
- Week 3-4: Screen Migration & UI Components
- Week 5: Native Features Integration
- Week 6: Testing & Bug Fixes
- Week 7-8: Deployment & App Store Submission

---

## 📱 Phase 1: Setup

### 1.1 Install Expo CLI

```bash
npm install -g expo-cli eas-cli

# Verify installation
expo --version
eas --version
```

### 1.2 Create Expo Project

```bash
cd /Users/sarperhorata/12net
npx create-expo-app mobile --template expo-template-blank-typescript

cd mobile
```

### 1.3 Install Core Dependencies

```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# State Management
npm install zustand

# API & Networking
npm install axios socket.io-client
npm install @react-native-async-storage/async-storage

# UI Components
npm install react-native-paper
npm install react-native-vector-icons

# Forms & Validation
npm install react-hook-form zod

# Native Features
npm install expo-camera expo-barcode-scanner
npm install expo-local-authentication
npm install expo-notifications
npm install expo-secure-store
npm install expo-location
npm install expo-image-picker

# Utilities
npm install date-fns
npm install react-native-qrcode-svg
```

### 1.4 Project Configuration

**app.json**
```json
{
  "expo": {
    "name": "Oniki Network",
    "slug": "oniki-network",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#3B82F6"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "net.oniki.app",
      "infoPlist": {
        "NSCameraUsageDescription": "This app needs camera access for QR code scanning",
        "NSFaceIDUsageDescription": "Enable biometric authentication for secure login"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#3B82F6"
      },
      "package": "net.oniki.app",
      "permissions": [
        "CAMERA",
        "USE_BIOMETRIC",
        "USE_FINGERPRINT"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-camera",
      "expo-barcode-scanner",
      "expo-local-authentication",
      "expo-notifications"
    ]
  }
}
```

---

## 📂 Phase 2: Project Structure

```
mobile/
├── app.json
├── package.json
├── tsconfig.json
├── App.tsx
├── assets/
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
├── src/
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── main/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── EventsScreen.tsx
│   │   │   ├── MatchesScreen.tsx
│   │   │   ├── MessagesScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   └── event/
│   │       ├── EventDetailScreen.tsx
│   │       └── EventCheckInScreen.tsx
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Card.tsx
│   │   ├── event/
│   │   │   └── EventCard.tsx
│   │   └── match/
│   │       └── MatchCard.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── events.service.ts
│   │   ├── matches.service.ts
│   │   ├── messages.service.ts
│   │   └── storage.service.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── eventsStore.ts
│   │   └── messagesStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   └── helpers.ts
│   └── theme/
│       ├── colors.ts
│       ├── typography.ts
│       └── spacing.ts
```

---

## 🔌 Phase 3: Shared Services

### 3.1 API Service (Reusable)

**src/services/api.ts**
```typescript
import axios, { AxiosInstance } from 'axios';
import { getStorageItem, setStorageItem, removeStorageItem } from './storage.service';

const API_URL = __DEV__ 
  ? 'http://localhost:3000/api'
  : 'https://api.oniki.net/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const token = await getStorageItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await removeStorageItem('access_token');
          // Navigate to login
        }
        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, params?: any) {
    return this.client.get<T>(url, { params });
  }

  post<T>(url: string, data?: any) {
    return this.client.post<T>(url, data);
  }

  put<T>(url: string, data?: any) {
    return this.client.put<T>(url, data);
  }

  delete<T>(url: string) {
    return this.client.delete<T>(url);
  }
}

export default new ApiService();
```

### 3.2 Secure Storage Service

**src/services/storage.service.ts**
```typescript
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use SecureStore for sensitive data, AsyncStorage for others
export async function setStorageItem(key: string, value: string, secure: boolean = false) {
  try {
    if (secure) {
      await SecureStore.setItemAsync(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  } catch (error) {
    console.error('Storage set error:', error);
  }
}

export async function getStorageItem(key: string, secure: boolean = false): Promise<string | null> {
  try {
    if (secure) {
      return await SecureStore.getItemAsync(key);
    } else {
      return await AsyncStorage.getItem(key);
    }
  } catch (error) {
    console.error('Storage get error:', error);
    return null;
  }
}

export async function removeStorageItem(key: string, secure: boolean = false) {
  try {
    if (secure) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Storage remove error:', error);
  }
}
```

---

## 🧭 Phase 4: Navigation

### 4.1 App Navigator

**src/navigation/AppNavigator.tsx**
```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
```

### 4.2 Main Navigator (Bottom Tabs)

**src/navigation/MainNavigator.tsx**
```typescript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/main/HomeScreen';
import EventsScreen from '../screens/main/EventsScreen';
import MatchesScreen from '../screens/main/MatchesScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Events':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Matches':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

---

## 📱 Phase 5: Screen Migration

### Component Mapping: PWA → React Native

| PWA Component | React Native Equivalent |
|---------------|------------------------|
| `div` | `View` |
| `span`, `p` | `Text` |
| `button` | `TouchableOpacity` / `Pressable` |
| `input` | `TextInput` |
| `img` | `Image` |
| CSS | `StyleSheet` |
| `onClick` | `onPress` |
| Scrolling | `ScrollView` / `FlatList` |

### Example: Login Screen Migration

**Before (PWA - LoginPage.tsx)**
```typescript
<div className="container">
  <input 
    type="email" 
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="input"
  />
  <button onClick={handleLogin} className="button">
    Login
  </button>
</div>
```

**After (React Native - LoginScreen.tsx)**
```typescript
<View style={styles.container}>
  <TextInput
    value={email}
    onChangeText={setEmail}
    style={styles.input}
    keyboardType="email-address"
    autoCapitalize="none"
  />
  <TouchableOpacity onPress={handleLogin} style={styles.button}>
    <Text style={styles.buttonText}>Login</Text>
  </TouchableOpacity>
</View>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});
```

---

## 🔐 Phase 6: Native Features

### 6.1 Biometric Authentication

```typescript
import * as LocalAuthentication from 'expo-local-authentication';

async function authenticateWithBiometrics() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) {
    return false;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Authenticate to access your account',
    fallbackLabel: 'Use passcode',
  });

  return result.success;
}
```

### 6.2 QR Code Scanner (Event Check-in)

```typescript
import { BarCodeScanner } from 'expo-barcode-scanner';

function QRScannerScreen() {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    // Process QR code data
    checkInToEvent(data);
  };

  return (
    <BarCodeScanner
      onBarCodeScanned={handleBarCodeScanned}
      style={StyleSheet.absoluteFillObject}
    />
  );
}
```

### 6.3 Push Notifications

```typescript
import * as Notifications from 'expo-notifications';

async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  
  if (status !== 'granted') {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync();
  
  // Send token to backend
  await api.post('/users/push-token', { token: token.data });
  
  return token.data;
}
```

### 6.4 Offline Storage

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache events for offline access
async function cacheEvents(events: Event[]) {
  await AsyncStorage.setItem('cached_events', JSON.stringify(events));
}

async function getCachedEvents(): Promise<Event[]> {
  const cached = await AsyncStorage.getItem('cached_events');
  return cached ? JSON.parse(cached) : [];
}
```

---

## 🧪 Phase 7: Testing

### 7.1 Unit Testing

```bash
npm install --save-dev jest @testing-library/react-native
```

**Example Test:**
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from './LoginScreen';

describe('LoginScreen', () => {
  it('should call login function when button pressed', () => {
    const onLogin = jest.fn();
    const { getByText } = render(<LoginScreen onLogin={onLogin} />);
    
    fireEvent.press(getByText('Login'));
    
    expect(onLogin).toHaveBeenCalled();
  });
});
```

### 7.2 Device Testing

```bash
# iOS Simulator
expo start --ios

# Android Emulator
expo start --android

# Physical Device (Expo Go app)
expo start
# Scan QR code with Expo Go app
```

---

## 🚀 Phase 8: Deployment

### 8.1 EAS Build Setup

```bash
# Login to Expo
eas login

# Configure EAS
eas build:configure
```

**eas.json**
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### 8.2 Build for Production

```bash
# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Build for both
eas build --platform all --profile production
```

### 8.3 App Store Submission

**iOS (App Store Connect):**
1. Create app in App Store Connect
2. Complete app metadata
3. Upload screenshots (6.5", 5.5" displays)
4. Submit for review
5. Wait for approval (typically 24-48 hours)

**Android (Google Play Console):**
1. Create app in Play Console
2. Complete store listing
3. Upload screenshots
4. Submit for review
5. Release to production

### 8.4 OTA Updates

```bash
# Publish update (no app store submission needed)
eas update --branch production --message "Fixed minor bug"
```

---

## 📊 Migration Checklist

### Phase 1: Setup ✅
- [ ] Expo project created
- [ ] Dependencies installed
- [ ] Project structure organized
- [ ] TypeScript configured

### Phase 2: Core Features
- [ ] Authentication (Login/Register)
- [ ] Home Dashboard
- [ ] Events List & Detail
- [ ] Matches & Recommendations
- [ ] Real-time Messaging
- [ ] User Profile

### Phase 3: Advanced Features
- [ ] QR Code Scanner (Check-in)
- [ ] Biometric Authentication
- [ ] Push Notifications
- [ ] Offline Mode
- [ ] Calendar Integration
- [ ] Photo Upload

### Phase 4: Testing
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] Device Testing (iOS)
- [ ] Device Testing (Android)
- [ ] Beta Testing

### Phase 5: Deployment
- [ ] App Icons & Splash Screen
- [ ] App Store Screenshots
- [ ] Privacy Policy & Terms
- [ ] iOS Build
- [ ] Android Build
- [ ] App Store Submission
- [ ] Play Store Submission

---

## 🎯 Key Differences: PWA vs React Native

| Feature | PWA | React Native |
|---------|-----|--------------|
| Installation | Browser | App Store |
| Performance | Good | Excellent |
| Native APIs | Limited | Full Access |
| Offline | Service Workers | Built-in |
| Push Notifications | Web Push | Native Push |
| Camera | WebRTC | Native Camera |
| Biometrics | WebAuthn | Native |
| File Size | ~500KB | ~30MB |
| Updates | Instant | OTA or Store |

---

## 💡 Best Practices

### Code Reuse
- **80% Shared**: Business logic, API services, stores
- **20% Platform-specific**: UI components, navigation

### Performance
- Use `FlatList` for long lists (not `ScrollView`)
- Implement `React.memo` for expensive components
- Use `useMemo` and `useCallback` hooks
- Optimize images with proper sizing

### User Experience
- Follow platform guidelines (iOS Human Interface, Material Design)
- Implement haptic feedback
- Add loading states
- Handle errors gracefully
- Support dark mode

---

## 🔗 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Play Store Guidelines](https://play.google.com/about/developer-content-policy/)

---

## 🎊 Conclusion

React Native migration will provide:
- ✅ Native app experience
- ✅ App Store visibility
- ✅ Better performance
- ✅ Full native feature access
- ✅ Larger user base

**Estimated Timeline**: 6-8 weeks
**Estimated Cost**: $15-25K (with experienced team)
**ROI**: 2-3x increase in user engagement

---

**Last Updated**: October 18, 2025  
**Version**: 1.0.0  
**Contact**: dev@oniki.net

