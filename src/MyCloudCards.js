import React from 'react';
import './NewCards.css'; 
import S3 from "./images/SimpleStorageService-bgr.png";

const MyCloudCards = () => {
  const cardData = [
    {
      title: "Static Hosting Pro",
      image: S3,
      description: "Fast, secure, and scalable S3 hosting for your static sites.",
      features: [
        { icon: "https://cdn.prod.website-files.com/636a6f81a287f5628189d717/63766ece935510459098998d_ic_payments.svg", text: "Reliable hosting with minimal downtime." },
        { icon: "https://cdn.prod.website-files.com/636a6f81a287f5628189d717/63766ecdc6f0982b8aba2e36_Exclude.svg", text: "Lightning-fast page loads." },
        { icon: "https://cdn.prod.website-files.com/636a6f81a287f5628189d717/63766ecd44af8ece61b6a077_ic_interest.svg", text: "Robust Security - Free SSL and DDoS protection." },
        { icon: "https://cdn.prod.website-files.com/636a6f81a287f5628189d717/63766ecd6e21052c736683fe_ic_leap_nav.svg", text: "Easy Scaling - Host small projects or scale to millions." }
      ]
    },
    {
      title: "Cloud Backup Plus",
      image: S3,
      description: "Automated backups with high durability and fast recovery.",
      features: [
        { icon: "https://cdn.prod.website-files.com/636a6f81a287f5628189d717/63766ece935510459098998d_ic_payments.svg", text: "Durable Storage - 99.999999999% durability." },
        { icon: "https://cdn.prod.website-files.com/636a6f81a287f5628189d717/63766ecdc6f0982b8aba2e36_Exclude.svg", text: "Fast Recovery - Instant access to stored data." },
        { icon: "https://cdn.prod.website-files.com/636a6f81a287f5628189d717/63766ecd44af8ece61b6a077_ic_interest.svg", text: "Secure Encryption - End-to-end encryption for all files." },
        { icon: "https://cdn.prod.website-files.com/636a6f81a287f5628189d717/63766ecd6e21052c736683fe_ic_leap_nav.svg", text: "Flexible Pricing - Pay only for what you use." }
      ]
    },
    {
      title: "Content Delivery Edge",
      image: S3,
      description: "Global edge caching for optimized content delivery.",
      features: [
        { icon: "https://cdn.prod.website-files.com/636a6f81a287f5628189d717/63766ece935510459098998d_ic_payments.svg", text: "Ultra-low Latency - Serve content from the nearest node" },
        { icon: "https://cdn.prod.website-files.com/636a6f81a287f5628189d717/63766ecdc6f0982b8aba2e36_Exclude.svg", text: "Multi-Region Support - Content replication for reliability." },
        { icon: "https://cdn.prod.website-files.com/636a6f81a287f5628189d717/63766ecd44af8ece61b6a077_ic_interest.svg", text: "Adaptive Streaming - Seamless video delivery." },
        { icon: "https://cdn.prod.website-files.com/636a6f81a287f5628189d717/63766ecd6e21052c736683fe_ic_leap_nav.svg", text: "Scalable - Handle any traffic surge effortlessly." }
      ]
    }
  ];

  return (
    <div className="cards-container">
      {cardData.map((card, index) => (
        <div className="card" key={index}>
          <div className="change-color">
            <div className="card-header">
              <h2>{card.title}</h2>
              <img src={card.image} alt="Bucket Image" />
            </div>
          </div>
          <p>{card.description}</p>
          {card.features.map((feature, i) => (
            <div className="feature" key={i}>
              <img src={feature.icon} alt="Feature Icon" />
              <p><strong>{feature.text.split(" . ")[0]}</strong>  {feature.text.split(" . ")[1]}</p>
            </div>
          ))}
          <div className="learn-more">Get Started →</div>
        </div>
      ))}
    </div>
  );
};

export default MyCloudCards;
