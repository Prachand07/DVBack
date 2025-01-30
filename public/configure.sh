#!/bin/bash
sudo yum update -y
sudo yum install -y httpd
sudo yum install -y nodejs
sudo systemctl start httpd
sudo systemctl enable httpd
cd /var/www/html/backend
node server.js
echo "Deployment complete and server restarted successfully."
