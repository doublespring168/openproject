#!/bin/zsh


time_day="`date +%Y%m%d`"
time_hour="`date +%Y%m%d%H`"
time_minute="`date +%Y%m%d%H%M`"
time_second="`date +%Y%m%d%H%M%S`"
USER_HOME=$HOME
email_suffix='zhangxiuchun128@163.com'
pwdd=$PWD

print_error() {
    echo -e "\033[31m[error] ------------------------------------------------------------------------\033[0m"
    echo -e "\033[31m[error] ${1}\033[0m" # 红
    echo -e "\033[31m[error] ------------------------------------------------------------------------\033[0m"
}

error_and_exit() {
    print_error "$1"
    exit 1
}

eexit() {
    print_error "$1"
    exit 1
}

# 检查目录, 没有就直接退出
check_directory() {
    if [ ! -d "${1}" ]; then
        error_and_exit "目录 ${1} 不存在, 无法完成此操作"
    fi
}

# 检查目录, 没有就递归创建
check_create_directory() {
    if [ ! -d "${1}" ]; then
        mkdir -p "$1"
    fi
}

# 检查文件, 没有就直接退出
check_file() {
    log_with_header "文件路径 ${1}"
    if [ ! -e "${1}" ]; then
        error_and_exit "文件 ${1} 不存在, 无法完成此操作"
    fi
}

# 检查文件, 有就直接退出
check_file_not_exist() {
    log "判断文件不存在，文件路径 ${1}"
    if [ -e "${1}" ]; then
        error_and_exit "文件 ${1} 已存在, 无法完成此操作"
    fi
}


log_with_header() {
    echo ""
    echo "[INFO] ------------------------------------------------------------------------"
    echo "[INFO] ${1}"
}

logh() {
    echo ""
    echo "[INFO] ------------------------------------------------------------------------"
    echo "[INFO] ${1}"
}


log() {
    echo "[INFO] ${1}"
}


empty() {
    if [ $# -lt 2 ]; then
        error_and_exit "参数[${1}]不存在, 请指定！ eg： $usage_template"
    fi
}


# 检测脚本执行结果

result(){
    if [ $1 != 0 ];then
	print_error "脚本调用异常，提示信息:$2"
	exit $1
    fi
}



trim(){
   echo `echo $1 | sed 's/ //g'`
}

open(){
    cmd="nohup dde-file-manager $pwdd >/dev/null 2>&1 &"
    eval $cmd
}

# 根据命令启动 应用
start_up(){


    nohup $@  > /dev/null 2>&1 &

}
