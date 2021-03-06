#!/usr/bin/env zsh

# http://elevated-dev.com/TechTips/Launchd%20&%20Logging/

NODEJS_PATH=${1:A:h}
export PATH="$NODEJS_PATH:$PATH"

T="beame-gatekeeper"
exec > >(/usr/bin/sed -l 's/^/[out] /' | logger -t "$T" -p user.error) 2> >(/usr/bin/sed -l 's/^/[err] /' | logger -t "$T" -p user.error)
exec "$@"
