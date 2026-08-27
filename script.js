(function initSpaceBackground() {
    const canvas = document.getElementById('spaceCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w, h;
    let stars = [];
    let shootingStars = [];
    let nebulae = [];
    let mouseX = 0, mouseY = 0;
    let frameTick = 0;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const STAR_COUNT = Math.min(400, Math.floor((w * h) / 3000));

    for (let i = 0; i < STAR_COUNT; i++) {
        const layer = Math.random();            // 0 = far, 1 = near
        const brightness = 0.3 + layer * 0.7;
        const hue = Math.random() < 0.3 ? 210 + Math.random() * 30 : 0;   // some blue-tinted
        const sat = hue > 0 ? 30 + Math.random() * 40 : 0;

        stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: 0.3 + layer * 1.6,
            baseAlpha: brightness,
            alpha: brightness,
            speed: 0.002 + layer * 0.01,          // parallax drift
            twinkleSpeed: 0.005 + Math.random() * 0.02,
            twinklePhase: Math.random() * Math.PI * 2,
            hue,
            sat,
        });
    }

    const nebulaColors = [
        { r: 0, g: 255, b: 136 },   // green
        { r: 0, g: 180, b: 255 },   // cyan
        { r: 120, g: 40, b: 220 },  // purple
        { r: 20, g: 60, b: 180 },   // deep blue
    ];

    for (let i = 0; i < 4; i++) {
        const c = nebulaColors[i % nebulaColors.length];
        nebulae.push({
            x: Math.random() * w,
            y: Math.random() * h,
            radius: 150 + Math.random() * 250,
            color: c,
            alpha: 0.015 + Math.random() * 0.02,
            driftX: (Math.random() - 0.5) * 0.15,
            driftY: (Math.random() - 0.5) * 0.1,
            pulsePhase: Math.random() * Math.PI * 2,
        });
    }

    function spawnShootingStar() {
        shootingStars.push({
            x: Math.random() * w * 1.2,
            y: Math.random() * h * 0.4,
            len: 60 + Math.random() * 100,
            speed: 6 + Math.random() * 8,
            angle: (Math.PI / 6) + Math.random() * (Math.PI / 8),
            alpha: 0.7 + Math.random() * 0.3,
            life: 1,
            decay: 0.008 + Math.random() * 0.008,
        });
    }

    setInterval(() => {
        if (shootingStars.length < 3) spawnShootingStar();
    }, 2000 + Math.random() * 3000);

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / w - 0.5) * 2;   // -1 to 1
        mouseY = (e.clientY / h - 0.5) * 2;
    });

    function draw() {
        frameTick++;
        ctx.clearRect(0, 0, w, h);

        const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.85, 0, w * 0.5, h * 0.5, Math.max(w, h));
        bgGrad.addColorStop(0, '#111428');
        bgGrad.addColorStop(0.5, '#0a0c18');
        bgGrad.addColorStop(1, '#050510');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        for (const n of nebulae) {
            n.x += n.driftX;
            n.y += n.driftY;
            if (n.x < -n.radius) n.x = w + n.radius;
            if (n.x > w + n.radius) n.x = -n.radius;
            if (n.y < -n.radius) n.y = h + n.radius;
            if (n.y > h + n.radius) n.y = -n.radius;

            const pulse = 1 + Math.sin(n.pulsePhase + frameTick * 0.005) * 0.3;
            n.pulsePhase += 0.002;

            const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * pulse);
            grad.addColorStop(0, `rgba(${n.color.r}, ${n.color.g}, ${n.color.b}, ${n.alpha * pulse})`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(n.x - n.radius * 2, n.y - n.radius * 2, n.radius * 4, n.radius * 4);
        }

        for (const s of stars) {
            const px = s.x + mouseX * s.speed * 30;
            const py = s.y + mouseY * s.speed * 30;

            s.twinklePhase += s.twinkleSpeed;
            s.alpha = s.baseAlpha * (0.6 + 0.4 * Math.sin(s.twinklePhase));

            ctx.beginPath();
            ctx.arc(px, py, s.r, 0, Math.PI * 2);

            if (s.hue > 0) {
                ctx.fillStyle = `hsla(${s.hue}, ${s.sat}%, 85%, ${s.alpha})`;
            } else {
                ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
            }
            ctx.fill();

            if (s.r > 1.2) {
                ctx.beginPath();
                ctx.arc(px, py, s.r * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(200, 220, 255, ${s.alpha * 0.08})`;
                ctx.fill();
            }
        }

        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const ss = shootingStars[i];
            ss.x += Math.cos(ss.angle) * ss.speed;
            ss.y += Math.sin(ss.angle) * ss.speed;
            ss.life -= ss.decay;

            if (ss.life <= 0) {
                shootingStars.splice(i, 1);
                continue;
            }

            const tailX = ss.x - Math.cos(ss.angle) * ss.len;
            const tailY = ss.y - Math.sin(ss.angle) * ss.len;

            const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
            grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
            grad.addColorStop(0.7, `rgba(180, 220, 255, ${ss.alpha * ss.life * 0.4})`);
            grad.addColorStop(1, `rgba(255, 255, 255, ${ss.alpha * ss.life})`);

            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(ss.x, ss.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${ss.alpha * ss.life})`;
            ctx.fill();
        }

        requestAnimationFrame(draw);
    }

    draw();
})();

