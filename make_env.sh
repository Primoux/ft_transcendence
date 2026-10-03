#!/bin/sh

if [ -f .env ]
then
    echo "[WARN ].env file already present."
    echo "Press enter to replace and DROP YOUR CURRENT DB. ctrl+c to abort"
    read _
    `docker compose down postgres -v`
else
    echo "[WARN] no .env file present."
    echo "creating one with default values"
fi
    DB_USER=`whoami`
    DB_PASSWORD=`openssl rand -hex 6`
    DB_NAME="dev_db"
    
    echo "DB_USER=$DB_USER" > .env
    echo "DB_PASSWORD=$DB_PASSWORD" >> .env
    echo "DB_NAME=$DB_NAME" >> .env

    echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@postgres:5432/$DB_NAME\"" >> .env
    echo "JWT_SECRET=`openssl rand -hex 32`" >> .env