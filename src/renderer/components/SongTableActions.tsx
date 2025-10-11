import { useEffect, useMemo } from 'react';
import { App, Button, Flex } from 'antd';
import {
  CopyOutlined,
  DownloadOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PlusSquareOutlined,
} from '@ant-design/icons';
import { copySongInfoToClipboard } from '../utils';
import { type Song, getSongSrc } from '../api';
import { usePlayer, useSong } from '../hooks';
import { useMusicPlayerStore } from '../store';

type SongTableActionsProps = {
  song: Song;
};

// 为了使用自定义 hook, 专门抽出一个组件
export default function SongTableActions({ song }: SongTableActionsProps) {
  const { message } = App.useApp();
  const { matchCurrentSong, isSongPlaying } = useSong(song);
  const { playOrPauseCurrentSong, playNewSong, addSongToPlaylist } =
    usePlayer();
  const brokenSongIds = useMusicPlayerStore((state) => state.brokenSongIds);
  const disabled = useMemo(
    () => brokenSongIds.includes(song?.newId),
    [brokenSongIds, song?.newId],
  );

  return (
    <Flex gap={0}>
      <Button
        // 显示下一个状态
        disabled={disabled}
        title={isSongPlaying ? '暂停' : '播放'}
        size="small"
        type="link"
        icon={isSongPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
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
      <Button
        disabled={disabled}
        title="添加到播放列表"
        size="small"
        type="link"
        icon={<PlusSquareOutlined />}
        onClick={() => {
          addSongToPlaylist(song);
        }}
      />
      <Button
        disabled={disabled}
        title="下载"
        size="small"
        type="link"
        icon={<DownloadOutlined />}
        onClick={() => {
          getSongSrc(song.newId)
            .then((res) => {
              if (res?.data?.success) {
                window.electron?.downloadFile({
                  url: res.data.data,
                  name: song.name,
                });
              } else {
                message.error('获取下载链接失败');
              }
            })
            .catch(() => {
              message.error('获取下载链接失败');
            });
        }}
      />
      <Button
        title="复制歌曲信息"
        size="small"
        type="link"
        icon={<CopyOutlined />}
        onClick={() => {
          copySongInfoToClipboard(song);
        }}
      />
    </Flex>
  );
}
