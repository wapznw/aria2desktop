import React from 'react'
import {Icon} from 'antd'

const textTypes = {
  'active': {icon: 'cloud-download', text: '没有正在下载中的任务'},
  'complete': {icon: 'schedule', text: '没有已完成的任务'},
  'remove': {icon: 'delete', text: '废纸篓是空的'},
};

export default class EmptyContent extends React.Component {

  static defaultProps = {
    color: '#acacac',
    iconSize: 60,
    icon: '',
    text: '',
    textType: ''
  };

  render() {
    const props = this.props;
    return (
      <div style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        color: props.color
      }}>
        <div><Icon type={props.textType ? textTypes[props.textType].icon : props.icon} style={{fontSize: props.iconSize}}/></div>
        <div>{props.textType ? textTypes[props.textType].text : props.text}</div>
      </div>
    )
  }
}

