#!/bin/bash
sudo yum update -y
sudo yum install -y httpd
sudo systemctl start httpd
sudo systemctl enable httpd
cd /var/www/html/backend
REPO_FILE="/etc/yum.repos.d/mongodb-org-8.0.repo"
echo "[mongodb-org-8.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2023/mongodb-org/8.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-8.0.asc" | sudo tee $REPO_FILE > /dev/null
sudo yum install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
sudo yum install -y nodejs
sudo npm install -g pm2
pm2 start server.js
echo "Deployment complete and server restarted successfully."