const CORS_PROXIES = [
    { prefix: 'https://api.allorigins.win/raw?url=', encode: true },
    { prefix: 'https://corsproxy.org/?', encode: false },
    { prefix: 'https://api.codetabs.com/v1/proxy?quest=', encode: true },
];

let workingProxy = null;
let proxyTested = false;

async function findWorkingProxy() {
    if (proxyTested && workingProxy) return workingProxy;

    for (const proxy of CORS_PROXIES) {
        try {
            const testTarget = 'https://www.github.com';
            const proxyUrl = proxy.encode
                ? proxy.prefix + encodeURIComponent(testTarget)
                : proxy.prefix + testTarget;

            const controller = new AbortController();
            const tid = setTimeout(() => controller.abort(), 6000);

            const res = await fetch(proxyUrl, {
                method: 'GET',
                signal: controller.signal,
            });
            clearTimeout(tid);

            if (res.ok) {
                workingProxy = proxy;
                proxyTested = true;
                console.log('[FindMe] Using CORS proxy:', proxy.prefix);
                return proxy;
            }
        } catch (_) {
            /* try next */
        }
    }

    workingProxy = CORS_PROXIES[0];
    proxyTested = true;
    console.warn('[FindMe] No proxy passed test, falling back to:', workingProxy.prefix);
    return workingProxy;
}

async function loadPlatforms() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/0xSaikat/findme/main/data.json');
        const data = await response.json();
        const platforms = {};
        for (const [key, value] of Object.entries(data)) {
            if (!key.startsWith('$') && typeof value === 'object' && value.url) {
                platforms[key] = value;
            }
        }
        return platforms;
    } catch (error) {
        console.error('Error loading platforms:', error);
        return {};
    }
}

let searchResults = [];
let showingAll = false;
let isSearching = false;

const BATCH_SIZE = 15;
const REQUEST_TIMEOUT = 10000;

async function checkUsername(platform, username, platformName, proxy) {
    const url = platform.url.replace('{}', username);

    const proxyUrl = proxy.encode
        ? proxy.prefix + encodeURIComponent(url)
        : proxy.prefix + url;

    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        const response = await fetch(proxyUrl, {
            method: 'GET',
            redirect: 'follow',
            signal: controller.signal,
        });

        clearTimeout(tid);

        const errorType = platform.errorType || 'status_code';

        if (errorType === 'status_code') {
            if (response.ok && response.status !== 404) {
                return { name: platformName, url: url, found: true };
            }
        } else if (errorType === 'message') {
            if (response.ok) {
                try {
                    const text = await response.text();
                    const errorMsgs = Array.isArray(platform.errorMsg)
                        ? platform.errorMsg
                        : [platform.errorMsg];
                    const hasError = errorMsgs.some(msg => text.includes(msg));
                    if (!hasError) {
                        return { name: platformName, url: url, found: true };
                    }
                } catch (_) { /* body read failed */ }
            }
        } else if (errorType === 'response_url') {
            if (response.ok && response.status !== 404) {
                return { name: platformName, url: url, found: true };
            }
        }

        return null;
    } catch (_) {
        return null;
    }
}

