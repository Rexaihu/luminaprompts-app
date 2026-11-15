import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Share } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

export default function GlassCard({ item }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(item.prompt);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${item.title} — AI Prompt:\n\n"${item.prompt}"\n\nShared via LuminaPrompts`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <LinearGradient
      colors={['rgba(168, 85, 247, 0.45)', 'rgba(56, 189, 248, 0.25)', 'rgba(255, 255, 255, 0.08)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.borderGradient}
    >
      <BlurView intensity={35} tint="dark" style={styles.glassContainer}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.category}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.promptText} numberOfLines={3}>
            {item.prompt}
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCopy}
              style={styles.copyWrapper}
            >
              <LinearGradient
                colors={copied ? ['#10B981', '#059669'] : ['#9333EA', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.copyButton}
              >
                <Text style={styles.copyText}>
                  {copied ? '✓ Prompt Copied' : 'Copy Prompt'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleShare}
              style={styles.shareButton}
            >
              <Text style={styles.shareText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  borderGradient: {
    borderRadius: 22,
    padding: 1.5,
    marginBottom: 20,
  },
  glassContainer: {
    borderRadius: 20.5,
    overflow: 'hidden',
    backgroundColor: 'rgba(18, 18, 28, 0.65)',
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 230,
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 15, 25, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    color: '#E9D5FF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  content: {
    padding: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  promptText: {
    color: '#CBD5E1',
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  copyWrapper: {
    flex: 1,
  },
  copyButton: {
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  copyText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  shareButton: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  shareText: {
    color: '#E2E8F0',
    fontWeight: '600',
    fontSize: 14,
  },
});
  
