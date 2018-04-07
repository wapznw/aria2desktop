import React, {Component} from 'react';
import {Layout} from 'antd';
import Aria2Client from './aria2client'

import LeftSider from './components/LeftSider'
import DownloadView from './components/DownloadView'

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
    this.aria2.connect()
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
    } else {
      data = this.state.stopped.filter(item => item.status !== 'complete')
    }
    return (
      <Layout className="App">
        <LeftSider defaultMenu={this.state.menu} onMenuClick={(item) => this.onMenuClick(item)}/>
        <Layout>
        {/*<Header className="darg-move-window header-title">Aria2</Header>*/}

          <DownloadView aria2={this.aria2} currentMenu={this.state.menu} data={data}/>
        {/*<Footer>Footer</Footer>*/}
        </Layout>
      </Layout>
    );
  }
}

export default App;
