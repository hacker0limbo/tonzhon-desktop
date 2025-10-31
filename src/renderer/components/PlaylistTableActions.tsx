import { Flex } from 'antd';
import {
  PlayCircleOutlined,
  ShareAltOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import { type Playlist } from '../api';
import { usePlaylistCollection } from '../hooks';
import { copyPlaylistLinkToClipboard } from '../utils';
import Auth from './Auth';

type PlaylistTableActionsProps = {
  playlist?: Playlist;
};

// 用于表格模式下的歌单操作栏
export default function PlaylistTableActions({
  playlist,
}: PlaylistTableActionsProps) {
  const { isPlaylistCollected, collectPlaylist, playWholePlaylist } =
    usePlaylistCollection(playlist);

  return (
    <Flex gap="small" align="center">
      <PlayCircleOutlined
        title="播放"
        className="icon-link"
        onClick={() => {
          playWholePlaylist(playlist?.id);
        }}
      />
      {isPlaylistCollected ? (
        <Auth>
          <StarFilled title="已收藏" style={{ color: 'var(--ant-pink)' }} />
        </Auth>
      ) : (
        <Auth>
          <StarOutlined
            title="收藏"
            className="icon-link"
            onClick={() => {
              collectPlaylist();
            }}
          />
        </Auth>
      )}
      <ShareAltOutlined
        title="分享"
        className="icon-link"
        onClick={() => {
          copyPlaylistLinkToClipboard(playlist?.id);
        }}
      />
    </Flex>
  );
}
