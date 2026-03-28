import React, { createContext, useContext, useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ensure the browser closes properly after login
WebBrowser.maybeCompleteAuthSession();

type AuthContextType = {
  user: any;
  token: string | null;
  loading: boolean;
  hasSeenPreferences: boolean;
  setHasSeenPreferences: (value: boolean) => void;
  signIn: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  hasSeenPreferences: false,
  setHasSeenPreferences: () => {},
  signIn: () => {},
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenPreferences, _setHasSeenPreferences] = useState(false);

  // Pobieramy ID z .env (wymaga prefiksu EXPO_PUBLIC_ w Expo)
  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  
  if (!googleClientId) {
    console.warn('WARNING: EXPO_PUBLIC_GOOGLE_CLIENT_ID is not defined in .env file!');
  }

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: googleClientId,
    iosClientId: googleClientId,
    webClientId: googleClientId,
  });

  useEffect(() => {
    checkLocalUser();
    checkPreferences();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.idToken) {
        authenticateWithBackend(authentication.idToken);
      }
    }
  }, [response]);

  const checkLocalUser = async () => {
    try {
      const userJSON = await AsyncStorage.getItem('@user');
      const savedToken = await AsyncStorage.getItem('@token');
      if (userJSON && savedToken) {
        setUser(JSON.parse(userJSON));
        setToken(savedToken);
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

  const authenticateWithBackend = async (googleIdToken: string) => {
    try {
      setLoading(true);
      const res = await fetch('http://10.0.2.2:8000/api/v1/auth/google/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleIdToken }),
      });
      
      const data = await res.json();
      if (data.status === 'success') {
        await AsyncStorage.setItem('@user', JSON.stringify(data.user));
        await AsyncStorage.setItem('@token', data.access_token);
        setUser(data.user);
        setToken(data.access_token);
      }
    } catch (e) {
      console.error('Backend authentication failed', e);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    promptAsync();
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('@user');
    await AsyncStorage.removeItem('@token');
    await AsyncStorage.removeItem('@hasSeenPreferences');
    setUser(null);
    setToken(null);
    _setHasSeenPreferences(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, hasSeenPreferences, setHasSeenPreferences, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
