#!/bin/sh
rm -rf /www/dashboard /www/cgi-bin/dashboard
rm -f /etc/abeyy-dashboard.conf
/etc/init.d/uhttpd restart
echo "Dashboard dibuang."
