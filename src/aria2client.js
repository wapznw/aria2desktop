import {
  formatResult
} from './aria2utils'

const Aria2 = window.Aria2;

export default class Aria2Client {
  config = {
    host: '127.0.0.1',
    port: 6800,
    secure: false,
    secret: 'xxxx',
    path: '/jsonrpc',
    onRefresh: () => {}
  };
  _timer = null;
  waitings = [];
  actives = [];
  stopped = [];

  constructor(config) {
    if (config) {
      this.config = {
        ...this.config,
        ...config
      };
    }
    this.aria2 = new Aria2(this.config);
    Aria2.methods.forEach((name, i) => {
      if (i > 3){
        this[name] = (...args) => {
          return this.aria2[name](args)
        }
      }
    })
  }

  connect() {
    const aria2 = this.aria2;
    aria2.onclose = () => {
      if (this._timer != null) clearInterval(this._timer)
    };
    aria2.open().then(async () => {
      if ((await this.refreshTasks()).length) {
        this.startRefresh()
      }
    });
    aria2.onDownloadStart = /*aria2.onDownloadPause = aria2.onDownloadStop =*/ () => {
      this.startRefresh()
    };
    this.aria2 = aria2;
  }

  addUri(...args){
    return this.aria2.addUri(...args).then(() => {
      this.refreshTasks()
    })
  }

  addTorrent(...args){
    return this.aria2.addTorrent(...args).then(() => {
      this.refreshTasks()
    })
  }

  addMetalink(...args){
    this.aria2.addMetalink(...args).then(() => {
      this.refreshTasks()
    })
  }

  changeStatus(status, gid) {
    const aria2 = this.aria2;
    return new Promise((resolve, reject) => {
      if (status in aria2) {
        const p = gid ? aria2[status](gid) : aria2[status]();
        p.then(() => {
          return this.refreshTasks()
        }).then(resolve).catch(e => {
          reject(e)
        });
      }
    })
  }

  startRefresh(delay = 1000) {
    if (this._timer) return;
    this._timer = setInterval(async () => {
      const actives = await this.refreshTasks();
      if (!actives.length) {
        clearInterval(this._timer);
        this._timer = null
      }
    }, delay)
  }

  refreshTasks() {
    const aria2 = this.aria2;
    return new Promise((resolve, reject) => {
      Promise.all([
        aria2.tellActive(),
        aria2.tellWaiting(0, 100),
        aria2.tellStopped(0, 100)
      ]).then(([actives, waitings, stopped]) => {
        this.actives = formatResult(actives);
        this.waitings = formatResult(waitings);
        this.stopped = formatResult(stopped);
        this.config.onRefresh({
          actives: this.actives,
          waitings: this.waitings,
          stopped: this.stopped
        });
        resolve(actives)
      }).catch(reject)
    })
  }
}
