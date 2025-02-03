import React from "react";
import "./ResourcesDocumentation.css";

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

  export default ResourcesDocumentation;