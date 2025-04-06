const AWS = require("aws-sdk");
const scp2 = require('scp2');
const path = require('path');
const crypto = require('crypto');
const mime = require("mime-types");
const fs = require('fs');
const { exec } = require('child_process');
AWS.config.update({ region: 'eu-north-1' });
const ec2 = new AWS.EC2();
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
async function getDefaultVpcId() {
    const vpcs = await ec2.describeVpcs({}).promise();
    return vpcs.Vpcs.find(vpc => vpc.IsDefault).VpcId;
}

const generateBucketName = async (username) => {
    const randomString = crypto.randomBytes(4).toString("hex");
    const timestamp = Date.now();
    const bucketName = `${username}-${randomString}${timestamp}`;
    console.log(`Generated bucket name: ${bucketName}`);
    await s3.createBucket({ Bucket: bucketName }).promise();
    console.log(`S3 bucket created: ${bucketName}`);
    return bucketName;
};


async function createSecurityGroup() {
    const securityGroupName = "DynamicSG-" + Date.now();

    try {
        // Create Security Group
        const sgData = await ec2.createSecurityGroup({
            Description: "Security group with dynamic ports",
            GroupName: securityGroupName,
            VpcId: await getDefaultVpcId(),
        }).promise();

        const securityGroupId = sgData.GroupId;
        console.log("Created Security Group:", securityGroupId);

        // Define inbound rules (allow HTTP + additional ports)
        const ingressRules = [
            { IpProtocol: "tcp", FromPort: 80, ToPort: 80, IpRanges: [{ CidrIp: "0.0.0.0/0" }] },
            { IpProtocol: "tcp", FromPort: 22, ToPort: 22, IpRanges: [{ CidrIp: "0.0.0.0/0" }] }
        ];

        // Add Ingress Rules
        await ec2.authorizeSecurityGroupIngress({
            GroupId: securityGroupId,
            IpPermissions: ingressRules,
        }).promise();

        console.log("Ingress rules added successfully.");
        return securityGroupId;
    } catch (error) {
        console.error("Error creating security group:", error);
        throw error;
    }
}

async function createEC2Instance(user_name) {

    try {
        const securityGroupId = await createSecurityGroup();

        const params = {
            ImageId: "ami-0274f4b62b6ae3bd5",
            InstanceType: "t3.micro",
            KeyName: "Ec2-DV",
            MinCount: 1,
            MaxCount: 1,
            SecurityGroupIds: [securityGroupId],
            IamInstanceProfile: {
                Arn: "arn:aws:iam::794038217891:role/S3FullAccess"
            },
            TagSpecifications: [
                {
                    ResourceType: "instance",
                    Tags: [{ Key: "Name", Value: `${user_name}` }],
                },
            ],
        };

        const data = await ec2.runInstances(params).promise();
        const instanceId = data.Instances[0].InstanceId;

        console.log("Created instance with ID:", instanceId);
        return instanceId;
    } catch (error) {
        console.error("Error creating EC2 instance:", error);
    }
}

async function getPublicIP(instanceId) {
    console.log("Waiting for EC2 instance to be in 'running' state...");
    await ec2.waitFor("instanceRunning", { InstanceIds: [instanceId] }).promise();

    const data = await ec2.describeInstances({ InstanceIds: [instanceId] }).promise();
    const publicIp = data.Reservations[0].Instances[0].PublicIpAddress;

    console.log("EC2 is now running. Public IP:", publicIp);
    return publicIp;
}

const bucketCreate = async (user_name, file) => {
    const bucketName = await generateBucketName(user_name);
    try {
        const uploadParams = {
            Bucket: bucketName,
            Key: file.originalname,
            Body: file.buffer,
            ContentType: mime.lookup(file.originalname) || "application/zip",
        };

        await s3.upload(uploadParams).promise();
        console.log(`File uploaded successfully to: s3://${bucketName}/${file.originalname}`);
        return bucketName;
    } catch (error) {
        console.error("S3 Upload Error:", error);
        throw error;
    }
};



const copyFromS3ToEC2 = async (publicIp, bucketName, fileName, backend_file_name, backend_name, frontend_name) => {
    const sshCommand = `ssh -o StrictHostKeyChecking=no -i "Ec2-DV.pem" ec2-user@${publicIp} `
        + `"aws s3 cp s3://${bucketName}/${fileName} /home/ec2-user/ && echo 'File copied successfully!' || echo 'S3 file does not exist.';"`;

    return new Promise((resolve, reject) => {
        exec(sshCommand, async (error, stdout, stderr) => {

            if (error) {
                console.error("Error copying file from S3:", stderr);
                reject(error);
            } else {
                console.log("File copied to EC2:", stdout);
                await bashCopy(publicIp, fileName, backend_file_name, backend_name, frontend_name);
                resolve();

            }
        });
    });
};

const bashCopy = async (publicIp, fileName, backend_file_name, backend_name, frontend_name) => {
    const fixedBucketName = "deployverse";
    const fixedFileName = "script.sh";

    const sshCommand = `ssh -o StrictHostKeyChecking=no -i "Ec2-DV.pem" ec2-user@${publicIp} `
        + `"aws s3 cp s3://${fixedBucketName}/${fixedFileName} /home/ec2-user/ && `
        + `chmod +x /home/ec2-user/${fixedFileName} && `
        + `bash -c '/home/ec2-user/${fixedFileName} "${fileName}" "${backend_name}" "${backend_file_name}" "${frontend_name}"' && `
        + `echo 'Script executed successfully!' || echo 'Error executing script.';"`;

    return new Promise((resolve, reject) => {
        exec(sshCommand, (error, stdout, stderr) => {
            if (error) {
                console.error("Error executing Bash script:", stderr);
                reject(error);
            } else {
                console.log("Bash script executed on EC2:", stdout);
                resolve();
            }
        });
    });
};


const storeDetails = async (username, projectname, publicIp) => {
console.log(username+projectname+publicIp);
  try {
    const params = {
      TableName: "EC2ProjectDetails", 
      
      Item: {
        username: username,
        projectname: projectname,
        IP: publicIp,
      },
    };

    console.log(`Storing details for username: ${username}, IP:${publicIp}`);
    await dynamodb.put(params).promise();
    return { status: "Success", message: "Project stored successfully." };
  } catch (error) {
    console.error("Error storing data:", error);
    return { status: "Failed", message: "Error storing project details." };
  }
};


module.exports = {
    createEC2Instance,
    getPublicIP,
    bucketCreate,
    copyFromS3ToEC2,
    storeDetails
}

