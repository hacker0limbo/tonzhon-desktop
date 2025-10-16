import {
  Tabs,
  Flex,
  Avatar,
  theme,
  App,
  Typography,
  Tag,
  type TabsProps,
  Button,
} from 'antd';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MailOutlined, PlusOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store';
import { getAccountInfo } from '../../api';
import SongTable from '../../components/SongTable';
import PlaylistGroup from '../../components/PlaylistGroup';

// 个人主页
export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const {
    token: { colorPrimary },
  } = theme.useToken();
  const { message } = App.useApp();
  const [email, setEmail] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const openCreatePlaylistModal = useAuthStore(
    (state) => state.openCreatePlaylistModal,
  );
  const favoriteSongs = useAuthStore((state) => state.favoriteSongs);

  const items: TabsProps['items'] = [
    {
      key: 'favorites',
      label: '我喜欢的音乐',
      children: <SongTable songs={favoriteSongs} loading={false} />,
    },
    {
      key: 'collections',
      label: '我的收藏',
      children: <PlaylistGroup playlists={user?.collectedPlaylists ?? []} />,
    },
    {
      key: 'playlists',
      label: '我的歌单',
      children: <PlaylistGroup playlists={user?.playlists ?? []} />,
    },
  ];

  useEffect(() => {
    getAccountInfo()
      .then((res) => {
        setEmail(res.data.email ?? '');
      })
      .catch(() => {
        message.error('获取用户账户信息失败');
      });
  }, [message]);

  return (
    <>
      <Flex gap="middle" style={{ marginBottom: 12 }}>
        <Avatar size={96} style={{ background: colorPrimary }}>
          {user?.username?.[0] ?? '用户'}
        </Avatar>
        <div>
          <Typography.Text
            strong
            style={{ fontSize: 28, display: 'block', marginBottom: 4 }}
          >
            {user?.username ?? '用户'}
          </Typography.Text>
          <Tag icon={<MailOutlined />}>{email || '暂无邮箱'}</Tag>
        </div>
      </Flex>
      <Tabs
        activeKey={searchParams.get('tab') || 'favorites'}
        items={items}
        onChange={(key) => {
          setSearchParams({ tab: key });
        }}
        tabBarExtraContent={
          <Button
            icon={<PlusOutlined />}
            onClick={() => {
              openCreatePlaylistModal();
            }}
          >
            创建歌单
          </Button>
        }
      />
    </>
  );
}
