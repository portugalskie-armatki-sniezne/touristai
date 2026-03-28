import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Wymuszenie czystego startu przy każdym przeładowaniu
  useEffect(() => {
    const forceReset = async () => {
      await AsyncStorage.clear();
      setUser(null);
      setToken(null);
      _setHasSeenPreferences(false);
      setLoading(false);
    };
    forceReset();
  }, []);

  const setHasSeenPreferences = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('@hasSeenPreferences', value ? 'true' : 'false');
      _setHasSeenPreferences(value);
    } catch (e) {
      console.error('Failed to save preferences status', e);
    }
  };

  const signIn = async () => {
    setLoading(true);
    // Hardcoded user data
    const dummyUser = {
      id: "00000000-0000-0000-0000-000000000000",
      username: "test_user",
      email: "test@example.com",
      full_name: "Test User",
      profile_picture_url: "https://via.placeholder.com/150"
    };
    
    // Dummy token (accepted by our modified backend)
    const dummyToken = "dummy-jwt-token";

    try {
      await AsyncStorage.setItem('@user', JSON.stringify(dummyUser));
      await AsyncStorage.setItem('@token', dummyToken);
      setUser(dummyUser);
      setToken(dummyToken);
    } catch (e) {
      console.error('Failed to sign in', e);
    } finally {
      setLoading(false);
    }
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
