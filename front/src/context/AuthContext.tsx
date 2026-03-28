import React, { createContext, useContext, useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ensure the browser closes properly after login
WebBrowser.maybeCompleteAuthSession();

type AuthContextType = {
  user: any;
  loading: boolean;
  hasSeenPreferences: boolean;
  setHasSeenPreferences: (value: boolean) => void;
  signIn: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  hasSeenPreferences: false,
  setHasSeenPreferences: () => {},
  signIn: () => {},
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenPreferences, _setHasSeenPreferences] = useState(false);

  // Zastąp poniższe ID swoimi rzeczywistymi kluczami z Google Cloud Console
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  });

  useEffect(() => {
    // Odkomentuj poniższą linię, aby WYMUSIĆ reset przy każdym odświeżeniu:
    AsyncStorage.clear(); 
    
    checkLocalUser();
    checkPreferences();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        getUserInfo(authentication.accessToken);
      }
    }
  }, [response]);

  const checkLocalUser = async () => {
    try {
      const userJSON = await AsyncStorage.getItem('@user');
      if (userJSON) {
        setUser(JSON.parse(userJSON));
      }
    } catch (e) {
      console.error('Failed to load user info', e);
    } finally {
      setLoading(false);
    }
  };

  const checkPreferences = async () => {
    try {
      const val = await AsyncStorage.getItem('@hasSeenPreferences');
      if (val === 'true') {
        _setHasSeenPreferences(true);
      }
    } catch (e) {
      console.error('Failed to load preferences status', e);
    }
  };

  const setHasSeenPreferences = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('@hasSeenPreferences', value ? 'true' : 'false');
      _setHasSeenPreferences(value);
    } catch (e) {
      console.error('Failed to save preferences status', e);
    }
  };

  const getUserInfo = async (token: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userInfo = await res.json();
      await AsyncStorage.setItem('@user', JSON.stringify(userInfo));
      setUser(userInfo);
    } catch (e) {
      console.error('Failed to fetch user info', e);
    }
  };

  const signIn = async () => {
    // Placeholder: Set dummy user to proceed to preferences/app without real auth
    const dummyUser = { name: 'Test User', email: 'test@example.com' };
    await AsyncStorage.setItem('@user', JSON.stringify(dummyUser));
    setUser(dummyUser);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('@user');
    await AsyncStorage.removeItem('@hasSeenPreferences');
    setUser(null);
    _setHasSeenPreferences(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, hasSeenPreferences, setHasSeenPreferences, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
