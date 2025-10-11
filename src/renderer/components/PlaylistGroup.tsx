import { PlayCircleFilled } from '@ant-design/icons';
import { Col, Flex, Row, Image, theme, Typography, App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getPlaylistInfo, type Playlist } from '../api';
import { fallbackCover, getPlaylistCoverUrl } from '../utils';
import { useMusicPlayerStore } from '../store';

type PlaylistGroupProps = {
  playlists: Playlist[];
};

// 歌单列表
export default function PlaylistGroup({ playlists }: PlaylistGroupProps) {
  const {
    token: { borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();
  const resetNewSongs = useMusicPlayerStore((state) => state.resetNewSongs);
  const { message } = App.useApp();

  return (
    <Row gutter={[16, 16]}>
      {playlists.map(({ cover, id, name }) => (
        <Col span={4} key={id}>
          <Flex vertical align="center" gap="small">
            <Image
              fallback={fallbackCover}
              onClick={() => {
                navigate(`/playlists/${id}`);
              }}
              rootClassName="playlist-cover"
              style={{ borderRadius: borderRadiusLG }}
              src={getPlaylistCoverUrl(cover)}
              preview={{
                visible: false,
                mask: (
                  <PlayCircleFilled
                    style={{ fontSize: 48 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // 直接播放整张专辑
                      getPlaylistInfo(id).then((res) => {
                        if (res.data.success) {
                          if (res.data.playlist?.songs?.length) {
                            resetNewSongs(res.data.playlist.songs || []);
                          } else {
                            message.warning('该歌单为空');
                          }
                        }
                      });
                    }}
                  />
                ),
              }}
            />
            <Typography.Text className="link">{name}</Typography.Text>
          </Flex>
        </Col>
      ))}
    </Row>
  );
}
