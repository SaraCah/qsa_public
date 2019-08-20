#!/bin/bash

export QSA_PUBLIC_ENV=development
cd "`dirname "$0"`/../"

scripts/start.sh
