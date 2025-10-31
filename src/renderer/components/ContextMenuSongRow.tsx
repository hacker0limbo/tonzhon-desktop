import React, { useMemo } from 'react';
import { type Song } from '../api';
import { usePlayer, useSong } from '../hooks';
import { useMusicPlayerStore } from '../store';
import SongActionsDropdown from './SongActionsDropdown';

type ContextMenuSongRowProps = {
  children: React.ReactNode;
  record?: Song;
  className: string;
  style: React.CSSProperties;
};

// 自定义歌曲表格行, 支持右键菜单
export default function ContextMenuSongRow({
  children,
  record,
  className,
  ...restProps
}: ContextMenuSongRowProps) {
  const { matchCurrentSong } = useSong(record);
  const { playNewSong, playOrPauseCurrentSong } = usePlayer();
  const brokenSongIds = useMusicPlayerStore((state) => state.brokenSongIds);
  const disabled = useMemo(
    () => brokenSongIds.includes(record?.newId ?? ''),
    [brokenSongIds, record?.newId],
  );

  return (
    <SongActionsDropdown trigger={['contextMenu']} song={record}>
      <tr
        {...restProps}
        onDoubleClick={() => {
          if (disabled) {
            // 损坏歌曲不让双击
            return;
          }
          if (matchCurrentSong) {
            // 是当前歌曲, 下一步操作
            playOrPauseCurrentSong();
          } else {
            // 不存在歌曲或者不是当前这首歌, 播放这首新歌
            playNewSong(record);
          }
        }}
        className={`${matchCurrentSong ? 'ant-table-row-selected' : ''} ${className}`}
      >
        {children}
      </tr>
    </SongActionsDropdown>
  );
}
