import react from 'react';
import './Cards.css'; 
import S3 from "./images/SimpleStorageService-bgr.png";

const CloudCards = () => {
  return (
    <div className="card">
      <div className="change-color">
        <div className="card-header">
          <h2>Static Hosting Pro</h2>
          <img src={S3} alt="Bucket Image" />
        </div>
      </div>
      <p>Fast, secure, and scalable S3 hosting for your static sites.</p>

      <div className="feature">
        <img
          src="https://cdn.prod.website-files.com/636a6f81a287f5628189d717/63766ece935510459098998d_ic_payments.svg"
          alt="Uptime"
        />
        <p>
          <strong>99.99% Uptime</strong> - Reliable hosting with minimal downtime.
        </p>
      </div>

      <div className="feature">
        <img
          src="https://cdn.prod.website-files.com/636a6f81a287f5628189d717/63766ecdc6f0982b8aba2e36_Exclude.svg"
          alt="Speed"/>
        <p>
          <strong>Blazing Fast</strong> - Global CDN ensures lightning-fast page loads.
        </p>
      </div>

      <div className="feature">
        <img
          src="https://cdn.prod.website-files.com/636a6f81a287f5628189d717/63766ecd44af8ece61b6a077_ic_interest.svg"
          alt="Security"
        />
        <p>
          <strong>Robust Security</strong> - Free SSL and DDoS protection.
        </p>
      </div>

      <div className="feature">
        <img
          src="https://cdn.prod.website-files.com/636a6f81a287f5628189d717/63766ecd6e21052c736683fe_ic_leap_nav.svg"
          alt="Scaling"
        />
        <p>
          <strong>Easy Scaling</strong> - Host small projects or scale to millions.
        </p>
      </div>

      <div className="learn-more">Get Started →</div>
    </div>
  );
};

export default CloudCards;