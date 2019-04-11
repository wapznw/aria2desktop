#!/bin/bash
#export ELECTRON_MIRROR=https://npm.taobao.org/mirrors/electron/

ARIA2_RES=./res/aria2
ARIA2_VERSION=1.33.1

# build win x64
# build win ia32
# build mac x64
# build linux x64
# build linux ia32
build () {
clean
PLATFORM=$1
ARCH=$2
ARIC2_CLI="${ARIA2_RES}/aria2-${ARIA2_VERSION}-${PLATFORM}-${ARCH}/aria2c"

if [[ x"win" == x"$PLATFORM" ]];then
ARIC2_CLI="${ARIC2_CLI}.exe"
fi
if [[ ! -d "node_modules" ]];then
npm i
fi
if [[ ! -d "build" ]];then
  npm run build
fi
if [[ x"$(which electron-builder)" == x"" ]]; then
    npm i -g electron-builder
fi
cp $ARIC2_CLI ./build/aria2cli/
cp ./public/package.json ./build/package.json
electron-builder --project ./build --${PLATFORM} --${ARCH}
}

clean(){
[[ -f "./build/aria2cli/aria2c.exe" ]] && rm ./build/aria2cli/aria2c.exe
[[ -f "./build/aria2cli/aria2c" ]] && rm ./build/aria2cli/aria2c
}


case $1 in all)
build mac x64
build win x64
#build win ia32
build linux x64
;;
asar-test)
if [[ ! -f "app.asar" ]]; then
  npm run build
  ARIC2_CLI="${ARIA2_RES}/aria2-${ARIA2_VERSION}-$2-x64/aria2c"
  cp ${ARIC2_CLI} ./build/aria2cli/aria2c

  if [[ x"$(which asar)" == x"" ]];then
    npm i -g asar
  fi
  asar pack build app.asar
fi
./node_modules/.bin/electron app.asar
;;
win|mac|linux)
arch=$2
if [[ x"" == x"$arch" ]]; then
   arch=x64
fi
build $1 ${arch}
;;
*)
echo "错误的参数"
echo "请使用使用以下命令"
echo "$0 win|mac|linux x64|ia32"
echo "$0 asar-test win|mac|linux"
echo
;;
esac
