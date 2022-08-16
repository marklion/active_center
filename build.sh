#!/bin/bash
echo 'building'
set -e

SRC_DIR=`realpath $(dirname $0)`
BUILD_DIR="${SRC_DIR}/build"
API_DELIVER_PACKAGE="${BUILD_DIR}/api_service.tar.gz"
WEB_DELIVER_PACKAGE="${BUILD_DIR}/web_service.tar.gz"

mkdir -p $BUILD_DIR

pushd $SRC_DIR
tar zcf $API_DELIVER_PACKAGE api_service
popd

pushd $SRC_DIR/fe_pc
npm install && npm run build:prod
tar zcf $WEB_DELIVER_PACKAGE dist
popd

cp $SRC_DIR/deploy.sh $BUILD_DIR/deploy.sh
chmod +x $BUILD_DIR/deploy.sh
tar zcf ac_pack_$(date +%Y%m%d).tar.gz -C $BUILD_DIR api_service.tar.gz web_service.tar.gz deploy.sh
rm -rf $BUILD_DIR