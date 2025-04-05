#!/bin/bash
sudo yum update -y
sudo yum install -y httpd
sudo systemctl start httpd
sudo systemctl enable httpd
cd /var/www/html/Backend
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
aws ssm get-parameters --names "JWT_SECRET" "MONGO_URL" --with-decryption --query "Parameters[*].{Name:Name,Value:Value}" --output text | awk '{print $1 "=" $2}' > .env
aws ssm get-parameter --name "KP" --with-decryption --query "Parameter.Value" --output text >/var/www/html/Backend/DV.pem              
sudo echo "CONFIG = { PUBLIC_IP: '$(curl -s ifconfig.me)' };" > config.js
sudo yum install -y nodejs
sudo npm install -g pm2
sudo pm2 start server.js
echo "Deployment complete and server restarted successfully."
