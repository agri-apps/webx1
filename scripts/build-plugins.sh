#!/bin/bash

./node_modules/microbundle/dist/cli.js -i src/plugins/withHooks.js -o dist/plugins/webx.hooks.umd.js --name webxHooks --no-pkg-main -f umd
