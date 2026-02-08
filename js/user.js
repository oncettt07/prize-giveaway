// ===== DOM Elements =====
const prizesList = document.getElementById('prizesList');
const emptyState = document.getElementById('emptyState');
const labelsContainer = document.getElementById('labelsContainer');
const winnersList = document.getElementById('winnersList');

// Entry Modal
const entryModal = document.getElementById('entryModal');
const closeModal = document.getElementById('closeModal');
const cancelEntry = document.getElementById('cancelEntry');
const entryForm = document.getElementById('entryForm');
const modalPrizeName = document.getElementById('modalPrizeName');
const modalPrizeDescription = document.getElementById('modalPrizeDescription');

// Prize Detail Modal
const prizeDetailModal = document.getElementById('prizeDetailModal');
const closePrizeDetail = document.getElementById('closePrizeDetail');

// Winner Reveal Modal
const winnerRevealModal = document.getElementById('winnerRevealModal');
const closeWinnerReveal = document.getElementById('closeWinnerReveal');
const countdownPhase = document.getElementById('countdownPhase');
const spinningPhase = document.getElementById('spinningPhase');
const winnerPhase = document.getElementById('winnerPhase');
const countdownNumber = document.getElementById('countdownNumber');

// ===== State =====
let currentPrizeId = null;

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    renderLabels(); // From common.js
    renderPrizes();
    updateEmptyState();

    // Initialize tabs
    initializeUserTabs();
});

// ===== User Tab Switching =====
function initializeUserTabs() {
    const userTabs = document.querySelectorAll('.admin-tab'); // Using same class for tabs?
    // In index.html, tabs have class "admin-tab" inside "userTabsNavigation"
    const joinTab = document.getElementById('joinTab');
    const winnersTab = document.getElementById('winnersTab');

    userTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all
            userTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabName = tab.getAttribute('data-tab');
            if (tabName === 'join') {
                joinTab.classList.remove('hidden');
                winnersTab.classList.add('hidden');
                renderPrizes();
            } else if (tabName === 'winners') {
                joinTab.classList.add('hidden');
                winnersTab.classList.remove('hidden');
                renderWinnersList();
            }
        });
    });
}

// ===== Render Prizes (Join Tab) =====
function renderPrizes() {
    if (!prizesList) return;
    prizesList.innerHTML = '';

    const now = new Date();
    // Filter active prizes
    const activePrizes = prizes.filter(prize => {
        const deadline = new Date(prize.deadline);
        return now < deadline;
    });

    activePrizes.forEach(prize => {
        const prizeCard = createPrizeCard(prize);
        prizesList.appendChild(prizeCard);
    });
}

function updateEmptyState() {
    if (!emptyState || !prizesList) return;
    const now = new Date();
    const activePrizes = prizes.filter(p => now < new Date(p.deadline));

    if (activePrizes.length === 0) {
        emptyState.classList.remove('hidden');
        prizesList.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        prizesList.classList.remove('hidden');
    }
}

