#!/bin/bash

export QSA_PUBLIC_ENV=development
cd "`dirname "$0"`/../"


trap "exit" INT TERM
trap "kill 0" EXIT

echo
echo "API running on http://localhost:3333/"
echo
echo "UI running on http://localhost:3009/"
echo

scripts/start.sh &

(
    cd qsa-public-spa
    PORT=3009 npm start
)

