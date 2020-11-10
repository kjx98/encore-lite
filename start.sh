#! /bin/bash

DATADIR=$( dirname $0 )
cd $DATADIR
#PORT=3100 /data/node-v12.19.0-linux-x64/bin/node bin/www
PORT=3100 bin/www
