import React, {Component} from 'react'
import {
  Button, Dropdown, Icon, Layout, List,
  Modal, Input, Divider, Menu, message,
  Form, Upload, Popconfirm, Card
} from 'antd'
import {bytesToSize, getStatusText, getFileExt} from '../aria2utils'

import DownloadItem from './DownloadItem'

const {shell} = window.require('electron').remote;

const {Header, Content} = Layout;
const {TextArea} = Input;
const Dragger = Upload.Dragger;

const gridStyle = {
  width: '33.333333333%',
  textAlign: 'left',
  padding: 5
};

export default class DownloadView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      data: props.data || [],
      selectedItem: null,
      key: 'tab1',
      noTitleKey: 'info'
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

  componentDidMount(){

    document.ondragover = (e) => {
      if(!this.state.visible){
        this.setState({
          visible: true,
          taskType: 'bt'
        })
      }
      e.preventDefault();  //只有在ondragover中阻止默认行为才能触发 ondrop 而不是 ondragleave
    };
    document.ondrop = (e) => {
      console.log(e.dataTransfer.files);
      const files = e.dataTransfer.files;
      if (this.state.taskType === 'bt' && files && files.length && getFileExt(files[0].name) !== 'torrent') {
        this.setState({
          visible: false
        })
      }
      e.preventDefault();  //阻止 document.ondrop的默认行为  *** 在新窗口中打开拖进的图片
    };
  }

  onTabChange = (key, type) => {
    this.setState({ [type]: key });
  };

  showModal = (item) => {
    this.setState({
      visible: true,
      taskType: item.key
    });
  };

  handleOk = (e) => {
    const aria2 = this.props.aria2;
    const saveDir = this.getSaveDir();
    let options = {};
    if (saveDir) options.dir = saveDir;

    if (aria2 && this.state.url) {
      let urls = this.state.url.split('\n');
      urls = urls.map(url => url.trim()).filter(url => url && url.length > 5);
      if (urls.length) {
        switch (this.state.taskType) {
          case 'url':
            urls.forEach(url => {
              aria2.addUri([url], options).catch(e=>{
                message.error(e.message)
              });
            });
            break;
          case 'magnet':
            message.error('磁力连接暂不支持');
            break;
          case 'bt':
            urls.forEach(url => {
              aria2.addTorrent(url, options).catch(e=>{
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

  getSaveDir(){
    return localStorage.getItem('DEFAULT_SAVE_DIR')
  }

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
        {this.renderCard(this.state.data && selectedItem ? this.state.data.filter(item => item.gid === selectedItem.gid)[0] : null)}
      </Layout>
    )
  }

  renderItem(item) {
    const selected = this.state.selectedItem && item.gid === this.state.selectedItem.gid;
    item.selected = selected;
    if (selected && this.state.selectedItem) {
      // eslint-disable-next-line
      this.state.selectedItem.status = item.status;
    }
    return (
      <DownloadItem
        selected={selected}
        onClick={() => this.onItemClick(item)} item={item}/>
    )
  }

  renderCard(item){
    if (Array.isArray(item)) item = item[0];
    const tabListNoTitle = [{
      key: 'info',
      tab: '下载详情',
    }];
    if (item && item.bittorrent){
      tabListNoTitle.push({
        key: 'bit',
        tab: '种子信息',
      })
    } else if (this.state.noTitleKey !== 'info') {
      this.setState({
        noTitleKey: 'info'
      })
    }
    return (
      <Card activeTabKey={this.state.noTitleKey}
            className="download-item-details-card"
            tabList={item ? tabListNoTitle : []}
            onTabChange={(key) => { this.onTabChange(key, 'noTitleKey'); }}
            style={{
              width: '100%',
              height: item ? 192 : 0
            }}>
        {item && this.state.noTitleKey === 'info' ?
        <div style={{
          height: item ? 155 : 0,
          overflow:'auto'
        }}>
          <Card.Grid style={{width: '100%', padding: 5}}>
            文件名称: {item.title}
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            任务状态: {getStatusText(item.status)}
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            文件大小: {bytesToSize(item.totalLength)}
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            存储目录: {item.dir}
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            已下载: {bytesToSize(item.completedLength)}
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            当前下载速度: {bytesToSize(item.downloadSpeed)}/秒
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            下载进度: {item.progress}%
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            分片数: {item.numPieces}
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            分片大小: {bytesToSize(item.pieceLength)}
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            连接数: {item.connections}
          </Card.Grid>
          {item.files && item.files.length ? item.files.map(file => (
            <Card.Grid style={{width: '100%', padding: 5}} key={file.path}>
              文件位置: {file.path}
              <a className="device-electron-show"
                 style={{marginLeft: 5}} title={'在文件管理器中显示'}
                 onClick={()=>shell.showItemInFolder(file.path)}>
                <Icon type="search" />
              </a>
            </Card.Grid>
          )) : null}
        </div>
          : null }

        {item && item.bittorrent && this.state.noTitleKey === 'bit' ? <div style={{
          height: item ? 155 : 0,
          overflow:'auto'
        }}>
          <Card.Grid style={{width: '100%', padding: 5}}>
            注释: {item.bittorrent.comment}
          </Card.Grid>
          <Card.Grid style={{width: '100%', padding: 5}}>
            创建时间: {item.bittorrent.creationDate ? (new Date(Number(item.bittorrent.creationDate) * 1000)).toLocaleString() : ''}
          </Card.Grid>
          {/*{item.bittorrent.info ? Object.keys(item.bittorrent.info).map(key => {*/}
            {/*return (*/}
              {/*<Card.Grid style={{padding: 5}} key={key}>*/}
                {/*{key}: {item.bittorrent.info[key]}*/}
              {/*</Card.Grid>*/}
            {/*)*/}
          {/*}) : null}*/}
          {/*{JSON.stringify(item.bittorrent)}*/}
        </div> : null }
        </Card>
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
              this.setState({url: txt.substr(txt.indexOf('base64,') + 7)});
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
