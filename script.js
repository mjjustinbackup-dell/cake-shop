document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    // Initialize navbar scroll effect
    initializeNavbar();
    
    // Initialize cake loading
    loadCakes();
    
    // Initialize filter functionality
    initializeFilters();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
}

function initializeNavbar() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function loadCakes() {
    const cakeGrid = document.getElementById('cake-grid');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    
    if (!cakeGrid) return;
    
    const repoOwner = 'mjjustinbackup-dell';
    const repoName = 'cake-shop';
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/cakes`;
    const whatsappNumber = '+31685655527';

    // Show loading state
    if (loadingState) loadingState.style.display = 'flex';
    if (cakeGrid) cakeGrid.innerHTML = '';

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch directory contents from GitHub API');
            }
            return response.json();
        })
        .then(data => {
            const cakeNames = data
                .filter(file => file.name.endsWith('.jpg'))
                .map(file => file.name.replace('.jpg', ''));

            if (cakeNames.length === 0) {
                showEmptyState();
                return;
            }

            // Load all cakes
            const cakePromises = cakeNames.map(cake => loadCakeData(cake, whatsappNumber));
            
            Promise.allSettled(cakePromises)
                .then(results => {
                    const successfulCakes = results
                        .filter(result => result.status === 'fulfilled')
                        .map(result => result.value);
                    
                    if (successfulCakes.length === 0) {
                        showEmptyState();
                    } else {
                        displayCakes(successfulCakes);
                    }
                })
                .catch(error => {
                    console.error('Error loading cakes:', error);
                    showErrorState();
                });
        })
        .catch(error => {
            console.error('Error fetching cake list:', error);
            showErrorState();
        });
}

function loadCakeData(cakeName, whatsappNumber) {
    return fetch(`cakes/${cakeName}.txt`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch ${cakeName}.txt`);
            }
            return response.text();
        })
        .then(text => {
            const lines = text.split('\n');
            const description = lines[0].replace('Description: ', '').trim();
            const price = lines[1].replace('Price: ', '').trim();
            
            return {
                name: cakeName,
                displayName: cakeName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                description: description,
                price: price,
                image: `cakes/${cakeName}.jpg`,
                whatsappUrl: `https://wa.me/${whatsappNumber}?text=I%20want%20to%20order%20the%20${cakeName.replace('-', '%20')}%20cake`,
                category: getCakeCategory(cakeName)
            };
        });
}

function getCakeCategory(cakeName) {
    const name = cakeName.toLowerCase();
    if (name.includes('birthday') || name.includes('party')) return 'birthday';
    if (name.includes('wedding') || name.includes('bridal')) return 'wedding';
    if (name.includes('special') || name.includes('custom')) return 'special';
    return 'all';
}

function displayCakes(cakes) {
    const cakeGrid = document.getElementById('cake-grid');
    const loadingState = document.getElementById('loading-state');
    
    if (loadingState) loadingState.style.display = 'none';
    
    cakeGrid.innerHTML = '';
    
    cakes.forEach((cake, index) => {
        const card = createCakeCard(cake, index);
        cakeGrid.appendChild(card);
    });
}

function createCakeCard(cake, index) {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6 mb-4';
    col.setAttribute('data-category', cake.category);
    
    col.innerHTML = `
        <div class="cake-card animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s">
            <div class="cake-badge">
                <i class="fas fa-star"></i>
                Premium
            </div>
            <img src="${cake.image}" class="cake-image" alt="${cake.displayName}" loading="lazy">
            <div class="cake-content">
                <h5 class="cake-title">${cake.displayName}</h5>
                <p class="cake-description">${cake.description}</p>
                <div class="cake-price">${cake.price}</div>
                <a href="${cake.whatsappUrl}" class="btn btn-primary w-100" target="_blank">
                    <i class="fab fa-whatsapp me-2"></i>
                    Order Now
                </a>
            </div>
        </div>
    `;
    
    return col;
}

function showEmptyState() {
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    
    if (loadingState) loadingState.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
}

function showErrorState() {
    const cakeGrid = document.getElementById('cake-grid');
    const loadingState = document.getElementById('loading-state');
    
    if (loadingState) loadingState.style.display = 'none';
    if (cakeGrid) {
        cakeGrid.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <h4>Unable to load cakes</h4>
                    <p>We're having trouble loading our cake collection. Please try again later or contact us directly.</p>
                    <a href="https://wa.me/31685655527" class="btn btn-success">
                        <i class="fab fa-whatsapp me-2"></i>
                        Contact Us
                    </a>
                </div>
            </div>
        `;
    }
}

function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cakeCards = document.querySelectorAll('[data-category]');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter cakes
            const filter = button.getAttribute('data-filter');
            filterCakes(filter);
        });
    });
}

function filterCakes(filter) {
    const cakeCards = document.querySelectorAll('[data-category]');
    
    cakeCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
            card.style.display = 'block';
            card.classList.add('animate__fadeInUp');
        } else {
            card.style.display = 'none';
            card.classList.remove('animate__fadeInUp');
        }
    });
}

function initializeSmoothScrolling() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__fadeInUp');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .cake-card, .image-card');
    animateElements.forEach(el => observer.observe(el));
});
