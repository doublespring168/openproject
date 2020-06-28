#!/bin/bash

psql -h localhost -U oppj -d oppj_dev_"`date +%Y%m%d`" <  oppj_dev_20200618-202006280948.back
