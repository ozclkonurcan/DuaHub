// services/audioService.ts
import { Audio } from 'expo-av';

let currentSound: Audio.Sound | null = null;
let currentPlaylist: string[] = [];
let currentIndex: number = 0;

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  currentDuaId: string | null;
}

// Audio session'ı başlat
export const initAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
  } catch (error) {
    console.error('Audio init error:', error);
  }
};

// Ses dosyası çal
export const playAudio = async (
  audioUrl: string,
  onStatusUpdate?: (status: AudioState) => void
): Promise<void> => {
  try {
    // Önceki ses varsa durdur
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUrl },
      { shouldPlay: true },
      (status) => {
        if (status.isLoaded && onStatusUpdate) {
          onStatusUpdate({
            isPlaying: status.isPlaying,
            isLoading: false,
            currentTime: status.positionMillis,
            duration: status.durationMillis || 0,
            currentDuaId: null,
          });
        }
      }
    );

    currentSound = sound;
    await sound.playAsync();
  } catch (error) {
    console.error('Play audio error:', error);
    throw error;
  }
};

// Duraklat/Devam
export const togglePlayPause = async (): Promise<boolean> => {
  if (!currentSound) return false;

  try {
    const status = await currentSound.getStatusAsync();
    if (status.isLoaded) {
      if (status.isPlaying) {
        await currentSound.pauseAsync();
        return false;
      } else {
        await currentSound.playAsync();
        return true;
      }
    }
  } catch (error) {
    console.error('Toggle play/pause error:', error);
  }
  return false;
};

// Durdur
export const stopAudio = async (): Promise<void> => {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    } catch (error) {
      console.error('Stop audio error:', error);
    }
  }
};

// Pozisyon ayarla
export const seekAudio = async (positionMillis: number): Promise<void> => {
  if (currentSound) {
    try {
      await currentSound.setPositionAsync(positionMillis);
    } catch (error) {
      console.error('Seek audio error:', error);
    }
  }
};

// Playlist çal
export const playPlaylist = async (
  duaIds: string[],
  startIndex: number = 0,
  getDuaAudioUrl: (duaId: string) => string | undefined
): Promise<void> => {
  currentPlaylist = duaIds;
  currentIndex = startIndex;

  const audioUrl = getDuaAudioUrl(duaIds[startIndex]);
  if (audioUrl) {
    await playAudio(audioUrl);
  }
};

// Sonraki
export const playNext = async (
  getDuaAudioUrl: (duaId: string) => string | undefined
): Promise<void> => {
  if (currentIndex < currentPlaylist.length - 1) {
    currentIndex++;
    const audioUrl = getDuaAudioUrl(currentPlaylist[currentIndex]);
    if (audioUrl) {
      await playAudio(audioUrl);
    }
  }
};

// Önceki
export const playPrevious = async (
  getDuaAudioUrl: (duaId: string) => string | undefined
): Promise<void> => {
  if (currentIndex > 0) {
    currentIndex--;
    const audioUrl = getDuaAudioUrl(currentPlaylist[currentIndex]);
    if (audioUrl) {
      await playAudio(audioUrl);
    }
  }
};

// Temizle
export const cleanup = async (): Promise<void> => {
  await stopAudio();
  currentPlaylist = [];
  currentIndex = 0;
};