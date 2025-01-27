#!/bin/bash
cd /var/www/react-app

echo "Installing npm dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "Failed to install npm dependencies."
    exit 1
fi

echo "NPM dependencies installed successfully."
