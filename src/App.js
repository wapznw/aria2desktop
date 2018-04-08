import React, {Component} from 'react';
import {Layout} from 'antd';
import Aria2Client from './aria2client'
import './device'

import LeftSider from './components/LeftSider'
import DownloadView from './components/DownloadView'
import SettingView from './components/SettingView'

import './App.css';

// const {Header} = Layout;

class App extends Component {

  state = {
    actives: [],
    waitings: [],
    stopped: [],
    menu: 'active'
  };

  constructor(props){
    super(props);
    this.aria2 = new Aria2Client({
      onRefresh: (data) => {
        this.setState({
          ...data
        })
      }
    });
  }

  componentDidMount(){
    this.aria2.connect();
  }

  onMenuClick(item){
    this.setState({
      menu: item
    })
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
                   onMenuClick={(item) => this.onMenuClick(item)}/>
        {this.state.menu && this.state.menu !== 'setting' ?
          <DownloadView aria2={this.aria2} currentMenu={this.state.menu} data={data}/>:
          <SettingView aria2={this.aria2} />}
      </Layout>
    );
  }
}

export default App;
