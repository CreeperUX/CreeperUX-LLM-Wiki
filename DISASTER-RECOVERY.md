# App Server 灾难恢复手册

> **适用场景**: App Server (192.168.5.182) 系统完全损毁，需要在新机器上重建全部服务。
> **最后更新**: 2026-06-04
> **维护者**: AL (OpenClaw Assistant)

---

## 前置条件

- [ ] 全新 Ubuntu Server (建议 24.04+)，至少 60GB 磁盘、4GB 内存
- [ ] 网络可访问 192.168.5.0/24 局域网
- [ ] 能访问备份数据源之一（按优先级）：
  1. **NAS** `smb://192.168.5.40/Downloads/OpenClaw/backups/` （最全）
  2. **GitHub** `CreeperUX/CreeperUX-LLM-Wiki` （配置 + LLM Wiki）
  3. **本地** `/opt/backups/` （仅当原磁盘可挂载）

---

## 一、系统初始化

```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker

# 安装基础工具
apt install -y git zip unzip smbclient curl

# 验证
docker --version
docker compose version
```

---

## 二、获取备份文件

### 方案 A：从 NAS 拉取（首选）

```bash
# 挂载 SMB
mkdir -p /mnt/nas
mount -t cifs //192.168.5.40/Downloads /mnt/nas \
  -o username=openclaw,password='zsU2ddJ2Y3xjNdfB2s62'

# 复制全部备份到本地
cp -r /mnt/nas/OpenClaw/backups/ /opt/backups/
umount /mnt/nas
```

### 方案 B：从 GitHub 克隆配置

```bash
# 配置 + LLM Wiki 数据
git clone git@github.com:CreeperUX/CreeperUX-LLM-Wiki.git /tmp/backup-repo
```

### 方案 C：从旧磁盘挂载

```bash
# 如果旧磁盘可读，直接挂载复制
mount /dev/vda1 /mnt/old
cp -r /mnt/old/opt/backups/ /opt/backups/
umount /mnt/old
```

---

## 三、逐服务恢复

> 恢复顺序建议：基础设施 → 媒体服务 → 聊天服务 → 其他

### 3.1 go2rtc（视频桥接）

```bash
# 创建目录和配置
mkdir -p /opt/go2rtc

# 拉取最新备份的配置文件
cd /opt/backups/app-server/configs/
tar -xzf $(ls -t configs-*.tar.gz | head -1) -C /tmp/cfg-restore/
cp /tmp/cfg-restore/go2rtc/* /opt/go2rtc/

# 或从 GitHub 获取
# cp /tmp/backup-repo/app-server-configs/go2rtc/* /opt/go2rtc/

# 启动
cd /opt/go2rtc && docker compose up -d
docker ps --filter name=go2rtc
```

**配置位置**: `/opt/go2rtc/go2rtc.yaml`
**数据**: 无状态（配置即完整恢复）

### 3.2 MediaMTX（RTSP 服务器）

```bash
mkdir -p /opt/mediamtx

# 恢复配置
tar -xzf $(ls -t /opt/backups/app-server/configs/configs-*.tar.gz | head -1) -C /tmp/cfg-restore/
cp /tmp/cfg-restore/mediamtx/* /opt/mediamtx/

cd /opt/mediamtx && docker compose up -d
docker ps --filter name=mediamtx
```

**配置位置**: `/opt/mediamtx/mediamtx.yml`
**数据**: 无状态

### 3.3 qBittorrent

```bash
mkdir -p /opt/qbittorrent/config /opt/qbittorrent/downloads

# 恢复配置
tar -xzf $(ls -t /opt/backups/app-server/configs/configs-*.tar.gz | head -1) -C /tmp/cfg-restore/
cp /tmp/cfg-restore/qbittorrent/docker-compose.yml /opt/qbittorrent/
cp -r /tmp/cfg-restore/qbittorrent/qBittorrent /opt/qbittorrent/config/

cd /opt/qbittorrent && docker compose up -d
docker ps --filter name=qbittorrent
```

**访问**: `http://192.168.5.182:8080`
**配置位置**: `/opt/qbittorrent/config/qBittorrent/`
**webUI 构建**: 原 webUI 位于 `/opt/qb-webui-dist/`，需从 `CreeperUX/Unifi-Style-QB-Web-GUI` 仓库重新构建部署

### 3.4 Stoat（聊天系统）⚠️ 最重要

