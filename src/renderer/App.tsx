import { useEffect, useRef, useState } from 'react';
import {
  FolderOpenOutlined,
  HomeOutlined,
  LeftCircleOutlined,
  LeftOutlined,
  ReloadOutlined,
  SettingOutlined,
  SoundOutlined,
  StarOutlined,
  TeamOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import {
  Flex,
  Input,
  Layout,
  Menu,
  theme,
  Typography,
  Button,
  App as AntdApp,
  FloatButton,
  Space,
  Select,
  Avatar,
} from 'antd';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import ReactJkMusicPlayer from 'react-jinke-music-player';
import 'react-jinke-music-player/assets/index.css';
import { useSettingsStore, type PlayerSong } from './store';

import './App.css';
import { useMusicPlayerStore } from './store';
import { useCurrentSong } from './hooks';

const { Header, Content, Sider } = Layout;

const headerItems: MenuProps['items'] = [
  {
    key: '/royalty-free-music',
    label: '免版税音乐',
  },
  {
    key: '/pedia',
    label: '铜钟百科',
  },
  {
    key: '/rain',
    label: '铜钟雨',
  },
];

const siderItems: MenuProps['items'] = [
  {
    key: '',
    label: '首页',
    icon: <HomeOutlined />,
  },
  {
    key: 'artists',
    label: '艺人',
    icon: <TeamOutlined />,
  },
  {
    key: 'recommend',
    label: '精选',
    icon: <StarOutlined />,
  },
  {
    key: 'playlists',
    label: '歌单',
    icon: <FolderOpenOutlined />,
  },
  {
    key: 'pure',
    label: '纯音乐',
    icon: <SoundOutlined />,
  },
  // {
  //   key: 'mv',
  //   label: 'MV',
  //   icon: <VideoCameraOutlined />,
  // },
];

export default function App() {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { message } = AntdApp.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const setPlayerInstance = useMusicPlayerStore(
    (state) => state.setPlayerInstance,
  );
  const songs = useMusicPlayerStore((state) => state.songs);
  const playerConfigs = useMusicPlayerStore((state) => state.playerConfigs);
  const setPlayIndex = useMusicPlayerStore((state) => state.setPlayerIndex);
  const setSongs = useMusicPlayerStore((state) => state.setSongs);
  const setIsPlayerPlaying = useMusicPlayerStore(
    (state) => state.setIsPlayerPlaying,
  );
  const contentRef = useRef<HTMLDivElement>(null);
  // 搜索类型, 是所有还是仅搜索歌手, 调用接口不同
  const [searchType, setSearchType] = useState<'all' | 'artist'>('all');
  // 播放器设置
  const autoPlay = useSettingsStore((state) => state.player.autoPlay);
  const loadAudioErrorPlayNext = useSettingsStore(
    (state) => state.player.loadAudioErrorPlayNext,
  );
  const currentSong = useCurrentSong();
  const themeMode = useSettingsStore((state) => state.theme.mode);
  const playerInstance = useMusicPlayerStore((state) => state.playerInstance);

  // 全局监听下载结果
  useEffect(() => {
    const removeDownloadCompleteListener = window.electron?.onDownloadComplete(
      (path) => {
        message.success(`下载完成, 文件保存至: ${path}`);
      },
    );

    const removeDownloadFailedListener = window.electron?.onDownloadFailed(
      () => {
        message.error('下载失败');
      },
    );

    return () => {
      removeDownloadCompleteListener();
      removeDownloadFailedListener();
    };
  }, [message]);

  // 全局监听导航到设置页面
  useEffect(() => {
    const removeNavigateToSettingsListener =
      window.electron?.onNavigateToSettings(() => {
        navigate('/settings');
      });

    return () => {
      removeNavigateToSettingsListener();
    };
  }, [navigate]);

  // 全局监听菜单栏的播放控制
  useEffect(() => {
    const removePlayerListener = window.electron?.onPlayerActions((action) => {
      if (action === 'togglePlay') {
        playerInstance?.togglePlay?.();
      } else if (action === 'playNext') {
        playerInstance?.playNext?.();
      } else if (action === 'playPrev') {
        playerInstance?.playPrev?.();
      } else if (action === 'load') {
        playerInstance?.load?.();
      } else if (action === 'clear') {
        playerInstance?.clear?.();
      } else {
        // do nothing
      }
    });

    return () => {
      removePlayerListener();
    };
  }, [playerInstance]);

  return (
    <Layout style={{ height: 'calc(100vh - var(--audio-player-height))' }}>
      <Header
        style={{
          background: colorBgContainer,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Flex align="center">
          <Typography.Title
            level={4}
            type="warning"
            style={{ margin: 0, width: 150, cursor: 'pointer' }}
            onClick={() => {
              navigate('/');
            }}
          >
            铜钟
          </Typography.Title>
          <Flex align="center" gap="small">
            <Button
              icon={<LeftOutlined />}
              onClick={() => {
                navigate(-1);
              }}
              disabled={location.key === 'default'}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                window.location.reload();
              }}
            />
            <Space.Compact>
              <Select
                value={searchType}
                onChange={(value) => {
                  setSearchType(value);
                }}
                options={[
                  {
                    label: '所有',
                    value: 'all',
                  },
                  {
                    label: '歌手',
                    value: 'artist',
                  },
                ]}
              />
              <Input.Search
                placeholder="安全搜索"
                allowClear
                onSearch={(value) => {
                  if (value.trim()) {
                    // 存在值才进行搜索
                    navigate(
                      `/search?keyword=${value.trim()}&type=${searchType}`,
                    );
                  }
                }}
              />
            </Space.Compact>
          </Flex>
        </Flex>
        <Flex align="center" gap="small">
          <Menu
            // TODO: 后续再集成进来, 目前在默认浏览器里打开
            selectable={false}
            mode="horizontal"
            items={headerItems}
            onClick={({ key }) => {
              window.electron?.openExternal(
                `https://universe.tonzhon.whamon.com/${key}`,
              );
            }}
          />
          <Flex gap={4} align="center">
            <Avatar icon={<UserOutlined />} size="small" />
            未登录
          </Flex>
          <Button
            title="设置"
            icon={<SettingOutlined />}
            size="small"
            shape="circle"
            onClick={() => {
              navigate('/settings');
            }}
          />
        </Flex>
      </Header>
      <Layout>
        <Sider theme="light" collapsible>
          <Menu
            mode="inline"
            items={siderItems}
            selectedKeys={[location.pathname.split('/')[1]]}
            onSelect={({ key }) => {
              navigate(`/${key}`);
            }}
          />
        </Sider>
        <Layout style={{ padding: '16px' }}>
          <Content
            ref={contentRef}
            style={{
              padding: 16,
              background: colorBgContainer,
              overflow: 'auto',
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>

      <FloatButton.BackTop
        style={{ bottom: 100, right: 36 }}
        target={() => {
          if (contentRef.current) {
            return contentRef.current;
          }
          return window;
        }}
      />

      <ReactJkMusicPlayer
        // quietUpdate
        autoPlayInitLoadPlayList
        // playIndex={playIndex}
        responsive={false}
        locale="zh_CN"
        getAudioInstance={(instance) => {
          setPlayerInstance(instance);
        }}
        audioLists={songs}
        theme={themeMode}
        // 主题在设置里更改
        showThemeSwitch={false}
        defaultPosition={{
          bottom: 0,
          left: 16,
        }}
        mode="full"
        toggleMode={false}
        onAudioError={(err) => {
          console.log('onAudioError', err);
          message.error('播放异常, 已自动跳过');
        }}
        autoHiddenCover
        onAudioListsChange={(currentPlayId, audioLists, audioInfo) => {
          console.log('onAudioListsChange', audioLists, audioInfo);
          setSongs(audioLists as PlayerSong[]);
        }}
        onPlayIndexChange={(index) => {
          setPlayIndex(index);
        }}
        onAudioPlay={(audioInfo) => {
          console.log('开始播放', audioInfo);
          setIsPlayerPlaying(true);
        }}
        onAudioPause={(audioInfo) => {
          console.log('暂停播放', audioInfo);
          setIsPlayerPlaying(false);
        }}
        customDownloader={({ src }) => {
          if (currentSong && src) {
            window.electron?.downloadFile({
              url: src,
              name: currentSong?.name as string,
            });
          }
        }}
        autoPlay={autoPlay}
        loadAudioErrorPlayNext={loadAudioErrorPlayNext}
        {...playerConfigs}
      />
    </Layout>
  );
}
