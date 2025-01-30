const AWS = require("aws-sdk");
const crypto = require("crypto");
const mime = require("mime-types");

AWS.config.update({ region: 'eu-north-1' });
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

const generateBucketName = (username) => {
  const randomString = crypto.randomBytes(4).toString("hex");
  const timestamp = Date.now();
  const bucketName = `${username}-${randomString}-${timestamp}`;
  console.log(`Generated bucket name: ${bucketName}`);
  return bucketName;
};

const createBucketAndEnableHosting = async (bucketName, files) => {
  try {
    console.log(`Starting bucket creation process for: ${bucketName}`);

    const params = {
      Bucket: bucketName,
    };
    await s3.createBucket(params).promise();
    console.log(`S3 bucket created: ${bucketName}`);


    const publicAccessBlockParams = {
      Bucket: bucketName,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        BlockPublicPolicy: false,
        RestrictPublicBuckets: false,
      },
    };
    await s3.putPublicAccessBlock(publicAccessBlockParams).promise();
    console.log(`Block public access disabled for bucket: ${bucketName}`);

    const websiteParams = {
      Bucket: bucketName,
      WebsiteConfiguration: {
        IndexDocument: { Suffix: "index.html" },
        ErrorDocument: { Key: "error.html" },
      },
    };
    await s3.putBucketWebsite(websiteParams).promise();
    console.log(`Static website hosting enabled for bucket: ${bucketName}`);


    const bucketPolicy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicReadGetObject",
          Effect: "Allow",
          Principal: "*",
          Action: "s3:GetObject",
          Resource: `arn:aws:s3:::${bucketName}/*`,
        },
      ],
    };
    const bucketPolicyParams = {
      Bucket: bucketName,
      Policy: JSON.stringify(bucketPolicy),
    };
    await s3.putBucketPolicy(bucketPolicyParams).promise();
    console.log(`Public bucket policy added for bucket: ${bucketName}`);

    const uploadPromises = files.map((file) => {
      const params = {
        Bucket: bucketName,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: mime.lookup(file.originalname) || "application/octet-stream",
      };
      console.log(` Uploading file: ${file.originalname} to bucket: ${bucketName}`);
      return s3.upload(params).promise();
    });

    await Promise.all(uploadPromises);
    console.log(` All files uploaded successfully to bucket: ${bucketName}`);

    const websiteURL = `http://${bucketName}.s3-website.${AWS.config.region}.amazonaws.com`;
    console.log(`Bucket hosting URL: ${websiteURL}`);
    return websiteURL;
  } catch (error) {
    console.error(`Failed to create and configure bucket: ${error.message}`);
    throw new Error("Failed to create and configure bucket.");
  }
};
const storeProjectDetails = async (username, websiteURL) => {
  const params = {
    TableName: 'ProjectURL',
    Item: {
      username: username,       
      URL: websiteURL,    
    },
  };
  console.log(`Storing details for username: ${username}, URL: ${websiteURL}`);

  try {
    const data = await dynamodb.put(params).promise();
    
  } catch (error) {
    console.error('Error storing data:', error);
  }
};


module.exports = {
  generateBucketName,
  createBucketAndEnableHosting,
  storeProjectDetails,
}
