const AWS = require("aws-sdk");
const crypto = require("crypto");
const mime = require("mime-types");
const { Route53Client, ChangeResourceRecordSetsCommand } = require("@aws-sdk/client-route-53");
AWS.config.update({ region: 'us-east-1' });
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: "eu-north-1"
});
const route53 = new Route53Client({ region: 'us-east-1' });
const hostedZoneId = process.env.ROUTE53_HOSTED_ZONE_ID;
const domain = process.env.DOMAIN;
const checkLimit = async (username) => {
  try {
    const existingProjects = await dynamodb.query({
      TableName: "S3ProjectDetails",
      KeyConditionExpression: "username = :username",
      ExpressionAttributeValues: {
        ":username": username
      },

    }).promise();
    const projectCount = existingProjects.Items.length;
    const isLimitReached = projectCount >= 3;
    const randomId = crypto.randomBytes(2).toString("hex");

    return {
      isLimitReached,
      randomId: isLimitReached ? null : randomId
    };
  } catch (error) {
    console.error("Error checking project limit:", error);
    throw new Error("Failed to check project limit.");
  }
};

const generateBucketName = (projectname, randomId) => {
  const bucketName = `${projectname}.${randomId}.deployverse.in`;
  console.log(`Generated bucket name: ${bucketName}`);
  return bucketName;
};

const bucketCreateandhost = async (bucketName, files) => {
  try {
    console.log(`Starting bucket creation process for: ${bucketName}`);

    await s3.createBucket({ Bucket: bucketName }).promise();
    console.log(`S3 bucket created: ${bucketName}`);

    await s3.putPublicAccessBlock({
      Bucket: bucketName,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        BlockPublicPolicy: false,
        RestrictPublicBuckets: false,
      },
    }).promise();
    console.log(`Public access enabled for bucket: ${bucketName}`);

    await s3.putBucketWebsite({
      Bucket: bucketName,
      WebsiteConfiguration: {
        IndexDocument: { Suffix: "index.html" },
        ErrorDocument: { Key: "error.html" },
      },
    }).promise();
    console.log(`Static website hosting enabled for bucket: ${bucketName}`);

    await s3.putBucketPolicy({
      Bucket: bucketName,
      Policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
          Sid: "PublicReadGetObject",
          Effect: "Allow",
          Principal: "*",
          Action: "s3:GetObject",
          Resource: `arn:aws:s3:::${bucketName}/*`,
        }],
      }),
    }).promise();
    console.log(`Bucket policy added for: ${bucketName}`);

    await Promise.all(files.map(file =>
      s3.upload({
        Bucket: bucketName,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: mime.lookup(file.originalname) || "application/octet-stream",
      }).promise()
    ));
    console.log(`All files uploaded successfully to: ${bucketName}`);

    const websiteURL = `http://${bucketName}.s3-website.${AWS.config.region}.amazonaws.com`;
    return websiteURL;
  } catch (error) {
    console.error(`Failed to create and configure bucket: ${error.message}`);
    throw new Error("Failed to create and configure bucket.");
  }
};

const mapSubdomainToS3 = async (projectname, randomId, websiteURL) => {
  if (!hostedZoneId) {
    throw new Error("ROUTE53_HOSTED_ZONE_ID not set in environment variables");
  }

  const subdomain = `${projectname}.${randomId}.${domain}`;
  const changeRecordCommand = new ChangeResourceRecordSetsCommand({
    HostedZoneId: hostedZoneId,
    ChangeBatch: {
      Comment: `Map ${subdomain} to S3 website endpoint`,
      Changes: [
        {
          Action: "UPSERT",
          ResourceRecordSet: {
            Name: subdomain,
            Type: "CNAME",
            TTL: 300,
            ResourceRecords: [{ Value: websiteURL }],
          },
        },
      ],
    },
  });

  await route53.send(changeRecordCommand);
  console.log(`Successfully mapped ${subdomain} → ${websiteURL}`);
  return `http://${subdomain}`;
};


const storeProjectDetails = async (username, projectname, MappedURL) => {
  try {
    const params = {
      TableName: "S3ProjectDetails",
      Item: {
        username: username,
        projectname: projectname,
        URL: MappedURL,
      },
    };

    console.log(`Storing details for username: ${username}, URL: ${MappedURL}`);
    await dynamodb.put(params).promise();
    return { status: "Success", message: "Project stored successfully." };
  } catch (error) {
    console.error("Error storing data:", error);
    return { status: "Failed", message: "Error storing project details." };
  }
};

module.exports = {
  generateBucketName,
  checkLimit,
  bucketCreateandhost,
  storeProjectDetails,
  mapSubdomainToS3
};
