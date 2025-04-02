const AWS = require("aws-sdk");
const scp2 = require('scp2');
const fs = require('fs');
AWS.config.update({ region: 'ap-south-1' });
const ec2 = new AWS.EC2();

async function getDefaultVpcId() {
    const vpcs = await ec2.describeVpcs({}).promise();
    return vpcs.Vpcs.find(vpc => vpc.IsDefault).VpcId;
}
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

async function createEC2Instance() {
    try {
        const securityGroupId = await createSecurityGroup();

        const params = {
            ImageId: "ami-076c6dbba59aa92e6",
            InstanceType: "t2.micro",
            KeyName: "DV",
            MinCount: 1,
            MaxCount: 1,
            SecurityGroupIds: [securityGroupId],
            TagSpecifications: [
                {
                    ResourceType: "instance",
                    Tags: [{ Key: "Name", Value: "MyEC2Instance" }],
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

async function copyFiles(publicIp, fileBuffer, fileName) {
    const privateKeyPath = './DV.pem'; // Adjust your path to the private key
    const remotePath = `/home/ec2-user/${fileName}`;  // Path on EC2 where you want to store the file

    try {
        if (!fileBuffer || !fileName) {
            throw new Error('File buffer or file name is missing.');
        }

        console.log("Attempting to copy file to EC2 instance...");
        console.log(`Copying file to: ${publicIp} with filename: ${fileName}`);

        await new Promise((resolve, reject) => {
            scp2.scp({
                host: publicIp,
                username: 'ec2-user',
                privateKey: fs.readFileSync(privateKeyPath),  // Use your private key to authenticate
                path: remotePath,
                file: fileBuffer,
            }, (err) => {
                if (err) {
                    reject(new Error(`Error copying file: ${err.message}`));
                } else {
                    resolve();
                }
            });
        });

        console.log(`File successfully copied to EC2 instance at ${remotePath}`);
    } catch (error) {
        console.error('Error copying file:', error);
        throw new Error(`Error copying file: ${error.message}`);
    }
}
//   try {
//     // Use scp2 to copy the file
//     await new Promise((resolve, reject) => {
//       scp2.send({
//         host: publicIp,
//         username: 'ec2-user',
//         privateKey: fs.readFileSync(privateKeyPath),  // Use your private key to authenticate
//         path: remotePath,
//         file: fileBuffer,
//       }, (err) => {
//         if (err) {
//           reject(new Error(`Error copying file: ${err.message}`));
//         } else {
//           resolve();
//         }
//       });
//     });








module.exports = {
    createEC2Instance,
    getPublicIP,
    copyFiles
}

