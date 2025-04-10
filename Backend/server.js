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
const redis = require('redis');
const bcrypt = require("bcryptjs");
require("dotenv").config();

const { createEC2Instance, getPublicIP, bucketCreate, copyFromS3ToEC2, storeDetails } = require("./ec2-aws-sdk");
const { generateBucketName, checkLimit, bucketCreateandhost, storeProjectDetails, } = require("./s3-aws-sdk");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(require("cookie-parser")());
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

const validateZip = (buffer, frontend_name, backend_name, backend_file_name, res) => {
  console.log('Validating ZIP file structure...');
  console.log('Received parameters from frontend:');
  console.log('frontend_name:', frontend_name);
  console.log('backend_name:', backend_name);
  console.log('backend_file_name:', backend_file_name);

  try {
    const allowedExtensions = [
      '.html', '.css', '.js', '.json', '.jpeg', '.jpg', '.png', '.gif', '.md', '.gitignore',
      '.ejs', '.svg', '.ts', '.tsx', '.jsx', '.env', '.mp4', '.mkv', '.csv', '/'
    ];
    const maxFileSize = 20 * 1024 * 1024;
    const zip = new AdmZip(buffer);

    const zipEntries = zip.getEntries();
    const entryNames = zipEntries
      .map(entry => entry.entryName)
      .filter(entry => !entry.includes('node_modules/'));

    const directories = new Set(
      zipEntries.filter(entry => entry.isDirectory).map(entry => {
        const parts = entry.entryName.split('/');
        return parts.length > 1
          ? parts.slice(1).join('/').replace(/\/$/, '')
          : entry.entryName.replace(/\/$/, '');
      })
    );

    const withoutRootDir = entryNames.map(entry => {
      const parts = entry.split('/');
      const normalized = parts.length > 1 ? parts.slice(1).join('/') : entry;
      return normalized.replace(/\/$/, '');
    }).filter(entry => entry);

    console.log('Filtered ZIP Entries (excluding node_modules):');
    console.log(entryNames);
    console.log('Normalized ZIP Entries:');
    console.log(withoutRootDir);

    const invalidFiles = [];
    const oversizedFiles = [];

    zipEntries.forEach(entry => {
      if (!entry.isDirectory && !entry.entryName.includes('node_modules/')) {
        const parts = entry.entryName.split('/');
        const normalized = parts.length > 1 ? parts.slice(1).join('/') : entry.entryName;

        const ext = path.extname(normalized).toLowerCase();
        const isHidden = normalized.startsWith('.');

        if (!allowedExtensions.includes(ext) && !isHidden) {
          invalidFiles.push(normalized);
        }

        if (entry.getData().length > maxFileSize) {
          oversizedFiles.push(normalized);
        }
      }
    });

    if (invalidFiles.length > 0) {
      console.log('Found invalid file types:', invalidFiles);
      const errorPayload = {
        success: false,
        errorType: 'invalidFiles',
        files: invalidFiles
      };
      if (res) return res.status(400).json(errorPayload);
      return errorPayload;
    }

    if (oversizedFiles.length > 0) {
      console.log('Found oversized files (>20MB):', oversizedFiles);
      const errorPayload = {
        success: false,
        errorType: 'oversizedFiles',
        files: oversizedFiles
      };

      if (res) return res.status(400).json(errorPayload);
      return errorPayload;
    }

    const hasFrontendIndex = withoutRootDir.includes(`${frontend_name}/index.html`);
    const hasBackendFile = withoutRootDir.includes(`${backend_name}/${backend_file_name}`);
    const hasFrontendFolder = withoutRootDir.some(entry => entry.startsWith(`${frontend_name}/`));
    const hasBackendFolder = withoutRootDir.some(entry => entry.startsWith(`${backend_name}/`));
    const hasPackageManifest =
      withoutRootDir.includes('package.json') ||
      withoutRootDir.includes('package-lock.json');

    console.log(`Checking for frontend index.html: ${hasFrontendIndex}`);
    console.log(`Checking for backend file: ${hasBackendFile}`);
    console.log(`Checking for frontend folder: ${hasFrontendFolder}`);
    console.log(`Checking for backend folder: ${hasBackendFolder}`);
    console.log(`Checking for package manifest (package.json or lock file): ${hasPackageManifest}`);

    const allValid =
      hasFrontendIndex &&
      hasBackendFile &&
      hasFrontendFolder &&
      hasBackendFolder &&
      hasPackageManifest;

    console.log('Validation result:', allValid);

    if (allValid) {
      return { success: true };
    } else {
      const errorPayload = {
        success: false,
        errorType: 'structureInvalid',
        message: 'Required structure is missing'
      };
      if (res) return res.status(400).json(errorPayload);
      return errorPayload;
    }

  } catch (error) {
    console.error("Error processing ZIP file:", error);
    const errorPayload = {
      success: false,
      errorType: 'exception',
      message: error.message
    };
    if (res) return res.status(500).json(errorPayload);
    return errorPayload;
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
      await copyFromS3ToEC2(publicIp, bucketName, req.file.originalname, backend_file_name, backend_name, frontend_name);
      await storeDetails(user_name, projectname, publicIp);
    } catch (err) {
      console.error("Error copying file:", err);
      return res.status(500).json({ error: `Deployment failed while copying files to EC2: ${err.message || err}` });
    }

    return res.status(200).json({ ip_address: publicIp });

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: `Deployment process failed: ${err.message || err}` });
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
    const websiteUrl = await bucketCreateandhost(bucketName, req.files);
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

app.get('/views', async (req, res) => {
  try {
    const views = await redisClient.incr('site:views');
    res.json({ views });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch views' });
  }
});

const PORT = process.env.PORT || 8090;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});