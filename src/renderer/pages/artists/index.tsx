import { Tabs, type TabsProps } from 'antd';
import ArtistList from '../../components/ArtistList';
import chineseMaleSingers from './chinese-male-singers';
import chineseFemaleSingers from './chinese-female-singers';
import chineseTeams from './chinese-teams';
import overseasMaleSingers from './overseas-male-singers';
import overseasFemaleSingers from './overseas-female-singers';
import overseasTeams from './overseas-teams';

export default function Artists() {
  const items: TabsProps['items'] = [
    {
      key: 'chinese-male-singers',
      label: '华语男歌手',
      children: <ArtistList singers={chineseMaleSingers} />,
    },
    {
      key: 'chinese-female-singers',
      label: '华语女歌手',
      children: <ArtistList singers={chineseFemaleSingers} />,
    },
    {
      key: 'chinese-teams',
      label: '华语组合',
      children: <ArtistList singers={chineseTeams} />,
    },
    {
      key: 'overseas-male-singers',
      label: '海外男歌手',
      children: <ArtistList singers={overseasMaleSingers} />,
    },
    {
      key: 'overseas-female-singers',
      label: '海外女歌手',
      children: <ArtistList singers={overseasFemaleSingers} />,
    },
    {
      key: 'overseas-teams',
      label: '海外组合',
      children: <ArtistList singers={overseasTeams} />,
    },
  ];

  return <Tabs items={items} />;
}
