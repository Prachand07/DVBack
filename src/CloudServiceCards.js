import React from "react";
import "./CloudServiceCards.css";

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


export default CloudServiceCards;