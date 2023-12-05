/**
 * run cmd with terminal
 */

import { terminals } from './remote-common.js'
import { terminal, testConnection } from './session.js'

const cmdMapper = {
  uptime: 'up 20 weeks, 6 hours, 22 minutes',
  'df -h': `Filesystem      Size  Used Avail Use% Mounted on
  udev            438M     0  438M   0% /dev
  tmpfs            97M  1.2M   96M   2% /run
  /dev/sda         24G   21G  1.9G  92% /
  tmpfs           483M     0  483M   0% /dev/shm
  tmpfs           5.0M     0  5.0M   0% /run/lock
  tmpfs           483M     0  483M   0% /sys/fs/cgroup
  /dev/loop0      128K  128K     0 100% /snap/bare/5
  /dev/loop7      522M  522M     0 100% /snap/gimp/393
  /dev/loop11     350M  350M     0 100% /snap/gnome-3-38-2004/143
  /dev/loop12     350M  350M     0 100% /snap/gnome-3-38-2004/140
  /dev/loop13     165M  165M     0 100% /snap/gnome-3-28-1804/198
  /dev/loop15     256K  256K     0 100% /snap/gtk2-common-themes/13
  /dev/loop16      92M   92M     0 100% /snap/gtk-common-themes/1535
  /dev/loop17      64M   64M     0 100% /snap/core20/1974
  /dev/loop18     165M  165M     0 100% /snap/gnome-3-28-1804/194
  tmpfs            97M     0   97M   0% /run/user/1006
  /dev/loop3       56M   56M     0 100% /snap/core18/2790
  /dev/loop20      64M   64M     0 100% /snap/core20/2015
  /dev/loop8      106M  106M     0 100% /snap/core/16091
  /dev/loop2      106M  106M     0 100% /snap/core/16202
  /dev/loop1      521M  521M     0 100% /snap/gimp/405
  /dev/loop5       45M   45M     0 100% /snap/certbot/3437
  /dev/loop6       45M   45M     0 100% /snap/certbot/3462
  /dev/loop9       56M   56M     0 100% /snap/core18/2796
  /dev/loop14      48M   48M     0 100% /snap/cmake/1345
  /dev/loop10      48M   48M     0 100% /snap/cmake/1356`,
  'ps --no-headers -o pid,user,%cpu,size,command ax | sort -b -k3 -r': `2986312 execapp   1.0  5560 -/bin/bash
  799 execapp   0.1 99220 node /home/electerm/apps/letsencrypt-bot/app/user-app.js
2684307 execapp   0.1 98800 node /home/electerm/dev/auto-bots/cmds/update-ss-list.js
  757 root      0.1 95212 node /home/electerm/apps/letsencrypt-bot/app/root-app.js
2986206 root      0.1  1516 sshd: execapp [priv]
547253 execapp   0.1 100364 node /home/electerm/dev/electerm.html5beta.com/electerm.home.watch.js
  733 root      0.0 99668 PM2 v5.2.0: God Daemon (/root/.pm2)
  457 systemd+  0.0  9028 /lib/systemd/systemd-timesyncd
  432 systemd+  0.0  8860 /lib/systemd/systemd-networkd
 1090 execapp   0.0 84044 /tmp/go-build169644277/b001/exe/app
  645 root      0.0  8348 /usr/bin/python3 /usr/bin/networkd-dispatcher --run-startup-triggers
1197075 root      0.0   804 sshd: /usr/sbin/sshd -D [listener] 0 of 10-100 startups
2986624 execapp   0.0  6616 sort -b -k3 -r
  465 root      0.0  6160 /usr/sbin/haveged --Foreground --verbose=1 -w 1024
  826 execapp   0.0 57912 /home/electerm/apps/caddy/caddy run --config /home/electerm/confs/Caddyfile
2684862 execapp   0.0   548 inotifywait -m -r -e modify,create,delete public/
1817601 root      0.0   452 /usr/sbin/inetd
  639 root      0.0   448 /usr/sbin/cron -f
  669 daemon    0.0   448 /usr/sbin/atd -f
  454 systemd+  0.0  4432 /lib/systemd/systemd-resolved
2698475 root      0.0   424 /usr/lib/ipsec/starter --daemon charon --nofork
2986583 execapp   0.0   400 /bin/bash -c ps --no-headers -o pid,user,%cpu,size,command ax | sort -b -k3 -r
  888 execapp   0.0   400 bash /home/electerm/dev/sbn.htmlbeta.com/watch-sbn.sh
2683756 execapp   0.0   400 bash /home/electerm/dev/sbn.htmlbeta.com/run-sbn.sh
  921 execapp   0.0   400 bash /home/electerm/dev/github-api-handler-go/run-electerm-github-api-server-go.sh
2684863 execapp   0.0   400 bash /home/electerm/dev/common-cdn/watch-cdn.sh
2684861 execapp   0.0   400 bash /home/electerm/dev/common-cdn/watch-cdn.sh
  825 execapp   0.0   400 bash /home/electerm/cmds/caddy.sh`,
  "(grep 'cpu ' /proc/stat;sleep 0.1;grep 'cpu ' /proc/stat)|awk -v RS=\"\" '{print \"CPU \"($13-$2+$15-$4)*100/($13-$2+$15-$4+$16-$5)\"%\"}'": 'CPU 0%',
  'free -h': `             total        used        free      shared  buff/cache   available
  Mem:          964Mi       324Mi       145Mi       0.0Ki       495Mi       486Mi
  Swap:         511Mi       141Mi       370Mi`,
  'ip addr': `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether f2:3c:91:73:56:73 brd ff:ff:ff:ff:ff:ff
    inet 23.239.5.15/24 brd 23.239.5.255 scope global dynamic eth0
       valid_lft 1059sec preferred_lft 1059sec
    inet6 2600:3c01::f03c:91ff:fe73:5673/64 scope global dynamic mngtmpaddr noprefixroute 
       valid_lft 5333sec preferred_lft 1733sec
    inet6 fe80::f03c:91ff:fe73:5673/64 scope link 
       valid_lft forever preferred_lft forever`
}
export function runCmd (ws, msg) {
  const { id, pid, sessionId, cmd } = msg
  const term = terminals(pid, sessionId)
  const txt = cmdMapper[cmd] || term.runCmd(cmd)
  // console.log('msg', msg, txt)
  ws.send({
    id,
    data: txt
  }, false)
}

export function resize (ws, msg) {
  const { id, pid, sessionId, cols, rows } = msg
  const term = terminals(pid, sessionId)
  if (term) {
    term.resize(cols, rows)
  }
  ws.send({
    id,
    data: 'ok'
  }, false)
}

export function toggleTerminalLog (ws, msg) {
  const { id, pid, sessionId } = msg
  const term = terminals(pid, sessionId)
  if (term) {
    term.toggleTerminalLog()
  }
  ws.send({
    id,
    data: 'ok'
  }, false)
}

export function toggleTerminalLogTimestamp (ws, msg) {
  const { id, pid, sessionId } = msg
  const term = terminals(pid, sessionId)
  if (term) {
    term.toggleTerminalLogTimestamp()
  }
  ws.send({
    id,
    data: 'ok'
  }, false)
}

export function createTerm (ws, msg) {
  const { id, body } = msg
  const data = terminal(body, ws)
  ws.send({
    id,
    data: data.pid
  }, false)
}

export function testTerm (ws, msg) {
  const { id, body } = msg
  const data = testConnection(body)
  ws.send({
    id,
    data
  }, false)
}
