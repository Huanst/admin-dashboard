#!/bin/bash

# SSH 连接诊断脚本
# 用于检查 SSH 配置和连接问题

echo "=== SSH 连接诊断工具 ==="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_item() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# 获取用户输入
read -p "请输入服务器 IP 或域名: " SERVER_HOST
read -p "请输入 SSH 用户名 (默认: root): " SERVER_USER
SERVER_USER=${SERVER_USER:-root}
read -p "请输入 SSH 端口 (默认: 22): " SERVER_PORT
SERVER_PORT=${SERVER_PORT:-22}
read -p "请输入私钥文件路径 (默认: ~/.ssh/id_rsa): " SSH_KEY_PATH
SSH_KEY_PATH=${SSH_KEY_PATH:-~/.ssh/id_rsa}

echo ""
echo "=== 配置信息 ==="
echo "服务器: $SERVER_HOST"
echo "用户: $SERVER_USER"
echo "端口: $SERVER_PORT"
echo "私钥: $SSH_KEY_PATH"
echo ""

# 1. 检查私钥文件是否存在
echo "=== 1. 检查本地 SSH 密钥 ==="
if [ -f "$SSH_KEY_PATH" ]; then
    check_item 0 "私钥文件存在: $SSH_KEY_PATH"
    
    # 检查私钥权限
    PERM=$(stat -f "%A" "$SSH_KEY_PATH" 2>/dev/null || stat -c "%a" "$SSH_KEY_PATH" 2>/dev/null)
    if [ "$PERM" = "600" ]; then
        check_item 0 "私钥文件权限正确: $PERM"
    else
        check_item 1 "私钥文件权限不正确: $PERM (应该是 600)"
        echo -e "${YELLOW}修复命令: chmod 600 $SSH_KEY_PATH${NC}"
    fi
    
    # 检查私钥格式
    if grep -q "BEGIN.*PRIVATE KEY" "$SSH_KEY_PATH"; then
        check_item 0 "私钥格式正确"
    else
        check_item 1 "私钥格式可能有问题"
    fi
else
    check_item 1 "私钥文件不存在: $SSH_KEY_PATH"
    echo -e "${YELLOW}生成密钥命令: ssh-keygen -t rsa -b 4096 -f $SSH_KEY_PATH${NC}"
fi

# 2. 检查公钥文件
echo ""
echo "=== 2. 检查公钥文件 ==="
PUB_KEY_PATH="${SSH_KEY_PATH}.pub"
if [ -f "$PUB_KEY_PATH" ]; then
    check_item 0 "公钥文件存在: $PUB_KEY_PATH"
    echo "公钥内容:"
    echo -e "${YELLOW}$(cat $PUB_KEY_PATH)${NC}"
else
    check_item 1 "公钥文件不存在: $PUB_KEY_PATH"
fi

# 3. 测试网络连接
echo ""
echo "=== 3. 测试网络连接 ==="
if ping -c 1 "$SERVER_HOST" >/dev/null 2>&1; then
    check_item 0 "服务器网络可达"
else
    check_item 1 "服务器网络不可达"
fi

# 4. 测试 SSH 端口
echo ""
echo "=== 4. 测试 SSH 端口 ==="
if nc -z "$SERVER_HOST" "$SERVER_PORT" 2>/dev/null; then
    check_item 0 "SSH 端口 $SERVER_PORT 开放"
else
    check_item 1 "SSH 端口 $SERVER_PORT 不可达"
fi

# 5. 测试 SSH 连接
echo ""
echo "=== 5. 测试 SSH 连接 ==="
echo "正在测试 SSH 连接..."

# 使用 ssh 命令测试连接
SSH_OUTPUT=$(ssh -i "$SSH_KEY_PATH" -p "$SERVER_PORT" -o ConnectTimeout=10 -o StrictHostKeyChecking=no -o BatchMode=yes "$SERVER_USER@$SERVER_HOST" "echo 'SSH连接成功'" 2>&1)
SSH_EXIT_CODE=$?

