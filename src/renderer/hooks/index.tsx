import { useMemo, useCallback } from 'react';
import { App as AntdApp } from 'antd';
import { useMusicPlayerStore } from '../store';
import { type Song } from '../api';

// 获取当前播放的歌曲
export function useCurrentSong() {
  const songs = useMusicPlayerStore((state) => state.songs);
  const playerIndex = useMusicPlayerStore((state) => state.playerIndex);
  const currentSong = useMemo(() => {
    if (songs.length) {
      return songs[playerIndex];
    }
    return null;
  }, [songs, playerIndex]);

  return currentSong;
}

// 给定一个歌曲, 返回这首歌曲是否在播放列表里, 以及是否在播放
export function useSong(song?: Song) {
  const currentSong = useCurrentSong();
  // 播放器存在歌曲且是当前这首歌曲
  const matchCurrentSong = useMemo(
    () => currentSong && currentSong?.newId === song?.newId,
    [currentSong, song],
  );
  const isPlayerPlaying = useMusicPlayerStore((state) => state.isPlayerPlaying);
  // 下一个状态是否是暂停(显示暂停按钮): 是当前歌曲, 并且当前歌曲正在播放
  const isSongPlaying = useMemo(
    () => matchCurrentSong && isPlayerPlaying,
    [matchCurrentSong, isPlayerPlaying],
  );

  return {
    matchCurrentSong,
    isSongPlaying,
  };
}

// 返回播放器的相关操作
export function usePlayer() {
  const { message } = AntdApp.useApp();
  const addSongToFront = useMusicPlayerStore((state) => state.addSongToFront);
  const isPlayerPlaying = useMusicPlayerStore((state) => state.isPlayerPlaying);
  const playerInstance = useMusicPlayerStore((state) => state.playerInstance);
  const addSong = useMusicPlayerStore((state) => state.addSong);
  const songs = useMusicPlayerStore((state) => state.songs);
  const addSongs = useMusicPlayerStore((state) => state.addSongs);

  // 在播放列表里顶端插入一首歌并播放
  const playNewSong = useCallback(
    (newSong?: Song) => {
      if (!newSong) {
        return;
      }

      addSongToFront(newSong);
    },
    [addSongToFront],
  );

  // 继续播放或暂停当前歌曲
  const playOrPauseCurrentSong = useCallback(() => {
    if (isPlayerPlaying) {
      playerInstance?.pause();
    } else {
      playerInstance?.play();
    }
  }, [isPlayerPlaying, playerInstance]);

  // 添加一首歌到播放列表末尾, 不影响当前播放
  const addSongToPlaylist = useCallback(
    (newSong?: Song) => {
      if (!newSong) {
        return;
      }

      if (songs.find((song) => song.newId === newSong.newId)) {
        message.info('歌曲已存在播放列表');
      } else {
        addSong(newSong);
      }
    },
    [addSong, message, songs],
  );

  // 添加多首歌到播放列表末尾, 不影响当前播放
  const addSongsToPlaylist = useCallback(
    (newSongs: Song[]) => {
      // 去除已存在的重复的歌曲
      const filteredNewSongs = newSongs.filter(
        (newSong) => !songs.find((s) => s.newId === newSong.newId),
      );

      if (!newSongs.length || !filteredNewSongs.length) {
        return;
      }
      addSongs(filteredNewSongs);
    },
    [addSongs, songs],
  );

  return {
    playNewSong,
    playOrPauseCurrentSong,
    addSongToPlaylist,
    addSongsToPlaylist,
  };
}
