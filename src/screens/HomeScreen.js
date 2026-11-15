import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, RefreshControl, SafeAreaView, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import GlassCard from '../components/GlassCard';
import CategoryTabs from '../components/CategoryTabs';
import LegalModal from '../components/LegalModal';

// Fallback sample prompts (agar internet slow ho ya database empty ho)
const SAMPLE_PROMPTS = [
  {
    id: 'sample-1',
    title: 'Himalayan Golden Hour',
    category: 'Cinematic',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    prompt: 'Ultra-realistic cinematic shot of snow-covered Himalayan peaks at golden hour, volumetric fog, 8k resolution, shot on 35mm lens, photorealistic.'
  },
  {
    id: 'sample-2',
    title: 'Cyberpunk Neon Rain',
    category: '9:16 Reels',
    image: 'https://images.unsplash.com/photo-1515630278258-407f66498911?w=800',
    prompt: 'Vertical 9:16 futuristic cyberpunk street in rain at night, glowing neon cyan and magenta reflections on wet asphalt, cinematic lighting, 8k.'
  }
];

export default function HomeScreen() {
  const [prompts, setPrompts] = useState([]);
  const [filteredPrompts, setFilteredPrompts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [legalVisible, setLegalVisible] = useState(false);

  const fetchPrompts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'prompts'));
      const fetchedList = [];
      querySnapshot.forEach((doc) => {
        fetchedList.push({ id: doc.id, ...doc.data() });
      });

      const finalData = fetchedList.length > 0 ? fetchedList : SAMPLE_PROMPTS;
      setPrompts(finalData);
    } catch (error) {
      console.log('Firebase fetch error:', error);
      setPrompts(SAMPLE_PROMPTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    let result = prompts;

    if (selectedCategory !== 'All') {
      result = result.filter(
        (item) => item.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.prompt?.toLowerCase().includes(q)
      );
    }

    setFilteredPrompts(result);
  }, [prompts, selectedCategory, searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPrompts();
  }, []);

  return (
    <LinearGradient colors={['#090910', '#130E24', '#0A111F']} style={styles.gradientBg}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#090910" />

        {/* Liquid Glass Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.appTitle}>LuminaPrompts</Text>
            <Text style={styles.subtitle}>Curated AI Art & Video Prompts</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setLegalVisible(true)}
            style={styles.infoButton}
          >
            <Text style={styles.infoText}>ⓘ Legal</Text>
          </TouchableOpacity>
        </View>

        {/* Glass Search Bar */}
        <View style={styles.searchWrapper}>
          <BlurView intensity={30} tint="dark" style={styles.searchGlass}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search prompts, styles, lighting..."
              placeholderTextColor="#64748B"
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearText}>✕</Text>
              </TouchableOpacity>
            )}
          </BlurView>
        </View>

        {/* Category Filter Tabs */}
        <View>
          <CategoryTabs
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>

        {/* Prompts List */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#A855F7" />
            <Text style={styles.loadingText}>Loading AI Prompts...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredPrompts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <GlassCard item={item} />}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#A855F7"
              />
            }
            ListEmptyComponent={
              <View style={styles.centerBox}>
                <Text style={styles.emptyText}>No prompts found for this filter.</Text>
              </View>
            }
          />
        )}

        {/* Privacy & Disclaimer Modal */}
        <LegalModal visible={legalVisible} onClose={() => setLegalVisible(false)} />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12.5,
    marginTop: 2,
  },
  infoButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  infoText: {
    color: '#E2E8F0',
    fontSize: 12.5,
    fontWeight: '600',
  },
  searchWrapper: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  searchGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingVertical: 11,
  },
  clearText: {
    color: '#94A3B8',
    fontSize: 15,
    paddingLeft: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 30,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    color: '#CBD5E1',
    marginTop: 12,
    fontSize: 14,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 15,
  },
});
    
