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
const myrouter=require('./routes/routes')
require("dotenv").config();
const { storeContactDetails } = require('./contactus-aws-sdk');
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
    withoutRootDir.includes('package-lock.json') ||
    withoutRootDir.includes(`${backend_name}/package.json`) ||
    withoutRootDir.includes(`${backend_name}/package-lock.json`);
  

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
app.use('/api', myrouter);

const PORT = process.env.PORT || 8090;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});