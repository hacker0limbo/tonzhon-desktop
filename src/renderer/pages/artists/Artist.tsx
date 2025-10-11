import {
  PlayCircleOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Col,
  Flex,
  Row,
  Typography,
  List,
  Divider,
  App,
} from 'antd';
import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import {
  getSongsOfArtist,
  type Song,
  getSongsOfArtistBySearch,
} from '../../api';
import SongTable from '../../components/SongTable';

export default function Artist() {
  const { message } = App.useApp();
  const [searchParams] = useSearchParams();
  const { name = '' } = useParams<{ name: string }>();
  const pic = searchParams.get('pic');
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (pic) {
      getSongsOfArtist(name)
        .then((res) => {
          setSongs(res.data?.songs ?? []);
        })
        .catch(() => {
          message.error('获取该歌手的歌曲失败');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      Promise.allSettled(
        ['q', 'n', 'k'].map((search) => getSongsOfArtistBySearch(name, search)),
      )
        .then((results) => {
          const allSongs: Song[] = [];
          results.forEach((result) => {
            if (result.status === 'fulfilled') {
              if (result.value.data.success) {
                allSongs.push(...(result.value?.data?.data?.songs ?? []));
              }
            }
          });
          setSongs(allSongs);
        })
        .catch(() => {
          message.error('获取该歌手的歌曲失败');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [message, name, pic]);

  return (
    <>
      <List
        dataSource={[1]}
        renderItem={() => (
          <List.Item>
            <List.Item.Meta
              avatar={
                pic ? (
                  <Avatar src={pic} size={96} />
                ) : (
                  <Avatar icon={<UserOutlined />} size={96} />
                )
              }
              title={
                <Typography.Text style={{ fontSize: 28, marginBottom: 16 }}>
                  {name}
                </Typography.Text>
              }
              description={
                <Button icon={<PlusOutlined />} disabled>
                  关注
                </Button>
              }
            />
          </List.Item>
        )}
      />

      <Divider style={{ marginTop: 0 }} size="middle" />

      <SongTable songs={songs} loading={loading} />
    </>
  );
}
