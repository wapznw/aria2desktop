# aria2desktop

#### 一个aria2的UI界面
这是一个基于 electron 开发的aria2控制界面。

如果你只想体验一下，直接下载打包好的安装程序就好了。

---
[下载Mac版](releases)


[下载Windows版](releases)


[下载Ubuntu版](releases)
> Ubuntu 需要先安装 aria2_1.33.1-1_amd64.deb

编译
```
npm install
npm run build
```
打包执行程序
打包使用的 electron-builder，如果你没安装请先安装。
```
npm install -g electron-builder
```

```
# mac
./build-release.sh mac

#windows
./build-release.sh win
```
生成的文件在 $(projectRoot)/build/dist 目录下

## windows10运行截图
![](screenshot/windows10-aria2desktop.png)

## Ubuntu 运行截图
![](screenshot/ubuntu-22B2E901F8BA.png)

## Mac 运行截图
![image](screenshot/WX20180408-172402.png)
---
![image description](screenshot/WX20180408-172436.png)
---
![image description](screenshot/WX20180408-172453.png)
---
![image description](screenshot/WX20180408-172503.png)

---
![image description](screenshot/WX20180408-172615.png)

---
![image description](screenshot/WX20180408-172905.png)

---
![image description](screenshot/WX20180408-172938.png)
