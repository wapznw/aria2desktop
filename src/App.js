import React, {Component} from 'react';
import {Layout, message} from 'antd';
import Aria2Client from './aria2client'
import './device'

import LeftSider from './components/LeftSider'
import DownloadView from './components/DownloadView'
import SettingView from './components/SettingView'

import './App.css';

const defaultServer = {
  host: '127.0.0.1',
  port: 6800,
  secure: false,
  secret: window.location.hash.split('#')[1]
};
localStorage.setItem('ARIA2_LOCAL_SERVER', JSON.stringify(defaultServer));
let conf = localStorage.getItem('ARIA2_SERVER');
try {
  if (conf) {
    conf = JSON.parse(conf);
    if (conf.host === defaultServer.host && conf.port === defaultServer.port) {
      conf = defaultServer;
    }
  }
} catch (e) {
}

if (!conf) {
  conf = defaultServer
}

class App extends Component {

  state = {
    actives: [],
    waitings: [],
    stopped: [],
    menu: 'active',
    online: false
  };

  constructor(props){
    super(props);
    this.aria2 = new Aria2Client({
      ...conf,
      onRefresh: (data) => {
        this.setState({
          ...data
        })
      }
    });

    this.aria2.onConnect = async () => {
      this.aria2.getSessionInfo().then(res => {
        console.log(res);
        this.setState({online: true})
      }).catch(e => {
        message.error(`连接服务器失败: ${e.message}`);
        this.setState({online: false})
      })
    };
    this.aria2.onClose = () => {
      this.setState({online: false})
    }
  }

  componentDidMount(){
    this.aria2.connect();
  }

  onMenuClick(item){
    this.setState({
      menu: item
    })
  }

  async onChangeServer(server){
    const hide = message.loading('正在切换Aria2服务器...', 0);
    localStorage.setItem('ARIA2_SERVER', JSON.stringify(server));
    this.setState({
      actives: [],
      waitings: [],
      stopped: []
    });
    await this.aria2.close();
    try {
      this.aria2.setOptions(server);
      await this.aria2.connect()
    } catch (e) {
      console.log(e.message);
    } finally {
      hide();
    }
  }

  render() {
    let data;
    if (this.state.menu === 'active') {
      data = [...this.state.actives, ...this.state.waitings];
    } else if (this.state.menu === 'complete') {
      data = this.state.stopped.filter(item => item.status === 'complete')
    } else if (this.state.menu === 'remove'){
      data = this.state.stopped.filter(item => item.status !== 'complete')
    }
    return (
      <Layout className="App">
        <LeftSider defaultMenu={this.state.menu}
                   defaultServerConf={conf}
                   online={this.state.online}
                   onChangeServer={this.onChangeServer.bind(this)}
                   onMenuClick={(item) => this.onMenuClick(item)}/>
        {this.state.menu && this.state.menu !== 'setting' ?
          <DownloadView aria2={this.aria2} currentMenu={this.state.menu} data={data}/>:
          <SettingView aria2={this.aria2} />}
      </Layout>
    );
  }
}

export default App;
