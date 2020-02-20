#!/bin/bash

rm -R lib
npm run build
cp package.json lib
cp README.md lib
cp LICENSE lib