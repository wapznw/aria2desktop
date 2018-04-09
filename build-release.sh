#!/bin/bash
ARIA2_RES=./res/aria2
ARIA2_VERSION=1.33.1

# build win x64
# build win ia32
# build mac x64
# build linux x64
# build linux ia32
build () {
PLATFORM=$1
ARCH=$2
ARIC2_CLI="${ARIA2_RES}/aria2-${ARIA2_VERSION}-${PLATFORM}-${ARCH}/aria2c"

if [ x"win" == x"$PLATFORM" ];then
ARIC2_CLI="${ARIC2_CLI}.exe"
fi

cp $ARIC2_CLI ./build/aria2cli/
cp ./public/package.json ./build/package.json
electron-builder --project ./build --${PLATFORM} --${ARCH}
}

clean(){
[ -f "./build/aria2cli/aria2c.exe" ] && rm ./build/aria2cli/aria2c.exe
[ -f "./build/aria2cli/aria2c" ] && rm ./build/aria2cli/aria2c
}

if [ x"$(uname)" != x"Darwin" ];then
  echo "此脚本只能在macOS上运行"
  exit
fi

case $1 in all)
clean
build mac x64
build win x64
build win ia32
build linux x64
;;
asar-test)
if [ ! -f "app.asar" ]; then
  npm run build
  cp ./res/aria2/aria2-1.33.1-mac-x64/aria2c ./build/aria2cli/aria2c
  asar pack build app.asar
fi
electron app.asar
;;
win|mac|linux)
clean
arch=$2
if [ x"" == x"$arch" ]; then
   arch=x64
fi
build $1 ${arch}
;;
*)
echo "错误的参数"
echo "请使用使用以下命令"
echo "$0 win|mac|linux x64|ia32"
echo "$0 asar-test"
echo
;;
esac
