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
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { uniqBy } from 'lodash';
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
  const [searchedSongs, setSearchedSongs] = useState<Song[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const totalSongs = useMemo(
    () => uniqBy([...songs, ...searchedSongs], 'newId'),
    [songs, searchedSongs],
  );

  // 直接获取歌手的歌曲, 注意部分歌手可能没有这个接口会进到 catch 里
  useEffect(() => {
    setLoading(true);
    getSongsOfArtist(name)
      .then((res) => {
        setSongs(res.data?.songs ?? []);
      })
      .catch(() => {
        // message.error('获取该歌手的歌曲失败');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [message, name]);

  useEffect(() => {
    setLoadingSearch(true);
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
        setSearchedSongs(allSongs);
      })
      .catch(() => {
        message.error('获取该歌手的歌曲失败');
      })
      .finally(() => {
        setLoadingSearch(false);
      });
  }, [message, name]);

  return (
    <>
      <Flex gap="middle">
        {pic ? (
          <Avatar src={pic} size={96} />
        ) : (
          <Avatar icon={<UserOutlined />} size={96} />
        )}
        <div>
          <Typography.Text
            strong
            style={{ fontSize: 28, display: 'block', marginBottom: 4 }}
          >
            {name}
          </Typography.Text>
          <Button icon={<PlusOutlined />} disabled>
            关注
          </Button>
        </div>
      </Flex>

      <Divider size="middle" />

      <SongTable songs={totalSongs} loading={loading || loadingSearch} />
    </>
  );
}
