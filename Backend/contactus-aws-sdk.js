const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-north-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

const storeContactDetails = async (name, email, message) => {
  try {
    const params = {
      TableName: 'ContactFormDetails',
      Item: {
        name: name,
        email: email,
        message: message,
        timestamp: new Date().toISOString(),
      },
    };

    console.log(`Storing contact form data: ${name}, ${email}`);
    await dynamodb.put(params).promise();
    return { status: 'Success', message: 'Contact form stored successfully.' };
  } catch (error) {
    console.error('Error storing contact form data:', error);
    return { status: 'Failed', message: 'Error storing contact form data.' };
  }
};

module.exports = { storeContactDetails };
