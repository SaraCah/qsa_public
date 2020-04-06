#!/bin/bash

if [ "$JVM_HEAP_SIZE" = "" ]; then
    JVM_HEAP_SIZE="512m"
fi

cd "`dirname "$0"`/../"

export GEM_HOME=$PWD/distlibs/gems

java -Dapp=QSAPublic -Djava.security.egd=file:/dev/./urandom ${JAVA_OPTS} -Xmx${JVM_HEAP_SIZE} -cp 'distlibs/*' org.jruby.Main ${1+"$@"}
