import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, PixelScreen } from '@/components/PixelLayout';
import { theme } from '@/constants/theme';

const MAX_DIARY_LENGTH = 1000;

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, '0');
  const day = `${today.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDiaryDate(dateKey: string) {
  const [, month, day] = dateKey.split('-');
  return `${day}/${month}`;
}

async function getDiaryStorage() {
  const storageModule = await import('@react-native-async-storage/async-storage');
  return storageModule.default;
}

export default function DiaryScreen() {
  const diaryDateKey = useMemo(() => getTodayKey(), []);
  const [content, setContent] = useState('');
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadDiary() {
      try {
        const storage = await getDiaryStorage();
        const savedContent = await storage.getItem(`pixelday.diary.${diaryDateKey}`);

        if (savedContent) {
          setContent(savedContent);
        }

        const savedPhotos = await storage.getItem(`pixelday.diary.photos.${diaryDateKey}`);

        if (savedPhotos) {
          setPhotoUris(JSON.parse(savedPhotos) as string[]);
        }
      } catch {
        setContent('');
        setPhotoUris([]);
      }
    }

    loadDiary();
  }, [diaryDateKey]);

  function updateContent(nextContent: string) {
    setContent(nextContent.slice(0, MAX_DIARY_LENGTH));
    setSuccessMessage('');
  }

  async function saveDiary() {
    setIsSaving(true);

    try {
      const storage = await getDiaryStorage();
      await storage.setItem(`pixelday.diary.${diaryDateKey}`, content);
      setSuccessMessage('Đã lưu nhật ký hôm nay.');
    } catch {
      setSuccessMessage('Chưa lưu được, thử lại sau.');
    } finally {
      setIsSaving(false);
    }
  }

  async function savePhotoUris(nextPhotoUris: string[]) {
    setPhotoUris(nextPhotoUris);

    try {
      const storage = await getDiaryStorage();
      await storage.setItem(`pixelday.diary.photos.${diaryDateKey}`, JSON.stringify(nextPhotoUris));
    } catch {
      setSuccessMessage('Chưa lưu được ảnh, thử lại sau.');
    }
  }

  async function pickPhotos() {
    const ImagePicker = await import('expo-image-picker');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setSuccessMessage('Cần quyền truy cập thư viện ảnh.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ['images'],
      orderedSelection: true,
      quality: 0.85,
      selectionLimit: 0,
    }).catch(() => null);

    if (!result) {
      result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: false,
        mediaTypes: ['images'],
        quality: 0.85,
      });
    }

    if (result.canceled) {
      return;
    }

    const nextUris = result.assets.map((asset) => asset.uri).filter(Boolean);
    await savePhotoUris([...photoUris, ...nextUris]);
    setSuccessMessage('Đã thêm ảnh vào nhật ký.');
  }

  return (
    <PixelScreen title="Nhật ký" subtitle="Ghi lại vài dòng, không cần chọn tâm trạng.">
      <Card style={styles.promptCard}>
        <View style={styles.promptIcon}>
          <MaterialCommunityIcons color={theme.colors.primary} name="pencil" size={28} />
        </View>
        <View style={styles.promptText}>
          <Text style={styles.promptTitle}>Câu hỏi hôm nay</Text>
          <Text style={styles.promptBody}>Điều nhỏ nào khiến bạn thấy ngày này đáng nhớ?</Text>
        </View>
      </Card>

      <Card style={styles.editorCard}>
        <View style={styles.editorHeader}>
          <Text style={styles.label}>Nhật ký ngày {formatDiaryDate(diaryDateKey)}</Text>
          <Text style={styles.counter}>
            {content.length}/{MAX_DIARY_LENGTH}
          </Text>
        </View>
        <TextInput
          multiline
          placeholder="Viết vài dòng cho chính bạn..."
          placeholderTextColor={theme.colors.muted}
          style={styles.textArea}
          textAlignVertical="top"
          value={content}
          onChangeText={updateContent}
        />
        <View style={styles.saveRow}>
          <Text style={[styles.successText, successMessage.includes('Chưa') && styles.errorText]}>
            {successMessage}
          </Text>
          <Pressable style={styles.saveButton} onPress={saveDiary} disabled={isSaving}>
            <MaterialCommunityIcons color={theme.colors.onPrimaryContainer} name="content-save-outline" size={20} />
            <Text style={styles.saveText}>{isSaving ? 'Đang lưu' : 'Lưu'}</Text>
          </Pressable>
        </View>
      </Card>

      <Card style={styles.photoCard}>
        <View style={styles.editorHeader}>
          <View>
            <Text style={styles.label}>Ảnh trong ngày</Text>
            <Text style={styles.promptBody}>{photoUris.length} ảnh đã chọn</Text>
          </View>
        </View>
        <View style={styles.photoGrid}>
          {photoUris.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.photoThumb} contentFit="cover" />
          ))}
          <Pressable style={styles.uploadCard} onPress={pickPhotos}>
            <MaterialCommunityIcons color={theme.colors.onPeach} name="image-plus" size={28} />
            <Text style={styles.uploadText}>Thêm ảnh</Text>
          </Pressable>
        </View>
      </Card>

      <Card style={styles.recentCard}>
        <Text style={styles.label}>Nhật ký gần đây</Text>
        {['Một ngày năng suất', 'Cà phê cuối tuần'].map((item, index) => (
          <View key={item} style={styles.recentRow}>
            <View style={[styles.dateBox, index === 0 ? styles.dateBoxActive : null]}>
              <Text style={styles.dateDay}>{index === 0 ? '29' : '28'}</Text>
              <Text style={styles.dateMonth}>Th 6</Text>
            </View>
            <View style={styles.recentText}>
              <Text style={styles.recentTitle}>{item}</Text>
              <Text style={styles.recentBody}>Vài dòng nhẹ nhàng được lưu trong bản demo...</Text>
            </View>
            <MaterialCommunityIcons color={theme.colors.muted} name="chevron-right" size={22} />
          </View>
        ))}
      </Card>

      <View style={styles.memoryRow}>
        <Card style={styles.memoryCard}>
          <Text style={styles.memoryValue}>{content.split('\n').filter(Boolean).length}</Text>
          <Text style={styles.memoryLabel}>Dòng đã viết</Text>
        </Card>
        <Card style={styles.memoryCard}>
          <Text style={styles.memoryValue}>{content.length}</Text>
          <Text style={styles.memoryLabel}>Ký tự hôm nay</Text>
        </Card>
      </View>
    </PixelScreen>
  );
}

const styles = StyleSheet.create({
  promptCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.peachSoft,
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  promptIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  promptText: {
    flex: 1,
    gap: 4,
  },
  promptTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  promptBody: {
    color: theme.colors.muted,
    lineHeight: 20,
  },
  editorCard: {
    gap: theme.spacing.md,
  },
  editorHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  counter: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '900',
  },
  textArea: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 220,
    padding: theme.spacing.md,
  },
  saveRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  successText: {
    color: theme.colors.onMint,
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  errorText: {
    color: theme.colors.danger,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 12,
  },
  saveText: {
    color: theme.colors.onPrimaryContainer,
    fontSize: 15,
    fontWeight: '900',
  },
  photoCard: {
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.md,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  photoThumb: {
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: theme.radius.md,
    height: 96,
    width: '30.5%',
  },
  uploadCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.peachSoft,
    borderColor: theme.colors.peach,
    borderRadius: theme.radius.md,
    borderStyle: 'dashed',
    borderWidth: 2,
    gap: theme.spacing.xs,
    height: 96,
    justifyContent: 'center',
    width: '30.5%',
  },
  uploadText: {
    color: theme.colors.onPeach,
    fontSize: 12,
    fontWeight: '900',
  },
  recentCard: {
    gap: theme.spacing.sm,
  },
  recentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  dateBox: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: theme.radius.md,
    minWidth: 64,
    padding: theme.spacing.sm,
  },
  dateBoxActive: {
    backgroundColor: theme.colors.mint,
  },
  dateDay: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  dateMonth: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  recentText: {
    flex: 1,
  },
  recentTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  recentBody: {
    color: theme.colors.muted,
    lineHeight: 20,
  },
  memoryRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  memoryCard: {
    flex: 1,
  },
  memoryValue: {
    color: theme.colors.primary,
    fontSize: 30,
    fontWeight: '900',
  },
  memoryLabel: {
    color: theme.colors.muted,
    fontWeight: '700',
  },
});
