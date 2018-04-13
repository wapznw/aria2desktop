import React from 'react'
import {Icon, Button} from 'antd'
import device from '../device'

const {BrowserWindow} = window.require('electron').remote

const classList = document.body.parentElement.classList
export default class WindowControl extends React.Component{

  state = {
    isFullScreen: classList.contains('device-fullscreen')
  }

  onResizeClick(){
    if (device.electron) {
      const win = BrowserWindow.getFocusedWindow()
      if (win) {
        win.isMaximized() ? win.unmaximize() : win.maximize()
        setTimeout(() => {
          this.setState({
            isFullScreen: win.isMaximized()
          })
        }, 500)
      }
    } else {
      classList.contains('device-fullscreen') ? classList.remove('device-fullscreen') : classList.add('device-fullscreen')
      this.setState({
        isFullScreen: classList.contains('device-fullscreen')
      })
    }
  }

  onCloseClick(){
    const win = BrowserWindow.getFocusedWindow()
    win && win.close()
  }

  onMinimizeClick(){
    const win = BrowserWindow.getFocusedWindow()
    win && win.minimize()
  }

  render(){
    const {isFullScreen} = this.state
    return (
      <div className="window-control">
        <Button onClick={this.onMinimizeClick.bind(this)} className="device-electron-show">
          <Icon type="minus" />
        </Button>
        <Button onClick={this.onResizeClick.bind(this)}>
          <Icon type={isFullScreen ? "shrink" : "arrows-alt"} />
        </Button>
        <Button onClick={this.onCloseClick.bind(this)} className="device-electron-show">
          <Icon type="close" />
        </Button>
      </div>
    )
  }
}
