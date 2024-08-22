const questions = [
    {
        question: "First move?",
        options: ["You", "Them"],
        key: "confession"
    },
    {
        question: "Ideal first date?",
        options: ["Arcade", "Cafe", "Cinema", "Park", "I don't care"],
        key: "first_date"
    },
    {
        question: "Feel most loved?",
        options: ["getting headpats", "Sharing an ice-cream cone", "Raiding a castle", "Defends you with their life"],
        key: "most_loved"
    },
    {
        question: "Biggest turnoff?",
        options: ["Possessive", "Pretentious", "Optimistic", "Pessimistic"],
        key: "turn_off"
    },
    {
        question: "Ideal arm wrestling outcome?",
        options: ["Lose on purpose", "Easy win", "Close match", "Tactical", "Complete loss"],
        key: "physique"
    },
    {
        question: "Partner's crime?",
        options: ["Murder", "Falsely accused", "Something stupid", "Arrested for a good cause"],
        key: "crime"
    },
];

let currentQuestionIndex = 0;
const userPreferences = {};

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('get-started-button').style.display = 'none';
    displayQuestion(currentQuestionIndex);
});

function displayQuestion(index) {
    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = '';

    if (index >= questions.length) {
        findMatch();
        return;
    }

    const question = questions[index];
    const questionElement = document.createElement('div');
    questionElement.innerHTML = `<h3 class="highlighted-question">${question.question}</h3>`;

    question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => {
            userPreferences[question.key] = option.toLowerCase();
            currentQuestionIndex++;
            displayQuestion(currentQuestionIndex);
        };
        questionElement.appendChild(button);
    });

    if (index > 0) {
        const backButton = document.createElement('button');
        backButton.textContent = "Back";
        backButton.onclick = () => {
            currentQuestionIndex--;
            displayQuestion(currentQuestionIndex);
        };
        questionElement.appendChild(backButton);
    }

    questionContainer.appendChild(questionElement);
}


document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    const image = urlParams.get('image');

    if (name && image) {
        updateOGImage(image); // Update the OG image meta tag
        displayResult(name, image);
    } else {
        // Initialize the questions or call findMatch() when appropriate
        // Here you might want to start the quiz or load the questions
    }
});

function findMatch() {
    fetch('https://animebaeradar.freewebhostmost.com/findMatch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userPreferences)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.name && data.image) {
            // Update the URL to reflect the result
            const resultUrl = `${window.location.origin}/assets/questions.html?name=${encodeURIComponent(data.name)}&image=${encodeURIComponent(data.image)}`;
            history.replaceState(null, '', resultUrl);

            updateOGImage(data.image); // Update the OG image meta tag
            displayResult(data.name, data.image);
        } else {
            document.getElementById('question-container').innerHTML = `<h3>No match found</h3>`;
        }
    })
    .catch(error => {
        console.error('Error fetching character data:', error);
        document.getElementById('question-container').innerHTML = `<h3>Sorry, an error occurred. Please try again later.</h3>`;
    });
}

function displayResult(name, image) {
    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = `
        <div style="text-align: center;">
            <img src="${image}" alt="${name}" style="max-width: 100%; height: auto;">
            <h3 style="margin-top: 10px;">Your match is ${name}!</h3>
            <button id="share-button">Share your match</button>
            <p class="share-warning">When sharing your results, please ensure your friend copies the full link and pastes it into their browser..</p>
        </div>
    `;

    const shareButton = document.getElementById('share-button');
    if (navigator.share) {
        shareButton.addEventListener('click', () => {
            navigator.share({
                title: `My Anime Match is `,
                text: `Check out my anime match: `,
                url: window.location.href,  // Share the current page URL
            }).then(() => {
                console.log('Thanks for sharing!');
            }).catch(console.error);
        });
    } else {
        shareButton.style.display = 'none';
    }
}


function updateOGImage(imageUrl) {
    let ogImageTag = document.querySelector('meta[property="og:image"]');
    if (ogImageTag) {
        ogImageTag.setAttribute('content', imageUrl);
    } else {
        ogImageTag = document.createElement('meta');
        ogImageTag.setAttribute('property', 'og:image');
        ogImageTag.setAttribute('content', imageUrl);
        document.head.appendChild(ogImageTag);
    }
}
