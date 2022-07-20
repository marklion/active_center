SHELL=/bin/bash
SRC_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
all:
	pushd $(SRC_DIR); ./build.sh && ./test.sh
