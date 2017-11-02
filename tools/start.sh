#!/bin/sh

# get environment variables
# source /etc/profile.d/poland20.sh
# use dotenv from server
cp /var/www/.env ./.env
npm install --only=production
npm run build
npm run start
