const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
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

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true, 
  },
});
redisClient.on('error', (err) => console.error('Redis error:', err));

(async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Redis connection failed:', err);
  }
})();

router.get("/verify", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

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

    // Username length validation
    if (name.length > 30) {
      return res.status(400).json({ message: "Username must be less than or equal to 30 characters" });
    }

    // Username must start with a letter
    const usernameRegex = /^[a-zA-Z]/;
    if (!usernameRegex.test(name)) {
      return res.status(400).json({ message: "Username must start with a letter." });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@(gmail\.com|yahoo\.com|outlook\.com|stu\.upes\.ac\.in)$/i;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Only Gmail, Yahoo, Outlook, or student emails (domains starting with 'stu') are allowed."
      });
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
      });
    }

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { name }] });
    console.log("User found:", user);
    if (user) {
      return res.status(400).json({ message: "Email or Username already exists" });
    }

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    console.log("Salt generated:", salt);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Hashed password:", hashedPassword);

    // Create and save user
    user = new User({ name, email, password: hashedPassword });
    await user.save();
    console.log("User saved successfully:", user);

    // JWT Token creation
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

router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;
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

    const emailRegex = /^[^\s@]+@(gmail\.com|yahoo\.com|outlook\.com|stu\.upes\.ac\.in)$/i;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    // Basic field presence check
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Email must be from Gmail, Yahoo, Outlook, or a valid student domain",
      });
    }

    // Validate password strength
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long, with uppercase, lowercase, number, and special character (!@#$%^&*)",
      });
    }

    console.log("Login attempt:", email);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, username: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

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

router.post("/upload-folder", upload.array("files", 35), async (req, res) => {
  console.log("Received a request to upload files");

  // 1. Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("Authorization token missing or invalid");
    return res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }

  const username = decoded.username?.toLowerCase().trim().replace(/\s+/g, "");
  if (!username) {
    return res.status(400).json({ message: "Invalid token payload: username missing" });
  }
  console.log("Token username:", username);

  // 2. Validate request
  const rawProjectName = req.body.projectname;
  if (!rawProjectName) {
    return res.status(400).json({ message: "Project name is required" });
  }

  const projectname = rawProjectName.toLowerCase().trim().replace(/\s+/g, "");
  const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  if (!identifierRegex.test(projectname)) {
    return res.status(400).json({ message: "Project name is invalid" });
  }

  if (!req.files || req.files.length === 0) {
    console.error("No files uploaded");
    return res.status(400).json({ message: "No files uploaded" });
  }

  const validFileTypes = [
    "image/jpeg", "image/png", "image/jpg",
    "text/html", "text/css", "text/javascript", "application/javascript", "video/mp4",
    "video/x-matroska", "text/csv"
  ];
  const maxSize = 20 * 1024 * 1024; // 20MB

  // Validate each file
  for (const file of req.files) {
    if (!validFileTypes.includes(file.mimetype)) {
      return res.status(400).json({ message: `Invalid file type: ${file.originalname}` });
    }
    if (file.size > maxSize) {
      return res.status(400).json({ message: `File too large: ${file.originalname}` });
    }
  }

  const hasIndexHtml = req.files.some(file => file.originalname === "index.html");
  if (!hasIndexHtml) {
    console.error("index.html is missing");
    return res.status(400).json({ message: "index.html is required to host a static website" });
  }

  try {
    console.log(`Checking if user ${username} already has 3 projects...`);
    const { isLimitReached, randomId } = await checkLimit(username);

    if (isLimitReached) {
      console.error(`User ${username} already has 3 projects`);
      return res.status(400).json({ message: "Maximum 3 projects allowed per user." });
    }

    const bucketName = generateBucketName(projectname, randomId);
    console.log(`Generated bucket name: ${bucketName}`);

    console.log(`Starting bucket creation and configuration...`);
    const websiteUrl = await bucketCreateandhost(bucketName, req.files);
    console.log(`Static website hosted successfully at: ${websiteUrl}`);

    const mappedURL = await mapSubdomainToS3(projectname, randomId, websiteUrl);
    console.log(`Mapped URL: ${mappedURL}`);

    const storedURL = await storeProjectDetails(username, projectname, mappedURL);
    console.log(`Website data stored successfully for username: ${username}`);

    return res.json({
      status: "Success",
      message: `Static website hosted successfully at: ${mappedURL}`,
      storedURL: storedURL,
    });
  } catch (error) {
    console.error("Failed to process request:", error.message);
    return res.status(500).json({
      status: "Failed",
      message: error.message || "Internal server error",
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

const isPrivateIP = (ip) => {
  return (
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)
  );
};

router.get('/views', async (req, res) => {
  try {
    const ip = getIP(req);
    if (isPrivateIP(ip)) {
      return res.json({
        views: parseInt(await redisClient.get('site:views') || 0),
        unique: false
      });
    }

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