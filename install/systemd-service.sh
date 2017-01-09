#!/bin/bash

set -eu

err_trap_func() {
	echo "ERROR: Installation failed"
}

trap err_trap_func ERR

if [[ $EUID -ne 0 ]]; then
   echo "Installation failed" 
   echo "Please run this script as root" 
   exit 1
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

: ${BEAME_INSTA_SERVER_USER:=beame-insta-server}
: ${BEAME_INSTA_SERVER_SVC:=beame-insta-server}
: ${BEAME_INSTA_SERVER_NODEJS_BIN:=$(which nodejs)}
: ${BEAME_INSTA_SERVER_SYSTEMD_FILE:="/etc/systemd/system/$BEAME_INSTA_SERVER_SVC.service"}
: ${BEAME_INSTA_SERVER_SYSTEMD_EXTRA:=''}
: ${BEAME_INSTA_SERVER_DIR:="$(dirname "$SCRIPT_DIR")"}

if [[ $BEAME_INSTA_SERVER_NODEJS_BIN ]];then
	echo "+ Will be using NodeJS at $BEAME_INSTA_SERVER_NODEJS_BIN"
else
	echo "+ NodeJS not found"
	exit 2
fi

"$SCRIPT_DIR/check-nodejs-version.sh" "$BEAME_INSTA_SERVER_NODEJS_BIN"

if getent passwd "$BEAME_INSTA_SERVER_USER" >/dev/null 2>&1;then
	echo "+ User $BEAME_INSTA_SERVER_USER already exists"
else
	echo "+ Adding user for beame-insta-server: $BEAME_INSTA_SERVER_USER"
	adduser --system --group --disabled-password --shell /bin/false "$BEAME_INSTA_SERVER_USER"
fi

echo "+ Creating $BEAME_INSTA_SERVER_SYSTEMD_FILE file for beame-insta-server"
cat >"$BEAME_INSTA_SERVER_SYSTEMD_FILE" <<E
[Service]
Type=simple
Environment=NODE_ENV=production
User=$BEAME_INSTA_SERVER_USER
WorkingDirectory=$BEAME_INSTA_SERVER_DIR
ExecStart=$BEAME_INSTA_SERVER_NODEJS_BIN main.js serve"
Restart=always
RestartSec=10

$BEAME_INSTA_SERVER_SYSTEMD_EXTRA

[Install]
WantedBy=multi-user.target
E

echo "+ Enabling the $BEAME_INSTA_SERVER_SVC service"
systemctl enable "$BEAME_INSTA_SERVER_SVC"

echo "+ Reloading systemd"
systemctl daemon-reload

echo "+ SUCCESS. Installation complete."