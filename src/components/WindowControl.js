import React from 'react'
import {Icon, Button} from 'antd'
import device from '../device'

const {ipcRenderer, remote} = window.require('electron')
const {BrowserWindow} = remote

const classList = document.body.parentElement.classList
export default class WindowControl extends React.Component{

  state = {
    isFullSecreen: classList.contains('device-fullscreen')
  }

  onResizeClick(){
    if (device.electron) {
      ipcRenderer.send('set-window-maximize')
      setTimeout(() => {
        let win = BrowserWindow.getFocusedWindow()
        if(win){
          this.setState({
            isFullSecreen: win.isMaximized()
          })
        }
      }, 500)
    } else {
      classList.contains('device-fullscreen') ? classList.remove('device-fullscreen') : classList.add('device-fullscreen')
      this.setState({
        isFullSecreen: classList.contains('device-fullscreen')
      })
    }
  }

  render(){
    const {isFullSecreen} = this.state
    return (
      <div className="window-control">
        <Button onClick={() => {
          console.log(ipcRenderer);
          ipcRenderer.send('set-window-minimize')
        }} className="device-electron-show">
          <Icon type="minus" />
        </Button>
        <Button onClick={this.onResizeClick.bind(this)}>
          <Icon type={isFullSecreen ? "shrink" : "arrows-alt"} />
        </Button>
        <Button onClick={()=>{
          ipcRenderer.send('close-window')
        }} className="device-electron-show">
          <Icon type="close" />
        </Button>
      </div>
    )
  }
}
