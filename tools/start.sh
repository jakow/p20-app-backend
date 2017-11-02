#!/bin/sh

# get environment variables
# source /etc/profile.d/poland20.sh
# use dotenv from server

cp /var/www/.env ./.env
echo "Install dependencies"
npm install
npm run build
npm run start
