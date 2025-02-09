import React from "react";
import { useRef } from "react";
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
// import CloudServiceCards from "./CloudServiceCards";
// import CloudCards from "./CloudCards";
import MyCloudCards from "./MyCloudCards";
import DeploymentPipeline from "./DeploymentPipeline";
import Features from "./Features";
import ResourcesDocumentation from "./ResourceDocumentation";

function App() {
  const servicesRef = useRef(null);

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="homepage">
      <header className="navbar">
        <div className="logo-container">
          <img src="logo.jpg" alt="Logo" className="logo" />
        </div>
        <nav>
          <ul className="nav-links">
            <li onClick={scrollToTop} style={{ cursor: "pointer" }}>Dashboard</li>
            <li onClick={scrollToServices} style={{ cursor: "pointer" }}>Services </li>
            <li>Pricing</li>
            <li>Support</li>
          </ul>
        </nav>
        <div className="nav-buttons">

          <button className="cta">Sign In</button>
        </div>
      </header>

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
          <div className="center-text" style={{ fontFamily: 'Poppins, sans-serif', textAlign: 'center' }}>
            <h1 style={{ fontSize: "60px", margin: "10px 0" }}>DeployVerse</h1>
            <p style={{ fontSize: "35px" }}>Where Code Meets Cloud</p>
            <div className="button-container">
              <button className="see-apps-btn">
                See in Action
                <span>
                  <img alt="Arrow" src="/expand_circle_right1.svg" />
                </span>
              </button>
              <button className="see-apps-btn" onClick={scrollToServices} style={{ cursor: "pointer" }}>
                Hosting Solutions
                <span>
                  <img alt="Arrow" src="/expand_circle_right1.svg" />
                </span>
              </button>
            </div>
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
        {/* <CloudServiceCards /> */}
        {/* <CloudCards /> */}
        <div ref={servicesRef}>
          <MyCloudCards />
        </div>
        <DeploymentPipeline />
        <Features />
        <ResourcesDocumentation />
      </main>
    </div>
  );
}

export default App;