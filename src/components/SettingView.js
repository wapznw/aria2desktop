import React from 'react'
import {Layout, Popconfirm, Form, Input, InputNumber, Switch, Button, Icon, message, List, Card, Modal, Col} from 'antd'
import device from '../device'
import {getStorage, setStorage, eventBus} from "../utils";
import {getDownloadSaveDir, isRemoteServer, setDownloadSaveDir} from "../aria2utils";

const {Header} = Layout;
const {dialog} = window.require('electron').remote;

const dataSource = getStorage('SERVER_LIST') || [];
let enableAria2 = getStorage('enableAria2')

class SettingView extends React.Component {

  state = {
    dir: getDownloadSaveDir() || '',
    enableAria2: enableAria2 || enableAria2 === null,
    visible: false,
    dataSource: dataSource
  };

  componentWillMount() {
    // 读取配置
    if (!this.state.dir) {
      this.props.aria2.getGlobalOption().then(options => {
        this.setState({
          dir: options.dir
        })
      });
    }
    eventBus.on('aria2_connect', this.handleAria2Connect)
  }

  componentWillUnmount(){
    eventBus.off('aria2_connect', this.handleAria2Connect)
  }

  handleAria2Connect = (config) => {
    this.setState({
      dir: config.dir
    })
  };

  handleSubmit = (e) => {
    e.preventDefault();
    message.success('已修改默认下载目录');
    setStorage('enableAria2', this.state.enableAria2);
    this.state.dir && setDownloadSaveDir(this.state.dir)
  };

  handleOk = (e) => {
    const item = this.state.item;
    if (item && item.title) {
      let dataSource = this.state.dataSource;
      if (item.id) {
        dataSource = dataSource.map(it => {
          return it.id === item.id ? item : it
        })
        eventBus.emit('server_change', item)
      } else {
        const last = this.state.dataSource[this.state.dataSource.length - 1];
        item.id = last ? last.id + 1 : 2;
        dataSource.push(item)
      }
      this.setState({
        visible: false,
        dataSource
      });
      setStorage('SERVER_LIST', this.state.dataSource);
      eventBus.emit('server_list_change', dataSource)
    } else {
      this.setState({
        visible: false,
      });
    }
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };

  handleDelete = (item) => {
    let dataSource = this.state.dataSource.filter(it => it.id !== item.id)
    this.setState({
      dataSource
    });
    setStorage('SERVER_LIST', dataSource)
  };

  handleChange = (v, k) => {
    let item = this.state.item || {};
    item[k] = v;
    this.setState({
      item: item
    })
  };

  openFileDialog() {
    let selectDir = dialog.showOpenDialog({
      buttonLabel: '选取目录',
      message: '选择一个文件夹来存放下载的文件',
      properties: ['openDirectory', 'createDirectory']
    });
    if(Array.isArray(selectDir) && selectDir.length) {
      selectDir = selectDir[0]
    }
    if (selectDir) {
      this.setState({
        dir: selectDir
      });
    }
  }

  render() {
    const addonAfter = device.electron && !isRemoteServer() ? <label onClick={() => this.openFileDialog()}>选择目录</label> : null;
    return (
      <Layout className={'Setting'}>
        <Header className="darg-move-window header-toolbar">设置</Header>
        <div style={{padding: 20}}>
          <Form onSubmit={this.handleSubmit}>
            <Form.Item label={'文件保存目录'} style={{marginBottom: 0}}>
              <Input prefix={<Icon type="folder" style={{color: 'rgba(0,0,0,.25)'}}/>}
                     addonAfter={addonAfter}
                     onChange={(e) => this.setState({dir: e.target.value})}
                     value={this.state.dir}
                     placeholder="默认文件保存路径"/>
            </Form.Item>
            {device.electron ? <Form.Item label={'内置Aria2'} style={{marginBottom: 10}}>
              <Switch checkedChildren="开"
                      unCheckedChildren="关"
                      onChange={val => this.setState({enableAria2: val})}
                      defaultChecked={this.state.enableAria2} />
              <span style={{marginLeft: 20}}>保存并重启生效</span>
            </Form.Item> : null}
            <Form.Item>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </Form.Item>
          </Form>
          <Card title="服务器列表"
                bordered={false}
                extra={<Button size="small"
                               type="primary"
                               icon="plus"
                               style={{marginBottom: 5}}
                               onClick={() => this.setState({visible: true, item: null})}>添加</Button>}>
            <List
              itemLayout="horizontal"
              dataSource={this.state.dataSource}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={item.host + ':' + item.port}
                  />
                  <List.Item.Meta
                    title={<div style={item.secure ? {color: '#52c41a'} : {}}><Icon
                      type={item.secure ? 'lock' : 'unlock'}/>{item.secure ? '加密' : '未加密'}</div>}
                    description={item.secret}
                  />
                  <div>
                    <div><Button size="small" onClick={() => this.setState({visible: true, item: item})}><Icon
                      type="edit"/> 编辑</Button></div>
                    <div style={{marginTop: 2}}>
                      <Popconfirm title="Are you sure delete this config?" onConfirm={() => this.handleDelete(item)}
                                  okText="Yes" cancelText="No">
                        <Button type="danger" size="small"><Icon type="delete"/> 删除</Button>
                      </Popconfirm>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </div>
        {this.renderModal(this.state.item || {})}
      </Layout>
    );
  }

  renderModal(item) {
    let protocol = global.location.protocol
    return (
      <Modal
        wrapClassName="SettingModal"
        title={`${item && item.title ? '编辑' : '添加'}Aria2服务器`}
        maskStyle={{backgroundColor: 'transparent'}}
        visible={this.state.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form>
          <Form.Item label="标题">
            <Input value={item.title || ''}
                   placeholder="如: 公司，家里"
                   onChange={(e) => this.handleChange(e.target.value, 'title')}/>
          </Form.Item>
          <Form.Item label="Aria2地址">
            <Input.Group>
              <Col span={19}>
                <Input value={item.host || ''}
                       placeholder="如: 127.0.0.1, aria2.xxx.com"
                       onChange={(e) => this.handleChange(e.target.value, 'host')}/>
              </Col>
              <Col span={4}>
                <InputNumber min={1} max={65535}
                             placeholder="1-65535"
                             value={item.port || 6800} onChange={(v) => this.handleChange(v, 'port')}/>
              </Col>
            </Input.Group>
          </Form.Item>
          <Form.Item label="通信密令">
            <Input value={item.secret || ''}
                   placeholder="与Aria2连接的密令 secret"
                   onChange={(e) => this.handleChange(e.target.value, 'secret')}/>
          </Form.Item>
          <Form.Item label="是否使用HTTPS/WSS">
            <Switch checked={item && item.title ? item.secure : protocol === 'https:'}
                    onChange={(v) => this.handleChange(v, 'secure')}/>
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}

export default SettingView
