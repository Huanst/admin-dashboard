# SSH 密钥配置指南

## 1. 生成 SSH 密钥对

在您的本地机器上运行以下命令：

```bash
# 生成新的 SSH 密钥对
ssh-keygen -t rsa -b 4096 -C "github-actions@admin-dashboard"

# 按提示操作：
# - 文件保存位置：可以使用默认位置或指定新位置
# - 密码：建议留空（直接回车）
```

## 2. 复制公钥到服务器

```bash
# 方法1：使用 ssh-copy-id（推荐）
ssh-copy-id -i ~/.ssh/id_rsa.pub username@your-server-ip

# 方法2：手动复制
cat ~/.ssh/id_rsa.pub
# 然后将输出内容添加到服务器的 ~/.ssh/authorized_keys 文件中
```

## 3. 配置 GitHub Secrets

在 GitHub 仓库中添加以下 Secrets：

### SERVER_HOST
```
your-server-ip-or-domain
```

### SERVER_USER
```
root
# 或其他有权限的用户名
```

### SSH_PRIVATE_KEY
```bash
# 复制私钥内容
cat ~/.ssh/id_rsa
# 将完整输出（包括 -----BEGIN 和 -----END 行）复制到 GitHub Secrets
```

### SERVER_PORT（可选）
```
22
# 如果使用非标准端口，请修改为实际端口号
```

## 4. 测试 SSH 连接

```bash
# 测试连接
ssh -i ~/.ssh/id_rsa username@your-server-ip

# 如果连接成功，说明配置正确
```

## 5. 服务器权限检查

确保服务器上的目录权限正确：

```bash
# 在服务器上执行
sudo mkdir -p /www/wwwroot/admin-dashboard.huanst.cn
sudo mkdir -p /www/wwwroot/backups/admin-dashboard
sudo chown -R www-data:www-data /www/wwwroot/admin-dashboard.huanst.cn
sudo chmod -R 755 /www/wwwroot/admin-dashboard.huanst.cn
```

## 6. 常见问题排查

### SSH 连接被拒绝
- 检查服务器 SSH 服务是否运行：`sudo systemctl status ssh`
- 检查防火墙设置：`sudo ufw status`
- 检查 SSH 配置：`sudo nano /etc/ssh/sshd_config`

### 权限问题
- 确保 ~/.ssh 目录权限为 700
- 确保 ~/.ssh/authorized_keys 文件权限为 600
- 确保私钥文件权限为 600

### GitHub Actions 仍然失败
- 检查 Secrets 是否正确配置
- 确保私钥格式完整（包括头尾标记）
- 检查服务器用户是否有足够权限