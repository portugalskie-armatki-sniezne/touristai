import { StyleSheet, FlatList, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';

interface VisitedLocation {
  name: string;
  facts: {
    city: string;
    country: string;
    [key: string]: any;
  };
  when_visited: string;
}

export default function VisitedScreen() {
  const [visitedData, setVisitedData] = useState<VisitedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/uploads/visits');
        if (!response.ok) {
          throw new Error('Failed to fetch visited locations');
        }
        const data = await response.json();
        setVisitedData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sortedData = [...visitedData].sort(
    (a, b) => new Date(b.when_visited).getTime() - new Date(a.when_visited).getTime()
  );

  const renderItem = ({ item }: { item: VisitedLocation }) => {
    const { name, facts, when_visited } = item;
    const date = new Date(when_visited).toLocaleString();
    
    return (
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">{name}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.date}>{date}</ThemedText>
        <View style={styles.locationContainer}>
          <ThemedText style={styles.factText}>{facts.city}, {facts.country}</ThemedText>
        </View>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText type="title">Visited</ThemedText>
          <ThemedText themeColor="textSecondary">Locations you've explored with AI</ThemedText>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : error ? (
          <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
        ) : (
          <FlatList
            data={sortedData}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            style={styles.list}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  loader: {
    marginTop: Spacing.six,
  },
  errorText: {
    color: 'red',
    marginTop: Spacing.four,
  },
  list: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    gap: Spacing.four,
  },
  card: {
    padding: Spacing.four,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.2)',
  },
  date: {
    fontSize: 12,
    marginBottom: Spacing.two,
  },
  locationContainer: {
    marginBottom: 0,
  },
  factText: {
    fontSize: 14,
  },
});
