import React from 'react';
import {
  StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView, Linking
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const PRIVACY_URL = 'https://rexaihu.github.io/luminaprompts-app/';

export default function LegalModal({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={65} tint="dark" style={styles.modalCard}>
          <Text style={styles.header}>About LuminaPrompts</Text>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>1. AI Content Disclaimer</Text>
            <Text style={styles.bodyText}>
              All preview images in LuminaPrompts are AI-generated examples. Because AI image models (Midjourney, Flux, Gemini, Stable Diffusion) generate unique outputs each time, your results may vary depending on the AI tool and settings used.
            </Text>

            <Text style={styles.sectionTitle}>2. Privacy & Data Safety</Text>
            <Text style={styles.bodyText}>
              LuminaPrompts does not collect or sell personal user data. Prompts are fetched securely from Google Firebase.
            </Text>

            <Text style={styles.sectionTitle}>3. Terms of Use</Text>
            <Text style={styles.bodyText}>
              You are free to copy and use these prompts for personal and commercial AI art generation.
            </Text>

            <TouchableOpacity
              onPress={() => Linking.openURL(PRIVACY_URL)}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>Open Full Privacy Policy Online ↗</Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity activeOpacity={0.8} onPress={onClose}>
            <LinearGradient
              colors={['#9333EA', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>Close</Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 24,
    padding: 20,
    maxHeight: '80%',
    backgroundColor: 'rgba(20, 20, 32, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    overflow: 'hidden',
  },
  header: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
    textAlign: 'center',
  },
  scrollArea: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#C084FC',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 4,
  },
  bodyText: {
    color: '#CBD5E1',
    fontSize: 13.5,
    lineHeight: 20,
  },
  linkButton: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  linkText: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 13.5,
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
