#!/bin/bash

phantomjs --version

npm run test-coverage
TEST_STATUS=$?

if [ "$TEST_STATUS" != "0" ]; then
  pip install --user awscli
  export PATH=$PATH:$HOME/.local/bin
  export S3_PATH=s3://$AWS_BUCKET/$TRAVIS_REPO_SLUG/$TRAVIS_BUILD_NUMBER
  aws s3 cp /tmp/metaform/build $S3_PATH --recursive
fi

exit $TEST_STATUS