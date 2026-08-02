#!/bin/sh
set -eu
B="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
command -v uhttpd >/dev/null || { echo "uhttpd tiada"; exit 1; }
command -v jsonfilter >/dev/null || { echo "Pasang jsonfilter"; exit 1; }
command -v vnstat >/dev/null || { echo "Pasang vnstat2"; exit 1; }
S=$(date +%Y%m%d-%H%M%S)
[ -d /www/dashboard ] && cp -a /www/dashboard "/www/dashboard.backup-$S"
[ -d /www/cgi-bin/dashboard ] && cp -a /www/cgi-bin/dashboard "/www/cgi-bin/dashboard.backup-$S"
mkdir -p /www/dashboard /www/cgi-bin/dashboard
cp -a "$B/dashboard/." /www/dashboard/
cp -a "$B/cgi-bin/dashboard/." /www/cgi-bin/dashboard/
chmod 755 /www/cgi-bin/dashboard/*
[ -f /etc/abeyy-dashboard.conf ] || printf 'WAN_IF="wwan0"\nLAN_IF="br-lan"\n' >/etc/abeyy-dashboard.conf
/etc/init.d/uhttpd restart
echo "Siap: http://192.168.1.1/dashboard/"
