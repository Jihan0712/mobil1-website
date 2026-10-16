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
        
        <div class="mobile-actions">
            <a href="../src/driver-profile.html" class="btn-primary mobile-cta">Find the Right Oil
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M1 7H17M11 13L17 7L11 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            </a>
            <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="mobileMenu" aria-label="Open menu">
                <svg width="24" height="24" viewBox="120 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M124 7H140M124 12H140M124 17H140" stroke="#001450" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>

        <nav class="desktop-nav">
            <ul>
                <!-- Dropdown Parent Item -->
                <li class="nav-dropdown">
                    <a href="../src/products.html" class="dropdown-trigger">Products 
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
                                <a href="../src/products.html">
                                    <span>All Mobil products</span>
                                    <span class="arrow">${customArrowSVG}</span>
                                </a>
                            </li>
                            <li>
                                <a href="../src/products.html?category=cars">
                                    <span>Cars & light vehicles</span>
                                    <span class="arrow">${customArrowSVG}</span>
                                </a>
                            </li>
                            <li>
                                <a href="../src/products.html?category=commercial">
                                    <span>Commercial vehicles & trucks</span>
                                    <span class="arrow">${customArrowSVG}</span>
                                </a>
                            </li>
                            <li>
                                <a href="../src/products.html?category=motorcycles">
                                    <span>Motorcycles & scooters</span>
                                    <span class="arrow">${customArrowSVG}</span>
                                </a>
                            </li>
                            <li class="no-border">
                                <a href="../src/products.html?category=fluids">
                                    <span>Fluids, gear oils & greases</span>
                                    <span class="arrow">${customArrowSVG}</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </li>
                <li><a href="../src/service-centers.html">Where to Buy</a></li>
                <li><a href="../src/about.html">About</a></li>
                <li><a href="../src/contact.html">Contact</a></li>
            </ul>
        </nav>
        <div class="desktop-actions">
            <a href="../src/driver-profile.html" class="btn-primary">Find the Right Oil
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 7H17M11 13L17 7L11 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            </a>
            <a href="search.html" style="cursor: pointer; display: flex;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.5 17C14.0899 17 17 14.0899 17 10.5C17 6.91015 14.0899 4 10.5 4C6.91015 4 4 6.91015 4 10.5C4 14.0899 6.91015 17 10.5 17Z" stroke="#001450" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M15.5 15.5L21 21" stroke="#001450" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </a>
        </div>
    </header>
`;

const myMobileMenu = `
    <div class="mobile-menu" id="mobileMenu" role="dialog" aria-modal="true" aria-label="Menu" hidden>
        <div class="mobile-menu-top">
            <div class="logo-container">
                <a href="homepage.html"><img src="../assets/mobil-logo.png" alt="Mobil Logo"></a>
                <span class="logo-divider">|</span>
                <img src="../assets/allied-logo.png" alt="Allied Lubrication">
            </div>
            <button type="button" class="mobile-menu-close" aria-label="Close menu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M5 5L19 19M19 5L5 19" stroke="#001450" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        </div>
        <a href="../src/driver-profile.html" class="btn-primary mobile-menu-cta">Find the Right Oil
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M1 7H17M11 13L17 7L11 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </a>
        <nav aria-label="Main">
            <ul class="mobile-menu-links">
                <li><a href="../src/products.html">Products</a></li>
                <li><a href="../src/service-centers.html">Where to Buy</a></li>
                <li><a href="../src/about.html">About</a></li>
                <li><a href="../src/contact.html">Contact</a></li>
                <li><a href="../src/search.html">Search</a></li>
            </ul>
        </nav>
        <img class="mobile-menu-allied" src="../assets/allied-logo.png" alt="Allied Lubrication, authorized Mobil distributor">
    </div>
`;

function setupMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;
    const close = menu.querySelector('.mobile-menu-close');

    function setOpen(open) {
        menu.hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('menu-open', open);
        (open ? close : toggle).focus();
    }

    toggle.addEventListener('click', function () { setOpen(true); });
    close.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !menu.hidden) setOpen(false);
    });
    // Back to desktop width: never leave the page scroll-locked
    window.matchMedia('(min-width: 769px)').addEventListener('change', function (mq) {
        if (mq.matches && !menu.hidden) setOpen(false);
    });
}

const myFooter = `
    <footer>
        <div class="footer-top">
            <div class="footer-logo-col">
                <img src="../assets/mobil-logo.png" alt="Mobil Logo">
                <p>Engine oils and services<br>engineered for performance.</p>
            </div>
            
            <div class="footer-links">
                <div class="footer-col">
                    <h4>Products</h4>
                    <ul>
                        <li><a href="../src/products.html?category=cars">Passenger vehicle</a></li>
                        <li><a href="../src/products.html?category=commercial">Commercial vehicles & trucks</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="../src/driver-profile.html">Find the right oil</a></li>
                        <li><a href="../src/service-centers.html">Where to buy</a></li>
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
            <a href="../src/legal.html#privacy-policy">Privacy</a>
            <a href="../src/legal.html#terms-of-use">Terms</a>
            <a href="../src/legal.html#accessibility">Accessibility</a>
        </div>
    </footer>
`;

document.addEventListener("DOMContentLoaded", function() {
    document.body.insertAdjacentHTML('afterbegin', myHeader + myMobileMenu);
    setupMobileMenu();
    
    const wantsFooter = document.body.getAttribute('data-no-footer') !== "true";
    if (wantsFooter) {
        document.body.insertAdjacentHTML('beforeend', myFooter);
    }
});

