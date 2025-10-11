import {
  Divider,
  Typography,
  Row,
  Col,
  Checkbox,
  Flex,
  Button,
  App,
  Radio,
  ColorPicker,
  Space,
} from 'antd';
import { useSettingsStore } from '../../store';

export default function Settings() {
  const { message } = App.useApp();
  const autoPlay = useSettingsStore((state) => state.player.autoPlay);
  const loadAudioErrorPlayNext = useSettingsStore(
    (state) => state.player.loadAudioErrorPlayNext,
  );
  const {
    setAutoPlay,
    setLoadAudioErrorPlayNext,
    setThemeMode,
    setThemeColor,
    setThemeCustomColor,
  } = useSettingsStore();
  const themeColor = useSettingsStore((state) => state.theme.color);
  const themeMode = useSettingsStore((state) => state.theme.mode);
  const themeCustomColor = useSettingsStore((state) => state.theme.customColor);

  return (
    <>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        设置
      </Typography.Title>
      <Divider size="middle" />

      <Row align="top">
        <Col span={3}>
          <Typography.Title level={5} style={{ margin: 0 }}>
            播放
          </Typography.Title>
        </Col>
        <Col span={21}>
          <Flex vertical gap="small" align="start">
            <Checkbox
              checked={autoPlay}
              onChange={(e) => setAutoPlay(e.target.checked)}
            >
              加载完歌曲后自动播放
            </Checkbox>
            <Checkbox
              checked={loadAudioErrorPlayNext}
              onChange={(e) => setLoadAudioErrorPlayNext(e.target.checked)}
            >
              歌曲播放失败自动播放下一首
            </Checkbox>
          </Flex>
        </Col>
      </Row>
      <Divider size="middle" />

      <Row align="top">
        <Col span={3}>
          <Typography.Title level={5} style={{ margin: 0 }}>
            主题
          </Typography.Title>
        </Col>
        <Col span={21}>
          <Flex vertical gap="small" align="start">
            <Flex align="center" gap="middle">
              <Typography.Text strong style={{ fontSize: 15 }}>
                模式
              </Typography.Text>
              <Radio.Group
                value={themeMode}
                onChange={(e) => {
                  setThemeMode(e.target.value);
                }}
                options={[
                  {
                    label: '亮色',
                    value: 'light',
                  },
                  {
                    label: '暗色',
                    value: 'dark',
                  },
                ]}
              />
            </Flex>

            <Flex align="center" gap="middle">
              <Typography.Text strong style={{ fontSize: 15 }}>
                皮肤
              </Typography.Text>
              <Radio.Group
                value={themeColor}
                onChange={(e) => {
                  setThemeColor(e.target.value);
                }}
                options={[
                  {
                    label: (
                      <ColorPicker
                        defaultValue="#1677ff"
                        size="small"
                        showText={() => '酷炫蓝'}
                        open={false}
                      />
                    ),
                    value: '#1677ff',
                  },
                  {
                    label: (
                      <ColorPicker
                        defaultValue="#ffa500"
                        size="small"
                        showText={() => '铜钟橙'}
                        open={false}
                      />
                    ),
                    value: '#ffa500',
                  },
                  {
                    label: (
                      <ColorPicker
                        value={themeCustomColor}
                        onChange={(color) => {
                          setThemeCustomColor(color.toHexString());
                        }}
                        disabledAlpha
                        size="small"
                        showText={() => '自定义'}
                      />
                    ),
                    value: 'custom',
                  },
                ]}
              />
            </Flex>
          </Flex>
        </Col>
      </Row>
      <Divider size="middle" />

      <Row align="top">
        <Col span={3}>
          <Typography.Title level={5} style={{ margin: 0 }}>
            缓存
          </Typography.Title>
        </Col>
        <Col span={21}>
          <Button
            onClick={() => {
              localStorage.clear();
              message.success('缓存已清空');
            }}
          >
            清空缓存
          </Button>
        </Col>
      </Row>
      <Divider size="middle" />

      <Row align="top">
        <Col span={3}>
          <Typography.Title level={5} style={{ margin: 0 }}>
            关于
          </Typography.Title>
        </Col>
        <Col span={21}>
          <Flex vertical gap="small" align="start">
            <Typography.Text>
              当前版本: <strong>{window.electron?.appVersion}</strong>
            </Typography.Text>

            <Flex gap="small" align="baseline">
              <Typography.Text>相关链接</Typography.Text>
              <Button onClick={() => {}}>GitHub</Button>
              <Button
                onClick={() => {
                  window.electron?.openExternal('https://tonzhon.whamon.com/');
                }}
              >
                网页版
              </Button>
              <Button
                onClick={() => {
                  window.electron?.openExternal(
                    'https://universe.tonzhon.whamon.com/about-tonzhon/',
                  );
                }}
              >
                关于铜钟
              </Button>
            </Flex>
          </Flex>
        </Col>
      </Row>
    </>
  );
}
