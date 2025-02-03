import React from "react";
import "./App.css";

// Importing updated images from src/images
import cloudFront from "./images/CloudFront.png";
import cloudWatch from "./images/CloudWatch.png";
import docker from "./images/DockerSample2.png";
import dynamoDB from "./images/DynamoDB.png";
import ec2 from "./images/EC2.png";
import keyManagementService from "./images/Key Management Service.png";
import lambda from "./images/Lambda.png";
import simpleStorageService from "./images/Simple Storage Service.png";
import virtualPrivateCloud from "./images/Virtual Private Cloud.png";
import terraform from "./images/Terraform.png";

//importing other components
import CloudServiceCards from "./CloudServiceCards";
import DeploymentPipeline from "./DeploymentPipeline";
import Features from "./Features";
import ResourcesDocumentation from "./ResourceDocumentation";

function App() {
        return (
<div className="homepage">
{/* Navigation Bar */}
<header className="navbar">
  <nav>
    <ul className="nav-links">
      <li>Dashboard</li>
      <li>Documentation</li>
      <li>Pricing</li>
      <li>Support</li>
    </ul>
  </nav>

  <div className="nav-buttons">
    <button className="cta">Sign In</button>
  </div>
</header>

      {/* Main Content */}
      <main className="content">
        <div className="apps-section">
          <div className="side-logos left-side">
            <img src={ec2} alt="EC2" />
            <img src={docker} alt="Docker" />
            <img src={simpleStorageService} alt="Simple Storage Service" />
          </div>
          <div className="side-logos left-middle">
            <img src={cloudFront} alt="CloudFront" />
            <img src={cloudWatch} alt="CloudWatch" />
          </div>
          <div className="center-text">
            <h1>DeployVerse</h1>
            <p>Simplifying Cloud Deployments for Everyone</p>
            <button className="see-apps-btn">See in Action</button>
            <button className="see-apps-btn">See All Plans</button>
          </div>
          <div className="side-logos right-middle">
            <img src={dynamoDB} alt="DynamoDB" />
            <img src={lambda} alt="Lambda" />
          </div>
          <div className="side-logos right-side">
            <img src={keyManagementService} alt="Key Management Service" />
            <img src={terraform} alt="terraform" />
            <img src={virtualPrivateCloud} alt="VPC" />
          </div>
        </div>
        {/* Cloud Service Cards */}
        <CloudServiceCards />
        {/* Deployment Pipeline Section */}
        <DeploymentPipeline />
        {/* Everything you can Deploy Section */}
        <Features />
        {/* Resource Documentation section */}
        <ResourcesDocumentation />
      </main>
    </div>
  );
}

export default App;