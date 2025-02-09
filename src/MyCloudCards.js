import React from 'react';
import './NewCards.css';
import S3 from "./images/SimpleStorageService-bgr.png";
import laptop from './images/laptop.png';
import lightning from './images/lightning.png';
import globe from './images/globe.png';
import tools from './images/tools.png';
import shield from './images/shield.png';
import stocks from './images/stocks.png';
import scaling from './images/scaling.png';
import EC2 from './images/ec2-nbgr.png';
import rdecnbr from './images/rdec-nbr.png';
import link from './images/link.png';
import backup from './images/backup.png'
const MyCloudCards = () => {
  const cardData = [
    {
      title: "Static Hosting Pro",
      image: S3,
      description: "Fast, scalable hosting for your static sites.",
      features: [
        { icon: <img src={stocks} style={{ width: "50px", height: "50px" }} />, text: "Reliable hosting with minimal downtime" },
        { icon: <img src={lightning} />, text: "Lightning-fast page loads,ensuring seamless content delivery" },
        { icon: <img src={shield} />, text: "Robust Security with DDoS protection." },
        { icon: <img src={scaling} style={{ width: "45px", height: "45px" }} />, text: "Easy Scaling with support for parallel requests." }
      ]
    },
    {
      title: "EC2 DualHost",
      image: EC2,
      description: "Powering both frontend & backend on EC2.",
      features: [
        { icon: <img src={laptop} style={{ width: "50px", height: "50px" }} />, text: "Run your Frontend and Backend code at one place" },
        { icon: <img src={lightning} />, text: "Seamless, high-speed, and dependable execution on EC2 " },
        { icon: <img src={globe} />, text: "Get a public IP to access your hosted application" },
        { icon: <img src={tools} />, text: "No manual configurations—just upload and go!" }

      ]
    },
    {
      title: "All-in-One Deploy",
      image: rdecnbr,
      description: "Seamless hosting for logic and data layers.",
      features: [
        { icon: <img src={shield} />, text: "Built-in security measures for all layers" },
        { icon: <img src={link} />, text: " Host your application logic on EC2 with MySQL RDS support" },
        { icon: <img src={tools} />, text: "Preconfigured environments for a hassle-free exprience" },
        { icon: <img src={backup} />, text: " MySQL comes with automated backups and point-in-time recovery" }
      ]

    }
  ];


  const getCardClass = (title) => {
    if (title.includes("EC2")) return "ec2";
    if (title.includes("Static")) return "s3";
    if (title.includes("All")) return "rds";
  };

  return (
    <div className="cards-container">
      {cardData.map((card, index) => (
        <div className={`card ${getCardClass(card.title)}`} key={index}>
          <div className="card-header">
            <h2>{card.title}</h2>
            <img src={card.image} />
          </div>
          <p>{card.description}</p>
          {card.features.map((feature, i) => (
            <div className="feature" key={i}>
              {typeof feature.icon === "string" ? (
                <img src={feature.icon} alt="icon" className="icon-class" />
              ) : (
                feature.icon
              )}
              <p>{feature.text}</p>
            </div>
          ))}

          <div className="learn-more">
            {card.title.includes("Static") ? (
              <a href="/backend/backend.html">Get Started →</a>
            ) : (
              "Coming Soon !!"
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyCloudCards;
