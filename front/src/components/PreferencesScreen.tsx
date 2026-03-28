import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions, ScrollView, SafeAreaView } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

// Nowy, niezawodny selektor poziomów (zamiast problematycznego slidera)
const InterestLevelSelector = ({ label, value, onValueChange }: { label: string, value: number, onValueChange: (val: number) => void }) => {
  const levels = [20, 40, 60, 80, 100];
  
  return (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <View style={styles.levelsWrapper}>
        {levels.map((level) => (
          <TouchableOpacity 
            key={level}
            activeOpacity={0.7}
            onPress={() => onValueChange(level)}
            style={[
              styles.levelBlock, 
              value >= level ? styles.levelBlockActive : styles.levelBlockInactive
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export const PreferencesScreen = () => {
  const { setHasSeenPreferences, signOut } = useAuth();
  const [language, setLanguage] = useState<'Polski' | 'English'>('English');
  const [interests, setInterests] = useState({
    history: 60,
    sports: 40,
    technology: 80,
  });

  const handleContinue = () => {
    console.log('Final Preferences:', { language, interests });
    setHasSeenPreferences(true);
  };

  return (
    <View style={styles.container}>
      {/* Decorative Pill Shapes */}
      <View style={[styles.pill, styles.pillCyan, { top: -40, left: -100 }]} />
      <View style={[styles.pill, styles.pillCoral, { bottom: -40, right: -100 }]} />

      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={signOut}>
          <SymbolView name="chevron.left" size={24} tintColor="#000" />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>select language</Text>
        
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.langButton, language === 'Polski' && styles.langButtonActive]} 
            onPress={() => setLanguage('Polski')}
          >
            <Text style={styles.buttonText}>Polski</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.langButton, language === 'English' && styles.langButtonActive]} 
            onPress={() => setLanguage('English')}
          >
            <Text style={styles.buttonText}>English</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>choose your interests</Text>

        <View style={styles.interestsWrapper}>
          <InterestLevelSelector 
              label="History" 
              value={interests.history} 
              onValueChange={(v) => setInterests(prev => ({ ...prev, history: v }))} 
          />
          <InterestLevelSelector 
              label="Sports" 
              value={interests.sports} 
              onValueChange={(v) => setInterests(prev => ({ ...prev, sports: v }))} 
          />
          <InterestLevelSelector 
              label="Technology" 
              value={interests.technology} 
              onValueChange={(v) => setInterests(prev => ({ ...prev, technology: v }))} 
          />
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
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
  header: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 100,
  },
  backButton: {
    padding: 10,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    marginTop: 8,
    textTransform: 'lowercase',
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  langButton: {
    backgroundColor: '#D9D9D9',
    paddingVertical: 10,
    borderRadius: 25,
    width: 200,
    alignItems: 'center',
  },
  langButtonActive: {
    backgroundColor: '#B0B0B0',
    borderWidth: 1,
    borderColor: '#000',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
  },
  interestsWrapper: {
    width: '100%',
    maxWidth: 280,
    marginBottom: 10,
  },
  selectorContainer: {
    marginBottom: 18,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  levelsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  levelBlock: {
    width: 45,
    height: 8,
    borderRadius: 4,
  },
  levelBlockActive: {
    backgroundColor: '#000',
  },
  levelBlockInactive: {
    backgroundColor: '#E0E0E0',
  },
  continueButton: {
    marginTop: 20,
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 25,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
