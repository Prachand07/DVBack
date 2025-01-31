#!/bin/bash
sudo yum update -y
sudo yum install -y httpd
sudo systemctl start httpd
sudo systemctl enable httpd
cd /var/www/html/backend
sudo yum install -y nodejs
sudo kill $(lsof -t -i:8090)
node server.js
echo "Deployment complete and server restarted successfully."
