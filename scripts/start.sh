#!/bin/bash

if [ "$QSA_PUBLIC_ENV" = "" ]; then
    QSA_PUBLIC_ENV=production
fi

if [ "$QSA_PUBLIC_LISTEN_PORT" = "" ]; then
    QSA_PUBLIC_LISTEN_PORT=3333
fi

# open files
ulimit -n 65000

set -eou pipefail

cd "`dirname "$0"`/../"

listen_address="0.0.0.0"
listen_port=$QSA_PUBLIC_LISTEN_PORT
solr_port=9384
logging=0

if [ "QSA_PUBLIC_ENV" = "" ]; then
    QSA_PUBLIC_ENV=production
fi

while [ "$#" -gt 0 ]; do
    param="$1"; shift
    value="${1:-}"

    case "$param" in
        --listen-address)
            listen_address="$value"
            ;;
        --listen-port)
            listen_port="$value"
            ;;
        --solr-port)
            solr_port="$value"
            ;;
        --logging)
            logging="$value"
            ;;
        --help|-h)
            echo "Usage: $0 [--listen-address $listen_address] [--listen-port $listen_port] [--solr-port $solr_port] [--logging 0/1]"
            exit 0
            ;;
        *)
            echo "Unknown parameter: $param"
            exit 1
            ;;
    esac

    if [ "$value" = "" ]; then
        echo "Value for $param can't be empty"
        exit 1
    fi

    shift
done

TRAPPED=0

function stop_solr() {
    if [ "$TRAPPED" = "0" ]; then
        TRAPPED=1
        solr_dist/bin/solr stop -p $solr_port
        kill 0
    fi
}

function fail() {
    echo "ERROR: $*"
    exit 1
}

lsof -i ":${listen_port}" -sTCP:LISTEN && fail "Port $listen_port already in use"
lsof -i ":${solr_port}" -sTCP:LISTEN && fail "Port $solr_port already in use"

trap "stop_solr" INT TERM EXIT

function run() {
    heap_size="$((grep '^\s*AppConfig\[:java_heap_size\]' config/config.local.rb config/config.rb 2>/dev/null || true) | cut -d'=' -f2 | tr -c -d '[a-z0-9]' | head -1)"
    solr_heap_size="$((grep '^\s*AppConfig\[:solr_heap_size\]' config/config.local.rb config/config.rb 2>/dev/null || true) | cut -d'=' -f2 | tr -c -d '[a-z0-9]' | head -1)"

    if [ "$solr_heap_size" = "" ]; then
        solr_heap_size="$heap_size"

        if [ "$solr_heap_size" = "" ]; then
            solr_heap_size="512m"
        fi
    fi

    mkdir -p data/solr
    solr_dist/bin/solr start -f -p $solr_port -s solr -m "$solr_heap_size" -a "-Dsolr.data.home=$PWD/data/solr -Djava.security.egd=file:/dev/./urandom" &

    export JVM_HEAP_SIZE="$heap_size"
    scripts/jruby.sh distlibs/gems/bin/fishwife app/config.ru --quiet --host $listen_address --port $listen_port -E "$QSA_PUBLIC_ENV" -O request_body_max=134217728
}

if [ "$logging" = "0" ]; then
    run
else
    mkdir -p "$PWD/logs"
    run 2>&1 | scripts/log-rotater.pl "$PWD/logs/%a.log" "$PWD/logs/public.log"
fi
