const cardData = [
    {
        title: "Static Hosting Pro",
        image: "../images/SimpleStorageService-bgr.png",
        description: "Fast, scalable hosting for your static sites.",
        features: [
            { icon: "../images/stocks.png",  text: "Reliable hosting with minimal downtime" },
            { icon: "../images/lightning.png", text: "Lightning-fast page loads, ensuring seamless content delivery" },
            { icon: "../images/shield.png", text: "Robust Security with SSL and DDoS protection." },
            { icon: "../images/scaling.png",style: { width: "50px", height: "50px" },  text: "Easy Scaling with support for parallel requests." }
        ]
    },

    {
        title: "EC2 DualHost",
        image: "../images/ec2-nbgr.png",
        description: "Powering both frontend & backend on EC2.",
        features: [
            { icon: "../images/laptop.png",  text: "Run your Frontend and Backend code at one place" },
            { icon: "../images/lightning.png", text: "Seamless, high-speed, and dependable execution on EC2 " },
            { icon: "../images/globe.png", text: "Get a public IP to access your hosted application" },
            { icon: "../images/tools.png", text: "No manual configurations—just upload and go!" }
        ]
    },
    {
        title: "All-in-One Deploy",
        image: "../images/rdec-nbr.png",
        description: "Seamless hosting for logic and data layers.",
        features: [
            { icon: "../images/shield.png", text: "Built-in security measures for all layers" },
            { icon: "../images/link.png", text: " Host your application logic on EC2 with MySQL RDS support" },
            { icon: "../images/tools.png", text: "Preconfigured environments for a hassle-free exprience" },
            { icon: "../images/backup.png", text: " MySQL comes with automated backups and point-in-time recovery" }
        ]
    }
];

const getCardClass = (title) => {
    if (title.includes("EC2")) return "ec2";
    if (title.includes("Static")) return "s3";
    if (title.includes("All")) return "rds";
};

const cardsContainer = document.querySelector('.cards-container');

cardData.forEach((card, index) => {
    const cardElement = document.createElement('div');
    cardElement.className = `card ${getCardClass(card.title)}`;

    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';
    cardHeader.innerHTML = `
        <h2>${card.title}</h2>
        <img src="${card.image}" alt="${card.title}">
    `;

    const description = document.createElement('p');
    description.textContent = card.description;

    const featuresContainer = document.createElement('div');
    card.features.forEach((feature, i) => {
        const featureElement = document.createElement('div');
        featureElement.className = 'feature';
        featureElement.innerHTML = `
            <img src="${feature.icon}" alt="icon" class="icon-class">
            <p>${feature.text}</p>
        `;
        featuresContainer.appendChild(featureElement);
    });

    const learnMore = document.createElement('div');
    learnMore.className = 'learn-more';
    if (card.title.includes("Static")) {
        learnMore.innerHTML = `<a href="./SignUp.html">Get Started →</a>`;
    } else {
        learnMore.textContent = "Coming Soon !!";
    }

    cardElement.appendChild(cardHeader);
    cardElement.appendChild(description);
    cardElement.appendChild(featuresContainer);
    cardElement.appendChild(learnMore);

    cardsContainer.appendChild(cardElement);
});