import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  Share,
  Modal,
  Alert,
  Keyboard,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

import LegalModal from '../components/LegalModal';

const COLORS = {
  background: '#080812',
  surface: 'rgba(255,255,255,0.065)',
  border: 'rgba(255,255,255,0.14)',
  white: '#FFFFFF',
  muted: '#9997AE',
  purple: '#A855F7',
  cyan: '#43D9F5',
};

const SAMPLE_PROMPTS = [
  {
    id: 'sample-1',
    title: 'Himalayan Golden Hour',
    category: 'Cinematic',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900',
    prompt: 'Ultra realistic cinematic photograph of snow covered Himalayan peaks at golden hour, volumetric fog, dramatic natural lighting, 8K resolution, shot on 35mm lens, photorealistic.',
  },
  {
    id: 'sample-2',
    title: 'Cyberpunk Neon Rain',
    category: 'Anime',
    image: 'https://images.unsplash.com/photo-1515630278258-407f66498911?w=900',
    prompt: 'Futuristic cyberpunk street in rain at night, glowing neon cyan and magenta reflections on wet asphalt, cinematic lighting, ultra detailed, 8K.',
  },
  {
    id: 'sample-3',
    title: 'Luxury Product Studio',
    category: '3D',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900',
    prompt: 'Premium luxury product photography, elegant studio composition, soft reflections, dramatic shadows, refined materials, editorial lighting, photorealistic.',
  },
];

function GlassPanel({ children, style }) {
  return (
    <View style={[styles.glassBorder, style]}>
      <BlurView intensity={35} tint="dark" style={styles.glassPanel}>
        {children}
      </BlurView>
    </View>
  );
}

function PromptCard({ item, favorite, onFavorite, onCopy, onOpen }) {
  return (
    <View style={styles.cardOuter}>
      <LinearGradient
        colors={[
          'rgba(168,85,247,0.75)',
          'rgba(67,217,245,0.35)',
          'rgba(255,255,255,0.08)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardBorder}
      >
        <View style={styles.promptCard}>
          <TouchableOpacity activeOpacity={0.9} onPress={onOpen}>
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['#272044', '#123044']}
                style={styles.cardImage}
              />
            )}

            <View style={styles.imageShade} />

            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {item.category || 'AI Prompt'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.cardContent}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title || 'Untitled Prompt'}
              </Text>

              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={onFavorite}
              >
                <Text style={styles.favoriteIcon}>
                  {favorite ? '♥' : '♡'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.promptExcerpt} numberOfLines={3}>
              {item.prompt}
            </Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.copyWrapper}
                onPress={onCopy}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#A855F7', '#536CFA', '#31BDEB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.copyButton}
                >
                  <Text style={styles.buttonText}>⌑  Copy Prompt</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.viewButton}
                onPress={onOpen}
              >
                <Text style={styles.viewButtonText}>View ↗</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

