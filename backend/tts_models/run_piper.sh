#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
if [ -f "$DIR/venv/bin/python3" ]; then
    exec "$DIR/venv/bin/python3" -m piper "$@"
elif [ -f "$DIR/piper/piper" ]; then
    exec "$DIR/piper/piper" "$@"
elif [ -f "/usr/local/bin/piper/piper" ]; then
    exec "/usr/local/bin/piper/piper" "$@"
else
    exec piper "$@"
fi
