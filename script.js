document.addEventListener('DOMContentLoaded', () => {
    const cakeGrid = document.getElementById('cake-grid');
    const repoOwner = 'mjjustinbackup-dell'; // Replace with your GitHub username
    const repoName = 'cake-shop'; // Replace with your repository name
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/cakes`;

    const whatsappNumber = '+31685655527'; // Replace with your WhatsApp number (e.g., '15551234567')

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch directory contents from GitHub API');
            }
            return response.json();
        })
        .then(data => {
            // Get all .jpg files and extract base names (without .jpg)
            const cakeNames = data
                .filter(file => file.name.endsWith('.jpg'))
                .map(file => file.name.replace('.jpg', ''));

            // For each cake, fetch its .txt and build the card
            cakeNames.forEach(cake => {
                fetch(`cakes/${cake}.txt`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to fetch ${cake}.txt`);
                        }
                        return response.text();
                    })
                    .then(text => {
                        const lines = text.split('\n');
                        const description = lines[0].replace('Description: ', '').trim();
                        const price = lines[1].replace('Price: ', '').trim();

                        const card = document.createElement('div');
                        card.className = 'col-md-4 mb-4';
                        card.innerHTML = `
                            <div class="card">
                                <img src="cakes/${cake}.jpg" class="card-img-top" alt="${cake}">
                                <div class="card-body">
                                    <h5 class="card-title">${cake.replace('-', ' ').toUpperCase()}</h5>
                                    <p class="card-text">${description}</p>
                                    <p class="card-text"><strong>${price}</strong></p>
                                    <a href="https://wa.me/${whatsappNumber}?text=I%20want%20to%20order%20the%20${cake.replace('-', '%20')}%20cake" class="btn btn-primary">Order Now</a>
                                </div>
                            </div>
                        `;
                        cakeGrid.appendChild(card);
                    })
                    .catch(error => console.error(`Error loading data for ${cake}:`, error));
            });
        })
        .catch(error => {
            console.error('Error fetching cake list:', error);
            // Optional: Show an error message on the page
            cakeGrid.innerHTML = '<p class="text-danger">Unable to load cakes. Please try again later.</p>';
        });
});