// ===== Create Prize Card (User) =====
function createPrizeCard(prize) {
    const card = document.createElement('div');
    card.className = 'prize-card';

    const now = new Date();
    const deadline = new Date(prize.deadline);
    const isActive = now < deadline;
    const hasWinner = prize.winner !== null;

    // Images logic
    const images = prize.images || (prize.image ? [prize.image] : []);

    let imageHtml = '';
    if (images.length > 0) {
        if (images.length === 1) {
            imageHtml = `<img src="${images[0]}" alt="${prize.name}" onclick="event.stopPropagation(); openImageViewer('${images[0]}');">`;
        } else {
            // Gallery logic
            imageHtml = `
                <div class="image-gallery">
                    <img class="gallery-main-image" src="${images[0]}" alt="${prize.name}" data-prize-id="${prize.id}" onclick="event.stopPropagation(); openImageViewer('${images[0]}');">
                    ${images.length > 1 ? `
                        <button class="gallery-nav prev" onclick="event.stopPropagation(); changeGalleryImage(${prize.id}, -1);">‹</button>
                        <button class="gallery-nav next" onclick="event.stopPropagation(); changeGalleryImage(${prize.id}, 1);">›</button>
                        <div class="gallery-dots">
                            ${images.map((_, index) => `<div class="gallery-dot ${index === 0 ? 'active' : ''}" onclick="event.stopPropagation(); setGalleryImage(${prize.id}, ${index});"></div>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }
    } else {
        imageHtml = '<div class="prize-image">🎁</div>';
    }

    // Status HTML
    let statusHtml = isActive
        ? '<span class="prize-status status-active">ร่วมลุ้นรางวัล</span>'
        : '<span class="prize-status status-ended">หมดเวลา</span>';

    // Countdown
    let countdownHtml = '';
    if (isActive) {
        const diff = deadline - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        let timeText = days > 0 ? `${days} วัน` : (hours > 0 ? `${hours} ชม.` : `${minutes} นาที`);
        countdownHtml = `<div class="prize-countdown">⏰ เหลืออีก ${timeText}</div>`;
    }

    // Render Card
    card.innerHTML = `
        <div class="prize-image">${imageHtml}</div>
        <div class="prize-content">
            <div class="prize-header">
                <h3 class="prize-name">${prize.name}</h3>
                <div class="prize-badges">${statusHtml}</div>
            </div>
            <p class="prize-description">${prize.description || 'ไม่มีรายละเอียด'}</p>
            ${countdownHtml}
            <div class="prize-meta">
                <div>⏰ สิ้นสุด: ${formatDateTime(prize.deadline)}</div>
                <div class="prize-entries">👥 ผู้เข้าร่วม: ${prize.entries.length} คน</div>
            </div>
            <button class="btn-primary" style="width:100%;margin-top:1rem;" onclick="openEntryModal(${prize.id})">
                เข้าร่วมสนุก
            </button>
        </div>
    `;

    // Make card clickable to show detail
    card.addEventListener('click', (e) => {
        // Don't open detail if clicking on action buttons or images (which have their own handlers)
        if (!e.target.closest('button') && !e.target.closest('img')) {
            openPrizeDetail(prize.id);
        }
    });

    return card;
}

// ===== Render Winners List (Winners Tab) =====
function renderWinnersList() {
    if (!winnersList) return;
    winnersList.innerHTML = '';

    // Only expired prizes logic (or should we show all drawn prizes?)
    // Original code showed all expired prizes.

    const now = new Date();
    const expiredPrizes = prizes.filter(p => now >= new Date(p.deadline));

    if (expiredPrizes.length === 0) {
        winnersList.innerHTML = '<div style="text-align:center;padding:3rem;">ยังไม่มีรางวัลที่ประกาศผล</div>';
        return;
    }

    // Grid layout
    winnersList.style.display = 'grid';
    winnersList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    winnersList.style.gap = '1.5rem';

    expiredPrizes.forEach(prize => {
        const card = createWinnerPrizeCard(prize);
        winnersList.appendChild(card);
    });
}

function createWinnerPrizeCard(prize) {
    const card = document.createElement('div');
    card.className = 'prize-card';

    // Image logic (Simplified for brevity, assume similar to createPrizeCard or extracted)
    const images = prize.images || (prize.image ? [prize.image] : []);
    const imageHtml = images.length > 0 ? `<img src="${images[0]}" onclick="openImageViewer('${images[0]}')">` : '🎁';

    const hasWinner = prize.winner !== null;

    let statusHtml = '';
    if (hasWinner) {
        // Green for Winner Announced
        statusHtml = '<span class="prize-status" style="background:rgba(76, 175, 80, 0.2); color:#4caf50; border:1px solid rgba(76, 175, 80, 0.3);">🏆 ประกาศผลแล้ว</span>';
    } else {
        // Orange/Yellow for Waiting
        statusHtml = '<span class="prize-status" style="background:rgba(255, 152, 0, 0.2); color:#ff9800; border:1px solid rgba(255, 152, 0, 0.3);">⏳ รอประกาศผล</span>';
    }

    let actionHtml = '';
    if (hasWinner) {
        actionHtml = `<button class="btn-primary" onclick="revealWinner(${prize.id})" style="width:100%;margin-top:1rem;">🏆 ดูผู้โชคดี</button>`;
    } else {
        actionHtml = `<div style="text-align:center;margin-top:1rem;color:gray;">รอประกาศผล...</div>`;
    }

    card.innerHTML = `
        <div class="prize-image">${imageHtml}</div>
        <div class="prize-content">
             <div class="prize-header">
                <h3 class="prize-name">${prize.name}</h3>
                <div class="prize-badges">${statusHtml}</div>
             </div>
             <p class="prize-description">${prize.description || ''}</p>
             <div class="prize-meta">
                <div class="prize-entries">👥 ผู้เข้าร่วม: ${prize.entries.length} คน</div>
             </div>
             ${actionHtml}
        </div>
    `;
    return card;
}

// ===== Entry Modal Logic =====
function openEntryModal(prizeId) {
    const prize = prizes.find(p => p.id === prizeId);
    if (!prize) return;
    currentPrizeId = prizeId;

    modalPrizeName.textContent = prize.name;
    modalPrizeDescription.textContent = prize.description || '';
    entryModal.classList.remove('hidden');
}

closeModal.addEventListener('click', () => entryModal.classList.add('hidden'));
cancelEntry.addEventListener('click', () => entryModal.classList.add('hidden'));

entryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const prize = prizes.find(p => p.id === currentPrizeId);
    if (!prize) return;

    const name = document.getElementById('participantName').value.trim();
    const twitter = document.getElementById('participantTwitter').value.trim();

    // Check duplicates
    if (prize.entries.some(e => e.name === name || e.twitter === twitter)) {
        showNotification('คุณลงทะเบียนไปแล้ว', 'error');
        return;
    }

    prize.entries.push({
        id: Date.now(),
        name,
        twitter,
        enteredAt: new Date().toISOString()
    });

    savePrizes();
    renderPrizes();
    entryModal.classList.add('hidden');
    entryForm.reset();
    showNotification('ลงทะเบียนสำเร็จ! 🎉');
});

// ===== Reveal Winner Logic =====
function revealWinner(prizeId) {
    const prize = prizes.find(p => p.id === prizeId);
    if (!prize || !prize.winner) return;

    // Show Modal
    winnerRevealModal.classList.remove('hidden');

    // Setup Content
    const revealImage = document.getElementById('revealPrizeImage');
    const images = prize.images || (prize.image ? [prize.image] : []);
    revealImage.innerHTML = images.length > 0 ? `<img src="${images[0]}" style="max-height:200px; border-radius:8px;">` : '🎁';

    document.getElementById('revealPrizeName').textContent = prize.name;
    document.getElementById('revealWinnerName').textContent = prize.winner.name;
    document.getElementById('revealWinnerTwitter').textContent = `@${prize.winner.twitter}`;
    document.getElementById('revealPrizeDescription').textContent = prize.description || 'ไม่มีรายละเอียด';

    // Skip animation phases, show winner directly
    countdownPhase.classList.add('hidden');
    spinningPhase.classList.add('hidden');
    winnerPhase.classList.remove('hidden');

    createConfetti();
}

function showWinnerPhase(prize) {
    winnerPhase.classList.remove('hidden');
    createConfetti();
}

closeWinnerReveal.addEventListener('click', () => winnerRevealModal.classList.add('hidden'));

// ===== Confetti =====
function createConfetti() {
    const container = document.getElementById('confettiContainer');
    if (!container) return;
    container.innerHTML = '';

    const colors = ['#f5576c', '#4facfe', '#00f2fe', '#43e97b'];
    for (let i = 0; i < 50; i++) {
        const c = document.createElement('div');
        c.style.cssText = `
            position: absolute; width: 10px; height: 10px; background: ${colors[Math.floor(Math.random() * colors.length)]};
            top: -10px; left: ${Math.random() * 100}%;
            animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
        `;
        container.appendChild(c);
    }
}

// ===== Open Prize Detail Modal =====
function openPrizeDetail(prizeId) {
    const prize = prizes.find(p => p.id === prizeId);
    if (!prize) return;

    const now = new Date();
    const deadline = new Date(prize.deadline);
    const isActive = now < deadline;
    const hasWinner = prize.winner !== null;

    // Images
    const images = prize.images || (prize.image ? [prize.image] : []);
    const detailImage = document.getElementById('detailPrizeImage');

    if (images.length > 0) {
        if (images.length === 1) {
            detailImage.innerHTML = `<img src="${images[0]}" onclick="openImageViewer('${images[0]}');" style="cursor: pointer;">`;
        } else {
            detailImage.innerHTML = `
                <div class="image-gallery" style="width: 100%; height: 100%;">
                    <img class="gallery-main-image" src="${images[0]}" data-prize-id="detail-${prize.id}" onclick="openImageViewer('${images[0]}');" style="cursor: pointer;">
                    ${images.length > 1 ? `
                        <button class="gallery-nav prev" onclick="changeDetailGalleryImage(event, ${prize.id}, -1);">‹</button>
                        <button class="gallery-nav next" onclick="changeDetailGalleryImage(event, ${prize.id}, 1);">›</button>
                        <div class="gallery-dots">
                            ${images.map((_, index) => `<div class="gallery-dot ${index === 0 ? 'active' : ''}" onclick="setDetailGalleryImage(event, ${prize.id}, ${index});"></div>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }
    } else {
        detailImage.innerHTML = '🎁';
    }

    document.getElementById('detailPrizeName').textContent = prize.name;
    document.getElementById('detailPrizeDescription').textContent = prize.description || 'ไม่มีรายละเอียด';
    document.getElementById('detailDeadline').textContent = formatDateTime(prize.deadline);
    document.getElementById('detailEntries').textContent = `${prize.entries.length} คน`;

    // Status
    let statusText = hasWinner ? '🏆 มีผู้โชคดีแล้ว' : (isActive ? '🎯 ร่วมลุ้นรางวัล' : '🔒 ปิดรับสมัครแล้ว');
    document.getElementById('detailStatus').textContent = statusText;

    // Actions
    const detailActions = document.getElementById('detailActions');
    let actionsHtml = '';

    if (hasWinner) {
        actionsHtml = `<button class="btn-draw" onclick="closePrizeDetailModal(); revealWinner(${prize.id});">🏆 ดูผู้โชคดี</button>`;
    } else if (isActive) {
        actionsHtml = `<button class="btn-enter" onclick="closePrizeDetailModal(); openEntryModal(${prize.id});">🎯 เข้าร่วมสุ่มรางวัล</button>`;
    } else {
        actionsHtml = `<button class="btn-secondary" disabled>🔒 หมดเวลาเข้าร่วมแล้ว</button>`;
    }

    detailActions.innerHTML = actionsHtml;
    prizeDetailModal.classList.remove('hidden');
}

function closePrizeDetailModal() {
    prizeDetailModal.classList.add('hidden');
}

closePrizeDetail.addEventListener('click', closePrizeDetailModal);
prizeDetailModal.querySelector('.modal-overlay').addEventListener('click', closePrizeDetailModal);

// Gallery helpers for detail modal (similar to common but with event stopPropagation to separate logic if needed, 
// using separate IDs/data attributes??)
// Actually common.js functions use data-prize-id logic.
// If I use data-prize-id="detail-${prizeId}", common.js updateGalleryDisplay needs to target it.
// common.js targets .gallery-main-image[data-prize-id="${prizeId}"]
// So for detail, I should use matching ID or update common.js to handle detail specific ID?
// Let's copy simple gallery logic for detail here to avoid conflict with list view gallery if mostly same.
// Or just reuse common functions but pass event to stop propagation?

function changeDetailGalleryImage(e, prizeId, direction) {
    e.stopPropagation();
    // Reusing common logic but with "detail-" prefix support?
    // Common logic: 
    // const galleryImg = document.querySelector(`.gallery-main-image[data-prize-id="${prizeId}"]`);
    // If I pass "detail-" + prizeId to common function? 
    // common function takes prizeId to look up PRIZE DATA.
    // If I pass "detail-123", it won't find prize in `prizes` array.

    // So I need separate logic or update common.js.
    // I'll implement simple local logic here for detail modal.

    const prize = prizes.find(p => p.id === prizeId);
    if (!prize) return;

    // We need to track index for detail view.
    // Let's store it on the modal element or simpler variable?
    // User only views one detail at a time.

    const images = prize.images || (prize.image ? [prize.image] : []);
    const imgElement = document.querySelector(`.gallery-main-image[data-prize-id="detail-${prizeId}"]`);

    if (!imgElement) return;

    let currentIndex = parseInt(imgElement.dataset.index || 0);
    currentIndex = (currentIndex + direction + images.length) % images.length;
    imgElement.dataset.index = currentIndex;
    imgElement.src = images[currentIndex];

    // Update dots
    const dots = imgElement.closest('.image-gallery').querySelectorAll('.gallery-dot');
    dots.forEach((dot, i) => {
        if (i === currentIndex) dot.classList.add('active');
        else dot.classList.remove('active');
    });
}

function setDetailGalleryImage(e, prizeId, index) {
    e.stopPropagation();
    const prize = prizes.find(p => p.id === prizeId);
    if (!prize) return;

    const images = prize.images || (prize.image ? [prize.image] : []);
    const imgElement = document.querySelector(`.gallery-main-image[data-prize-id="detail-${prizeId}"]`);

    if (!imgElement) return;

    imgElement.dataset.index = index;
    imgElement.src = images[index];

    const dots = imgElement.closest('.image-gallery').querySelectorAll('.gallery-dot');
    dots.forEach((dot, i) => {
        if (i === index) dot.classList.add('active');
        else dot.classList.remove('active');
    });
}

// Make functions global
window.openEntryModal = openEntryModal;
window.revealWinner = revealWinner;
window.changeGalleryImage = changeGalleryImage;
window.setGalleryImage = setGalleryImage;
