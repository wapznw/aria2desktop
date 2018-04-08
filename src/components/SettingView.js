import React from 'react'
import {Layout, Form, Input, Button, Icon, message} from 'antd'
import device from '../device'

const {Header} = Layout;
const {dialog} = window.require('electron').remote;

class SettingView extends React.Component {

  state = {
    dir: localStorage.getItem('DEFAULT_SAVE_DIR') || ''
  };

  componentDidMount() {
    // 读取配置
    if (!this.state.dir) {
      this.props.aria2.getGlobalOption().then(options => {
        this.setState({
          dir: options.dir
        })
      });
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    message.success('已修改默认下载目录');
    this.state.dir && localStorage.setItem('DEFAULT_SAVE_DIR', this.state.dir)
  };

  openFileDialog() {
    const selectDir = dialog.showOpenDialog({
      buttonLabel: '选取目录',
      message: '选择一个文件夹来存放下载的文件',
      properties: ['openDirectory', 'createDirectory']
    });
    if (selectDir) {
      this.setState({
        dir: selectDir
      });
    }
  }

  render() {
    const saveDir = this.state.dir || '';
    const addonAfter = device.electron ? <label onClick={() => this.openFileDialog()}>选择目录</label> : null;
    return (
      <Layout>
        <Header className="darg-move-window header-toolbar">设置</Header>
        <div style={{padding: 20}}>
          <Form onSubmit={this.handleSubmit}>
            <Form.Item label={'文件保存目录'}>
              <Input prefix={<Icon type="folder" style={{color: 'rgba(0,0,0,.25)'}}/>}
                     addonAfter={addonAfter}
                     value={saveDir} placeholder="默认文件保存路径"/>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Layout>
    );
  }
}

export default SettingView