```bash
# 创建目录结构
mkdir -p /opt/stoat/data/{db,minio,rabbit,caddy-data,caddy-config}

# 恢复配置文件
tar -xzf $(ls -t /opt/backups/app-server/configs/configs-*.tar.gz | head -1) -C /tmp/cfg-restore/
cp /tmp/cfg-restore/stoat/* /opt/stoat/

# 恢复 MongoDB 数据库（如果有 NAS 备份）
cd /opt/backups/app-server/data/
DB_FILE=$(ls -t mongodump-*.archive 2>/dev/null | head -1)
if [ -n "$DB_FILE" ]; then
    # 先启动 MongoDB
    cd /opt/stoat && docker compose up -d database
    sleep 5
    # 恢复数据
    docker cp "$DB_FILE" stoat-database-1:/tmp/restore.archive
    docker exec stoat-database-1 mongorestore --archive=/tmp/restore.archive
    docker exec stoat-database-1 rm /tmp/restore.archive
fi

# 启动全部服务
cd /opt/stoat && docker compose up -d
docker compose ps
```

**⚠️ 注意**:
- ✅ `secrets.env` 已纳入自动备份
- MongoDB 数据恢复是关键，NAS 上有 dump
- Stoat 共 15 个容器，启动需 1-2 分钟

### 3.5 WT8111 Tactical

```bash
mkdir -p /opt/wt8111-tactical

tar -xzf $(ls -t /opt/backups/app-server/configs/configs-*.tar.gz | head -1) -C /tmp/cfg-restore/
cp /tmp/cfg-restore/wt8111/docker-compose.yml /opt/wt8111-tactical/
cp -r /tmp/cfg-restore/wt8111/config /opt/wt8111-tactical/

cd /opt/wt8111-tactical && docker compose up -d
docker ps --filter name=wt8111
```

### 3.6 LLM Wiki

```bash
# 从 GitHub 获取完整项目（含 compose 文件）
git clone https://github.com/Pratiyush/llm-wiki.git /opt/llm-wiki

# 恢复 wiki 数据
tar -xzf $(ls -t /opt/backups/llm-wiki/local/llm-wiki-*.tar.gz | head -1) -C /opt/llm-wiki/

# 或从 GitHub 备份仓库恢复
# git clone git@github.com:CreeperUX/CreeperUX-LLM-Wiki.git /tmp/backup-repo
# cp -r /tmp/backup-repo/{raw,wiki} /opt/llm-wiki/

# 构建镜像（GHCR 预制镜像有 bug，需本地构建）
cd /opt/llm-wiki && docker compose build && docker compose up -d
docker ps --filter name=llmwiki
```

**访问**: `http://192.168.5.182:8765`

---

## 四、验证清单

```bash
# 1. 所有容器运行中
docker ps --format 'table {{.Names}}\t{{.Status}}'

# 2. 关键端口监听
ss -tlnp | grep -E '8765|8880|8080|8554|7881|17712'

# 3. 各服务响应
curl -s -o /dev/null -w '%{http_code}' http://localhost:8765/  # LLM Wiki → 200
curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/  # qBittorrent → 200
curl -s -o /dev/null -w '%{http_code}' http://localhost:8880/  # Stoat → 200
```

---

## 五、恢复备份系统

```bash
# 注册每日备份定时器
cat > /etc/systemd/system/llm-wiki-backup.service << 'UNIT'
[Unit]
Description=LLM Wiki Daily Backup
After=docker.service
[Service]
Type=oneshot
ExecStart=/opt/llm-wiki/backup.sh
User=root
UNIT

cat > /etc/systemd/system/llm-wiki-backup.timer << 'UNIT'
[Unit]
Description=LLM Wiki Daily Backup Timer
[Timer]
OnCalendar=daily; Persistent=true; RandomizedDelaySec=1800
[Install]
WantedBy=timers.target
UNIT

cat > /etc/systemd/system/app-server-backup.service << 'UNIT'
[Unit]
Description=App Server Daily Backup
After=docker.service
[Service]
Type=oneshot
ExecStart=/opt/backups/app-server/backup.sh
User=root
UNIT

cat > /etc/systemd/system/app-server-backup.timer << 'UNIT'
[Unit]
Description=App Server Daily Backup Timer
[Timer]
OnCalendar=daily; Persistent=true; RandomizedDelaySec=1800
[Install]
WantedBy=timers.target
UNIT

systemctl daemon-reload
systemctl enable --now llm-wiki-backup.timer app-server-backup.timer
```

---

## 六、备忘

| 项目 | 值 |
|------|-----|
| App Server IP | 192.168.5.182 |
| NAS 地址 | 192.168.5.40 |
| NAS 备份路径 | `Downloads/OpenClaw/backups/` |
| GitHub 备份仓库 | `CreeperUX/CreeperUX-LLM-Wiki` |
| 密钥文件（已备份） | `/opt/stoat/secrets.env` ✅ |
| 密钥文件 2（已备份） | `/opt/stoat/livekit.yml` (含 API keys) ✅ |
| qBittorrent webUI 源码 | `CreeperUX/Unifi-Style-QB-Web-GUI` |
