import React from 'react';
import { StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CATEGORIES = ['All', 'Cinematic', '9:16 Reels', 'Portrait', 'Anime', '3D Render'];

export default function CategoryTabs({ selectedCategory, onSelectCategory }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((category) => {
        const isActive = selectedCategory === category;

        return (
          <TouchableOpacity
            key={category}
            activeOpacity={0.8}
            onPress={() => onSelectCategory(category)}
            style={styles.pillWrapper}
          >
            {isActive ? (
              <LinearGradient
                colors={['#9333EA', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.activePill}
              >
                <Text style={styles.activeText}>{category}</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.inactivePill}>{category}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  pillWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  activePill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  activeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13.5,
  },
  inactivePill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 13.5,
    overflow: 'hidden',
  },
});
