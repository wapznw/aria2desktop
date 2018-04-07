import React, {Component} from 'react'
import {Button, Dropdown, Icon, Layout, List, Modal, Input, Divider, Menu, message, Form, Upload, Popconfirm} from 'antd'

import DownloadItem from './DownloadItem'

const {Header, Content} = Layout;
const {TextArea} = Input;
const Dragger = Upload.Dragger;

export default class DownloadView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      data: props.data || [],
      selectedItem: null
    };
    props.aria2.getGlobalOption().then(config => {
      this.setState({config})
    })
  }

  componentWillReceiveProps(props) {
    if (props.data) {
      let nextState = {
        data: props.data
      };
      if (props.currentMenu !== this.props.currentMenu) {
        nextState.selectedItem = null
      }
      this.setState(nextState)
    }
  }

  showModal = (item) => {
    console.log(item.key);
    this.setState({
      visible: true,
      taskType: item.key
    });
  };
  handleOk = (e) => {
    const aria2 = this.props.aria2;
    if (aria2 && this.state.url) {
      let urls = this.state.url.split('\n');
      urls = urls.map(url => url.trim()).filter(url => url && url.length > 5);
      if (urls.length) {
        switch (this.state.taskType) {
          case 'url':
            urls.forEach(url => {
              aria2.addUri([url]).catch(e=>{
                message.error(e.message)
              });
            });
            // aria2.addUri(urls, {
            //   dir: this.state.config.dir
            // });
            break;
          case 'magnet':
            message.error('磁力连接暂不支持');
            break;
          case 'bt':
            urls.forEach(url => {
              aria2.addTorrent(url).catch(e=>{
                message.error(e.message)
              });
            });
            break;
          default:
            message.error('不支持的下载类型');
            break;
        }
      }
      // magnet:?xt=urn:btih:e379ebffed9398c62295781b92380547a7d203fa
    }
    if (!this.state.url || this.state.url.length < 5) {
      message.error('请填写文件URL')
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

  onItemClick(item) {
    item.selected = !item.selected;
    const data = this.state.data.map(row => {
      row.selected = row === item ? item.selected : false;
      return row
    });
    this.setState({
      data: data,
      selectedItem: item.selected ? item : null
    })
  }

  async onChangeStatus(status) {
    if (['unpauseAll', 'forcePauseAll'].indexOf(status) === -1 && !this.state.selectedItem) {
      message.error('请选择一项任务再操作！');
      return
    }
    if (status) {
      const item = this.state.selectedItem;
      const errMsgs = {
        'paused': '当前任务状态已是暂停',
        'complete': '任务已完成，不能操作'
      };
      try {
        switch (status) {
          case 'start':
            if (item.status === 'paused') {
              await this.props.aria2.changeStatus('unpause', item.gid);
            } else {
              message.error(errMsgs[item.status] || '当前任务状态不能开始', 1)
            }
            break;
          case 'pause':
            if (item.status === 'active') {
              await this.props.aria2.changeStatus('forcePause', item.gid);
            } else {
              message.error(errMsgs[item.status] || '当前任务状态不能暂停', 1)
            }
            break;
          case 'remove':
            await this.props.aria2.changeStatus('forceRemove', item.gid);
            break;
          default:
            await this.props.aria2.changeStatus(status);
            break
        }
      } catch (e) {
        console.error(e);
        message.error(e.message, 2);
      }
    }
  }

  render() {
    const menu = (
      <Menu onClick={this.showModal}>
        <Menu.Item key="url">URL任务</Menu.Item>
        <Menu.Item key="bt">BT任务</Menu.Item>
        {/*<Menu.Item key="magnet">磁力连接</Menu.Item>*/}
      </Menu>
    );

    const selectedItem = this.state.selectedItem;
    const disableToolbar = this.props.currentMenu !== 'active';
    const selectedStatus = selectedItem && selectedItem.status;

    return (
      <Layout>
        <Header className="darg-move-window header-toolbar">
          <Dropdown disabled={disableToolbar} overlay={menu}>
            <Button type="primary" size={'small'}><Icon type="plus" onClick={this.showModal} style={{fontWeight: 700}}/>新建<Icon type="down"/></Button>
          </Dropdown>
          <Divider type="vertical"/>
          <Button size={'small'} onClick={() => this.onChangeStatus('unpauseAll')} icon={'caret-right'}>全部开始</Button>
          <Button size={'small'} onClick={() => this.onChangeStatus('forcePauseAll')} icon={'pause'} style={{marginLeft: 5}}>全部暂停</Button>
          <Divider type="vertical"/>
          {selectedStatus === 'paused' ?
            <Button onClick={() => this.onChangeStatus('start')}
                    disabled={!selectedItem || disableToolbar}
                    size={'small'} icon={'caret-right'}/>:
            <Button onClick={() => this.onChangeStatus('pause')}
                    disabled={!selectedItem || disableToolbar}
                    size={'small'} type="dashed" icon={'pause'}/>}
          <Popconfirm title="你确定要删除这个下载任务吗?"
                      onConfirm={() => this.onChangeStatus('remove')}
                      okText="删除"
                      cancelText="取消">
            <Button disabled={!selectedItem || disableToolbar}
                    size={'small'} style={{marginLeft: 10}} type="danger"><Icon type={'delete'}/></Button>
          </Popconfirm>
        </Header>
        <Content>
          <List
            itemLayout="horizontal"
            dataSource={this.state.data}
            renderItem={item => this.renderItem(item)}/>
        </Content>
        {this.renderAddTaskDialog()}
      </Layout>
    )
  }

  renderItem(item) {
    const selected = this.state.selectedItem && item.gid === this.state.selectedItem.gid;
    item.selected = selected;
    if (selected && this.state.selectedItem) {
      this.state.selectedItem.status = item.status;
    }
    return (
      <DownloadItem
        selected={selected}
        onClick={() => this.onItemClick(item)} item={item}/>
    )
  }

  renderAddTaskDialog(){
    const taskType = this.state.taskType;
    return (
      <Modal
        destroyOnClose={true}
        title={'新建' + String(taskType).toUpperCase() + '任务'}
        wrapClassName="newTaskDialog"
        maskStyle={{backgroundColor: 'transparent'}}
        visible={this.state.visible}
        footer={false}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form>
          {taskType === 'url' ? <TextArea onChange={(e) => this.setState({url: e.target.value})} placeholder={'添加多个下载连接时，请确保每行只有一个连接。'}
                                                     autosize={{minRows: 4, maxRows: 8}}/> : null}
          {taskType === 'magnet' ? <TextArea onChange={(e) => this.setState({url: e.target.value})} placeholder={'添加多个下载连接时，请确保每行只有一个连接。'}
                                                        autosize={{minRows: 4, maxRows: 8}}/> : null}

          {taskType === 'bt' ? <Dragger customRequest={(c)=>{
            if (c.file.size > 1024 * 1024){
              message.error('种子文件不能大于1MB');
              return
            }
            let reader = new FileReader();
            reader.onload = () => {
              let txt = reader.result;
              this.setState({url: txt.substr(txt.indexOf('base64,') + 7)})
              this.handleOk()
            };
            reader.readAsDataURL(c.file);
            c.onSuccess({"status": "success"}, c.file);
          }} showUploadList={false}>
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-text">点击或拖动BT文件到这个区域下载</p>
            <p className="ant-upload-hint">请选择正确的BT文件格式，BT文件不得超过1024KB。</p>
          </Dragger> : null}
          {/*<Form.Item label={'保存位置'}>
              <Input type={'file'} addonAfter={<a>选择一个目录</a>} placeholder={this.state.config && this.state.config.dir}/>
            </Form.Item>*/}
          {taskType === 'bt' ? null : <div className="ant-modal-footer">
            <Button type="primary" onClick={this.handleOk} size={'small'}>立即下载</Button>
          </div>}
        </Form>
      </Modal>
    )
  }
}
