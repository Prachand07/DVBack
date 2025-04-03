const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const connectDB = require("./db");
const jwt = require("jsonwebtoken");
const verifyToken = require("./authMiddleware");
const cookieParser = require("cookie-parser");
const User = require("./models/user");
const path = require("path");
const AdmZip = require('adm-zip');

const bcrypt = require("bcryptjs");
require("dotenv").config();

const { createEC2Instance, getPublicIP, bucketCreate, copyFromS3ToEC2 } = require("./ec2-aws-sdk");
const { generateBucketName, checkLimit, bucketCreateandhost, storeProjectDetails, } = require("./s3-aws-sdk");

const app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(require("cookie-parser")());
const upload = multer({
  storage: multer.memoryStorage(),
});

const validateZip = (buffer, frontend_name, backend_name, backend_file_name) => {
  try {
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries().map(entry => entry.entryName);

    const requiredFiles = [`${backend_file_name}`, 'package.json', `${frontend_name}/`, `${backend_name}/`];

    return requiredFiles.every(file => zipEntries.some(entry => entry.includes(file)));
  } catch (error) {
    console.error("Error processing ZIP file:", error);
    return false;
  }
};


app.get("/verify", (req, res) => {
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

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(`Signup attempt: ${name} - ${email}`);

    let user = await User.findOne({ email });
    console.log("User found:", user);
    if (user) return res.status(400).json({ message: "User already exists" });

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
      redirect: "../Frontend/S3hosting.html"
    });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



app.post("/signin", async (req, res) => {
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

app.post("/dynamicHosting", upload.single('zipFile'), async (req, res) => {
  const {frontend_name, backend_name, backend_file_name } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error(`Authorization token missing or invalid`);
    return res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  console.log(`Received token in uploadfolder: ${token}`);
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decoded);
  const user_name = decoded.username?.toLowerCase().trim().replace(/\s+/g, "");
  
  if (!frontend_name || !backend_name || !backend_file_name) {
    return res.status(400).json({ error: "Provide both frontend and backend names" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const isValid = validateZip(req.file.buffer, frontend_name, backend_name, backend_file_name);

  if (isValid) {
    try {
      const bucketName= await bucketCreate(user_name, req.file);
      
      const instanceId = await createEC2Instance(user_name);
      const publicIp = await getPublicIP(instanceId);
      
      console.log("Public IP: ", publicIp);

      try {

        console.log("Attempting to copy file to EC2 instance...");
        copyFromS3ToEC2(publicIp, bucketName, req.file.originalname, backend_file_name, backend_name, frontend_name);
        
      } catch (err) {
        console.error("Error copying file:", err);
        return res.status(500).json({ error: `Error copying file: ${err.message || err}` });
      }

      return res.status(200).json({ ip_address:publicIp });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ error: `Error transferring files: ${err.message || err}` });
    }
  } else {
    return res.status(400).json({ error: "ZIP file is missing required files or folders" });
  }
});




app.post("/upload-folder", upload.array("files", 30), async (req, res) => {
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
    const isLimitReached = await checkLimit(username);

    if (isLimitReached) {
      console.error(`User ${username} already has 3 projects. Denying request.`);
      return res.status(400).json({ message: "Maximum 3 projects allowed per user." });
    }

    const bucketName = generateBucketName(username);
    console.log(`Generated bucket name: ${bucketName}`);

    console.log(`Starting bucket creation and configuration for: ${bucketName}`);
    const websiteUrl = await bucketCreateandhost(bucketName, req.file.buffer, req.file.originalname);
    console.log(`Static website hosted successfully at: ${websiteUrl}`);

    const storedURL = await storeProjectDetails(username, projectname, websiteUrl);
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

const PORT = process.env.PORT || 8090;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});