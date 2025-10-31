import React from 'react';
import { type Playlist } from '../api';
import PlaylistActionsDropdown from './PlaylistActionsDropdown';
import { usePlaylistCollection } from '../hooks';

type ContextMenuPlaylistRowProps = {
  children: React.ReactNode;
  record?: Playlist;
  className: string;
  style: React.CSSProperties;
};

// 支持右键的歌单表格行
export default function ContextMenuPlaylistRow({
  children,
  record,
  ...restProps
}: ContextMenuPlaylistRowProps) {
  const { playWholePlaylist } = usePlaylistCollection(record);

  return (
    <PlaylistActionsDropdown trigger={['contextMenu']} playlist={record}>
      <tr
        {...restProps}
        onDoubleClick={() => {
          playWholePlaylist();
        }}
      >
        {children}
      </tr>
    </PlaylistActionsDropdown>
  );
}
