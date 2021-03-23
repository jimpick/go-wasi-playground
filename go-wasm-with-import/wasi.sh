#! /bin/bash

. ../SETENV

make clean && make && ./run-with-node-wasi.sh 

