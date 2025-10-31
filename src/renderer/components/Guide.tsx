import { Tour, type TourProps } from 'antd';

type GuideProps = {
  open: boolean;
  closeGuide: () => void;
};

// 漫游时引导
export default function Guide({ open, closeGuide }: GuideProps) {
  const steps: TourProps['steps'] = [
    {
      title: '教程',
      description: '欢迎使用铜钟客户端, 让我们开始了解如何使用吧!',
      target: null,
    },
    {
      title: '页头',
      description: '页头可以进行搜索, 页面后退刷新以及登录登出等操作',
      target: () => document.querySelector('.header')!,
      placement: 'bottom',
    },
    {
      title: '侧边栏',
      description:
        '左侧侧边栏上半部分可以进行基本的页面导航, 下半部分登录后可以查看自己收藏和创建的歌曲歌单',
      target: () => document.querySelector('.left-sider')!,
      placement: 'right',
    },
    {
      title: '内容区',
      description: '正中间为内容区, 你可以在这里浏览歌曲, 歌单, 歌手等各种内容',
      target: () => document.querySelector('.content')!,
      placement: 'leftTop',
    },
    {
      title: '播放器',
      description: '底部为播放器, 你可以在这里控制音乐播放, 查看播放列表等',
      target: () => document.querySelector('.music-player-panel')!,
      placement: 'top',
    },
  ];

  return (
    <Tour
      open={open}
      onClose={() => {
        closeGuide();
      }}
      steps={steps}
    />
  );
}
