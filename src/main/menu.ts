import {
  app,
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
  session,
} from 'electron';
import { signout } from '../renderer/api';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu(): Menu {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: '铜钟',
      submenu: [
        {
          label: '关于铜钟',
          selector: 'orderFrontStandardAboutPanel:',
        },
        { type: 'separator' },
        {
          label: '设置',
          click: () => {
            this.mainWindow.webContents.send('navigate-to-settings');
          },
        },
        { type: 'separator' },
        {
          role: 'hide',
          label: '隐藏铜钟',
        },
        {
          role: 'hideOthers',
          label: '隐藏其他',
        },
        { type: 'separator' },
        {
          role: 'quit',
          label: '退出铜钟',
        },
      ],
    };
    const subMenuEdit: DarwinMenuItemConstructorOptions = {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        {
          role: 'selectAll',
          label: '全选',
          selector: 'selectAll:',
        },
      ],
    };

    const subMenuPlayer: DarwinMenuItemConstructorOptions = {
      label: '播放控制',
      submenu: [
        {
          label: '播放/暂停',
          click: () => {
            this.mainWindow.webContents.send('player-actions', 'togglePlay');
          },
        },
        {
          label: '上一首',
          click: () => {
            this.mainWindow.webContents.send('player-actions', 'playPrev');
          },
        },
        {
          label: '下一首',
          click: () => {
            this.mainWindow.webContents.send('player-actions', 'playNext');
          },
        },
        {
          label: '重新载入',
          click: () => {
            this.mainWindow.webContents.send('player-actions', 'load');
          },
        },
        {
          label: '清空播放列表',
          click: () => {
            this.mainWindow.webContents.send('player-actions', 'clear');
          },
        },
      ],
    };

    const subMenuWindow: DarwinMenuItemConstructorOptions = {
      label: '窗口',
      submenu: [
        {
          role: 'minimize',
          label: '最小化',
        },
        { role: 'close', label: '关闭窗口' },
        { type: 'separator' },
        { role: 'front', label: '前置所有窗口' },
        { type: 'separator' },
        {
          role: 'togglefullscreen',
          label: '切换全屏',
        },
      ],
    };
    const subMenuHelp: MenuItemConstructorOptions = {
      label: '帮助',
      submenu: [
        {
          label: 'GitHub',
          click() {
            shell.openExternal(
              'https://github.com/hacker0limbo/tonzhon-desktop',
            );
          },
        },
        {
          label: '网页版',
          click() {
            shell.openExternal('https://tonzhon.whamon.com/');
          },
        },
        {
          label: '关于铜钟',
          click() {
            shell.openExternal(
              'https://universe.tonzhon.whamon.com/about-tonzhon/',
            );
          },
        },
      ],
    };

    return [
      subMenuAbout,
      subMenuEdit,
      subMenuPlayer,
      subMenuWindow,
      subMenuHelp,
    ];
  }

  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: '开始',
        submenu: [
          {
            label: '设置',
            click: () => {
              this.mainWindow.webContents.send('navigate-to-settings');
            },
          },
          {
            label: '关闭',
            accelerator: 'Ctrl+W',
            click: () => {
              this.mainWindow.close();
            },
          },
        ],
      },
      {
        label: '视图',
        submenu: [
          {
            label: '切换全屏',
            accelerator: 'F11',
            click: () => {
              this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
            },
          },
        ],
      },
      {
        label: '帮助',
        submenu: [
          {
            label: 'GitHub',
            click() {
              shell.openExternal(
                'https://github.com/hacker0limbo/tonzhon-desktop',
              );
            },
          },
          {
            label: '网页版',
            click() {
              shell.openExternal('https://tonzhon.whamon.com/');
            },
          },
          {
            label: '关于铜钟',
            click() {
              shell.openExternal(
                'https://universe.tonzhon.whamon.com/about-tonzhon/',
              );
            },
          },
        ],
      },
    ];

    return templateDefault;
  }
}
