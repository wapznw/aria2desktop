import React from 'react'
import {Avatar, Menu, Icon, Layout, Dropdown} from 'antd'
import {eventBus, getStorage, setStorage} from "../utils";

const {Sider} = Layout;

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
    online: false,
    servers: getStorage('SERVER_LIST') || []
  };

  constructor(props) {
    super(props);
    if (props.defaultServerConf) {
      this.state.serverConf = props.defaultServerConf
    }
  }

  componentWillMount(){
    eventBus.on('server_list_change', this.handleServerListChange)
  }

  componentWillUnmount(){
    eventBus.off('server_list_change', this.handleServerListChange)
  }

  handleServerListChange = list => {
    this.setState({servers: list})
  };

  handleMenuClick({key}) {
    let conf;
    if (key === 'default') {
      conf = getStorage('ARIA2_LOCAL_SERVER') || {}
    } else {
      conf = this.state.servers[key]
    }
    if (this.state.serverConf.id === conf.id) {
      return
    }
    setStorage('ARIA2_SERVER', conf);
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
        {this.state.servers && this.state.servers.map((server, index) => <Menu.Item key={index}>{server.title}</Menu.Item>)}
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
