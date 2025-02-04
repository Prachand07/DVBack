#!/bin/bash
sudo yum update -y
sudo yum install -y httpd
sudo systemctl start httpd
sudo systemctl enable httpd
cd /var/www/html/backend
sudo yum install -y nodejs
sudo npm install -g pm2
pm2 start server.js
echo "Deployment complete and server restarted successfully."
