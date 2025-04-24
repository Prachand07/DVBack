const cardData = [
    {
        title: "Static Hosting Pro",
        image: "Images/SimpleStorageService-bgr.png",
        description: "Fast, scalable hosting for your static sites.",
        features: [
            { icon: "Images/stocks.png", text: "Reliable hosting with minimal downtime" },
            { icon: "Images/lightning.png", text: "Lightning-fast page loads, ensuring seamless content delivery" },
            { icon: "Images/shield.png", text: "Robust Security with DDoS protection across globe." },
            { icon: "Images/scaling.png", style: { width: "50px", height: "50px" }, text: "Easy Scaling with support for parallel requests." }
        ]
    },

    {
        title: "EC2 DualHost",
        image: "Images/ec2-mongo.png",
        description: "Powering both frontend & backend on EC2.",
        features: [
            { icon: "Images/laptop.png", text: "Run your Frontend and Backend code at one place" },
            { icon: "Images/db.png", text: "Supports apps connected to MongoDB Atlas or other external services" },
            { icon: "Images/globe.png", text: "Get a public IP to access your hosted application" },
            { icon: "Images/tools.png", text: "No manual configurations—just upload and go!" }
        ]
    },
    {
        title: "Host-My-MERN",
        image: "Images/amplify-mongo.png",
        description: "Seamless hosting for logic and data layers.",
        features: [
            { icon: "Images/shield.png", text: "Built-in security measures for all layers" },
            { icon: "Images/link.png", text: "Connect seamlessly to your MongoDB Atlas database" },
            { icon: "Images/tools.png", text: "Preconfigured environments for a hassle-free exprience" },
            { icon: "Images/key.png", text: "Manage API and database credentials using environment variables" }
        ]
    }
];

const getCardClass = (title) => {
    if (title.includes("EC2")) return "ec2";
    if (title.includes("Static")) return "s3";
    if (title.includes("MERN")) return "amplify";
};

const cardsContainer = document.querySelector('.cards-container');

cardData.forEach((card) => {
    const cardElement = document.createElement('div');
    cardElement.className = `card ${getCardClass(card.title)}`;
    cardElement.title = card.title; // So we can access it easily in events

    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';
    cardHeader.innerHTML = `
        <h2>${card.title}</h2>
        <img src="${card.image}" alt="${card.title}">
    `;

    const description = document.createElement('p');
    description.textContent = card.description;

    const featuresContainer = document.createElement('div');
    card.features.forEach((feature) => {
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

   
    if (card.title.includes("Static") || card.title.includes("EC2")) {
        learnMore.innerHTML = `<a href="../Frontend/SignUp.html">Get Started →</a>`;
    } else {
        learnMore.textContent = "Coming Soon !!";
    }

    cardElement.addEventListener("click", () => {
        const selectedHosting = card.title;
        localStorage.setItem("selectedHosting", selectedHosting);

        if (selectedHosting.includes("Static") || selectedHosting.includes("EC2")) {
            learnMore.innerHTML = `<a href="../Frontend/SignUp.html">Get Started →</a>`;
        } else {
            learnMore.textContent = "Coming Soon !!";
        }

        console.log("Hosting type selected:", selectedHosting);
    });

    cardElement.appendChild(cardHeader);
    cardElement.appendChild(description);
    cardElement.appendChild(featuresContainer);
    cardElement.appendChild(learnMore);
    cardsContainer.appendChild(cardElement);
});