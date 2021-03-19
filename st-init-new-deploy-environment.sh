#!/bin/bash


source ./common_util.sh
usage_template="sh $0 branch-name"


branch=$1

empty $branch 'branch name'


git checkout -b $branch origin/$branch


