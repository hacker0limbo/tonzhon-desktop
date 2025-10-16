import { useMemo } from 'react';
import { Flex } from 'antd';
import {
  EllipsisOutlined,
  HeartFilled,
  HeartOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { type Song } from '../api';
import { useFavorite, usePlayer, useSong } from '../hooks';
import { useMusicPlayerStore } from '../store';
import SongActionsDropdown from './SongActionsDropdown';
import Auth from './Auth';

type SongTableActionsProps = {
  song: Song;
};

// 为了使用自定义 hook, 专门抽出一个组件
export default function SongTableActions({ song }: SongTableActionsProps) {
  const { matchCurrentSong, isSongPlaying } = useSong(song);
  const { playOrPauseCurrentSong, playNewSong, addSongToPlaylist } =
    usePlayer();
  const brokenSongIds = useMusicPlayerStore((state) => state.brokenSongIds);
  const disabled = useMemo(
    () => brokenSongIds.includes(song?.newId),
    [brokenSongIds, song?.newId],
  );
  const { isSongFavorite, favoriteSong, unFavoriteSong } = useFavorite(song);

  return (
    <Flex gap="small" align="center">
      {isSongPlaying ? (
        <PauseCircleOutlined
          title="暂停"
          className={disabled ? 'disabled-icon-link' : 'icon-link'}
          onClick={() => {
            if (matchCurrentSong) {
              // 是当前歌曲, 下一步操作
              playOrPauseCurrentSong();
            } else {
              // 不存在歌曲或者不是当前这首歌, 播放这首新歌
              playNewSong(song);
            }
          }}
        />
      ) : (
        <PlayCircleOutlined
          title="播放"
          className={disabled ? 'disabled-icon-link' : 'icon-link'}
          onClick={() => {
            if (matchCurrentSong) {
              // 是当前歌曲, 下一步操作
              playOrPauseCurrentSong();
            } else {
              // 不存在歌曲或者不是当前这首歌, 播放这首新歌
              playNewSong(song);
            }
          }}
        />
      )}

      <PlusCircleOutlined
        title="添加"
        className={disabled ? 'disabled-icon-link' : 'icon-link'}
        onClick={() => {
          addSongToPlaylist(song);
        }}
      />

      {isSongFavorite ? (
        <Auth>
          <HeartFilled
            style={{ color: 'var(--ant-pink)' }}
            title="取消喜欢"
            className={disabled ? 'disabled-icon-link' : ''}
            onClick={() => {
              unFavoriteSong();
            }}
          />
        </Auth>
      ) : (
        <Auth>
          <HeartOutlined
            title="喜欢"
            className={disabled ? 'disabled-icon-link' : 'icon-link'}
            onClick={() => {
              favoriteSong();
            }}
          />
        </Auth>
      )}

      <SongActionsDropdown trigger={['click']} song={song}>
        <EllipsisOutlined title="更多操作" className="icon-link" />
      </SongActionsDropdown>
    </Flex>
  );
}
