import React from 'react'
import {Avatar, List, Progress} from 'antd'
import {bytesToSize, getFileExt} from '../aria2utils'

export default class DownloadItem extends React.Component{

  render(){
    const styles = {
      paddingLeft: 10,
      paddingRight: 10,
      backgroundColor: this.props.selected ? '#d9ecfe' : ''
    };

    const item = this.props.item;
    return (
      <List.Item style={styles} onClick={() => this.props.onClick()}>
        <List.Item.Meta
          avatar={<Avatar size="large">{getFileExt(item.title)}</Avatar>}
          title={<span>{item.title}</span>}
          description={bytesToSize(item.totalLength)}
        />
        <div style={{width: 170}}>
          <Progress percent={item.progress} showInfo={false}/>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span>{item.eta ? '-' + item.eta : ''}</span>
            <span>{item.progress}%</span>
          </div>
        </div>
        {item.status === 'complete' ? <span>已完成</span> : null}
        {item.status === 'active' ? <span>{bytesToSize(item.downloadSpeed)}/s</span> : null}
        {item.status === 'paused' ? <span>暂停中</span> : null}
      </List.Item>
    )
  }
}
