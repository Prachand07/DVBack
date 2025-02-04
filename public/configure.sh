#!/bin/bash
sudo yum update -y
sudo yum install -y httpd
sudo systemctl start httpd
sudo systemctl enable httpd
cd /var/www/html/backend
sudo yum install -y nodejs
npm install -g pm2
echo "Deployment complete and server restarted successfully."
