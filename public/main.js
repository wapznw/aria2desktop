const {app, BrowserWindow, Menu, ipcMain, shell, Tray, dialog} = require('electron');
const child_process = require('child_process');
const path = require('path');
const fs = require('fs');

const ARIA2DESKTOP_DEV = process.env.ARIA2DESKTOP_DEV === 'true';

const template = [
  {
    label: '编辑',
    submenu: [
      {role: 'undo'},
      {role: 'redo'},
      {type: 'separator'},
      {role: 'cut', label: '剪切'},
      {role: 'copy', label: '复制'},
      {role: 'paste', label: '粘贴'},
      {role: 'delete', label: '删除'},
      {role: 'selectall', label: '全选'}
    ]
  },
  {
    label: '视图',
    submenu: [
      {role: 'reload', label: '重新载入'},
      {role: 'forcereload', label: '强制重新载入'},
      {type: 'separator'},
      {role: 'togglefullscreen'}
    ]
  },
  {
    role: 'window',
    label: '窗口',
    submenu: [
      {role: 'minimize', label: '最小化'},
      {role: 'close', label: '关闭'}
    ]
  },
  {
    role: 'help',
    label: '帮助',
    submenu: [
      {
        label: '在线帮助',
        click() {
          shell.openExternal('https://github.com/wapznw/aria2desktop')
        }
      }
    ]
  }
];

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      {role: 'about', label: '关于' + app.getName()},
      {type: 'separator'},
      {role: 'services', label: '服务', submenu: []},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'hideothers'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit', label: '退出'}
    ]
  });
}

let menu = Menu.buildFromTemplate(template);

let mainWindow;

const aria2dir = path.join(__dirname, './aria2cli');

const aria2home = path.join(process.env.HOME, app.getName());
const aria2Cli = path.resolve(aria2home, 'aria2c');
const aria2DownloadDir = path.join(process.env.HOME, 'Downloads');
const sessionFile = path.join(aria2home, 'aria2.session');
const aria2ConfFile = path.join(aria2home, 'aria2.conf');

if (!fs.existsSync(aria2home)) {
  fs.mkdirSync(aria2home);
}

fs.readdirSync(aria2dir).forEach(file => {
  var src = path.join(aria2dir, file),
    dest = path.join(aria2home, file);
  if (!fs.existsSync(dest)) {
    console.log('释放文件: ', src);
    if ('copyFileSync' in fs) {
      fs.copyFileSync(src, dest);
    } else {
      fs.writeFileSync(dest, fs.readFileSync(src));
      if (file === 'aria2c') {
        fs.chmodSync(dest, 755)
      }
    }
  }
});

const secret = Math.random().toString(32).substr(2);
const aria2Conf = [
  '--dir', aria2DownloadDir,
  '--conf-path', aria2ConfFile,
  '--input-file', sessionFile,
  '--save-session', sessionFile,
  '--max-concurrent-downloads', 10,
  '--max-connection-per-server', 16,
  '--min-split-size', '1024K',
  '--split', 16,
  '--max-overall-download-limit', '0K',
  '--max-overall-upload-limit', '0K',
  '--max-download-limit', '0K',
  '--max-upload-limit', '0K',
  '--continue', 'true',
  '--auto-file-renaming', 'true',
  '--allow-overwrite', 'true',
  '--disk-cache', '0M',
  '--max-tries', 0,
  '--retry-wait', 5,
  '--rpc-secret', secret
];

if (fs.existsSync(aria2Cli)) {
  console.log('rpc-secret: ',secret);
  const worker = child_process.spawn(aria2Cli, aria2Conf);

  worker.stdout.on('data', function (data) {
    console.log(data.toString());
  });

  process.on('exit', function () {
    worker.killed || worker.kill();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    minWidth: 900,
    minHeight: 600,
    center: true,
    titleBarStyle: 'hiddenInset',
    show: false,
    title: 'Aria2Desktop'
  });

  const loadUrl = ARIA2DESKTOP_DEV ? 'http://localhost:3000/' : `file://${process.cwd()}/app.asar/index.html`;
  mainWindow.loadURL(loadUrl + '#' + secret);
  console.log(loadUrl + '#' + secret);

  // mainWindow.loadURL(url.format({
  //   pathname: path.join(__dirname, 'index.html'),
  //   protocol: 'file:',
  //   slashes: true
  // }));

  mainWindow.on('closed', function () {
    mainWindow = null
  });

  ipcMain.on('close-window', function () {
    mainWindow.close()
  });
  ipcMain.on('set-window-maximize', function () {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
  });
  ipcMain.on('set-window-minimize', function () {
    mainWindow.minimize()
  });

  ipcMain.on('open-file-dialog', function (options) {
    console.log(options);
    dialog.showOpenDialog({properties: ['openDirectory', 'multiSelections']})
  });

  mainWindow.once('ready-to-show', () => {
    Menu.setApplicationMenu(menu)
    mainWindow.show()
  })
}

let tray;

app.on('ready', function () {
  createWindow();
  tray = new Tray(path.join(__dirname, 'aria2icon_16.png'));
  tray.setToolTip('aria2 desktop');
  const contextMenu = Menu.buildFromTemplate([
    {role: 'about', label: '关于' + app.getName()},
    {type: 'separator'},
    {role: 'hide', label: '隐藏'},
    {type: 'separator'},
    {role: 'quit', label: '完全退出'}
  ]);
  // tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    if (mainWindow === null) {
      createWindow()
    } else {
      if (mainWindow.isVisible() && !mainWindow.isFocused()) {
        mainWindow.focus();
      } else {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      }
    }
  });
  tray.on('right-click', () => {
    tray.popUpContextMenu(contextMenu)
  })
});

app.on('window-all-closed', function () {
  // if (process.platform !== 'darwin') {
  // app.quit()
  // }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
  mainWindow.isFocused() || mainWindow.focus();
});

