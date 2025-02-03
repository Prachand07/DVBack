import React from "react";
import "./DeploymentPipeline.css"; // Make sure to include the updated CSS

import terminal_icon from "./images/terminal_icon.jpg";
import docker from "./images/DockerSample2.png";
import terraform from "./images/Terraform.png";
import cloudWatch from "./images/CloudWatch.png";
import terra from "./images/terra.png";
function DeploymentPipeline() {
  return (
    <div className="container">
      {/* Left section: Deployment Pipeline */}
      <div className="left-section">
        <h2 className="section-heading">
          <img src={terminal_icon} alt="Terminal Icon" className="heading-logo" />
          Deployment Pipeline
        </h2>
        
        {/* Apple-like Terminal */}
        <div className="terminal">
          <div className="terminal-header">
            <span className="close-btn"></span>
            <span className="minimize-btn"></span>
            <span className="maximize-btn"></span>
          </div>
          <div className="terminal-body">
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
                URL: <a href="https://my-app.deployverse.app" target="_blank" rel="noopener noreferrer">
                  https://my-app.deployverse.app
                </a>
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Right section: Features */}
      <div className="right-section">
        <h2 className="section-heading">
          Integrated with Your Workflow
        </h2>

        <div className="features-dp">
          {/* Docker Support */}
          <div className="feature-dp">
            <img src={docker} alt="Docker Logo" className="feature-logo" />
            <div className="feature-content">
              <strong>Docker Support:</strong>
              <p>Native Docker support with automated container orchestration and registry integration.</p>
            </div>
          </div>

          {/* Terraform Integration */}
          <div className="feature-dp">
            <img src={terra} alt="Terraform Logo" className="feature-logo" />
            <div className="feature-content">
              <strong>Terraform Integration:</strong>
              <p>Infrastructure as code with Terraform for consistent and version-controlled deployments.</p>
            </div>
          </div>

          {/* Cloud Monitoring */}
          <div className="feature-dp">
            <img src={cloudWatch} alt="CloudFront Logo" className="feature-logo" />
            <div className="feature-content">
              <strong>Cloud Monitoring:</strong>
              <p>Integrated with AWS CloudWatch for real-time monitoring and alerts.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeploymentPipeline;
