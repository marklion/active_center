#!/bin/bash
echo 'deploy'

set -e

pm2 l | grep api_service && pm2 delete api_service

rm -rf dist
rm -rf api_service
tar xf web_service.tar.gz
tar xf api_service.tar.gz
chown -R root:root .
pushd api_service
npm install
export MONGO_URL=${1:-'mongodb://127.0.0.1:27017/game'}
export NODE_ENV=prod
export ALI_KEY_ID=$2
export ALI_KEY_SECRET=$3
npm run pm2
popd