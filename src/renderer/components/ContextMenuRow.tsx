import React, { useMemo } from 'react';
import { Dropdown, type MenuProps, App as AntdApp, App } from 'antd';
import {
  PlayCircleOutlined,
  PlusSquareOutlined,
  DownloadOutlined,
  CopyOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import { getSongSrc, type Song } from '../api';
import { usePlayer, useSong } from '../hooks';
import { copySongInfoToClipboard } from '../utils';
import { useMusicPlayerStore } from '../store';

type ContextMenuRowProps = {
  children: React.ReactNode;
  record?: Song;
  className: string;
  style: React.CSSProperties;
};

// 自定义表格行, 支持右键菜单
export default function ContextMenuRow({
  children,
  record,
  className,
  ...restProps
}: ContextMenuRowProps) {
  const { message } = App.useApp();
  const { matchCurrentSong, isSongPlaying } = useSong(record);
  const { playNewSong, playOrPauseCurrentSong, addSongToPlaylist } =
    usePlayer();
  const brokenSongIds = useMusicPlayerStore((state) => state.brokenSongIds);
  const disabled = useMemo(
    () => brokenSongIds.includes(record?.newId ?? ''),
    [brokenSongIds, record?.newId],
  );

  const items: MenuProps['items'] = [
    {
      key: 'play',
      disabled,
      // 显示下一个状态
      label: isSongPlaying ? '暂停' : '播放',
      icon: isSongPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />,
      onClick: () => {
        if (matchCurrentSong) {
          // 是当前歌曲, 下一步操作
          playOrPauseCurrentSong();
        } else {
          // 不存在歌曲或者不是当前这首歌, 播放这首新歌
          playNewSong(record);
        }
      },
    },
    {
      key: 'add',
      disabled,
      label: '添加到播放列表',
      icon: <PlusSquareOutlined />,
      onClick: () => {
        getSongSrc(record?.newId ?? '').then((res) => {
          if (res?.data?.success) {
            addSongToPlaylist(record);
          }
        });
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'download',
      disabled,
      label: '下载',
      icon: <DownloadOutlined />,
      onClick: () => {
        getSongSrc(record?.newId ?? '')
          .then((res) => {
            if (res?.data?.success) {
              window.electron?.downloadFile({
                url: res.data.data,
                name: record?.name,
              });
            } else {
              message.error('获取下载链接失败');
            }
          })
          .catch(() => {
            message.error('获取下载链接失败');
          });
      },
    },
    {
      key: 'copy',
      label: '复制歌曲信息',
      icon: <CopyOutlined />,
      onClick: () => {
        copySongInfoToClipboard(record);
      },
    },
  ];

  return (
    <Dropdown
      trigger={['contextMenu']}
      menu={{
        items,
      }}
    >
      <tr
        {...restProps}
        onDoubleClick={() => {
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
    </Dropdown>
  );
}
