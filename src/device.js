const ua = window.navigator.userAgent;

const device = {
  windows: false,
  macOS: false,
  linux: false,
  electron: false,
  cordova: window.cordova || window.phonegap,
  phonegap: window.cordova || window.phonegap,
};

const windows = ua.match(/Windows NT[\s\/]+([\d.]+)?/); // eslint-disable-line
const macOs = ua.match(/(Intel Mac OS).*X\s([\d_]+)/);
const linux = ua.match(/Linux/);
const electron = ua.match(/Electron/);

// Windows
if (windows) {
  device.os = 'windows';
  device.osVersion = windows[2];
  device.windows = true;
}

// macOs
if (macOs) {
  device.os = 'macOs';
  device.osVersion = macOs[2].replace(/_/g, '.');
  device.macOS = true;
}

// linux
if (linux) {
  device.os = 'linux';
  device.osVersion = '';
  device.linux = true;
}

if (electron) {
  device.electron = true
}

// Pixel Ratio
device.pixelRatio = window.devicePixelRatio || 1;

const classList = document.body.parentElement.classList;
classList.add(`device-${device.os}`);
if (device.electron ){
  classList.add('device-electron')
} else {
  classList.add('device-web')
  // classList.add('device-fullscreen')
}

export default device;
