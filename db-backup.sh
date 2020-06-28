#!/bin/bash
pg_dump -h localhost -U oppj oppj_dev_20200618 > ./db/oppj_dev_20200618-"`date +%Y%m%d%H%M`".back