export default function HomeScreen() {
  const [prompts, setPrompts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('Home');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [legalVisible, setLegalVisible] = useState(false);
  const [toast, setToast] = useState('');

  const fetchPrompts = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, 'prompts'));

      const fetched = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      setPrompts(fetched.length > 0 ? fetched : SAMPLE_PROMPTS);
    } catch (error) {
      console.log('Firebase prompt fetch error:', error);
      setPrompts(SAMPLE_PROMPTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const categories = useMemo(() => {
    const available = prompts
      .map((item) => item.category)
      .filter(Boolean);

    return ['All', ...new Set(available)];
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter((item) => {
      const categoryMatch =
        selectedCategory === 'All' ||
        item.category?.toLowerCase() === selectedCategory.toLowerCase();

      const query = searchQuery.trim().toLowerCase();

      const searchMatch =
        !query ||
        item.title?.toLowerCase().includes(query) ||
        item.prompt?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query);

      const favoriteMatch =
        activeTab !== 'Favorites' || favorites.includes(item.id);

      return categoryMatch && searchMatch && favoriteMatch;
    });
  }, [prompts, selectedCategory, searchQuery, activeTab, favorites]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2000);
  };

  const handleCopy = async (item) => {
    try {
      await Clipboard.setStringAsync(item.prompt || '');

      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } catch (_) {}

      showToast('Prompt copied successfully!');
    } catch (error) {
      Alert.alert('Copy failed', 'Please try again.');
    }
  };

  const toggleFavorite = (id) => {
    setFavorites((previous) => {
      if (previous.includes(id)) {
        return previous.filter((itemId) => itemId !== id);
      }

      return [...previous, id];
    });
  };

  const handleShare = async (item) => {
    try {
      await Share.share({
        message: `${item.title}\n\n${item.prompt}\n\nShared via LuminaPrompts`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPrompts();
  };

  const renderPrompt = ({ item }) => (
    <PromptCard
      item={item}
      favorite={favorites.includes(item.id)}
      onFavorite={() => toggleFavorite(item.id)}
      onCopy={() => handleCopy(item)}
      onOpen={() => setSelectedPrompt(item)}
    />
  );

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      <LinearGradient
        colors={['#090812', '#17102D', '#091321', '#080812']}
        locations={[0, 0.38, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.purpleGlow} />
      <View style={styles.cyanGlow} />

      <SafeAreaView style={styles.safeArea}>
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <View style={styles.brandRow}>
              <View style={styles.brandIcon}>
                <Text style={styles.brandIconText}>✦</Text>
              </View>

              <Text style={styles.brand}>
                Lumina
                <Text style={styles.brandAccent}>Prompts</Text>
              </Text>
            </View>

            <Text style={styles.tagline}>
              CREATE BEYOND IMAGINATION
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setLegalVisible(true)}
          >
            <Text style={styles.headerButtonText}>ⓘ</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'Profile' ? (
          <View style={styles.profilePage}>
            <View style={styles.profileOrb}>
              <Text style={styles.profileOrbText}>✦</Text>
            </View>

            <Text style={styles.profileTitle}>Your Creative Space</Text>

            <Text style={styles.profileSubtitle}>
              Your account, membership and settings will be available here.
              Google Login will be connected in a separate setup step.
            </Text>

            <GlassPanel style={styles.profileInfo}>
              <Text style={styles.profileInfoTitle}>LuminaPrompts</Text>
              <Text style={styles.profileInfoSubtitle}>
                Discover • Save • Create
              </Text>
            </GlassPanel>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setActiveTab('Home')}
            >
              <Text style={styles.backButtonText}>Back to Explore</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* HERO */}

            <View style={styles.hero}>
              <Text style={styles.eyebrow}>
                ✦ YOUR CREATIVE UNIVERSE
              </Text>

              <Text style={styles.heroTitle}>
                Find your next
                {'\n'}
                <Text style={styles.heroAccent}>masterpiece.</Text>
              </Text>

              <Text style={styles.heroSubtitle}>
                Explore prompts crafted to bring your imagination to life.
              </Text>
            </View>

            {/* SEARCH */}

            <GlassPanel style={styles.searchPanel}>
              <Text style={styles.searchIcon}>⌕</Text>

              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search prompts, styles, ideas..."
                placeholderTextColor="#858299"
                style={styles.searchInput}
                returnKeyType="search"
                onSubmitEditing={Keyboard.dismiss}
              />

              {!!searchQuery && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearSearch}>✕</Text>
                </TouchableOpacity>
              )}
            </GlassPanel>

            {/* CATEGORY HEADER */}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeTab === 'Favorites'
                  ? 'Your Favorites'
                  : 'Explore Categories'}
              </Text>

              <Text style={styles.sectionCount}>
                {filteredPrompts.length} prompts
              </Text>
            </View>

            {/* CATEGORY LIST */}

            {activeTab === 'Home' && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
              >
                {categories.map((category) => {
                  const active = selectedCategory === category;

                  return (
                    <TouchableOpacity
                      key={category}
                      activeOpacity={0.8}
                      onPress={() => setSelectedCategory(category)}
                    >
                      {active ? (
                        <LinearGradient
                          colors={['#A855F7', '#536CFA']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.activeCategory}
                        >
                          <Text style={styles.activeCategoryText}>
                            {category}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <View style={styles.inactiveCategory}>
                          <Text style={styles.inactiveCategoryText}>
                            {category}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* PROMPT LIST */}

            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>
                {activeTab === 'Favorites'
                  ? 'Saved for Later'
                  : 'Trending Prompts'}
              </Text>

              <Text style={styles.listSubtitle}>
                A little inspiration goes a long way
              </Text>
            </View>

            {loading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color={COLORS.purple} />
                <Text style={styles.loaderText}>
                  Preparing your inspiration...
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredPrompts}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderPrompt}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor={COLORS.purple}
                  />
                }
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>
                      {activeTab === 'Favorites' ? '♡' : '⌕'}
                    </Text>

                    <Text style={styles.emptyTitle}>
                      {activeTab === 'Favorites'
                        ? 'No Favorites Yet'
                        : 'No Prompts Found'}
                    </Text>

                    <Text style={styles.emptySubtitle}>
                      {activeTab === 'Favorites'
                        ? 'Tap the heart on a prompt to save it here.'
                        : 'Try another search or category.'}
                    </Text>
                  </View>
                }
              />
            )}
          </>
        )}

        {/* BOTTOM NAVIGATION */}

        <View style={styles.bottomNav}>
          {[
            { name: 'Home', icon: '⌂' },
            { name: 'Favorites', icon: '♡' },
            { name: 'Profile', icon: '◉' },
          ].map((tab) => {
            const active = activeTab === tab.name;

            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.navItem}
                onPress={() => {
                  setActiveTab(tab.name);
                  setSelectedCategory('All');
                }}
              >
                <Text style={[styles.navIcon, active && styles.navActive]}>
                  {tab.icon}
                </Text>

                <Text style={[styles.navLabel, active && styles.navActive]}>
                  {tab.name}
                </Text>

                {active && <View style={styles.navDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>

      {/* TOAST */}

      {!!toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓  {toast}</Text>
        </View>
      )}

      {/* PROMPT DETAIL MODAL */}

      <Modal
        visible={!!selectedPrompt}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPrompt(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.detailSheet}>
            <View style={styles.sheetHandle} />

            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setSelectedPrompt(null)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            {selectedPrompt?.image ? (
              <Image
                source={{ uri: selectedPrompt.image }}
                style={styles.detailImage}
              />
            ) : null}

            <Text style={styles.detailCategory}>
              {selectedPrompt?.category || 'AI PROMPT'}
            </Text>

            <Text style={styles.detailTitle}>
              {selectedPrompt?.title}
            </Text>

            <ScrollView style={styles.detailScroll}>
              <Text style={styles.detailPrompt}>
                {selectedPrompt?.prompt}
              </Text>
            </ScrollView>

            <View style={styles.detailActions}>
              <TouchableOpacity
                style={styles.detailCopyWrapper}
                onPress={() => handleCopy(selectedPrompt)}
              >
                <LinearGradient
                  colors={['#A855F7', '#536CFA']}
                  style={styles.detailCopy}
                >
                  <Text style={styles.buttonText}>⌑  Copy Prompt</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.detailShare}
                onPress={() => handleShare(selectedPrompt)}
              >
                <Text style={styles.viewButtonText}>Share ↗</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* LEGAL MODAL */}

      <LegalModal
        visible={legalVisible}
        onClose={() => setLegalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeArea: {
    flex: 1,
  },

  purpleGlow: {
    position: 'absolute',
    top: 80,
    left: -110,
    width: 260,
    height: 260,
    borderRadius: 150,
    backgroundColor: 'rgba(119,54,210,0.12)',
  },

  cyanGlow: {
    position: 'absolute',
    top: 350,
    right: -120,
    width: 250,
    height: 250,
    borderRadius: 150,
    backgroundColor: 'rgba(36,177,220,0.09)',
  },

  header: {
    paddingHorizontal: 21,
    paddingTop: 9,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  brandIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: 'rgba(168,85,247,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(190,150,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandIconText: {
    color: '#D9B8FF',
    fontSize: 19,
  },

  brand: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  brandAccent: {
    color: '#B98AFF',
  },

  tagline: {
    color: '#77748F',
    fontSize: 8,
    letterSpacing: 2,
    marginTop: 5,
    marginLeft: 40,
    fontWeight: '700',
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerButtonText: {
    color: '#D6B7FF',
    fontSize: 22,
  },

  hero: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 18,
  },

  eyebrow: {
    fontSize: 9,
    color: '#BDA0F7',
    fontWeight: '800',
    letterSpacing: 2,
  },

  heroTitle: {
    fontSize: 35,
    lineHeight: 41,
    fontWeight: '900',
    color: '#F7F3FF',
    letterSpacing: -1,
    marginTop: 10,
  },

  heroAccent: {
    color: '#B98AFF',
  },

  heroSubtitle: {
    fontSize: 12,
    color: '#9B9AAF',
    lineHeight: 19,
    marginTop: 8,
    maxWidth: 290,
  },

  glassBorder: {
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
  },

  glassPanel: {
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderRadius: 17,
    overflow: 'hidden',
  },

  searchPanel: {
    marginHorizontal: 18,
    marginBottom: 20,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchIcon: {
    fontSize: 25,
    color: '#BDA0F7',
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 13,
    paddingVertical: 14,
  },

  clearSearch: {
    color: '#AAAAAA',
    padding: 7,
    fontSize: 15,
  },

  sectionHeader: {
    paddingHorizontal: 21,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.white,
  },

  sectionCount: {
    fontSize: 10,
    color: COLORS.muted,
  },

  categoryList: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 6,
    gap: 8,
  },

  activeCategory: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 30,
  },

  activeCategoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  inactiveCategory: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  inactiveCategoryText: {
    color: '#AAA9BC',
    fontSize: 11,
    fontWeight: '600',
  },

  listHeader: {
    paddingHorizontal: 21,
    paddingTop: 13,
    paddingBottom: 10,
  },

  listTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.white,
  },

  listSubtitle: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 3,
  },

  listContent: {
    paddingHorizontal: 17,
    paddingBottom: 20,
  },

  cardOuter: {
    borderRadius: 22,
    marginBottom: 16,
  },

  cardBorder: {
    padding: 1.3,
    borderRadius: 22,
  },

  promptCard: {
    borderRadius: 21,
    overflow: 'hidden',
    backgroundColor: '#11111F',
  },

  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#201B36',
  },

  imageShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 55,
    backgroundColor: 'rgba(5,5,15,0.12)',
  },

  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(9,9,20,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  categoryBadgeText: {
    color: '#E2CEFF',
    fontSize: 10,
    fontWeight: '800',
  },

  cardContent: {
    padding: 14,
  },

  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
    flex: 1,
    marginRight: 8,
  },

  favoriteButton: {
    width: 35,
    height: 35,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  favoriteIcon: {
    fontSize: 20,
    color: '#D9B5FF',
  },

  promptExcerpt: {
    fontSize: 11,
    color: '#A6A4B8',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 13,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  copyWrapper: {
    flex: 1,
  },

  copyButton: {
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  viewButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  viewButtonText: {
    color: '#E6E0F5',
    fontSize: 11,
    fontWeight: '700',
  },

  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loaderText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 12,
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 55,
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 40,
    color: '#B98AFF',
  },

  emptyTitle: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '900',
    marginTop: 10,
  },

  emptySubtitle: {
    fontSize: 11,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },

  bottomNav: {
    height: 62,
    marginHorizontal: 14,
    marginBottom: 5,
    borderRadius: 19,
    backgroundColor: 'rgba(25,23,43,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },

  navIcon: {
    fontSize: 20,
    color: '#77758D',
  },

  navLabel: {
    fontSize: 9,
    color: '#77758D',
    marginTop: 2,
  },

  navActive: {
    color: '#C69BFF',
  },

  navDot: {
    width: 4,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#B98AFF',
    marginTop: 3,
  },

  profilePage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  profileOrb: {
    width: 92,
    height: 92,
    borderRadius: 32,
    backgroundColor: 'rgba(168,85,247,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(192,150,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileOrbText: {
    fontSize: 48,
    color: '#D2AEFF',
  },

  profileTitle: {
    fontSize: 23,
    color: COLORS.white,
    fontWeight: '900',
    marginTop: 22,
  },

  profileSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 9,
  },

  profileInfo: {
    width: '100%',
    marginTop: 25,
    padding: 20,
    alignItems: 'center',
  },

  profileInfoTitle: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '900',
  },

  profileInfoSubtitle: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 5,
  },

  backButton: {
    marginTop: 22,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(168,85,247,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(190,150,255,0.3)',
  },

  backButtonText: {
    color: '#E5D2FF',
    fontWeight: '800',
    fontSize: 12,
  },

  toast: {
    position: 'absolute',
    bottom: 82,
    alignSelf: 'center',
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: '#26203B',
    borderWidth: 1,
    borderColor: 'rgba(190,150,255,0.4)',
  },

  toastText: {
    color: '#F5EFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'flex-end',
  },

  detailSheet: {
    maxHeight: '88%',
    backgroundColor: '#11111F',
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    borderWidth: 1,
    borderColor: 'rgba(190,150,255,0.28)',
    padding: 19,
    paddingBottom: 28,
  },

  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#55536B',
    alignSelf: 'center',
    marginBottom: 15,
  },

  modalClose: {
    position: 'absolute',
    right: 17,
    top: 15,
    zIndex: 2,
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 15,
  },

  detailImage: {
    width: '100%',
    height: 155,
    borderRadius: 16,
    marginBottom: 14,
  },

  detailCategory: {
    fontSize: 9,
    color: '#C49AFF',
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  detailTitle: {
    fontSize: 21,
    color: COLORS.white,
    fontWeight: '900',
    marginTop: 6,
  },

  detailScroll: {
    maxHeight: 190,
    marginTop: 12,
  },

  detailPrompt: {
    fontSize: 13,
    color: '#C5C2D4',
    lineHeight: 21,
  },

  detailActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 17,
  },

  detailCopyWrapper: {
    flex: 1,
  },

  detailCopy: {
    padding: 13,
    borderRadius: 13,
    alignItems: 'center',
  },

  detailShare: {
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