if [ $SSH_EXIT_CODE -eq 0 ]; then
    check_item 0 "SSH 连接成功"
    echo "服务器响应: $SSH_OUTPUT"
else
    check_item 1 "SSH 连接失败"
    echo "错误信息: $SSH_OUTPUT"
fi

# 6. 检查服务器目录权限（如果连接成功）
if [ $SSH_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "=== 6. 检查服务器部署目录 ==="
    
    DEPLOY_PATH="/www/wwwroot/admin-dashboard.huanst.cn"
    BACKUP_PATH="/www/wwwroot/backups/admin-dashboard"
    
    # 检查部署目录
    DIR_CHECK=$(ssh -i "$SSH_KEY_PATH" -p "$SERVER_PORT" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "
        if [ -d '$DEPLOY_PATH' ]; then
            echo 'DEPLOY_DIR_EXISTS'
        else
            echo 'DEPLOY_DIR_NOT_EXISTS'
        fi
        
        if [ -d '$BACKUP_PATH' ]; then
            echo 'BACKUP_DIR_EXISTS'
        else
            echo 'BACKUP_DIR_NOT_EXISTS'
        fi
        
        # 检查写权限
        if [ -w '$DEPLOY_PATH' ] || sudo test -w '$DEPLOY_PATH' 2>/dev/null; then
            echo 'DEPLOY_WRITABLE'
        else
            echo 'DEPLOY_NOT_WRITABLE'
        fi
    " 2>/dev/null)
    
    if echo "$DIR_CHECK" | grep -q "DEPLOY_DIR_EXISTS"; then
        check_item 0 "部署目录存在: $DEPLOY_PATH"
    else
        check_item 1 "部署目录不存在: $DEPLOY_PATH"
        echo -e "${YELLOW}创建目录命令: sudo mkdir -p $DEPLOY_PATH${NC}"
    fi
    
    if echo "$DIR_CHECK" | grep -q "BACKUP_DIR_EXISTS"; then
        check_item 0 "备份目录存在: $BACKUP_PATH"
    else
        check_item 1 "备份目录不存在: $BACKUP_PATH"
        echo -e "${YELLOW}创建目录命令: sudo mkdir -p $BACKUP_PATH${NC}"
    fi
    
    if echo "$DIR_CHECK" | grep -q "DEPLOY_WRITABLE"; then
        check_item 0 "部署目录可写"
    else
        check_item 1 "部署目录不可写"
        echo -e "${YELLOW}修复权限命令: sudo chown -R $SERVER_USER:$SERVER_USER $DEPLOY_PATH${NC}"
    fi
fi

echo ""
echo "=== 诊断完成 ==="
echo ""

# 生成 GitHub Secrets 配置建议
echo "=== GitHub Secrets 配置建议 ==="
echo "请在 GitHub 仓库的 Settings → Secrets and variables → Actions 中添加："
echo ""
echo "SERVER_HOST:"
echo "$SERVER_HOST"
echo ""
echo "SERVER_USER:"
echo "$SERVER_USER"
echo ""
echo "SERVER_PORT:"
echo "$SERVER_PORT"
echo ""
echo "SSH_PRIVATE_KEY:"
echo "$(cat $SSH_KEY_PATH 2>/dev/null || echo '请复制私钥文件内容')"
echo ""

if [ $SSH_EXIT_CODE -ne 0 ]; then
    echo -e "${RED}=== 修复建议 ===${NC}"
    echo "1. 确保服务器上已添加公钥到 ~/.ssh/authorized_keys"
    echo "2. 检查服务器 SSH 配置是否允许密钥认证"
    echo "3. 确保防火墙允许 SSH 连接"
    echo "4. 检查服务器 SSH 服务是否正常运行"
    echo ""
    echo -e "${YELLOW}复制公钥到服务器命令:${NC}"
    echo "ssh-copy-id -i $PUB_KEY_PATH -p $SERVER_PORT $SERVER_USER@$SERVER_HOST"
fi