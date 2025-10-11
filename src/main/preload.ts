// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { version } from '../../release/app/package.json';

export type Channels = 'ipc-example';

const electronHandler = {
  // ipcRenderer: {
  //   sendMessage(channel: Channels, ...args: unknown[]) {
  //     ipcRenderer.send(channel, ...args);
  //   },
  //   on(channel: Channels, func: (...args: unknown[]) => void) {
  //     const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
  //       func(...args);
  //     ipcRenderer.on(channel, subscription);

  //     return () => {
  //       ipcRenderer.removeListener(channel, subscription);
  //     };
  //   },
  //   once(channel: Channels, func: (...args: unknown[]) => void) {
  //     ipcRenderer.once(channel, (_event, ...args) => func(...args));
  //   },
  // },
  appVersion: version,

  copyToClipboard: (text: string) =>
    ipcRenderer.send('copy-to-clipboard', text),
  openExternal: (url: string) => ipcRenderer.send('open-external', url),
  downloadFile: ({ url, name }: { url: string; name?: string }) =>
    ipcRenderer.send('download-file', { url, name }),

  // on 开头为监听主进程发送的事件
  onDownloadComplete: (func: (savePath: string) => void) => {
    const subscription = (_event: IpcRendererEvent, savePath: string) =>
      func(savePath);
    ipcRenderer.on('download-complete', subscription);

    // 返回一个函数取消监听, 用于在 react useEffect 中清理
    return () => {
      ipcRenderer.removeListener('download-complete', subscription);
    };
  },
  onDownloadFailed: (func: () => void) => {
    const subscription = (_event: IpcRendererEvent) => func();
    ipcRenderer.on('download-failed', subscription);

    return () => {
      ipcRenderer.removeListener('download-failed', subscription);
    };
  },
  onNavigateToSettings: (func: () => void) => {
    const subscription = (_event: IpcRendererEvent) => func();
    ipcRenderer.on('navigate-to-settings', subscription);

    return () => {
      ipcRenderer.removeListener('navigate-to-settings', subscription);
    };
  },
  onPlayerActions: (func: (action: string) => void) => {
    const subscription = (_event: IpcRendererEvent, action: string) =>
      func(action);
    ipcRenderer.on('player-actions', subscription);

    return () => {
      ipcRenderer.removeListener('player-actions', subscription);
    };
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
