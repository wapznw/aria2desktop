import React from 'react'
import {Avatar, Menu, Icon, Layout, Dropdown} from 'antd'

const {Sider} = Layout;

const servers = [
  {title: '家', host: 'home.xxx.ccc.eee.aaaa', port: 6800, secret: 'aaaax'},
  {title: '家里路由器', host: '192.168.1.121', port: 6800, secret: 'aaa3a'},
  {title: '公司电脑', host: '121.231.32.178', port: 6800, secret: 'aaaaax'}
];

export default class LeftSider extends React.Component {

  static defaultProps = {
    defaultMenu: 'active',
    onMenuClick: (item) => {
      console.log(item)
    },
    onChangeServer: () => {
    }
  };

  state = {
    serverConf: {},
    online: false
  };

  constructor(props) {
    super(props);
    if (props.defaultServerConf) {
      this.state.serverConf = props.defaultServerConf
    }
  }

  handleMenuClick({key}) {
    let conf;
    if (key === 'default') {
      conf = localStorage.getItem('ARIA2_LOCAL_SERVER') ? JSON.parse(localStorage.getItem('ARIA2_LOCAL_SERVER')) : {}
    } else {
      conf = servers[key]
    }
    if (this.props.onChangeServer) {
      this.props.onChangeServer(conf)
    }
    this.setState({
      serverConf: conf
    })
  }

  componentWillReceiveProps(props) {
    if (props.online !== this.state.online) {
      this.setState({online: props.online})
    }
  }

  render() {
    const menu = (
      <Menu onClick={this.handleMenuClick.bind(this)}>
        <Menu.Item key="default">本地默认</Menu.Item>
        <Menu.Divider/>
        {servers && servers.map((server, index) => <Menu.Item key={index}>{server.title}</Menu.Item>)}
      </Menu>
    );

    return (
      <Sider width={160}>
        <div className="userInfo">
          <Avatar size="large" icon={'user'}/>
          <div className="userName">
            <Dropdown overlay={menu} trigger={['click']}>
              <div>{this.state.serverConf.title || '信步星空'} <Icon type="down"/></div>
            </Dropdown>
            <div
              className={`userVip ${this.props.online ? ' success' : ''}`}>{this.state.serverConf.host || 'VIP8'}</div>
          </div>
        </div>
        <Menu onClick={(item) => this.props.onMenuClick(item.key)}
              defaultSelectedKeys={[this.props.defaultMenu]}
              mode="inline" theme="dark">
          <Menu.Item key="active">
            <Icon type="download"/>
            <span>正在下载</span>
          </Menu.Item>
          <Menu.Item key="complete">
            <Icon type="check"/>
            <span>已完成</span>
          </Menu.Item>
          <Menu.Item key="remove">
            <Icon type="delete"/>
            <span>废纸篓</span>
          </Menu.Item>
          <Menu.Item key="setting">
            <Icon type="setting"/>
            <span>设置</span>
          </Menu.Item>
        </Menu>
      </Sider>
    )
  }
}
