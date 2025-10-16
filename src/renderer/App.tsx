import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BellFilled,
  ContactsOutlined,
  CustomerServiceOutlined,
  FolderOpenOutlined,
  HeartOutlined,
  HomeOutlined,
  ImportOutlined,
  LeftCircleOutlined,
  LeftOutlined,
  LogoutOutlined,
  MoonOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  SoundOutlined,
  StarOutlined,
  SunOutlined,
  TeamOutlined,
  UserOutlined,
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
  Dropdown,
  Divider,
  Row,
  Col,
  Collapse,
} from 'antd';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import ReactJkMusicPlayer from 'react-jinke-music-player';
import 'react-jinke-music-player/assets/index.css';
import {
  useAuthStore,
  useSettingsStore,
  type PlayerSong,
  useMusicPlayerStore,
} from './store';
import { useCurrentSong, useRefresh } from './hooks';
import LoginModal from './components/LoginModal';
import { signout, getUserInfo, getFavoriteSongs } from './api';
import CreatePlaylistModal from './components/CreatePlaylistModal';
import './App.css';
import Auth from './components/Auth';

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

const navItems: MenuProps['items'] = [
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
  {
    type: 'divider',
  },
];

export default function App() {
  const {
    token: { colorBgContainer, colorPrimary },
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
  const login = useAuthStore((state) => state.login);
  const openLoginModal = useAuthStore((state) => state.openLoginModal);
  const user = useAuthStore((state) => state.user);
  const resetAuth = useAuthStore((state) => state.resetAuth);
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const setThemeMode = useSettingsStore((state) => state.setThemeMode);
  const openCreatePlaylistModal = useAuthStore(
    (state) => state.openCreatePlaylistModal,
  );
  const { refreshUserInfo, refreshFavoriteSongs } = useRefresh();

  const userMenuSelectedKey = useMemo(() => {
    const [_, path, dynamicPath] = location.pathname.split('/');

    if (path?.includes('my-playlists')) {
      return `playlist-${dynamicPath}`;
    }

    if (path?.includes('profile')) {
      return new URLSearchParams(location.search).get('tab') || 'favorites';
    }

    return path;
  }, [location]);

  const userItems = useMemo<MenuProps['items']>(() => {
    return [
      {
        key: 'user',
        label: '我的',
        type: 'group',
        children: [
          {
            key: 'favorites',
            label: '我喜欢的音乐',
            icon: <HeartOutlined />,
          },
          {
            key: 'collections',
            label: '我的收藏',
            icon: <StarOutlined />,
          },
          {
            key: 'import-playlist',
            label: '导入歌单',
            icon: <ImportOutlined />,
          },
        ],
      },
      {
        type: 'divider',
      },
      {
        key: 'playlists',
        type: 'group',
        label: (
          <Flex
            justify="space-between"
            style={{ color: 'var(--ant-menu-group-title-color)' }}
            align="center"
          >
            歌单
            <Auth>
              <PlusOutlined
                title="创建歌单"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  openCreatePlaylistModal();
                }}
              />
            </Auth>
          </Flex>
        ),
        children: login
          ? user?.playlists?.map((p) => ({
              key: `playlist-${p.id}`,
              label: p.name,
              icon: <CustomerServiceOutlined />,
            }))
          : [],
      },
      {
        type: 'divider',
        style: login ? {} : { display: 'none' },
      },
    ];
  }, [login, openCreatePlaylistModal, user?.playlists]);

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

  useEffect(() => {
    refreshUserInfo();
  }, [refreshUserInfo]);

  useEffect(() => {
    if (login) {
      refreshFavoriteSongs();
    }
  }, [login, refreshFavoriteSongs]);

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
            <BellFilled /> 铜钟
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
          {login ? (
            <Dropdown
              placement="bottom"
              arrow={{ pointAtCenter: true }}
              trigger={['click']}
              // TODO: 下拉框不对齐
              menu={{
                items: [
                  {
                    key: 'user-account',
                    label: '个人主页',
                    icon: <ContactsOutlined />,
                    onClick: () => {
                      navigate('/profile');
                    },
                  },
                  {
                    type: 'divider',
                  },
                  {
                    key: 'sign-out',
                    label: '退出登录',
                    icon: <LogoutOutlined />,
                    onClick: () => {
                      signout()
                        .then((res) => {
                          if (res.status === 200 && res.data === 'OK') {
                            message.success('已退出登录');
                            // 清理登录状态
                            resetAuth();
                          } else {
                            message.error('退出登录失败, 请重试');
                          }
                        })
                        .catch(() => {
                          message.error('退出登录失败, 请重试');
                        });
                    },
                  },
                ],
              }}
            >
              <Flex style={{ cursor: 'pointer' }} gap={4} align="center">
                <Avatar size="small" style={{ background: colorPrimary }}>
                  {user?.username?.[0] ?? '用户'}
                </Avatar>
                {user?.username ?? '用户'}
              </Flex>
            </Dropdown>
          ) : (
            <Flex
              style={{ cursor: 'pointer' }}
              gap={4}
              align="center"
              onClick={() => {
                // 打开登录弹框
                openLoginModal();
              }}
            >
              <Avatar icon={<UserOutlined />} size="small" />
              未登录
            </Flex>
          )}
        </Flex>
      </Header>
      <Layout>
        <Sider
          theme="light"
          collapsible
          trigger={null}
          collapsed={siderCollapsed}
          className="left-sider"
          style={{ overflowY: 'auto' }}
        >
          <div>
            <Menu
              mode="inline"
              items={navItems}
              selectedKeys={[location.pathname.split('/')[1]]}
              onSelect={({ key }) => {
                navigate(`/${key}`);
              }}
            />

            <Menu
              mode="inline"
              items={userItems}
              selectedKeys={[userMenuSelectedKey]}
              onSelect={({ key }) => {
                if (!login) {
                  // 未登录打开登录弹框
                  openLoginModal();
                  return;
                }

                if (key.includes('playlist-')) {
                  const playlistId = key.split('playlist-')?.[1];
                  navigate(`/my-playlists/${playlistId}`);
                } else if (['favorites', 'collections'].includes(key)) {
                  navigate(`/profile?tab=${key}`);
                } else {
                  navigate(`/${key}`);
                }
              }}
            />
          </div>

          <Row style={{ margin: '12px 0' }}>
            <Col span={siderCollapsed ? 24 : 8} style={{ textAlign: 'center' }}>
              <LeftCircleOutlined
                rotate={siderCollapsed ? 180 : 0}
                title={siderCollapsed ? '展开' : '收起'}
                className="icon-link"
                style={{ fontSize: 16 }}
                onClick={() => {
                  setSiderCollapsed(!siderCollapsed);
                }}
              />
            </Col>
            {siderCollapsed ? null : (
              <>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <SettingOutlined
                    className="icon-link"
                    style={{ fontSize: 16 }}
                    title="设置"
                    onClick={() => {
                      navigate('/settings');
                    }}
                  />
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                  {themeMode === 'light' ? (
                    <SunOutlined
                      className="icon-link"
                      style={{ fontSize: 16 }}
                      title="切换主题"
                      onClick={() => {
                        setThemeMode('dark');
                      }}
                    />
                  ) : (
                    <MoonOutlined
                      className="icon-link"
                      style={{ fontSize: 16 }}
                      title="切换主题"
                      onClick={() => {
                        setThemeMode('light');
                      }}
                    />
                  )}
                </Col>
              </>
            )}
          </Row>
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
          if (!login) {
            openLoginModal();
            return;
          }

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

      <LoginModal />
      <CreatePlaylistModal />
    </Layout>
  );
}
