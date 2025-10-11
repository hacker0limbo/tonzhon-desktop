import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import zhCN from 'antd/locale/zh_CN';
import { App as AntdApp, ConfigProvider, theme } from 'antd';
import router from './router';
import { useSettingsStore } from './store';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

function Root() {
  const themeMode = useSettingsStore((state) => state.theme.mode);
  const themeColor = useSettingsStore((state) => state.theme.color);
  const customThemeColor = useSettingsStore((state) => state.theme.customColor);

  return (
    <ConfigProvider
      theme={{
        cssVar: true,
        algorithm:
          themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: themeColor === 'custom' ? customThemeColor : themeColor,
        },
      }}
      locale={zhCN}
    >
      <AntdApp message={{ maxCount: 1, duration: 3 }}>
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  );
}

root.render(<Root />);
