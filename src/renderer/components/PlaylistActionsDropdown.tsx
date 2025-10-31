import React from 'react';
import { Dropdown, type MenuProps, type DropdownProps } from 'antd';
import {
  PlayCircleOutlined,
  ShareAltOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import { type Playlist } from '../api';
import { usePlaylistCollection } from '../hooks';
import { useAuthStore } from '../store';
import { copyPlaylistLinkToClipboard } from '../utils';

type PlaylistActionsDropdownProps = {
  trigger: DropdownProps['trigger'];
  playlist?: Playlist;
  children?: React.ReactNode;
};

export default function PlaylistActionsDropdown({
  trigger,
  playlist,
  children,
}: PlaylistActionsDropdownProps) {
  const { isPlaylistCollected, playWholePlaylist, collectPlaylist } =
    usePlaylistCollection(playlist);
  const openLoginModal = useAuthStore((state) => state.openLoginModal);
  const login = useAuthStore((state) => state.login);

  const items: MenuProps['items'] = [
    {
      key: 'play',
      label: '播放',
      icon: <PlayCircleOutlined />,
      onClick: () => {
        playWholePlaylist();
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'collect',
      label: '收藏',
      icon: isPlaylistCollected ? (
        <StarFilled style={{ color: 'var(--ant-pink)' }} />
      ) : (
        <StarOutlined />
      ),
      onClick: () => {
        if (!login) {
          openLoginModal();
          return;
        }

        if (!isPlaylistCollected) {
          collectPlaylist();
        }
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'share',
      label: '分享',
      icon: <ShareAltOutlined />,
      onClick: () => {
        copyPlaylistLinkToClipboard(playlist?.id);
      },
    },
  ];

  return (
    <Dropdown trigger={trigger} menu={{ items }}>
      {children}
    </Dropdown>
  );
}
