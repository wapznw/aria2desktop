import React from 'react'
import {Avatar, Menu, Icon, Layout} from 'antd'

const {Sider} = Layout;

export default class LeftSider extends React.Component {

  static defaultProps = {
    defaultMenu: 'active',
    onMenuClick: (item) => {
      console.log(item)
    }
  };

  render() {
    return (
      <Sider width={160}>
        <div className="userInfo">
          <Avatar size="large">信</Avatar>
          <div className="userName">
            <div>信步星空</div>
            <div className="userVip">VIP8</div>
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
        </Menu>
      </Sider>
    )
  }
}
