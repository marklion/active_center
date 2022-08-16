#!/bin/bash
echo 'deploy'

set -e

[ -d dist ] || tar xf web_service.tar.gz
[ -d api_service ] || tar xf api_service.tar.gz
pushd api_service
npm install
MONGO_URL=$1 npm run prod
popd