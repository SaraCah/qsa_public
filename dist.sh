#!/bin/bash

version="$1"

if [ "$version" = "" ]; then
    version="v`date '+%Y%m%d%H%M%S'`"
fi

set -eou pipefail

if [ "`git status --porcelain`" != "" ] || [ "`git status --ignored --porcelain`" != "" ]; then
    echo "Your working directory isn't clean.  Clean with 'git clean -fdx' before running this script."
    exit
fi

if [ "$RELEASE_BRANCH" = "" ]; then
    export RELEASE_BRANCH="qa"
fi

echo "Building release for branch $RELEASE_BRANCH"


echo "================================================================================"
echo "== Preparing QSA Public"
echo "================================================================================"
(
    ./bootstrap.sh
    cp -a qsa-public-spa/public static
)

# Write the version file
echo "$version" > ./VERSION

tar czf qsa_public.tgz .

echo "================================================================================"
echo "== Release written to qsa_public.tgz"
echo "================================================================================"
