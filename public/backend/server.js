const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
require("dotenv").config();

const { generateBucketName, createBucketAndEnableHosting, storeProjectDetails } = require("./awsConfig");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const upload = multer({
  storage: multer.memoryStorage(),
});



app.post("/upload-folder", upload.array("files", 30), async (req, res) => {
  console.log(`Received a request to upload files`);

  let username = req.body.username;
  username = username.toLowerCase();
  console.log(username);
  if (!req.files || req.files.length === 0) {
    console.error(`No files uploaded`);
    return res.status(400).json({ message: "No files uploaded" });
  }
  
  console.log(`Number of files received: ${req.files.length}`);
  req.files.forEach((file, index) => {
    console.log(`File ${index + 1}: ${file.originalname}, Size: ${file.size} bytes`);
  });

  const hasIndexHtml = req.files.some(file => file.originalname === "index.html");
  if (!hasIndexHtml) {
    console.error(`index.html is missing`);
    return res.status(400).json({ message: "index.html is required to host a static website" });
  }

  const bucketName = generateBucketName(username);
  console.log(`Generated bucket name: ${bucketName}`);

  try {

    console.log(`Starting bucket creation and configuration process for: ${bucketName}`);
    const websiteUrl = await createBucketAndEnableHosting(bucketName, req.files);
    console.log(`Static website hosted successfully at: ${websiteUrl}`);
    const storedURL = await storeProjectDetails(username, websiteUrl);
    console.log(`Website Data stored successfully for username: ${username}`);
    res.json({
      status: "Success",
      message: `Static website hosted successfully at: ${websiteUrl}`,
      storedURL: storedURL,
    });
  } catch (error) {
    console.error(`Failed to process request: ${error.message}`);
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }

});

const PORT = process.env.PORT || 8090;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
