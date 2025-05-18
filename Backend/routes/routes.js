const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser"); // Note the capital 'R'
const multer = require("multer");
const jwt = require("jsonwebtoken");
const verifyToken = require("../authMiddleware");
const cookieParser = require("cookie-parser");
const User = require("../models/user");
const path = require("path");
const AdmZip = require('adm-zip');
const redis = require('redis');
const bcrypt = require("bcryptjs");

require("dotenv").config();
const { storeContactDetails } = require('../contactus-aws-sdk');
const { createEC2Instance, getPublicIP, bucketCreate, copyFromS3ToEC2, storeDetails } = require("../ec2-aws-sdk");
const { generateBucketName, checkLimit, bucketCreateandhost, storeProjectDetails, mapSubdomainToS3 } = require("../s3-aws-sdk");
const upload = multer({
  storage: multer.memoryStorage(),
});

router.get("/verify", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Support both methods

  console.log("Received Token:", token);
  if (!token) {
    return res.status(401).json({ valid: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ valid: true, user: decoded });
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(403).json({ valid: false, message: "Invalid or expired token" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(`Signup attempt: ${name} - ${email}`);

    const length = name.length;
    if (length > 30) {
      return res.status(400).json({ message: "Not valid Username" });
    }
    let user = await User.findOne({
      $or: [{ email }, { name }]
    });
    console.log("User found:", user);
    if (user) {
      return res.status(400).json({ message: "Email or Username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    console.log("Salt generated:", salt);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Hashed password:", hashedPassword);

    user = new User({ name, email, password: hashedPassword });
    await user.save();
    console.log("User saved successfully:", user);
    const token = jwt.sign(
      { userId: user._id, email: user.email, username: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(201).json({
      message: "Signup successful",
      token,

    });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post('/contact', async(req, res) => {
  const { name, email, message } = req.body;

  // Basic validation on server (you can enhance it more)
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  console.log('Received Contact Form Submission:', name, email, message);

  const result = await storeContactDetails(name, email, message);

  if (result.status === 'Success') {
    return res.status(200).json({ message: 'Message received and stored successfully!' });
  } else {
    return res.status(500).json({ error: 'Something went wrong while saving your message.' });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    // Generate JWT token with email
    const token = jwt.sign(
      { userId: user._id, email: user.email, username: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log(token);
    // Store token in HTTP-only cookie

    res.status(200).json({ message: "Login successful!", token });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/dynamicHosting", upload.single('zipFile'), async (req, res) => {
  const { backend_framework, frontend_framework, projectname, frontend_name, backend_name, backend_file_name } = req.body;
  console.log(frontend_framework);
  console.log(backend_framework);
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error(`Authorization token missing or invalid`);
    return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  console.log(`Received token in uploadfolder: ${token}`);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("JWT Verification failed:", err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }

  const user_name = decoded.username?.toLowerCase().trim().replace(/\s+/g, "");
  console.log(user_name);
  console.log(frontend_name + backend_name + backend_file_name);

  if (!frontend_name || !backend_name || !backend_file_name) {

    return res.status(400).json({ error: "Please provide frontend name, backend name, and backend file name." });
  }

  if (!req.file) {

    return res.status(400).json({ error: "No ZIP file uploaded. Please upload a valid project archive." });
  }

  const isValid = validateZip(req.file.buffer, frontend_name, backend_name, backend_file_name);
  console.log(isValid);

  if (!isValid || isValid.success === false) {

    if (isValid.errorType === "invalidFiles") {
      errorTitle = "Invalid File Type(s)";
      errorHtml = `The following files have unsupported extensions:<br><br><code>${isValid.files.join("</code><br><code>")}</code>`;
    } else if (isValid.errorType === "oversizedFiles") {
      errorTitle = "File(s) Too Large";
      errorHtml = `The following files exceed the 20MB limit:<br><br><code>${isValid.files.join("</code><br><code>")}</code>`;
    } else if (isValid.errorType === "structureInvalid") {
      errorTitle = "Invalid Project Structure";
      errorHtml = "Required folders or files are missing from the ZIP archive.";
    }

    return res.status(400).json({
      error: "Deployment Failed",
      errorType: isValid.errorType || "Something went wrong during deployment.",
      files: isValid.files || [],
    });
  }


  try {
    const bucketName = await bucketCreate(user_name, req.file);
    const instanceId = await createEC2Instance(user_name);
    const publicIp = await getPublicIP(instanceId);
    console.log("Public IP: ", publicIp);

    try {
      console.log("Attempting to copy file to EC2 instance...");
      const copyWithRetry = async (maxRetries = 5) => {
      let attempt = 1;
      while (attempt <= maxRetries) {
        console.log(`Attempt ${attempt}: Copying file to EC2 instance...`);
        try {
          const result = await copyFromS3ToEC2(publicIp, bucketName, req.file.originalname, backend_file_name, backend_name, frontend_name);

          if (result === "success") {
            console.log(`Copy successful on attempt ${attempt}`);
            return "success";
          }

          console.log(`Copy attempt ${attempt} failed. Retrying...`);
        } catch (err) {
          console.error(`Error on attempt ${attempt}:`, err.message || err);
        }

        attempt++;
        if (attempt <= maxRetries) {
          console.log(`Retrying in 3 seconds...`);
          await new Promise((resolve) => setTimeout(resolve, 10000));
        }
      }
      console.log("Max retries reached. Copy operation failed.");
      return "fail";
    };

    const copyStatus = await copyWithRetry();

    if (copyStatus === "fail") {
      return res.status(500).json({ error: "Deployment failed after multiple attempts to copy files to EC2." });
    }
     await storeDetails(user_name, projectname, publicIp);
    
    } 
    catch (err) {
      console.error("Error copying file:", err);
      return res.status(500).json({ error: `Deployment failed while copying files to EC2: ${err.message || err}` });
    }

    return res.status(200).json({ ip_address: publicIp });

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: `Deployment process failed: ${err.message || err}` });
  }
});

router.post("/upload-folder", upload.array("files", 30), async (req, res) => {
  console.log(`Received a request to upload files`);
  // Extract the token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error(`Authorization token missing or invalid`);
    return res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  console.log(`Received token in uploadfolder: ${token}`);
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decoded);
  const username = decoded.username?.toLowerCase().trim().replace(/\s+/g, "");
  console.log("Token username ", username);
  const projectname = req.body.projectname;
  console.log(projectname);
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

  try {
    console.log(`Checking if user ${username} already has 3 projects...`);
    const { isLimitReached, projectCount } = await checkLimit(username);

    if (isLimitReached) {
      console.error(`User ${username} already has 3 projects. Denying request.`);
      return res.status(400).json({ message: "Maximum 3 projects allowed per user." });
    }

    const bucketName = generateBucketName(username);
    console.log(`Generated bucket name: ${bucketName}`);

    console.log(`Starting bucket creation and configuration for: ${bucketName}`);
    const websiteUrl = await bucketCreateandhost(bucketName, req.files);
    console.log(`Static website hosted successfully at: ${websiteUrl}`);
    const MappedURL= await mapSubdomainToS3(projectname, projectCount, websiteUrl);
    console.log(`Mapped URL: ${MappedURL}`);
    const storedURL = await storeProjectDetails(username, projectname, MappedURL);
    console.log(`Website data stored successfully for username: ${username}`);
    
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

const getIP = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown-ip'
  );
};

router.get('/views', async (req, res) => {
  try {
    const ip = getIP(req);
    const uniqueKey = `site:unique:${ip}`;
    const alreadyCounted = await redisClient.exists(uniqueKey);

    let views;
    if (!alreadyCounted) {
      await redisClient.set(uniqueKey, 1, { EX: 60 * 60 * 24 }); // 1 day expiry
      views = await redisClient.incr('site:views');
    } else {
      views = await redisClient.get('site:views');
    }

    res.json({
      views: parseInt(views),
      unique: !alreadyCounted
    });

    console.log(`IP: ${ip}, Views: ${views}, Unique: ${!alreadyCounted}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch views' });
  }
});

module.exports = router;