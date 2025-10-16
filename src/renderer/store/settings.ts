import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

type SettingsStore = {
  // 播放器设置
  player: {
    autoPlay: boolean;
    loadAudioErrorPlayNext: boolean;
  };
  theme: {
    mode: ThemeMode;
    // 如果为 custom 则使用 customColor
    color: string;
    customColor?: string;
  };

  setAutoPlay: (autoPlay: boolean) => void;
  setLoadAudioErrorPlayNext: (loadAudioErrorPlayNext: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
  setThemeColor: (color: string) => void;
  setThemeCustomColor: (color: string) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => {
      return {
        player: {
          autoPlay: true,
          loadAudioErrorPlayNext: true,
        },
        theme: {
          mode: 'light',
          color: '#1677ff',
          customColor: '#31c27c',
        },

        setAutoPlay: (autoPlay) =>
          set((state) => ({
            player: { ...state.player, autoPlay },
          })),
        setLoadAudioErrorPlayNext: (loadAudioErrorPlayNext) =>
          set((state) => ({
            player: { ...state.player, loadAudioErrorPlayNext },
          })),
        setThemeMode: (mode) =>
          set((state) => ({
            theme: { ...state.theme, mode },
          })),
        toggleThemeMode: () =>
          set((state) => ({
            theme: {
              ...state.theme,
              mode: state.theme.mode === 'light' ? 'dark' : 'light',
            },
          })),
        setThemeColor: (color) =>
          set((state) => ({
            theme: { ...state.theme, color },
          })),
        setThemeCustomColor: (customColor) =>
          set((state) => ({
            theme: { ...state.theme, customColor },
          })),
      };
    },
    {
      name: 'settings-storage',
      // 仅仅持久化数据, 不包括函数
      partialize: (state) => ({ player: state.player, theme: state.theme }),
    },
  ),
);
