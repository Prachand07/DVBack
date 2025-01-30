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
import cloudVideo from "./images/cloud.mp4";
import terminal_icon from "./images/terminal_icon.png"
import git from "./images/git.png"

const CloudServiceCards = () => {
  const services = [
    {
      title: "EC2",
      tagline: "Elastic Cloud Compute",
      description: "Scalable computing capacity in the Amazon Web Services cloud",
      features: ["Auto-scaling capacity", "Pay-as-you-go pricing", "Global deployment"],
    },
    {
      title: "S3",
      tagline: "Simple Storage Service",
      description: "Object storage built to store and retrieve any amount of data",
      features: ["Unlimited scalability", "99.999999999% durability", "Advanced security"],
    },
    {
      title: "VPC",
      tagline: "Virtual Private Cloud",
      description: "Provision a logically isolated section of the AWS Cloud",
      features: ["Custom network control", "Enhanced security", "Flexible configuration"],
    }
  ];

  return (
    <section className="cloud-services">
      <h2 className="section-title">Our Core Services</h2>
      <div className="cards-container">
        {services.map((service) => (
          <div key={service.title} className="flip-card-wrapper">
            <div className="flip-card">
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <div className="card-content">
                    <h3 className="service-title">{service.title}</h3>
                    <p className="service-tagline">{service.tagline}</p>
                  </div>
                </div>
                <div className="flip-card-back">
                  <div className="card-content">
                    <h3>{service.title}</h3>
                    <p className="description">{service.description}</p>
                    <div className="features">
                      {service.features.map((feature, index) => (
                        <div key={index} className="feature-item">
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
function DeploymentPipeline() {
  return (
    <div className="container">
      {/* Left section: Deployment Pipeline */}
      <div className="left-section">
        <h2 className="heading">
          <img src={terminal_icon} alt="CloudFront Logo" className="logo" />
          Deployment Pipeline
        </h2>
        <div className="terminal-box">
          <pre>
            <code>
              $ deployverse init my-app<br />
              $ cd my-app<br />
              $ deployverse deploy --prod<br />
              <br />
              ✓ Building application<br />
              ✓ Provisioning AWS resources<br />
              ✓ Deploying to production<br />
              ✓ SSL certificate issued<br />
              ✓ Domain configured<br />
              <br />
              Deployment complete!<br />
              URL: <a href="https://my-app.deployverse.app" target="_blank" rel="noopener noreferrer">https://my-app.deployverse.app</a>
            </code>
          </pre>
        </div>
      </div>

      {/* Right section: Features */}
      <div className="right-section">
        <h3>Integrated with Your Workflow</h3>
        <ul className="features">
          <li>
            <img src={docker} alt="Docker Logo" style={{ width: "40px", height: "auto", borderRadius: "50%", objectFit: "cover", marginRight: "60px" }} />
            <strong> Docker Support:</strong> Native Docker support with automated container orchestration and registry integration.
          </li>
          <li>
            <img src={terraform} alt="Terraform logo" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", marginRight: "60px" }} />
            <strong> Terraform Integration:</strong> Infrastructure as code with Terraform for consistent and version-controlled deployments.
          </li>
          <li>
            <img src={cloudFront} alt="cloudFront logo" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", marginRight: "60px" }} />
            <strong> Cloud Monitoring:</strong> Integrated with AWS CloudWatch for real-time monitoring and alerts.
          </li>
        </ul>
      </div>
    </div>
  );
}
const Features = () => {
  const features = [
    {
      icon: ec2, // Replace with the actual path to your image/icon
      title: "EC2 Hosting",
      description: "Scalable compute capacity in the AWS Cloud",
    },
    {
      icon: ec2, // Replace with the actual path to your image/icon
      title: "Auto Scaling",
      description: "Automatically adjust capacity to maintain performance",
    },
    {
      icon: virtualPrivateCloud, // Replace with the actual path to your image/icon
      title: "CDN Integration",
      description: "Global content delivery with low latency",
    },
    {
      icon: ec2, // Replace with the actual path to your image/icon
      title: "SSL Certificates",
      description: "Secure your applications with free SSL",
    },
    {
      icon: ec2, // Replace with the actual path to your image/icon
      title: "Custom Domains",
      description: "Use your own domain name for deployments",
    },
    {
      icon: git, // Replace with the actual path to your image/icon
      title: "Git Integration",
      description: "Deploy directly from your Git repository",
    },
  ];

  return (
    <div className="features-container">
      <h1 className="features-heading">Everything You Need to Deploy</h1>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <img src={feature.icon} alt={feature.title} className="feature-icon" />
            <h2 className="feature-title">{feature.title}</h2>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
const ResourcesDocumentation = () => {
  return (
    <div className="container-rsd">
      <h1 className="title-rsd">Resources & Documentation</h1>
      <div className="cards-rsd">
        {/* Documentation Card */}
        <div className="card-rsd">
          <div className="card-header-rsd">
            <div className="icon green">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon-svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16h8M8 12h8m-7-4h7M5 8a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"
                />
              </svg>
            </div>
            <h2 className="card-title-rsd">Documentation</h2>
          </div>
          <p className="card-text-rsd">
            Comprehensive guides and API documentation to help you get started quickly.
          </p>
          <button className="button green-rsd">View Docs</button>
        </div>

        {/* Support Card */}
        <div className="card-rsd">
          <div className="card-header-rsd">
            <div className="icon purple">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon-svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 5.636a9 9 0 11-12.728 0M15 10v4m-6-4v4m3-2v2m0 4h.01"
                />
              </svg>
            </div>
            <h2 className="card-title-rsd">Support</h2>
          </div>
          <p className="card-text-rsd">
            Get help from our team of AWS experts and the community.
          </p>
          <button className="button purple rsd">Get Support</button>
        </div>
      </div>
    </div>
  );
}
function App() {
  return (
    <div className="homepage">
      {/* Navigation Bar */}
      <header className="navbar">
        <div className="logo">DV</div>
        <nav>
          <ul className="nav-links">
            <li>Features</li>
            <li>Small Businesses</li>
            <li>Accountants</li>
            <li>Resources</li>
            <li>Pricing</li>
            <li>Contact Us</li>
          </ul>
        </nav>
        <div className="nav-buttons">
          <button className="login">Login</button>
          <button className="cta">Buy Now</button>
          <a href="/backend/backend.html">
            <button className="cta">Try It Free</button>
          </a>

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

        {/* Video Section */}
        <div className="video-section">
          <div className="video-content">
            <video className="cloud-video" controls>
              <source src={cloudVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="video-text">
            <h2>See DeployVerse in Action</h2>
            <p>Experience seamless cloud deployments with minimal configuration.</p>
            <p>Effortless automation of infrastructure setup and management.</p>
            <p>Designed for both beginners and experienced cloud users.</p>
          </div>
        </div>

        {/* Cloud Service Cards */}
        <CloudServiceCards />
        {/* Deployment Pipeline Section */}
        <div>
          <DeploymentPipeline />
        </div>
        <div>
          <Features />
        </div>
        <div>
          <ResourcesDocumentation />
        </div>
      </main>
    </div>
  );
}

export default App;