function displayResults(results, showAll = false) {
    const resultsDiv = document.getElementById('results');
    const exportSection = document.getElementById('exportSection');
    const statsBar = document.getElementById('statsBar');
    const showMoreSection = document.getElementById('showMoreSection');

    if (results.length === 0) {
        if (!isSearching) {
            resultsDiv.innerHTML = '<div class="no-results">No accounts found. The username may not exist on these platforms.</div>';
        }
        exportSection.classList.remove('show');
        showMoreSection.classList.remove('show');
    } else {
        const displayCount = showAll ? results.length : Math.min(6, results.length);

        resultsDiv.innerHTML = '';

        for (let i = 0; i < displayCount; i++) {
            const result = results[i];
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.style.animationDelay = (i * 0.04) + 's';
            resultItem.innerHTML = `
                <span class="platform-name">${result.name}</span>
                <span class="result-url">${result.url}</span>
                <div class="result-actions">
                    <a href="${result.url}" target="_blank" class="visit-btn">Visit</a>
                </div>
            `;
            resultsDiv.appendChild(resultItem);
        }

        if (results.length > 6 && !showAll) {
            showMoreSection.classList.add('show');
            document.getElementById('showMoreBtn').textContent = `Show All ${results.length} Results`;
        } else {
            showMoreSection.classList.remove('show');
        }

        exportSection.classList.add('show');
        statsBar.classList.add('show');
    }

    resultsDiv.classList.add('show');
}

async function searchUsername(username) {
    const platforms = await loadPlatforms();
    const platformEntries = Object.entries(platforms);

    if (platformEntries.length === 0) {
        document.getElementById('currentCheck').textContent = 'Failed to load platform data.';
        return [];
    }

    const proxy = await findWorkingProxy();

    document.getElementById('totalCount').textContent = platformEntries.length;
    document.getElementById('platformCount').textContent = platformEntries.length;
    document.getElementById('scannedCount').textContent = '0';
    document.getElementById('foundCount').textContent = '0';

    searchResults = [];
    isSearching = true;

    const results = [];
    let scanned = 0;

    for (let i = 0; i < platformEntries.length; i += BATCH_SIZE) {
        const batch = platformEntries.slice(i, i + BATCH_SIZE);
        const batchNames = batch.map(b => b[0]);
        document.getElementById('currentCheck').textContent = `Checking: ${batchNames[0]} … ${batchNames[batchNames.length - 1]}`;

        const batchPromises = batch.map(([name, platform]) =>
            checkUsername(platform, username, name, proxy).then(result => {
                scanned++;
                document.getElementById('scannedCount').textContent = scanned;

                if (result) {
                    results.push(result);
                    searchResults.push(result);
                    document.getElementById('foundCount').textContent = results.length;
                    displayResults(results, showingAll);
                }
            })
        );

        await Promise.all(batchPromises);
    }

    isSearching = false;
    document.getElementById('currentCheck').textContent = 'Scan complete!';
    displayResults(results, showingAll);

    return results;
}

function exportAsJSON() {
    const dataStr = JSON.stringify(searchResults, null, 2);
    downloadFile(dataStr, 'findme-results.json', 'application/json');
}

function exportAsCSV() {
    let csv = 'Platform,URL\n';
    searchResults.forEach(result => {
        csv += `"${result.name}","${result.url}"\n`;
    });
    downloadFile(csv, 'findme-results.csv', 'text/csv');
}

function exportAsTXT() {
    let txt = 'FindMe Search Results\n';
    txt += '='.repeat(50) + '\n\n';
    searchResults.forEach(result => {
        txt += `${result.name}: ${result.url}\n`;
    });
    downloadFile(txt, 'findme-results.txt', 'text/plain');
}

function copyToClipboard() {
    let text = '';
    searchResults.forEach(result => {
        text += `${result.name}: ${result.url}\n`;
    });
    navigator.clipboard.writeText(text).then(() => {
        alert('Results copied to clipboard!');
    });
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
}

document.getElementById('searchBtn').addEventListener('click', async () => {
    const username = document.getElementById('usernameInput').value.trim();

    if (!username) {
        alert('Please enter a username');
        return;
    }

    const searchBtn = document.getElementById('searchBtn');
    const loader = document.getElementById('loader');
    const results = document.getElementById('results');
    const exportSection = document.getElementById('exportSection');
    const statsBar = document.getElementById('statsBar');
    const showMoreSection = document.getElementById('showMoreSection');

    searchBtn.disabled = true;
    loader.classList.add('active');
    results.classList.remove('show');
    results.innerHTML = '';
    exportSection.classList.remove('show');
    showMoreSection.classList.remove('show');
    statsBar.classList.add('show');
    showingAll = false;

    const foundResults = await searchUsername(username);

    loader.classList.remove('active');
    searchBtn.disabled = false;
    displayResults(foundResults, false);
});

document.getElementById('showMoreBtn').addEventListener('click', () => {
    showingAll = true;

    if (searchResults.length > 0) {
        displayResults(searchResults, true);
    }
});

document.getElementById('usernameInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('searchBtn').click();
    }
});
