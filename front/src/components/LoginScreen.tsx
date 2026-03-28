import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator, Image, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export const LoginScreen = () => {
  const { signIn, loading } = useAuth();

  return (
    <View style={styles.container}>
      {/* Decorative Pill Shapes */}
      <View style={[styles.pill, styles.pillCyan, { top: -40, right: -100 }]} />
      <View style={[styles.pill, styles.pillCoral, { top: 120, right: -150 }]} />
      
      <View style={[styles.pill, styles.pillCyan, { bottom: 120, left: -150 }]} />
      <View style={[styles.pill, styles.pillCoral, { bottom: -40, left: -100 }]} />

      <View style={styles.content}>
        <Image 
          source={require('../../assets/images/logos/logo-toursit-ai.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.description}>
          Sightseeing, simplified. Your personal AI guide, tailored to your needs.
        </Text>

        <TouchableOpacity 
          style={styles.googleButton} 
          onPress={signIn}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>login with google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  pill: {
    position: 'absolute',
    width: 300,
    height: 100,
    borderRadius: 50,
  },
  pillCyan: {
    backgroundColor: '#70E1E1',
  },
  pillCoral: {
    backgroundColor: '#FFA599',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  logo: {
    width: width * 0.8,
    height: 150,
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    color: '#444',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    maxWidth: 300,
  },
  googleButton: {
    backgroundColor: '#D9D9D9',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: 'auto',
    minWidth: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '400',
  },
});
