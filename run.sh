export ROOT_PASSWORD="$(cat /dev/urandom | head -c 24 | base64)"
export PB_USERNAME="$(jq -r .database.username config.json)"
export PB_PASSWORD="$(jq -r .database.password config.json)"
export PB_DATABASE="$(jq -r .database.database config.json)"

docker compose up -d
