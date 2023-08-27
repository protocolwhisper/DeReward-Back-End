#!/bin/bash

cat << "EOF"
·▄▄▄▄  ▄▄▄ .▄▄▄  ▄▄▄ .▄▄▌ ▐ ▄▌ ▄▄▄· ▄▄▄  ·▄▄▄▄  
██▪ ██ ▀▄.▀·▀▄ █·▀▄.▀·██· █▌▐█▐█ ▀█ ▀▄ █·██▪ ██ 
▐█· ▐█▌▐▀▀▪▄▐▀▀▄ ▐▀▀▪▄██▪▐█▐▐▌▄█▀▀█ ▐▀▀▄ ▐█· ▐█▌
██. ██ ▐█▄▄▌▐█•█▌▐█▄▄▌▐█▌██▐█▌▐█ ▪▐▌▐█•█▌██. ██ 
▀▀▀▀▀•  ▀▀▀ .▀  ▀ ▀▀▀  ▀▀▀▀ ▀▪ ▀  ▀ .▀  ▀▀▀▀▀▀• 
EOF

# ... rest of your script here
sleep 2  # You can adjust the sleep time if you want it to pause longer

cat << "EOF"

   .    .    .   Loading...   .    .    .

EOF

# Execute docker-compose up
docker-compose up
#Run worker that consumes Events logs from Oracle Consumer
npm run worker || yarn run worker || pnpm run worker
#Run api 
# Start the dereward process in the background
npm run dereward &