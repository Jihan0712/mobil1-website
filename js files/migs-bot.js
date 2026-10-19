// Migs · Mobil Drive Guide
// Guided, data-driven assistant. No backend: answers come from the same data files the site uses
// (driver-profile-data.js for vehicle → oil, products-data.js for products, service-centers-data.js
// for shops). Data files are loaded on demand, so pages do not need to include them.
(function () {
    // Resolve "../js files/" from this script's own URL so lazy loading works from any page in src/
    const SCRIPT_BASE = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '');

    const DATA_FILES = {
        products: { file: 'products-data.js', ready: function () { return !!window.MOBIL_PRODUCTS; } },
        vehicles: { file: 'driver-profile-data.js', ready: function () { return !!window.DP_VEHICLES; } },
        centers: { file: 'service-centers-data.js', ready: function () { return !!window.MOBIL_SERVICE_CENTERS; } }
    };

    // Product map keys -> products-data.js ids. Same mapping as driver-profile.html (spec 4.3).
    const PRODUCT_IDS = {
        'ALL IN ONE PROTECTION 0W20': 'mobil-super-all-in-one-protection-0w-20',
        'ALL IN ONE PROTECTION 5W30': 'mobil-super-all-in-one-protection-5w-30',
        'FRICTION FIGHTER 10W40': 'mobil-super-friction-fighter-10w-40',
        'SUPER DEFENSE 10W30': 'mobil-delvac-modern-10w-30-super-defense',
        'SUPER DEFENSE 15W40': 'mobil-delvac-modern-15w-40-super-defense',
        'MOBIL 1 0W20': 'mobil-1-esp-x2-0w-20',
        'MOBIL 1 5W30': 'mobil-1-triple-action-power-5w-30',
        'MOBIL 1 0W30': 'mobil-1-esp-0w-30',
        'MOBIL 1 0W40': 'mobil-1-triple-action-power-plus-0w-40',
        'MOBIL 1 ESP 5W30': 'mobil-1-esp-5w-30',
        'MOBIL 1 5W50': 'mobil-1-fs-x2-5w-50',
        'DELVAC 1 5W40': 'mobil-delvac-1-5w-40',
        'MOBIL 1 SYN GEAR LUBE 75W90': 'mobil-1-synthetic-gear-lube-ls-75w-90'
    };

    // Same groups as the Products page accordion
    const CATEGORIES = [
        { id: 'cars', label: 'Cars & light vehicles', categories: ['passenger'] },
        { id: 'commercial', label: 'Commercial vehicles & trucks', categories: ['diesel'] },
        { id: 'motorcycles', label: 'Motorcycles & scooters', categories: ['motorcycle'] },
        { id: 'fluids', label: 'Fluids, gear oils & greases', categories: ['transmission', 'specialty'] }
    ];

    // Driving pattern (Driver Profile Q2) -> engine context copy from DRIVER-PROFILE-SPEC.md section 5
    const PATTERN_CONTEXT = {
        PATTERN_DAILY: 'Frequent stopping, idling, short trips and daily heat create repeated engine stress, even when the distance looks ordinary.',
        PATTERN_MIXED: 'Mixed use puts different demands on your engine across traffic, open roads, passengers and routine trips. Consistency matters more than extras.',
        PATTERN_OPEN: 'Long, uninterrupted drives build mileage and sustained engine demand. Protection has to stay dependable across the distance.',
        PATTERN_WORK: 'Heavy loads, demanding routes and longer working hours raise the demands on your engine. Protection has to earn its place every day.'
    };

    const BRAND_ALIASES = {
        'chery': 'Cherry', 'benz': 'Mercedes', 'mercedes-benz': 'Mercedes', 'mb': 'Mercedes',
        'vw': 'Volkswagen', 'mini': 'Mini Cooper', 'range rover': 'Land Rover', 'lambo': 'Lamborghini'
    };

    // "Quezon City" should not read as a Honda City
    const COMMON_WORD_MODELS = ['city', 'jazz', 'life', 'one'];

    const SHOPEE_URL = 'https://shopee.ph/mobilph_alsc';
    const LAZADA_URL = 'https://www.lazada.com.ph/shop/mobil-ph/';

    
    const loading = {};
    function loadData(name) {
        const d = DATA_FILES[name];
        if (d.ready()) return Promise.resolve();
        if (!loading[name]) {
            loading[name] = new Promise(function (resolve, reject) {
                const s = document.createElement('script');
                s.src = SCRIPT_BASE + d.file;
                s.onload = function () { d.ready() ? resolve() : reject(new Error(d.file)); };
                s.onerror = function () { delete loading[name]; reject(new Error(d.file)); };
                document.head.appendChild(s);
            });
        }
        return loading[name];
    }

    function escapeHtml(str) {
        return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function norm(str) {
        // Accents are stripped so "Las Pinas" matches "Las Piñas"
        return String(str).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/[™®]/g, '').replace(/\s+/g, ' ').trim();
    }

    function hasWord(text, word) {
        const w = norm(word).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp('(^|[^a-z0-9])' + w + '($|[^a-z0-9])').test(text);
    }

    function titleCase(str) {
        return String(str).toLowerCase().replace(/(^|[\s(\-])([a-zñ])/g, function (m, pre, ch) { return pre + ch.toUpperCase(); });
    }

    /* ---------- Data helpers ---------- */

    let vehicleCache = null;
    function vehicles() {
        if (!vehicleCache) {
            const fields = window.DP_VEHICLE_FIELDS;
            vehicleCache = window.DP_VEHICLES.map(function (row) {
                const v = {};
                fields.forEach(function (f, i) { v[f] = row[i]; });
                return v;
            });
        }
        return vehicleCache;
    }

    function brands() {
        const seen = {};
        vehicles().forEach(function (v) { seen[v.brand] = true; });
        return Object.keys(seen).sort(function (a, b) { return a.localeCompare(b); });
    }

    // Brand -> [{ key, model, generation, label, rows }] grouped by Model + Generation (spec 4.2)
    function modelGroups(brand) {
        const groups = [];
        vehicles().forEach(function (v) {
            if (v.brand !== brand) return;
            const key = v.model + '||' + v.generation;
            let g = groups.find(function (x) { return x.key === key; });
            if (!g) { g = { key: key, model: v.model, generation: v.generation, rows: [] }; groups.push(g); }
            g.rows.push(v);
        });
        groups.forEach(function (g) {
            const gens = groups.filter(function (x) { return x.model === g.model; }).length;
            g.label = gens > 1 ? g.model + ' · ' + g.generation : g.model;
        });
        return groups;
    }

    // "Pajero / Montero" -> ['pajero', 'montero']; "Hiace (Old/High-Roof)" -> ['hiace']
    function modelTerms(model) {
        return norm(model).replace(/\([^)]*\)/g, '').split('/').map(function (x) { return x.trim(); }).filter(Boolean);
    }

    // Length of the longest model term found in the text (0 = no match); longer = more specific
    function modelScore(t, model, brandNamed) {
        return modelTerms(model).reduce(function (best, term) {
            // Short or everyday-word model names (TT, S6, City) only count when the brand is named too
            if (!brandNamed && (term.length < 3 || COMMON_WORD_MODELS.indexOf(term) !== -1)) return best;
            return hasWord(t, term) && term.length > best ? term.length : best;
        }, 0);
    }

    function bestGroups(t, groups, brandNamed) {
        const scored = groups.map(function (g) { return { g: g, score: modelScore(t, g.model, brandNamed) }; });
        const top = Math.max.apply(null, scored.map(function (x) { return x.score; }).concat(0));
        if (!top) return [];
        const hits = scored.filter(function (x) { return x.score === top; }).map(function (x) { return x.g; });
        // "Montero" could also mean "Montero Sport": offer models that extend the matched name
        const matched = modelTerms(hits[0].model).filter(function (term) { return term.length === top && hasWord(t, term); });
        groups.forEach(function (g) {
            if (hits.indexOf(g) !== -1) return;
            if (modelTerms(g.model).some(function (term) { return matched.some(function (m) { return term.indexOf(m + ' ') === 0; }); })) hits.push(g);
        });
        return hits;
    }

    function productById(id) {
        return (window.MOBIL_PRODUCTS || []).find(function (p) { return p.id === id; }) || null;
    }

    function productUrl(p) {
        return 'product-detail.html?id=' + encodeURIComponent(p.id);
    }

    function categoryOf(p) {
        return CATEGORIES.find(function (c) { return c.categories.indexOf(p.category) !== -1; });
    }

    /* ---------- UI ---------- */

    const chatHTML = `
        <button type="button" class="chat-bot" id="chatToggleButton" aria-label="Chat with Migs, your Mobil Drive Guide" aria-expanded="false" aria-controls="migsChatWindow">
            <img class="chat-bot-avatar" src="${SCRIPT_BASE}../assets/migs/migs-avatar.webp" alt="" width="64" height="64">
        </button>

        <div class="chat-window-wrapper" id="migsChatWindow" role="dialog" aria-label="Migs, Mobil Drive Guide">
            <div class="chat-header">
                <div class="chat-header-info">
                    <h4>Migs &middot; Mobil Drive Guide</h4>
                    <p>Online &middot; Ready to help you find the right oil</p>
                </div>
                <div class="chat-header-actions">
                    <button type="button" class="chat-close-btn chat-restart-btn" id="chatRestartBtn" aria-label="Start over" title="Start over">&#8635;</button>
                    <button type="button" class="chat-close-btn" id="chatCloseBtn" aria-label="Close chat">&#10005;</button>
                </div>
            </div>

            <div class="chat-body" id="chatHistory" aria-live="polite"></div>

            <form class="chat-footer" id="chatForm" autocomplete="off">
                <input type="text" class="chat-input" id="chatInput" placeholder="Ask Migs about your vehicle..." aria-label="Message Migs" maxlength="200">
                <button type="submit" class="chat-send-btn" id="chatSendBtn" aria-label="Send">&#8594;</button>
            </form>
        </div>
    `;

    function init() {
        document.body.insertAdjacentHTML('beforeend', chatHTML);

        const chatWindow = document.getElementById('migsChatWindow');
        const toggleBtn = document.getElementById('chatToggleButton');
        const closeBtn = document.getElementById('chatCloseBtn');
        const restartBtn = document.getElementById('chatRestartBtn');
        const form = document.getElementById('chatForm');
        const input = document.getElementById('chatInput');
        const history = document.getElementById('chatHistory');

        // Handler for the next free-text message when Migs has asked a specific question
        let pending = null;
        let started = false;

        function setOpen(open) {
            chatWindow.classList.toggle('show', open);
            toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggleBtn.classList.toggle('is-open', open);
            if (open) toggleBtn.classList.add('is-seen');
            if (open) {
                if (!started) { started = true; welcome(); }
                input.focus();
            } else {
                toggleBtn.focus();
            }
        }
        toggleBtn.addEventListener('click', function () { setOpen(!chatWindow.classList.contains('show')); });
        closeBtn.addEventListener('click', function () { setOpen(false); });
        chatWindow.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
        restartBtn.addEventListener('click', function () {
            history.innerHTML = '';
            pending = null;
            welcome();
            input.focus();
        });

        function scrollDown() {
            history.scrollTop = history.scrollHeight;
        }

        // Older option sets stop being clickable once the conversation moves on
        function retireOptions() {
            history.querySelectorAll('.chat-options:not(.is-retired)').forEach(function (el) {
                el.classList.add('is-retired');
                el.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
            });
        }

        function addUser(text) {
            retireOptions();
            const bubble = document.createElement('div');
            bubble.className = 'chat-bubble user-msg';
            bubble.textContent = text;
            history.appendChild(bubble);
            scrollDown();
        }

        function addBot(html) {
            const bubble = document.createElement('div');
            bubble.className = 'chat-bubble';
            bubble.innerHTML = html;
            history.appendChild(bubble);
            scrollDown();
            return bubble;
        }

        function addHtml(html) {
            const wrap = document.createElement('div');
            wrap.innerHTML = html;
            while (wrap.firstChild) history.appendChild(wrap.firstChild);
            scrollDown();
        }

        // options: [{ label, run }] — style 'list' (full-width rows) or 'chips' (wrapping pills)
        function addOptions(options, style) {
            const box = document.createElement('div');
            box.className = 'chat-options' + (style === 'chips' ? ' chat-options--chips' : '');
            options.forEach(function (opt) {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = style === 'chips' ? 'chat-chip' : 'chat-option-btn';
                b.textContent = opt.label;
                b.addEventListener('click', function () {
                    if (box.classList.contains('is-retired')) return;
                    pending = null;
                    addUser(opt.label);
                    safely(opt.run)();
                });
                box.appendChild(b);
            });
            history.appendChild(box);
            scrollDown();
        }

        // Short typing pause so replies read like a conversation
        function reply(fn) {
            const typing = document.createElement('div');
            typing.className = 'chat-typing';
            typing.setAttribute('aria-label', 'Migs is typing');
            typing.innerHTML = '<span></span><span></span><span></span>';
            history.appendChild(typing);
            scrollDown();
            const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450;
            setTimeout(function () { typing.remove(); safely(fn)(); }, delay);
        }

        // Safety net: if a reply throws, say so and offer the menu instead of going silent
        function safely(fn) {
            return function () {
                try {
                    return fn.apply(this, arguments);
                } catch (err) {
                    recover(err);
                }
            };
        }

        function recover(err) {
            if (window.console) console.error('[Migs]', err);
            try {
                pending = null;
                history.querySelectorAll('.chat-typing').forEach(function (el) { el.remove(); });
                addBot('Sorry, something went wrong on my side. Let’s try that again.');
                addOptions([
                    { label: 'Find the right oil for my vehicle', run: startVehicle },
                    { label: 'Compare Mobil products', run: startCompare },
                    { label: 'Understand my driving stress', run: startStress },
                    { label: 'Find where to buy', run: startBuy }
                ]);
            } catch (e) { /* nothing more we can safely do */ }
        }

        function withData(names, fn, immediate) {
            (immediate ? function (f) { f(); } : reply)(function () {
                Promise.all(names.map(loadData)).then(safely(fn), function () {
                    addBot("Sorry, I couldn't load that just now. Please try again in a moment.");
                    addOptions([{ label: 'Try again', run: function () { withData(names, fn); } }, menuOption()], 'chips');
                });
            });
        }

        function menuOption() {
            return { label: 'Main menu', run: function () { reply(showMenu); } };
        }

        /* ---------- Welcome + menu ---------- */

        function welcome() {
            addBot("Hi, I'm Migs—your Mobil Drive Guide. Tell me about your vehicle and real driving conditions, and I'll help narrow the right Mobil oil.");
            showMenu(true);
        }

        function showMenu(first) {
            if (!first) addBot('What else can I help with?');
            else addHtml('<p class="chat-prompt">What would you like to do?</p>');
            addOptions([
                { label: 'Find the right oil for my vehicle', run: startVehicle },
                { label: 'Compare Mobil products', run: startCompare },
                { label: 'Understand my driving stress', run: startStress },
                { label: 'Find where to buy', run: startBuy }
            ]);
            if (first) {
                addHtml('<p class="chat-disclaimer">Recommendations are guidance only. Confirm viscosity and specifications in your vehicle owner\'s manual.</p>');
            }
        }

        /* ---------- 1. Find the right oil ---------- */

        function startVehicle() {
            withData(['vehicles', 'products'], askBrand);
        }

        function askBrand(intro) {
            addBot(intro || "Let's match an oil to your engine. What's the brand of your vehicle? Pick one below or type it.");
            addOptions(brands().map(function (b) {
                return { label: b, run: function () { reply(function () { askModel(b); }); } };
            }).concat(menuOption()), 'chips');
            pending = function (text) {
                const match = matchVehicle(norm(text));
                if (match) return resolveVehicleMatch(match);
                askBrand("I don't have that brand in my list yet. Pick one of these, or check your owner's manual for the recommended oil grade.");
            };
        }

        function askModel(brand, intro) {
            const groups = modelGroups(brand);
            addBot(intro || 'Which ' + escapeHtml(brand) + ' do you drive?');
            addOptions(groups.map(function (g) {
                return { label: g.label, run: function () { reply(function () { chooseGroup(brand, g); }); } };
            }).concat({ label: 'Different brand', run: function () { reply(function () { askBrand('No problem. Which brand is it?'); }); } }, menuOption()), 'chips');
            pending = function (text) {
                const t = norm(text);
                const hits = bestGroups(t, groups, true);
                if (hits.length) return resolveVehicleMatch({ brand: brand, groups: hits });
                // They may have switched to a different vehicle altogether
                const other = matchVehicle(t);
                if (other && other.brand !== brand) return resolveVehicleMatch(other);
                askModel(brand, "I couldn't find that model for " + escapeHtml(brand) + '. Pick one of these:');
            };
        }

        function chooseGroup(brand, g) {
            if (g.rows.length === 1) return showVehicleResult(g.rows[0]);
            addBot('Which engine does your ' + escapeHtml(brand + ' ' + g.label) + ' have?');
            addOptions(g.rows.map(function (row) {
                return { label: row.engine_option_label, run: function () { reply(function () { showVehicleResult(row); }); } };
            }).concat(menuOption()), 'chips');
        }

        function resolveVehicleMatch(match) {
            if (!match.groups) return askModel(match.brand);
            if (match.groups.length === 1) return chooseGroup(match.brand, match.groups[0]);
            const sameModel = match.groups.every(function (g) { return g.model === match.groups[0].model; });
            addBot('Which ' + escapeHtml(match.brand + (sameModel ? ' ' + match.groups[0].model : '')) + ' is it?');
            addOptions(match.groups.map(function (g) {
                return { label: g.label, run: function () { reply(function () { chooseGroup(match.brand, g); }); } };
            }).concat(menuOption()), 'chips');
        }

        function productCardHtml(p, label) {
            const img = p.image ? '<img src="' + escapeHtml(p.image) + '" alt="" loading="lazy">' : '';
            const meta = [p.technology, p.viscosity].filter(Boolean).join(' · ');
            return '<a class="chat-product" href="' + productUrl(p) + '">' +
                '<span class="chat-product-img">' + img + '</span>' +
                '<span class="chat-product-info">' +
                    (label ? '<span class="chat-product-label">' + escapeHtml(label) + '</span>' : '') +
                    '<span class="chat-product-name">' + escapeHtml(p.name) + '</span>' +
                    (meta ? '<span class="chat-product-meta">' + escapeHtml(meta) + '</span>' : '') +
                    '<span class="chat-product-link">View product &rarr;</span>' +
                '</span></a>';
        }

        function showVehicleResult(row) {
            const vehicleName = [row.brand, row.model, row.engine_option_label].join(' ');
            const primary = productById(PRODUCT_IDS[row.final_primary_key]);
            const secondary = row.final_secondary_key ? productById(PRODUCT_IDS[row.final_secondary_key]) : null;

            addBot('Here’s what I’d recommend for your <strong>' + escapeHtml(vehicleName) + '</strong>' +
                '<span class="chat-vehicle-gen">' + escapeHtml(row.generation) + '</span>');
            addHtml(primary
                ? productCardHtml(primary, 'Right for your vehicle')
                : '<div class="chat-bubble"><strong>Right for your vehicle:</strong> ' + escapeHtml(row.final_primary_display) + '</div>');
            if (row.final_secondary_display) {
                addHtml(secondary
                    ? productCardHtml(secondary, 'Premium compatible option')
                    : '<div class="chat-bubble"><strong>Premium compatible option:</strong> ' + escapeHtml(row.final_secondary_display) + '</div>');
            }
            addHtml('<p class="chat-disclaimer">Always confirm the oil grade and specification in your owner\'s manual.</p>');
            addOptions([
                { label: 'Get my full Driver Profile', run: function () { location.href = 'driver-profile.html'; } },
                { label: 'Where can I buy it?', run: startBuy },
                { label: 'Check another vehicle', run: startVehicle },
                menuOption()
            ], 'chips');
        }

        // Free text -> { brand, groups? } using brand names, aliases and model names
        function matchVehicle(t) {
            const list = brands();
            let brand = list.find(function (b) { return hasWord(t, b); });
            if (!brand) {
                const alias = Object.keys(BRAND_ALIASES).find(function (a) { return hasWord(t, a); });
                if (alias) brand = BRAND_ALIASES[alias];
            }
            const pool = brand ? [brand] : list;
            let best = null;
            pool.forEach(function (b) {
                const hits = bestGroups(t, modelGroups(b), !!brand);
                if (!hits.length) return;
                const score = modelScore(t, hits[0].model, !!brand);
                if (!best || score > best.score) best = { brand: b, groups: hits, score: score };
            });
            if (best) return { brand: best.brand, groups: best.groups };
            return brand ? { brand: brand } : null;
        }

        /* ---------- 2. Compare products ---------- */

        function startCompare() {
            withData(['products'], function () {
                addBot('Which kind of product are you looking at?');
                addOptions(CATEGORIES.map(function (c) {
                    return { label: c.label, run: function () { reply(function () { showCategory(c); }); } };
                }), 'chips');
            });
        }

        function productsIn(cat) {
            return window.MOBIL_PRODUCTS.filter(function (p) { return cat.categories.indexOf(p.category) !== -1; });
        }

        function showCategory(cat) {
            const list = productsIn(cat);
            addBot('We carry <strong>' + list.length + '</strong> products in ' + escapeHtml(cat.label) + ':' +
                '<ul class="chat-list">' + list.map(function (p) {
                    return '<li><a href="' + productUrl(p) + '">' + escapeHtml(p.name) + '</a>' +
                        '<span>' + escapeHtml([p.technology, p.viscosity].filter(Boolean).join(' · ')) + '</span></li>';
                }).join('') + '</ul>' +
                '<a class="chat-link" href="products.html?category=' + cat.id + '">Browse them on the Products page &rarr;</a>');
            addBot('Pick the first product to compare.');
            pickForCompare(list, null);
        }

        function pickForCompare(list, first) {
            const options = list.filter(function (p) { return p !== first; }).map(function (p) {
                return {
                    label: p.name,
                    run: function () {
                        reply(function () {
                            if (!first) {
                                addBot('Now pick a second product to compare with <strong>' + escapeHtml(p.name) + '</strong>.');
                                pickForCompare(list, p);
                            } else {
                                showComparison(first, p);
                            }
                        });
                    }
                };
            });
            options.push(menuOption());
            addOptions(options, 'chips');
        }

        function showComparison(a, b) {
            const rows = [
                ['Technology', 'technology'],
                ['Viscosity', 'viscosity'],
                ['API', 'api'],
                ['ACEA', 'acea'],
                ['ILSAC', 'ilsac'],
                ['Pack sizes', function (p) { return (p.sizes || []).join(', '); }]
            ];
            function val(p, r) {
                const v = typeof r[1] === 'function' ? r[1](p) : p[r[1]];
                return v ? escapeHtml(v) : '<span class="chat-muted">—</span>';
            }
            const body = rows.filter(function (r) {
                return (typeof r[1] === 'function' ? r[1](a) || r[1](b) : a[r[1]] || b[r[1]]);
            }).map(function (r) {
                return '<tr><th scope="row">' + r[0] + '</th><td>' + val(a, r) + '</td><td>' + val(b, r) + '</td></tr>';
            }).join('');

            addHtml('<div class="chat-compare"><table>' +
                '<thead><tr><th></th>' +
                    '<th scope="col"><a href="' + productUrl(a) + '">' + escapeHtml(a.name) + '</a></th>' +
                    '<th scope="col"><a href="' + productUrl(b) + '">' + escapeHtml(b.name) + '</a></th>' +
                '</tr></thead><tbody>' + body + '</tbody></table></div>');
            addBot('Not sure which fits your engine? Tell me your vehicle and I’ll match it for you.');
            addOptions([
                { label: 'Find the right oil for my vehicle', run: startVehicle },
                { label: 'Compare other products', run: startCompare },
                menuOption()
            ], 'chips');
        }

        function showProducts(list, intro, viscosity) {
            addBot(intro);
            list.slice(0, 4).forEach(function (p) { addHtml(productCardHtml(p)); });
            const more = list.length > 4 ? list.length - 4 + ' more' : '';
            if (viscosity || more) {
                addHtml('<a class="chat-link" href="products.html' + (viscosity ? '?viscosity=' + encodeURIComponent(viscosity) : '') + '">' +
                    (more ? 'See ' + more + ' on the Products page' : 'See them on the Products page') + ' &rarr;</a>');
            }
            addOptions([
                { label: 'Find the right oil for my vehicle', run: startVehicle },
                { label: 'Compare Mobil products', run: startCompare },
                menuOption()
            ], 'chips');
        }

        /* ---------- 3. Driving stress ---------- */

        function startStress() {
            withData(['vehicles'], function () {
                const q2 = window.DP_SCORING.questions.find(function (q) { return q.id === 'Q2_PATTERN'; });
                addBot("Every drive has a pattern. What's yours in a normal week?");
                addOptions(q2.answers.map(function (a) {
                    return { label: a.label + ' — ' + a.support, run: function () { reply(function () { showStress(a); }); } };
                }));
            });
        }

        function showStress(answer) {
            addBot('<span class="chat-tag">' + escapeHtml(answer.stress_tag) + '</span>' +
                '<p>' + escapeHtml(PATTERN_CONTEXT[answer.id]) + '</p>');
            addBot('Want the full picture? The Driver Profile takes five quick taps and matches a Mobil oil to your engine.');
            addOptions([
                { label: 'Take the Driver Profile', run: function () { location.href = 'driver-profile.html'; } },
                { label: 'What Philippine roads do to engines', run: function () { location.href = 'engine.html'; } },
                { label: 'Find the right oil for my vehicle', run: startVehicle },
                menuOption()
            ], 'chips');
        }

        /* ---------- 4. Where to buy ---------- */

        function startBuy() {
            reply(function () {
                addBot('You can buy genuine Mobil oil online from our official stores, or visit a partner service center.');
                addOptions([
                    { label: 'Find a service center near me', run: function () { reply(askCity); } },
                    { label: 'Shop online', run: function () { reply(showOnline); } },
                    menuOption()
                ], 'chips');
            });
        }

        function showOnline() {
            addBot('Shop the official Mobil stores:' +
                '<div class="chat-stores">' +
                    '<a href="' + SHOPEE_URL + '" target="_blank" rel="noopener noreferrer"><img src="../assets/shopee.png" alt="">Shopee</a>' +
                    '<a href="' + LAZADA_URL + '" target="_blank" rel="noopener noreferrer"><img src="../assets/lazada.png" alt="">Lazada</a>' +
                '</div>');
            addOptions([
                { label: 'Find a service center instead', run: function () { reply(askCity); } },
                menuOption()
            ], 'chips');
        }

        function askCity() {
            addBot('Which city or province are you in? For example: Quezon City, Cavite or Cebu.');
            pending = function (text) { withData(['centers'], function () { showCenters(text); }, true); };
        }

        function findCenters(query) {
            const t = norm(query);
            const centers = window.MOBIL_SERVICE_CENTERS;
            // Prefer whole-field city/province matches, then substring matches on name/city/province
            const exact = centers.filter(function (c) { return norm(c.city) === t || norm(c.province) === t || norm(c.city).replace(/ city$/, '') === t; });
            if (exact.length) return exact;
            return centers.filter(function (c) {
                return [c.city, c.province, c.name].some(function (f) { return norm(f).indexOf(t) !== -1; }) ||
                    (t.length > 3 && [c.city, c.province].some(function (f) { return t.indexOf(norm(f).replace(/ city$/, '')) !== -1; }));
            });
        }

        // City or province named anywhere in the text, e.g. "shops in bacoor" -> "Bacoor City"
        function findPlace(t) {
            let hit = null;
            window.MOBIL_SERVICE_CENTERS.some(function (c) {
                if (hasWord(t, norm(c.city).replace(/ city$/, '')) && norm(c.city).length > 3) { hit = titleCase(c.city); return true; }
                if (hasWord(t, norm(c.province)) && norm(c.province).length > 3) { hit = titleCase(c.province); return true; }
                return false;
            });
            return hit;
        }

        function showCenters(query) {
            const results = findCenters(query);
            if (!results.length) {
                addBot('I couldn’t find a service center for “' + escapeHtml(query) + '”. Try a nearby city or province, or use the map to search by location.');
                addHtml('<a class="chat-link" href="service-centers.html">Open the service center map &rarr;</a>');
                pending = function (text) { withData(['centers'], function () { showCenters(text); }, true); };
                addOptions([menuOption()], 'chips');
                return;
            }
            addBot('I found <strong>' + results.length + '</strong> service center' + (results.length === 1 ? '' : 's') + ' for “' + escapeHtml(query) + '”' + (results.length > 3 ? '. Here are the first 3:' : ':'));
            addHtml(results.slice(0, 3).map(function (c) {
                const maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(c.name + ', ' + c.address);
                return '<div class="chat-center">' +
                    '<strong>' + escapeHtml(titleCase(c.name)) + '</strong>' +
                    '<span>' + escapeHtml(titleCase(c.city) + ', ' + titleCase(c.province)) + '</span>' +
                    (c.phone ? '<a href="tel:' + escapeHtml(c.phone.split('/')[0].replace(/[^\d+]/g, '')) + '">' + escapeHtml(c.phone) + '</a>' : '') +
                    '<a href="' + maps + '" target="_blank" rel="noopener noreferrer">Get directions &rarr;</a>' +
                '</div>';
            }).join(''));
            addHtml('<a class="chat-link" href="service-centers.html?q=' + encodeURIComponent(query) + '">See all on the map &rarr;</a>');
            addOptions([
                { label: 'Search another city', run: function () { reply(askCity); } },
                { label: 'Shop online', run: function () { reply(showOnline); } },
                menuOption()
            ], 'chips');
        }

        /* ---------- Free text ---------- */

        const INTENTS = {
            buy: /\b(buy|bili|bumili|where|saan|shop|store|near|nearby|service cent|mechanic|casa|lazada|shopee|retailer|outlet)/,
            price: /\b(price|cost|how much|magkano|presyo)/,
            compare: /\b(compare|comparison|difference|versus|vs\.?|better)\b/,
            stress: /\b(stress|traffic|heat|hot|init|rough|pothole|flood|rain|idling|idle|long drive|commute)/,
            motorcycle: /\b(motor|motorcycle|motorbike|scooter|bike|4t|underbone)\b/,
            commercial: /\b(truck|diesel|delvac|commercial|fleet|jeep|jeepney|bus)\b/,
            fluids: /\b(atf|cvt|transmission|gear oil|grease|brake fluid|dot 4)\b/,
            greet: /^(hi|hello|hey|yo|good (morning|afternoon|evening)|kumusta|musta)\b/,
            thanks: /\b(thanks|thank you|salamat|ty)\b/,
            oil: /\b(oil|recommend|which|what|best|right|langis)\b/
        };

        function handleText(text) {
            const t = norm(text);

            if (/\b(menu|start over|restart|cancel)\b/.test(t)) {
                pending = null;
                return reply(showMenu);
            }
            // A clear new request beats the question Migs just asked
            if (pending && (INTENTS.compare.test(t) || INTENTS.price.test(t) || (INTENTS.buy.test(t) && t.split(' ').length > 1))) pending = null;

            if (pending) {
                const fn = pending;
                pending = null;
                return reply(function () { fn(text); });
            }

            if (INTENTS.greet.test(t) && t.split(' ').length <= 3) {
                return reply(function () { addBot('Hi! Tell me what you drive, for example “Toyota Vios” or “Honda Civic”, and I’ll match a Mobil oil to it.'); showMenu(); });
            }
            if (INTENTS.thanks.test(t) && t.split(' ').length <= 4) {
                return reply(function () { addBot('You’re welcome! Drive safe.'); showMenu(); });
            }
            if (INTENTS.price.test(t)) {
                return reply(function () {
                    addBot('Prices depend on the retailer and pack size. You’ll find current prices on our official Shopee and Lazada stores.');
                    showOnline();
                });
            }

            withData(['vehicles', 'products', 'centers'], function () {
                // A named vehicle wins: it's the most specific thing we can answer
                const vehicle = matchVehicle(t);
                if (vehicle && !INTENTS.buy.test(t)) return resolveVehicleMatch(vehicle);

                // Grade like "5w30", "5W-30", "10w 40"
                const grade = t.match(/\b(\d{1,2})\s?w\s?-?\s?(\d{2})\b/);
                if (grade) {
                    const viscosity = grade[1] + 'W-' + grade[2];
                    const hits = window.MOBIL_PRODUCTS.filter(function (p) { return p.viscosity === viscosity; });
                    if (hits.length) return showProducts(hits, 'Here are our <strong>' + escapeHtml(viscosity) + '</strong> products:', viscosity);
                    addBot('We don’t carry a ' + escapeHtml(viscosity) + ' product right now. Tell me your vehicle and I’ll find the right Mobil oil for it.');
                    return startVehicle();
                }

                // Category words (scooter, truck, ATF...) show the whole range
                if (INTENTS.fluids.test(t)) return showCategory(CATEGORIES[3]);
                if (INTENTS.motorcycle.test(t)) return showCategory(CATEGORIES[2]);
                if (INTENTS.commercial.test(t)) return showCategory(CATEGORIES[1]);

                // Product line names: "mobil 1", "super moto", "friction fighter", ...
                const named = window.MOBIL_PRODUCTS.filter(function (p) {
                    const n = norm(p.name);
                    return n.indexOf(t) !== -1 || (t.length > 4 && t.indexOf(n) !== -1);
                });
                if (named.length && t.length > 3) return showProducts(named, 'Here’s what I found:');

                // "where to buy in Cavite" or just "Quezon City" -> search service centers straight away
                const place = findPlace(t);
                if (place) return showCenters(place);
                if (INTENTS.buy.test(t)) {
                    addBot('You can buy genuine Mobil oil online from our official stores, or visit a partner service center.');
                    return addOptions([
                        { label: 'Find a service center near me', run: function () { reply(askCity); } },
                        { label: 'Shop online', run: function () { reply(showOnline); } },
                        menuOption()
                    ], 'chips');
                }
                if (INTENTS.compare.test(t)) return startCompare();
                if (INTENTS.stress.test(t)) return startStress();
                if (vehicle) return resolveVehicleMatch(vehicle);
                if (INTENTS.oil.test(t)) return askBrand();

                addBot('I’m not sure I got that. I can match an oil to your vehicle, compare products, explain driving stress or help you find where to buy. Try something like “Toyota Vios” or “5W-30”.');
                showMenu();
            });
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;
            input.value = '';
            addUser(text);
            safely(handleText)(text);
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
