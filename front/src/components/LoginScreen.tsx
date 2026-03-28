import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useAuth } from '../context/AuthContext';
import { AnimatedSplashOverlay } from './animated-icon';

export const LoginScreen = () => {
  const { signIn, loading } = useAuth();

  return (
    <View style={styles.container}>
      <AnimatedSplashOverlay />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Sign in to access your AI Assistant</Text>
        </View>

        <TouchableOpacity 
          style={styles.googleButton} 
          onPress={signIn}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <SymbolView name="g.circle.fill" size={24} tintColor="#000" />
              <Text style={styles.buttonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 10, // Ensure content is above AnimatedSplashOverlay if needed
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    gap: 12,
    width: '100%',
    justifyContent: 'center',
    maxWidth: 300,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
