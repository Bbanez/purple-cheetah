#!/bin/bash
cp package.json lib
cp README.md lib
cp LICENSE lib
cd lib
npm publish --access=public