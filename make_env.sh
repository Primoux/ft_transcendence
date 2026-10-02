#!/bin/sh

if [ ! -f .env ]
then
    echo "[WARN] No .env file detected. Using default values"
    echo "Press enter to continue. ctrl+c to abort"
    read _
    DB_USER=`whoami`
    DB_PASSWORD=`openssl rand -hex 6`
    DB_NAME="dev_db"
    
    echo "DB_USER=$DB_USER" > .env
    echo "DB_PASSWORD=$DB_PASSWORD" >> .env
    echo "DB_NAME=$DB_NAME" >> .env

    echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@postgres:5432/$DB_NAME\"" >> .env
    echo "JWT_SECRET=`openssl rand -hex 32`" >> .env

    unset DB_USER DB_PASSWORD DB_NAME
else
    echo ".env file already present."
fi