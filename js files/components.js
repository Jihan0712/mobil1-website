const customArrowSVG = `
<svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 6H14.3333M9.33333 11L14.3333 6L9.33333 1" stroke="#001450" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const myHeader = `
    <header>
        <div class="logo-container">
            <a href="homepage.html">
                <img src="../assets/mobil-logo.png" alt="Mobil Logo">
            </a>
            <span class="logo-divider">|</span>
            <img src="../assets/allied-logo.png" alt="Allied Lubrication">
        </div>
        
        <div class="menu-toggle">
            <svg width="24" height="24" viewBox="120 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M124 7H140M124 12H140M124 17H140" stroke="#001450" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        
        <nav class="desktop-nav">
            <ul>
                <!-- Dropdown Parent Item -->
                <li class="nav-dropdown">
                    <a href="#" class="dropdown-trigger">Products 
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.75 0.75L5.75 6.75L10.75 0.75" stroke="#001450" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    </a>
                    
                    <!-- Dropdown Menu -->
                    <div class="dropdown-menu">
                        <div class="dropdown-header">Browse by product type</div>
                        <div class="dropdown-divider"></div>
                        <ul class="dropdown-list">
                            <li>
                                <a href="#">
                                    <span>All Mobil products</span>
                                    <span class="arrow">${customArrowSVG}</span>
                                </a>
                            </li>
                            <li>
                                <a href="#">
                                    <span>Cars & light vehicles</span>
                                    <span class="arrow">${customArrowSVG}</span>
                                </a>
                            </li>
                            <li>
                                <a href="#">
                                    <span>Commercial vehicles & trucks</span>
                                    <span class="arrow">${customArrowSVG}</span>
                                </a>
                            </li>
                            <li>
                                <a href="#">
                                    <span>Motorcycles & scooters</span>
                                    <span class="arrow">${customArrowSVG}</span>
                                </a>
                            </li>
                            <li class="no-border">
                                <a href="#">
                                    <span>Fluids, gear oils & greases</span>
                                    <span class="arrow">${customArrowSVG}</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </li>
                <li><a href="../src/product.html">Where to Buy</a></li>
                <li><a href="../src/about.html">About</a></li>
                <li><a href="../src/contact.html">Contact</a></li>
            </ul>
        </nav>
        <div class="desktop-actions">
            <button class="btn-primary">Find the Right Oil 
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 7H17M11 13L17 7L11 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            </button>
            <a href="search.html" style="cursor: pointer; display: flex;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.5 17C14.0899 17 17 14.0899 17 10.5C17 6.91015 14.0899 4 10.5 4C6.91015 4 4 6.91015 4 10.5C4 14.0899 6.91015 17 10.5 17Z" stroke="#001450" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M15.5 15.5L21 21" stroke="#001450" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </a>
        </div>
    </header>
`;

const myFooter = `
    <footer>
        <div class="footer-top">
            <div class="footer-logo-col">
                <img src="../assets/mobil-logo.png" alt="Mobil Logo">
                <p>Engine oils and services engineered for performance.</p>
            </div>
            
            <div class="footer-links">
                <div class="footer-col">
                    <h4>Products</h4>
                    <ul>
                        <li><a href="#">Passenger vehicle</a></li>
                        <li><a href="#">Commercial vehicles & trucks</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="../src/driver-profile.html">Find the right oil</a></li>
                        <li><a href="../src/products.html">Where to buy</a></li>
                        <li><a href="../src/contact.html">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Follow Mobil</h4>
                    <ul>
                        <li><a href="#">Facebook</a></li>
                        <li><a href="#">YouTube</a></li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="footer-bottom">
            <span>© 2026 Mobil</span>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Accessibility</a>
        </div>
    </footer>
`;

document.addEventListener("DOMContentLoaded", function() {
    document.body.insertAdjacentHTML('afterbegin', myHeader);
    
    const wantsFooter = document.body.getAttribute('data-no-footer') !== "true";
    if (wantsFooter) {
        document.body.insertAdjacentHTML('beforeend', myFooter);
    }
});

