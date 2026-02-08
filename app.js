// ===== Data =====
let prizes = JSON.parse(localStorage.getItem('prizes')) || [];
let isAdminAuthenticated = false;
let editingPrizeId = null;

// Default admin password - can be changed by admin
const DEFAULT_ADMIN_PASSWORD = 'admin123';

// ===== DOM Elements =====
const adminToggle = document.getElementById('adminToggle');
const adminPanel = document.getElementById('adminPanel');
const prizeForm = document.getElementById('prizeForm');
const prizesList = document.getElementById('prizesList');
const emptyState = document.getElementById('emptyState');

const prizeDetailModal = document.getElementById('prizeDetailModal');
const closePrizeDetail = document.getElementById('closePrizeDetail');

const entryModal = document.getElementById('entryModal');
const closeModal = document.getElementById('closeModal');
const cancelEntry = document.getElementById('cancelEntry');
const entryForm = document.getElementById('entryForm');
const modalPrizeName = document.getElementById('modalPrizeName');
const modalPrizeDescription = document.getElementById('modalPrizeDescription');

const winnerModal = document.getElementById('winnerModal');
const closeWinnerModal = document.getElementById('closeWinnerModal');
const winnerName = document.getElementById('winnerName');
const winnerTwitter = document.getElementById('winnerTwitter');
const winnerPrizeName = document.getElementById('winnerPrizeName');

// Winner Reveal Modal Elements
const winnerRevealModal = document.getElementById('winnerRevealModal');
const closeWinnerReveal = document.getElementById('closeWinnerReveal');
const countdownPhase = document.getElementById('countdownPhase');
const spinningPhase = document.getElementById('spinningPhase');
const winnerPhase = document.getElementById('winnerPhase');
const countdownNumber = document.getElementById('countdownNumber');
const revealPrizeName = document.getElementById('revealPrizeName');
const revealPrizeImage = document.getElementById('revealPrizeImage');
const revealWinnerName = document.getElementById('revealWinnerName');
const revealWinnerTwitter = document.getElementById('revealWinnerTwitter');


const imageViewerModal = document.getElementById('imageViewerModal');
const closeImageViewer = document.getElementById('closeImageViewer');
const fullSizeImage = document.getElementById('fullSizeImage');

const labelsContainer = document.getElementById('labelsContainer');
const labelsList = document.getElementById('labelsList');
const labelTextInput = document.getElementById('labelText');
const addLabelBtn = document.getElementById('addLabelBtn');
const cancelLabelEditBtn = document.getElementById('cancelLabelEditBtn');

// ===== State =====
let labels = JSON.parse(localStorage.getItem('labels')) || [];
let editingLabelId = null;

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    renderPrizes();
    updateEmptyState();
    setMinDateTime();
    initializeAdminPassword();
    renderLabels();
    renderAdminLabels();

    // Initialize user tab switching
    initializeUserTabs();

    // Initialize admin tab switching
    initializeAdminTabs();
});

// ===== Admin Tab Switching =====
function initializeAdminTabs() {
    const adminTabs = document.querySelectorAll('#adminTabsNavigation .admin-tab');
    const tabContents = document.querySelectorAll('.admin-tab-content');

    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');

            // Remove active class from all tabs
            adminTabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            tab.classList.add('active');

            // Hide all tab contents
            tabContents.forEach(content => content.classList.remove('active'));

            // Show selected tab content
            const selectedContent = document.getElementById(`tab-${tabName}`);
            if (selectedContent) {
                selectedContent.classList.add('active');
            }

            // Refresh content if needed
            if (tabName === 'list') {
                renderAdminPrizesList();
            } else if (tabName === 'draw') {
                renderDrawPrizesList();
            } else if (tabName === 'labels') {
                renderAdminLabels();
            }
        });
    });
}


// ===== User Tab Switching =====
function initializeUserTabs() {
    const userTabs = document.querySelectorAll('#userTabsNavigation .admin-tab');
    const joinTab = document.getElementById('joinTab');
    const winnersTab = document.getElementById('winnersTab');

    userTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');

            // Remove active class from all tabs
            userTabs.forEach(t => {
                t.classList.remove('active');
            });

            // Add active class to clicked tab
            tab.classList.add('active');

            // Show/hide tab content
            if (tabName === 'join') {
                joinTab.classList.remove('hidden');
                winnersTab.classList.add('hidden');
            } else if (tabName === 'winners') {
                joinTab.classList.add('hidden');
                winnersTab.classList.remove('hidden');
                renderWinnersList(); // Refresh winners list
            }
        });
    });
}


// ===== Admin Password Management =====
function initializeAdminPassword() {
    // Set default password if not exists
    if (!localStorage.getItem('adminPassword')) {
        localStorage.setItem('adminPassword', DEFAULT_ADMIN_PASSWORD);
    }
}

function checkAdminPassword() {
    const savedPassword = localStorage.getItem('adminPassword');
    const inputPassword = prompt('🔐 กรุณาใส่รหัสผ่าน Admin:\n\n(รหัสเริ่มต้น: admin123)');

    if (inputPassword === null) {
        return false; // User cancelled
    }

    if (inputPassword === savedPassword) {
        isAdminAuthenticated = true;
        showNotification('เข้าสู่ระบบ Admin สำเร็จ! 🎉');
        return true;
    } else {
        showNotification('รหัสผ่านไม่ถูกต้อง!', 'error');
        return false;
    }
}

function changeAdminPassword() {
    const currentPassword = prompt('🔐 กรุณาใส่รหัสผ่านปัจจุบัน:');

    if (currentPassword === null) return;

    if (currentPassword !== localStorage.getItem('adminPassword')) {
        showNotification('รหัสผ่านปัจจุบันไม่ถูกต้อง!', 'error');
        return;
    }

    const newPassword = prompt('🔑 กรุณาใส่รหัสผ่านใหม่:');

    if (newPassword === null || newPassword.trim() === '') return;

    const confirmPassword = prompt('🔑 ยืนยันรหัสผ่านใหม่:');

    if (newPassword !== confirmPassword) {
        showNotification('รหัสผ่านไม่ตรงกัน!', 'error');
        return;
    }

    localStorage.setItem('adminPassword', newPassword);
    showNotification('เปลี่ยนรหัสผ่านสำเร็จ! 🎉');
}

// ===== Labels Management =====
function renderLabels() {

    if (labelsContainer) {
        if (labels.length === 0) {
            labelsContainer.innerHTML = '';
            return;
        }

        labelsContainer.innerHTML = labels.map(label => `
            <div class="label-item">
                <div class="label-item-text">${label.text}</div>
            </div>
        `).join('');
    }
}

function renderAdminLabels() {
    if (!labelsList) return;

    if (labels.length === 0) {
        labelsList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 1rem;">ยังไม่มีป้ายประกาศ</p>';
        return;
    }

    labelsList.innerHTML = labels.map(label => `
        <div class="admin-label-item">
            <div class="admin-label-text">${label.text}</div>
            <div class="admin-label-actions">
                <button class="label-edit-btn" onclick="editLabel(${label.id})">✏️</button>
                <button class="label-delete-btn" onclick="deleteLabel(${label.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function addOrUpdateLabel() {
    const text = labelTextInput.value.trim();

    if (text === '') {
        showNotification('กรุณากรอกข้อความ!', 'error');
        return;
    }

    if (editingLabelId !== null) {
        // Update existing label
        const label = labels.find(l => l.id === editingLabelId);
        if (label) {
            label.text = text;
            showNotification('แก้ไขป้ายสำเร็จ! 💾');
        }
        cancelLabelEdit();
    } else {
        // Add new label
        const newLabel = {
            id: Date.now(),
            text: text,
            createdAt: new Date().toISOString()
        };
        labels.push(newLabel);
        showNotification('เพิ่มป้ายสำเร็จ! 🎉');
        labelTextInput.value = '';
    }

    saveLabels();
    renderLabels();
    renderAdminLabels();
}

function editLabel(labelId) {
    const label = labels.find(l => l.id === labelId);
    if (!label) return;

    editingLabelId = labelId;
    labelTextInput.value = label.text;
    addLabelBtn.innerHTML = '<span class="icon">💾</span> บันทึกการแก้ไข';
    cancelLabelEditBtn.style.display = 'block';

    // Scroll to form
    if (adminPanel && !adminPanel.classList.contains('hidden')) {
        labelTextInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        labelTextInput.focus();
    }
}

function deleteLabel(labelId) {
    if (!confirm('คุณต้องการลบป้ายนี้ใช่หรือไม่?')) return;

    labels = labels.filter(l => l.id !== labelId);
    saveLabels();
    renderLabels();
    renderAdminLabels();
    showNotification('ลบป้ายสำเร็จ! 🗑️');
}

function cancelLabelEdit() {
    editingLabelId = null;
    labelTextInput.value = '';
    addLabelBtn.innerHTML = '<span class="icon">➕</span> เพิ่มป้าย';
    cancelLabelEditBtn.style.display = 'none';
}

function saveLabels() {
    localStorage.setItem('labels', JSON.stringify(labels));
}

// Event listeners for labels
if (addLabelBtn) {
    addLabelBtn.addEventListener('click', addOrUpdateLabel);
}

if (cancelLabelEditBtn) {
    cancelLabelEditBtn.addEventListener('click', cancelLabelEdit);
}

// ===== Admin Panel Toggle =====
adminToggle.addEventListener('click', () => {
    if (adminPanel.classList.contains('hidden')) {
        // Trying to open admin panel - check password
        if (!isAdminAuthenticated) {
            if (!checkAdminPassword()) {
                return; // Authentication failed
            }
        }
        adminPanel.classList.remove('hidden');
        adminToggle.innerHTML = '<span class="icon">🔓</span> Admin (ออกจากระบบ)';

        // Hide User Section and Labels when Admin Panel is open
        const userMainSection = document.getElementById('userMainSection');
        if (userMainSection) userMainSection.classList.add('hidden');

        if (labelsContainer) labelsContainer.classList.add('hidden');

        renderLabels(); // Refresh labels to show admin buttons
        renderPrizes(); // Refresh prizes to hide draw buttons
        renderDrawPrizesList(); // Render draw prizes list in tab
        renderAdminPrizesList(); // Render admin prizes list
    } else {
        // Closing admin panel
        adminPanel.classList.add('hidden');
        isAdminAuthenticated = false;
        adminToggle.innerHTML = '<span class="icon">⚙️</span> Admin';

        // Show User Section and Labels when Admin Panel is closed
        const userMainSection = document.getElementById('userMainSection');
        if (userMainSection) userMainSection.classList.remove('hidden');

        if (labelsContainer) labelsContainer.classList.remove('hidden');

        showNotification('ออกจากระบบ Admin แล้ว');
        renderLabels(); // Refresh labels to hide admin buttons
        renderPrizes(); // Refresh prizes to hide admin buttons
        cancelEdit(); // Cancel any ongoing edit
    }
});

// ===== Admin Tab Switching =====
const adminTabs = document.querySelectorAll('.admin-tab');
const adminTabContents = document.querySelectorAll('.admin-tab-content');

adminTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');

        // Remove active class from all tabs and contents
        adminTabs.forEach(t => t.classList.remove('active'));
        adminTabContents.forEach(c => c.classList.remove('active'));

        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');

        // If switching to draw tab, render the list
        if (tabName === 'draw') {
            renderDrawPrizesList();
        }
    });
});

// ===== Change Password Button =====
document.addEventListener('DOMContentLoaded', () => {
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', changeAdminPassword);
    }
});


prizeForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Use dataset ID as backup or primary source of truth
    const editingId = editingPrizeId || (prizeForm.dataset.id ? parseInt(prizeForm.dataset.id) : null);

    if (editingId) {
        // Update existing prize
        const prize = prizes.find(p => p.id === editingId);
        if (prize) {
            // Backup entries to ensure they are never lost
            const currentEntries = prize.entries || [];

            prize.name = document.getElementById('prizeName').value;
            prize.description = document.getElementById('prizeDescription').value;

            // Parse multiple image URLs
            const imageInput = document.getElementById('prizeImage').value;
            prize.images = imageInput
                .split(',')
                .map(url => url.trim())
                .filter(url => url.length > 0);

            prize.deadline = document.getElementById('prizeDeadline').value;

            // Explicitly restore entries (though they shouldn't have changed)
            prize.entries = currentEntries;

            savePrizes();
            renderPrizes();
            renderAdminPrizesList();
            showNotification('แก้ไขของรางวัลสำเร็จ! 💾');

            cancelEdit();
        }
    } else {
        // Create new prize
        const imageInput = document.getElementById('prizeImage').value;
        const images = imageInput
            .split(',')
            .map(url => url.trim())
            .filter(url => url.length > 0);

        const prize = {
            id: Date.now(),
            name: document.getElementById('prizeName').value,
            description: document.getElementById('prizeDescription').value,
            images: images,
            deadline: document.getElementById('prizeDeadline').value,
            entries: [],
            winner: null,
            createdAt: new Date().toISOString()
        };

        prizes.push(prize);
        savePrizes();
        renderPrizes();
        renderAdminPrizesList();
        updateEmptyState();
        prizeForm.reset();
        setMinDateTime();

        showNotification('เพิ่มของรางวัลสำเร็จ! 🎉');
    }
});

// ===== Render Draw Prizes List (Admin Tab) =====
function renderDrawPrizesList() {
    const drawPrizesList = document.getElementById('drawPrizesList');
    if (!drawPrizesList) return;

    const now = new Date();

    // Get only expired prizes (same logic as user winners tab)
    const expiredPrizes = prizes.filter(prize => {
        const deadline = new Date(prize.deadline);
        return now >= deadline; // Show only expired prizes
    });

    // Separate into undrawn and drawn
    const undrawPrizes = expiredPrizes.filter(prize => {
        return prize.winner === null && prize.entries.length > 0;
    });

    const drawnPrizes = expiredPrizes.filter(prize => {
        return prize.winner !== null;
    });

    let html = '';

    // Section 1: Undrawn Prizes (Ready to Draw)
    if (undrawPrizes.length > 0) {
        html += `
            <div style="margin-bottom: 2rem;">
                <h3 style="color: var(--text-primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1.5rem;">🎡</span>
                    พร้อมหมุนวงล้อ
                    <span style="background: rgba(102, 126, 234, 0.2); color: #667eea; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.85rem; font-weight: 600;">${undrawPrizes.length}</span>
                </h3>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    ${undrawPrizes.map(prize => {
            // Get prize image
            const images = prize.images || (prize.image ? [prize.image] : []);
            const imageHtml = images.length > 0
                ? `<img src="${images[0]}" alt="${prize.name}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 0.75rem; border: 2px solid rgba(118, 75, 162, 0.3);">`
                : '<div style="width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; background: rgba(118, 75, 162, 0.2); border-radius: 0.75rem; font-size: 3rem;">🎁</div>';

            return `
                        <div class="draw-prize-item" style="display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem; background: rgba(102, 126, 234, 0.05); border-radius: var(--radius-md); border: 2px solid rgba(102, 126, 234, 0.1);">
                            ${imageHtml}
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
                                    <h4 style="margin: 0; color: var(--text-primary); font-size: 1.3rem;">${prize.name}</h4>
                                    <span style="background: rgba(255, 152, 0, 0.2); color: #ff9800; padding: 0.3rem 0.6rem; border-radius: 0.3rem; font-size: 0.85rem; font-weight: 600;">⏰ หมดเวลาแล้ว</span>
                                </div>
                                <p style="margin: 0 0 0.75rem 0; color: var(--text-muted); font-size: 1.1rem; line-height: 1.5;">${prize.description || 'ไม่มีรายละเอียด'}</p>
                                <div style="display: flex; gap: 1.5rem; font-size: 0.95rem; color: var(--text-muted);">
                                    <span>👥 ${prize.entries.length} คน</span>
                                    <span>⏰ ${formatDateTime(prize.deadline)}</span>
                                </div>
                            </div>
                            <button class="btn-primary" onclick="showWheelModal(${prize.id});" style="white-space: nowrap; font-size: 1.1rem; padding: 0.75rem 1.5rem;">
                                <span class="icon">🎡</span> หมุนวงล้อ
                            </button>
                        </div>
                    `;
        }).join('')}
                </div>
            </div>
        `;
    } else {
        html += `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted); background: rgba(102, 126, 234, 0.05); border-radius: var(--radius-md); border: 2px dashed rgba(102, 126, 234, 0.2);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎡</div>
                <p>ยังไม่มีของรางวัลที่พร้อมหมุนวงล้อ</p>
                <small>รอของรางวัลหมดเวลาเข้าร่วม</small>
            </div>
        `;
    }

    // Section 2: Drawn Prizes (Already Have Winners)
    if (drawnPrizes.length > 0) {
        html += `
            <div style="margin-bottom: 2rem;">
                <h3 style="color: var(--text-primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1.5rem;">🏆</span>
                    สุ่มเสร็จแล้ว
                    <span style="background: rgba(245, 87, 108, 0.2); color: #f5576c; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.85rem; font-weight: 600;">${drawnPrizes.length}</span>
                </h3>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    ${drawnPrizes.map(prize => {
            const deadline = new Date(prize.deadline);
            const isExpired = now >= deadline;
            const statusBadge = isExpired
                ? '<span style="background: rgba(255, 152, 0, 0.2); color: #ff9800; padding: 0.3rem 0.6rem; border-radius: 0.3rem; font-size: 0.85rem; font-weight: 600;">⏰ หมดเวลาแล้ว</span>'
                : '<span style="background: rgba(76, 175, 80, 0.2); color: #4caf50; padding: 0.3rem 0.6rem; border-radius: 0.3rem; font-size: 0.85rem; font-weight: 600;">✅ เปิดรับอยู่</span>';

            // Get prize image
            const images = prize.images || (prize.image ? [prize.image] : []);
            const imageHtml = images.length > 0
                ? `<img src="${images[0]}" alt="${prize.name}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 0.75rem; border: 2px solid rgba(245, 87, 108, 0.3);">`
                : '<div style="width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; background: rgba(245, 87, 108, 0.2); border-radius: 0.75rem; font-size: 3rem;">🎁</div>';

            return `
                        <div class="draw-prize-item" style="display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem; background: rgba(245, 87, 108, 0.1); border-radius: var(--radius-md); border: 2px solid rgba(245, 87, 108, 0.2);">
                            ${imageHtml}
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
                                    <h4 style="margin: 0; color: var(--text-primary); font-size: 1.3rem;">${prize.name}</h4>
                                    ${statusBadge}
                                </div>
                                <p style="margin: 0 0 0.75rem 0; color: var(--text-muted); font-size: 1.1rem; line-height: 1.5;">${prize.description || 'ไม่มีรายละเอียด'}</p>
                                <div style="display: flex; gap: 1.5rem; font-size: 1rem; color: var(--text-muted);">
                                    <span>🏆 ผู้ชนะ: <strong style="color: var(--primary); font-size: 1.1rem;">${prize.winner.name}</strong> (@${prize.winner.twitter})</span>
                                </div>
                                <div style="display: flex; gap: 1.5rem; font-size: 0.95rem; color: var(--text-muted); margin-top: 0.5rem;">
                                    <span>👥 ${prize.entries.length} คน</span>
                                    <span>⏰ ${formatDateTime(prize.deadline)}</span>
                                </div>
                            </div>
                            <button class="btn-secondary" onclick="showWinner(${prize.id});" style="white-space: nowrap; font-size: 1.1rem; padding: 0.75rem 1.5rem;">
                                👁️ ดูผู้ชนะ
                            </button>
                        </div>
                    `;
        }).join('')}
                </div>
            </div>
        `;
    }

    // If no prizes at all
    if (undrawPrizes.length === 0 && drawnPrizes.length === 0) {
        html = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                <p>ยังไม่มีของรางวัลที่พร้อมสุ่ม</p>
                <small>ของรางวัลต้องมีผู้เข้าร่วมและยังไม่มีผู้ชนะ</small>
            </div>
        `;
    }

    drawPrizesList.innerHTML = html;
}

// ===== Render Admin Prizes List =====
function renderAdminPrizesList() {
    const adminPrizesList = document.getElementById('adminPrizesList');
    if (!adminPrizesList) return;

    const now = new Date();

    if (prizes.length === 0) {
        adminPrizesList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted); background: rgba(102, 126, 234, 0.05); border-radius: var(--radius-md); border: 2px dashed rgba(102, 126, 234, 0.2);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎁</div>
                <p>ยังไม่มีของรางวัล</p>
                <small>เพิ่มของรางวัลใหม่ด้วยฟอร์มด้านบน</small>
            </div>
        `;
        return;
    }

    adminPrizesList.innerHTML = prizes.map(prize => {
        const deadline = new Date(prize.deadline);
        const isExpired = now >= deadline;
        const hasWinner = prize.winner !== null;

        // Status badge for time
        const statusBadge = isExpired
            ? '<span style="background: rgba(255, 152, 0, 0.2); color: #ff9800; padding: 0.3rem 0.6rem; border-radius: 0.3rem; font-size: 0.85rem; font-weight: 600;">⏰ หมดเวลาแล้ว</span>'
            : '<span style="background: rgba(76, 175, 80, 0.2); color: #4caf50; padding: 0.3rem 0.6rem; border-radius: 0.3rem; font-size: 0.85rem; font-weight: 600;">✅ เปิดรับอยู่</span>';

        // Winner badge
        const winnerBadge = hasWinner
            ? '<span style="background: rgba(245, 87, 108, 0.2); color: #f5576c; padding: 0.3rem 0.6rem; border-radius: 0.3rem; font-size: 0.85rem; font-weight: 600;">🏆 มีผู้ชนะแล้ว</span>'
            : '';

        // Get prize image
        const images = prize.images || (prize.image ? [prize.image] : []);
        const imageHtml = images.length > 0
            ? `<img src="${images[0]}" alt="${prize.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 0.5rem; border: 2px solid rgba(102, 126, 234, 0.3);">`
            : '<div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; background: rgba(102, 126, 234, 0.2); border-radius: 0.5rem; font-size: 2rem;">🎁</div>';

        return `
        <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(102, 126, 234, 0.05); border-radius: var(--radius-md); border: 2px solid rgba(102, 126, 234, 0.15);">
            ${imageHtml}
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
                    <h4 style="margin: 0; color: var(--text-primary);">${prize.name}</h4>
                    ${statusBadge}
                    ${winnerBadge}
                </div>
                <p style="margin: 0 0 0.5rem 0; color: var(--text-muted); font-size: 0.9rem; line-height: 1.4;">${prize.description || 'ไม่มีรายละเอียด'}</p>
                <div style="display: flex; gap: 1rem; font-size: 0.9rem; color: var(--text-muted);">
                    <span>👥 ${prize.entries.length} คน</span>
                    <span>⏰ ${formatDateTime(prize.deadline)}</span>
                </div>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button class="btn-secondary" onclick="showParticipantsList(${prize.id});" style="white-space: nowrap; padding: 0.5rem 1rem; background: rgba(79, 172, 254, 0.2); color: #4facfe; border: 1px solid rgba(79, 172, 254, 0.3);">
                    👥 ดูผู้เข้าร่วม
                </button>
                <button class="btn-secondary" onclick="editPrize(${prize.id});" style="white-space: nowrap; padding: 0.5rem 1rem;">
                    ✏️ แก้ไข
                </button>
                <button class="btn-secondary" onclick="deletePrize(${prize.id});" style="white-space: nowrap; padding: 0.5rem 1rem; background: rgba(245, 87, 108, 0.2); color: #f5576c; border: 1px solid rgba(245, 87, 108, 0.3);">
                    🗑️ ลบ
                </button>
            </div>
        </div>
    `;
    }).join('');
}

// ===== Render Prizes =====
function renderPrizes() {
    prizesList.innerHTML = '';

    const now = new Date();
    // Filter only active prizes (not expired)
    const activePrizes = prizes.filter(prize => {
        const deadline = new Date(prize.deadline);
        return now < deadline; // Show only prizes that haven't expired
    });

    activePrizes.forEach(prize => {
        const prizeCard = createPrizeCard(prize);
        prizesList.appendChild(prizeCard);
    });
}

// ===== Create Prize Card =====
function createPrizeCard(prize) {
    const card = document.createElement('div');
    card.className = 'prize-card';

    const now = new Date();
    const deadline = new Date(prize.deadline);
    const isActive = now < deadline;
    const hasWinner = prize.winner !== null;

    // Handle both old 'image' field and new 'images' array
    const images = prize.images || (prize.image ? [prize.image] : []);

    let imageHtml = '';
    if (images.length > 0) {
        if (images.length === 1) {
            // Single image
            imageHtml = `<img src="${images[0]}" alt="${prize.name}" onclick="event.stopPropagation(); openImageViewer('${images[0]}');">`;
        } else {
            // Multiple images - create gallery
            imageHtml = `
                <div class="image-gallery">
                    <img class="gallery-main-image" src="${images[0]}" alt="${prize.name}" data-prize-id="${prize.id}" onclick="event.stopPropagation(); openImageViewer('${images[0]}');">
                    ${images.length > 1 ? `
                        <button class="gallery-nav prev" onclick="event.stopPropagation(); changeGalleryImage(${prize.id}, -1);">‹</button>
                        <button class="gallery-nav next" onclick="event.stopPropagation(); changeGalleryImage(${prize.id}, 1);">›</button>
                        <div class="gallery-dots">
                            ${images.map((_, index) => `<div class="gallery-dot ${index === 0 ? 'active' : ''}" onclick="event.stopPropagation(); setGalleryImage(${prize.id}, ${index});"></div>`).join('')}
                        </div>
                        <div class="image-count">${images.length} รูป</div>
                    ` : ''}
                </div>
            `;
        }
    } else {
        imageHtml = '<div class="prize-image">🎁</div>';
    }

    // Activity status badge (Active/Inactive)
    let activityStatusHtml = '';
    if (hasWinner) {
        activityStatusHtml = `
            <div class="prize-status inactive">
                <span class="status-dot"></span>
                Inactive
            </div>
        `;
    } else if (isActive) {
        activityStatusHtml = `
            <div class="prize-status active">
                <span class="status-dot"></span>
                Active
            </div>
        `;
    } else {
        activityStatusHtml = `
            <div class="prize-status inactive">
                <span class="status-dot"></span>
                Inactive
            </div>
        `;
    }

    // Status badge (winner/active/closed)
    let statusHtml = '';
    if (hasWinner) {
        statusHtml = '<span class="prize-status status-winner">มีผู้โชคดีแล้ว</span>';
    } else if (isActive) {
        statusHtml = '<span class="prize-status status-active">ร่วมลุ้นรางวัล</span>';
    } else {
        statusHtml = '<span class="prize-status status-ended">หมดเวลาเข้าร่วมแล้ว</span>';
    }

    // Admin action buttons
    let adminActionsHtml = '';
    if (isAdminAuthenticated) {
        adminActionsHtml = `
            <div class="admin-actions" style="display: flex; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <button class="btn-edit" onclick="event.stopPropagation(); editPrize(${prize.id});" style="flex: 1; padding: 0.5rem; background: rgba(79, 172, 254, 0.2); color: #4facfe; border: 1px solid rgba(79, 172, 254, 0.3); border-radius: 0.5rem; cursor: pointer; font-family: 'Kanit', sans-serif; font-size: 0.9rem;">
                    ✏️ แก้ไข
                </button>
                <button class="btn-delete" onclick="event.stopPropagation(); deletePrize(${prize.id});" style="flex: 1; padding: 0.5rem; background: rgba(245, 87, 108, 0.2); color: #f5576c; border: 1px solid rgba(245, 87, 108, 0.3); border-radius: 0.5rem; cursor: pointer; font-family: 'Kanit', sans-serif; font-size: 0.9rem;">
                    🗑️ ลบ
                </button>
            </div>
        `;
    }

    // Calculate time remaining for countdown
    let countdownHtml = '';
    if (isActive && !hasWinner) {
        const now = new Date();
        const diff = deadline - now;

        if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            let timeText = '';
            if (days > 0) {
                timeText = `${days} วัน ${hours} ชั่วโมง`;
            } else if (hours > 0) {
                timeText = `${hours} ชั่วโมง ${minutes} นาที`;
            } else {
                timeText = `${minutes} นาที`;
            }

            countdownHtml = `
                <div class="prize-countdown" data-deadline="${prize.deadline}">
                    <span class="countdown-icon">⏰</span>
                    <span class="countdown-text">เหลืออีก ${timeText}</span>
                </div>
            `;
        }
    }

    card.innerHTML = `
        <div class="prize-image">
            ${imageHtml}
        </div>
        <div class="prize-content">
            <div class="prize-header">
                <h3 class="prize-name">${prize.name}</h3>
                <div class="prize-badges">
                    ${activityStatusHtml}
                    ${statusHtml}
                </div>
            </div>
            <p class="prize-description">${prize.description || 'ไม่มีรายละเอียด'}</p>
            ${countdownHtml}
            <div class="prize-meta">
                <div class="prize-deadline">
                    ⏰ สิ้นสุด: ${formatDateTime(prize.deadline)}
                </div>
                <div class="prize-entries">
                    👥 ผู้เข้าร่วม: ${prize.entries.length} คน
                </div>
            </div>
            <div style="text-align: center; margin-top: 1rem; padding: 0.75rem; background: rgba(102, 126, 234, 0.1); border-radius: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">
                👆 คลิกเพื่อดูรายละเอียด
            </div>
            ${adminActionsHtml}
        </div>
    `;


    // Make card clickable to show detail
    card.addEventListener('click', (e) => {
        // Don't open detail if clicking on action buttons
        if (!e.target.closest('.prize-actions')) {
            openPrizeDetail(prize.id);
        }
    });

    return card;
}

// ===== Open Prize Detail Modal =====
function openPrizeDetail(prizeId) {
    const prize = prizes.find(p => p.id === prizeId);
    if (!prize) return;

    const now = new Date();
    const deadline = new Date(prize.deadline);
    const isActive = now < deadline;
    const hasWinner = prize.winner !== null;

    // Handle both old 'image' field and new 'images' array
    const images = prize.images || (prize.image ? [prize.image] : []);

    // Set image gallery
    const detailImage = document.getElementById('detailPrizeImage');
    if (images.length > 0) {
        if (images.length === 1) {
            // Single image
            detailImage.innerHTML = `<img src="${images[0]}" alt="${prize.name}" onclick="openImageViewer('${images[0]}');" style="cursor: pointer;">`;
        } else {
            // Multiple images - create gallery
            detailImage.innerHTML = `
                <div class="image-gallery" style="width: 100%; height: 100%;">
                    <img class="gallery-main-image" src="${images[0]}" alt="${prize.name}" data-prize-id="detail-${prize.id}" onclick="openImageViewer('${images[0]}');" style="cursor: pointer;">
                    <button class="gallery-nav prev" onclick="changeDetailGalleryImage(${prize.id}, -1);">‹</button>
                    <button class="gallery-nav next" onclick="changeDetailGalleryImage(${prize.id}, 1);">›</button>
                    <div class="gallery-dots">
                        ${images.map((_, index) => `<div class="gallery-dot ${index === 0 ? 'active' : ''}" onclick="setDetailGalleryImage(${prize.id}, ${index});"></div>`).join('')}
                    </div>
                    <div class="image-count">${images.length} รูป</div>
                </div>
            `;
        }
    } else {
        detailImage.innerHTML = '🎁';
    }

    // Set text content
    document.getElementById('detailPrizeName').textContent = prize.name;
    document.getElementById('detailPrizeDescription').textContent = prize.description || 'ไม่มีรายละเอียด';
    document.getElementById('detailDeadline').textContent = formatDateTime(prize.deadline);
    document.getElementById('detailEntries').textContent = `${prize.entries.length} คน`;

    // Status badge
    let statusHtml = '';
    let activityStatusHtml = '';

    // Activity status (Active/Inactive)
    if (hasWinner) {
        activityStatusHtml = `
            <div class="prize-status inactive">
                <span class="status-dot"></span>
                Inactive
            </div>
        `;
    } else if (isActive) {
        activityStatusHtml = `
            <div class="prize-status active">
                <span class="status-dot"></span>
                Active
            </div>
        `;
    } else {
        activityStatusHtml = `
            <div class="prize-status inactive">
                <span class="status-dot"></span>
                Inactive
            </div>
        `;
    }

    // Prize status badge (winner/active/closed)
    // Set status
    let statusText = '';
    if (hasWinner) {
        statusText = '🏆 มีผู้โชคดีแล้ว';
    } else if (isActive) {
        statusText = '🎯 ร่วมลุ้นรางวัล';
    } else {
        statusText = '🔒 ปิดรับสมัครแล้ว';
    }
    document.getElementById('detailStatus').textContent = statusText;

    // Set actions
    const detailActions = document.getElementById('detailActions');
    let actionsHtml = '';

    if (hasWinner) {
        actionsHtml = `
            <button class="btn-draw" onclick="closePrizeDetailModal(); showWinner(${prize.id});">
                🏆 ดูผู้โชคดี
            </button>
        `;
    } else if (isActive) {
        actionsHtml = `
            <button class="btn-enter" onclick="closePrizeDetailModal(); openEntryModal(${prize.id});">
                🎯 เข้าร่วมสุ่มรางวัล
            </button>
        `;
    } else {
        actionsHtml = `
            <button class="btn-secondary" disabled>
                🔒 หมดเวลาเข้าร่วมแล้ว
            </button>
        `;
    }


    detailActions.innerHTML = actionsHtml;

    // Show modal
    prizeDetailModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// ===== Close Prize Detail Modal =====
function closePrizeDetailModal() {
    prizeDetailModal.classList.add('hidden');
    document.body.style.overflow = '';
}

closePrizeDetail.addEventListener('click', closePrizeDetailModal);
prizeDetailModal.querySelector('.modal-overlay').addEventListener('click', closePrizeDetailModal);

// ===== Open Entry Modal =====
function openEntryModal(prizeId) {
    const prize = prizes.find(p => p.id === prizeId);
    if (!prize) return;

    const now = new Date();
    const deadline = new Date(prize.deadline);

    if (now >= deadline) {
        showNotification('ขออภัย กิจกรรมนี้ปิดรับสมัครแล้ว', 'error');
        return;
    }

    currentPrizeId = prizeId;
    modalPrizeName.textContent = prize.name;
    modalPrizeDescription.textContent = prize.description || 'ไม่มีรายละเอียด';
    entryModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// ===== Close Entry Modal =====
function closeEntryModal() {
    entryModal.classList.add('hidden');
    document.body.style.overflow = '';
    entryForm.reset();
    currentPrizeId = null;
}

closeModal.addEventListener('click', closeEntryModal);
cancelEntry.addEventListener('click', closeEntryModal);

entryModal.querySelector('.modal-overlay').addEventListener('click', closeEntryModal);

// ===== Entry Form Submission =====
entryForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const prize = prizes.find(p => p.id === currentPrizeId);
    if (!prize) return;

    const name = document.getElementById('participantName').value.trim();
    const twitter = document.getElementById('participantTwitter').value.trim();

    // Check if already entered
    const alreadyEntered = prize.entries.some(entry =>
        entry.name.toLowerCase() === name.toLowerCase() ||
        entry.twitter.toLowerCase() === twitter.toLowerCase()
    );

    if (alreadyEntered) {
        showNotification('คุณได้เข้าร่วมกิจกรรมนี้แล้ว', 'error');
        return;
    }

    const entry = {
        id: Date.now(),
        name: name,
        twitter: twitter,
        enteredAt: new Date().toISOString()
    };

    prize.entries.push(entry);
    savePrizes();
    renderPrizes();
    closeEntryModal();

    showNotification('เข้าร่วมสุ่มรางวัลสำเร็จ! 🎉');
});

// ===== Draw Winner =====
function drawWinner(prizeId) {
    // Check admin authentication before drawing winner
    if (!isAdminAuthenticated) {
        if (!checkAdminPassword()) {
            return; // Authentication failed
        }
    }

    const prize = prizes.find(p => p.id === prizeId);
    if (!prize || prize.entries.length === 0) {
        showNotification('ไม่มีผู้เข้าร่วมในกิจกรรมนี้', 'error');
        return;
    }

    if (prize.winner) {
        showWinner(prizeId);
        return;
    }

    // Random winner selection with animation
    const randomIndex = Math.floor(Math.random() * prize.entries.length);
    const winner = prize.entries[randomIndex];

    prize.winner = winner;
    savePrizes();
    renderPrizes();

    // Show winner modal with delay for effect
    setTimeout(() => {
        showWinner(prizeId);
    }, 300);
}

// ===== Show Winner =====
function showWinner(prizeId) {
    const prize = prizes.find(p => p.id === prizeId);
    if (!prize || !prize.winner) return;

    winnerName.textContent = prize.winner.name;
    winnerTwitter.textContent = `@${prize.winner.twitter}`;
    winnerPrizeName.textContent = prize.name;

    // Populate prize details
    const images = prize.images || (prize.image ? [prize.image] : []);
    const winnerPrizeImage = document.getElementById('winnerPrizeImage');
    const winnerPrizeDescription = document.getElementById('winnerPrizeDescription');

    // Set prize image
    if (images.length > 0) {
        winnerPrizeImage.innerHTML = `<img src="${images[0]}" alt="${prize.name}" style="max-width: 100%; max-height: 180px; border-radius: 0.5rem; object-fit: contain; cursor: pointer;" onclick="openImageViewer('${images[0]}');">`;
    } else {
        winnerPrizeImage.innerHTML = '<div style="font-size: 3rem;">🎁</div>';
    }

    // Set prize description
    winnerPrizeDescription.textContent = prize.description || 'ไม่มีรายละเอียด';

    winnerModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// ===== Close Winner Modal =====
function closeWinnerModalFunc() {
    winnerModal.classList.add('hidden');
    document.body.style.overflow = '';
}

closeWinnerModal.addEventListener('click', closeWinnerModalFunc);
winnerModal.querySelector('.modal-overlay').addEventListener('click', closeWinnerModalFunc);

// ===== Delete Prize =====
function deletePrize(prizeId) {
    const prize = prizes.find(p => p.id === prizeId);
    if (!prize) return;

    const confirmDelete = confirm(`คุณแน่ใจหรือไม่ที่จะลบของรางวัล "${prize.name}"?\n\nการลบจะไม่สามารถกู้คืนได้!`);

    if (confirmDelete) {
        prizes = prizes.filter(p => p.id !== prizeId);
        savePrizes();
        renderPrizes();
        renderAdminPrizesList();
        updateEmptyState();
        showNotification('ลบของรางวัลสำเร็จ! 🗑️');
    }
}

// ===== Edit Prize =====
function editPrize(prizeId) {
    const prize = prizes.find(p => p.id === prizeId);
    if (!prize) return;

    editingPrizeId = prizeId;

    // Populate form with existing data
    document.getElementById('prizeName').value = prize.name;
    document.getElementById('prizeDescription').value = prize.description || '';

    // Handle both old 'image' field and new 'images' array
    const images = prize.images || (prize.image ? [prize.image] : []);
    document.getElementById('prizeImage').value = images.join(', ');

    // Convert ISO datetime to local datetime-local format
    const deadline = new Date(prize.deadline);
    deadline.setMinutes(deadline.getMinutes() - deadline.getTimezoneOffset());
    document.getElementById('prizeDeadline').value = deadline.toISOString().slice(0, 16);

    // Scroll to admin panel and show it
    if (adminPanel.classList.contains('hidden')) {
        adminPanel.classList.remove('hidden');
        adminToggle.innerHTML = '<span class="icon">🔓</span> Admin (ออกจากระบบ)';

        // Hide User Section and Labels when Admin Panel is open
        const userMainSection = document.getElementById('userMainSection');
        if (userMainSection) userMainSection.classList.add('hidden');
        if (labelsContainer) labelsContainer.classList.add('hidden');
    }

    // Switch to "Add Prize" tab
    const addTabBtn = document.querySelector('.admin-tab[data-tab="add"]');
    if (addTabBtn) {
        addTabBtn.click();
    }

    adminPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Change button text and show cancel button
    const submitBtn = document.getElementById('savePrizeBtn') || prizeForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<span class="icon">💾</span> บันทึกการแก้ไข';
    submitBtn.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';

    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) {
        cancelBtn.style.display = 'block';
        cancelBtn.innerHTML = '<span class="icon">✖️</span> ยกเลิกการแก้ไข';
    }

    showNotification('กำลังแก้ไขของรางวัล ✏️', 'success');

    // Set data attribute for robustness
    prizeForm.dataset.id = prizeId;
}

function cancelEdit() {
    editingPrizeId = null;
    delete prizeForm.dataset.id; // Clear data attribute
    prizeForm.reset();
    setMinDateTime();

    const submitBtn = prizeForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<span class="icon">➕</span> เพิ่มของรางวัล';
    submitBtn.style.background = '';

    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) cancelBtn.style.display = 'none';
}

// ===== Image Gallery Functions =====
const galleryStates = new Map(); // Store current index for each prize

function changeGalleryImage(prizeId, direction) {
    const prize = prizes.find(p => p.id === prizeId);
    if (!prize) return;

    const images = prize.images || (prize.image ? [prize.image] : []);
    if (images.length <= 1) return;

    // Get or initialize current index
    let currentIndex = galleryStates.get(prizeId) || 0;
    currentIndex = (currentIndex + direction + images.length) % images.length;
    galleryStates.set(prizeId, currentIndex);

    updateGalleryDisplay(prizeId, currentIndex, images);
}

function setGalleryImage(prizeId, index) {
    const prize = prizes.find(p => p.id === prizeId);
    if (!prize) return;

    const images = prize.images || (prize.image ? [prize.image] : []);
    if (index < 0 || index >= images.length) return;

    galleryStates.set(prizeId, index);
    updateGalleryDisplay(prizeId, index, images);
}

function updateGalleryDisplay(prizeId, currentIndex, images) {
    // Find the gallery image element
    const galleryImg = document.querySelector(`.gallery-main-image[data-prize-id="${prizeId}"]`);
    if (galleryImg) {
        galleryImg.src = images[currentIndex];
        galleryImg.onclick = (e) => {
            e.stopPropagation();
            openImageViewer(images[currentIndex]);
        };
    }

    // Update dots
    const card = galleryImg?.closest('.prize-card');
    if (card) {
        const dots = card.querySelectorAll('.gallery-dot');
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
}

// ===== Full Image Viewer =====
function openImageViewer(imageUrl) {
    fullSizeImage.src = imageUrl;
    imageViewerModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeImageViewerFunc() {
    imageViewerModal.classList.add('hidden');
    document.body.style.overflow = '';
}

closeImageViewer.addEventListener('click', closeImageViewerFunc);
imageViewerModal.querySelector('.modal-overlay').addEventListener('click', closeImageViewerFunc);

// ===== Detail Modal Gallery Functions =====
const detailGalleryStates = new Map();

function changeDetailGalleryImage(prizeId, direction) {
    const prize = prizes.find(p => p.id === prizeId);
    if (!prize) return;

    const images = prize.images || (prize.image ? [prize.image] : []);
    if (images.length <= 1) return;

    let currentIndex = detailGalleryStates.get(prizeId) || 0;
    currentIndex = (currentIndex + direction + images.length) % images.length;
    detailGalleryStates.set(prizeId, currentIndex);

    updateDetailGalleryDisplay(prizeId, currentIndex, images);
}

function setDetailGalleryImage(prizeId, index) {
    const prize = prizes.find(p => p.id === prizeId);
    if (!prize) return;

    const images = prize.images || (prize.image ? [prize.image] : []);
    if (index < 0 || index >= images.length) return;

    detailGalleryStates.set(prizeId, index);
    updateDetailGalleryDisplay(prizeId, index, images);
}

function updateDetailGalleryDisplay(prizeId, currentIndex, images) {
    const galleryImg = document.querySelector(`.gallery-main-image[data-prize-id="detail-${prizeId}"]`);
    if (galleryImg) {
        galleryImg.src = images[currentIndex];
        galleryImg.onclick = () => openImageViewer(images[currentIndex]);
    }

    const detailImage = document.getElementById('detailPrizeImage');
    if (detailImage) {
        const dots = detailImage.querySelectorAll('.gallery-dot');
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
}

// ===== Helper Functions =====
function savePrizes() {
    localStorage.setItem('prizes', JSON.stringify(prizes));
}

function updateEmptyState() {
    if (prizes.length === 0) {
        emptyState.classList.remove('hidden');
        prizesList.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        prizesList.classList.remove('hidden');
    }
}

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('th-TH', options);
}

function setMinDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('prizeDeadline').min = now.toISOString().slice(0, 16);
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-family: 'Kanit', sans-serif;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== User Tab Switching =====
const userTabs = document.querySelectorAll('.user-tab');
const joinTab = document.getElementById('joinTab');
const winnersTab = document.getElementById('winnersTab');

userTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;

        // Update active tab
        userTabs.forEach(t => {
            t.classList.remove('active');
            t.style.color = 'var(--text-muted)';
            t.style.borderBottom = '3px solid transparent';
        });
        tab.classList.add('active');
        tab.style.color = 'var(--primary)';
        tab.style.borderBottom = '3px solid var(--primary)';

        // Show/hide tab content
        if (tabName === 'join') {
            joinTab.classList.remove('hidden');
            winnersTab.classList.add('hidden');
        } else if (tabName === 'winners') {
            joinTab.classList.add('hidden');
            winnersTab.classList.remove('hidden');
            renderWinnersList(); // Render winners when tab is opened
        }
    });
});

// ===== Render Winners List =====
function renderWinnersList() {
    const winnersList = document.getElementById('winnersList');
    if (!winnersList) return;

    const now = new Date();
    // Get all expired prizes (both with and without winners)
    const expiredPrizes = prizes.filter(prize => {
        const deadline = new Date(prize.deadline);
        return now >= deadline; // Show only expired prizes
    });

    if (expiredPrizes.length === 0) {
        winnersList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🏆</div>
                <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">ยังไม่มีของรางวัลที่หมดอายุ</h3>
                <p>รอของรางวัลหมดเวลาเข้าร่วม</p>
            </div>
        `;
        return;
    }

    // Clear and use grid layout like join tab
    winnersList.innerHTML = '';
    winnersList.style.display = 'grid';
    winnersList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    winnersList.style.gap = '1.5rem';

    expiredPrizes.forEach(prize => {
        const card = createWinnerPrizeCard(prize);
        winnersList.appendChild(card);
    });
}

// ===== Create Winner Prize Card =====
function createWinnerPrizeCard(prize) {
    const card = document.createElement('div');
    card.className = 'prize-card';

    // Handle both old 'image' field and new 'images' array
    const images = prize.images || (prize.image ? [prize.image] : []);

    let imageHtml = '';
    if (images.length > 0) {
        if (images.length === 1) {
            imageHtml = `<div class="prize-image"><img src="${images[0]}" alt="${prize.name}" onclick="event.stopPropagation(); openImageViewer('${images[0]}');"></div>`;
        } else {
            imageHtml = `
                <div class="image-gallery">
                    <img class="gallery-main-image" src="${images[0]}" alt="${prize.name}" data-prize-id="${prize.id}" onclick="event.stopPropagation(); openImageViewer('${images[0]}');">
                    ${images.length > 1 ? `
                        <button class="gallery-nav prev" onclick="event.stopPropagation(); changeGalleryImage(${prize.id}, -1);">‹</button>
                        <button class="gallery-nav next" onclick="event.stopPropagation(); changeGalleryImage(${prize.id}, 1);">›</button>
                        <div class="gallery-dots">
                            ${images.map((_, index) => `<div class="gallery-dot ${index === 0 ? 'active' : ''}" onclick="event.stopPropagation(); setGalleryImage(${prize.id}, ${index});"></div>`).join('')}
                        </div>
                        <div class="image-count">${images.length} รูป</div>
                    ` : ''}
                </div>
            `;
        }
    } else {
        imageHtml = '<div class="prize-image">🎁</div>';
    }

    // Check if prize has winner
    const hasWinner = prize.winner !== null;

    // Status badge with improved styling
    let statusHtml = '';
    let buttonHtml = '';

    if (hasWinner) {
        statusHtml = '<span class="prize-status status-winner" style="background: linear-gradient(135deg, rgba(245, 87, 108, 0.3) 0%, rgba(240, 147, 251, 0.3) 100%); color: #f5576c; border: 2px solid rgba(245, 87, 108, 0.5); box-shadow: 0 0 15px rgba(245, 87, 108, 0.3); padding: 0.4rem 0.75rem; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 600;">🏆 มีผู้โชคดีแล้ว</span>';
        buttonHtml = `
            <button class="btn-reveal-winner" onclick="revealWinner(${prize.id});" style="
                width: 100%; 
                margin-top: 0.75rem; 
                background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); 
                border: none; 
                padding: 0.75rem 1.25rem; 
                border-radius: 0.75rem; 
                color: white; 
                font-weight: 700; 
                font-size: 1rem;
                cursor: pointer; 
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(245, 87, 108, 0.6)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(245, 87, 108, 0.4)';">
                🏆 ดูผู้โชคดี
            </button>
        `;
    } else {
        statusHtml = '<span class="prize-status status-ended" style="background: rgba(158, 158, 158, 0.2); color: #9e9e9e; border: 2px solid rgba(158, 158, 158, 0.3); padding: 0.4rem 0.75rem; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 600;">⏰ หมดเวลาแล้ว</span>';
        buttonHtml = `
            <div style="
                width: 100%; 
                margin-top: 0.75rem; 
                background: rgba(158, 158, 158, 0.1); 
                border: 2px dashed rgba(158, 158, 158, 0.3); 
                padding: 0.75rem 1.25rem; 
                border-radius: 0.75rem; 
                color: #9e9e9e; 
                font-weight: 600; 
                font-size: 0.95rem;
                text-align: center;
            ">
                ไม่มีผู้โชคดี
            </div>
        `;
    }

    card.innerHTML = `
        ${imageHtml}
        <div class="prize-content" style="padding: 1rem;">
            <div class="prize-header" style="margin-bottom: 0.5rem;">
                <h3 class="prize-name" style="margin: 0 0 0.5rem 0;">${prize.name}</h3>
                ${statusHtml}
            </div>
            <p class="prize-description" style="margin: 0 0 0.75rem 0;">${prize.description || 'ไม่มีรายละเอียด'}</p>
            <div class="prize-meta" style="margin-bottom: 0;">
                <div class="meta-item">
                    <span class="meta-icon">👥</span>
                    <span class="meta-text">${prize.entries.length} คน</span>
                </div>
                <div class="meta-item">
                    <span class="meta-icon">⏰</span>
                    <span class="meta-text">${formatDateTime(prize.deadline)}</span>
                </div>
            </div>
            ${buttonHtml}
        </div>
    `;

    // Add card hover effect
    card.style.transition = 'all 0.3s ease';
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
        card.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.15)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '';
    });

    return card;
}

// ===== Reveal Winner with Animation =====
if (closeWinnerReveal) {
    closeWinnerReveal.addEventListener('click', () => {
        winnerRevealModal.classList.add('hidden');
        document.body.style.overflow = '';
        // Reset phases
        countdownPhase.classList.remove('hidden');
        spinningPhase.classList.add('hidden');
        winnerPhase.classList.add('hidden');
    });
}


function revealWinner(prizeId) {
    const prize = prizes.find(p => p.id === prizeId);
    if (!prize || !prize.winner) return;

    // Show modal
    winnerRevealModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Skip countdown and spinning - show winner immediately
    countdownPhase.classList.add('hidden');
    spinningPhase.classList.add('hidden');
    winnerPhase.classList.remove('hidden');

    // Show winner with confetti immediately
    showWinnerWithConfetti(prize);
}

function showWinnerWithConfetti(prize) {
    winnerPhase.classList.remove('hidden');

    // Set prize and winner info
    const images = prize.images || (prize.image ? [prize.image] : []);
    const revealPrizeImage = document.getElementById('revealPrizeImage');
    if (images.length > 0) {
        revealPrizeImage.innerHTML = `<img src="${images[0]}" alt="${prize.name}" style="width: 100%; max-width: 300px; height: auto; object-fit: cover; border-radius: 0.75rem; border: 2px solid rgba(255, 255, 255, 0.3); margin: 0 auto; display: block;">`;
    } else {
        revealPrizeImage.innerHTML = '<div style="font-size: 5rem;">🎁</div>';
    }

    document.getElementById('revealPrizeName').textContent = prize.name;
    document.getElementById('revealWinnerName').textContent = prize.winner.name;
    document.getElementById('revealWinnerTwitter').textContent = `@${prize.winner.twitter}`;

    // Set prize description
    const revealPrizeDescription = document.getElementById('revealPrizeDescription');
    if (prize.description) {
        revealPrizeDescription.textContent = prize.description;
    } else {
        revealPrizeDescription.style.display = 'none';
    }

    // Create confetti
    createConfetti();
}

function createConfetti() {
    const confettiContainer = document.getElementById('confettiContainer');
    confettiContainer.innerHTML = '';

    const colors = ['#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const animationDuration = 2 + Math.random() * 3;
        const delay = Math.random() * 0.5;

        confetti.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: ${color};
            top: -10px;
            left: ${left}%;
            opacity: 1;
            animation: confettiFall ${animationDuration}s linear ${delay}s forwards;
            border-radius: 50%;
        `;

        confettiContainer.appendChild(confetti);
    }
}

// Add confetti animation to the existing style tag
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes confettiFall {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }

    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    @keyframes bounce {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-20px);
        }
    }

    @keyframes slideUp {
        from {
            transform: translateY(50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(confettiStyle);

// ===== Participants List Modal =====
let currentWheelPrizeId = null;

function showParticipantsList(prizeId) {
    const prize = prizes.find(p => p.id === prizeId);
    if (!prize) return;

    const modal = document.getElementById('participantsModal');
    const prizeName = document.getElementById('participantsPrizeName');
    const count = document.getElementById('participantsCount');
    const list = document.getElementById('participantsList');

    prizeName.textContent = prize.name;
    count.textContent = `ผู้เข้าร่วมทั้งหมด ${prize.entries.length} คน`;

    if (prize.entries.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">👥</div>
                <p>ยังไม่มีผู้เข้าร่วม</p>
            </div>
        `;
    } else {
        list.innerHTML = prize.entries.map((entry, index) => `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(102, 126, 234, 0.05); border-radius: 0.5rem; margin-bottom: 0.75rem; border: 1px solid rgba(102, 126, 234, 0.1);">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.1rem;">
                    ${index + 1}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">
                        ${entry.name}
                    </div>
                    <div style="color: var(--text-muted); font-size: 0.9rem;">
                        @${entry.twitter}
                    </div>
                </div>
            </div>
        `).join('');
    }

    modal.classList.remove('hidden');
}

// Close participants modal
document.getElementById('closeParticipants').addEventListener('click', () => {
    document.getElementById('participantsModal').classList.add('hidden');
});

// ===== Wheel of Fortune =====
const wheelColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
];

function showWheelModal(prizeId) {
    const prize = prizes.find(p => p.id === prizeId);
    if (!prize || prize.entries.length === 0) {
        alert('ไม่มีผู้เข้าร่วมในรางวัลนี้');
        return;
    }

    currentWheelPrizeId = prizeId;
    const modal = document.getElementById('wheelModal');
    const prizeName = document.getElementById('wheelPrizeName');

    prizeName.textContent = `รางวัล: ${prize.name}`;

    // Draw wheel
    drawWheel(prize.entries);

    modal.classList.remove('hidden');
}

// Close wheel modal
document.getElementById('closeWheel').addEventListener('click', () => {
    document.getElementById('wheelModal').classList.add('hidden');
    currentWheelPrizeId = null;
});

function drawWheel(entries) {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 10;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const anglePerSegment = (2 * Math.PI) / entries.length;

    // Draw segments
    entries.forEach((entry, index) => {
        const startAngle = index * anglePerSegment;
        const endAngle = startAngle + anglePerSegment;
        const color = wheelColors[index % wheelColors.length];

        // Draw segment
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + anglePerSegment / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Kanit, sans-serif';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;

        // Truncate long names
        let displayName = entry.name;
        if (displayName.length > 12) {
            displayName = displayName.substring(0, 10) + '...';
        }

        ctx.fillText(displayName, radius * 0.65, 5);
        ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 5;
    ctx.stroke();
}

let isSpinning = false;
let currentRotation = 0;

function spinWheel() {
    if (isSpinning) return;

    const prize = prizes.find(p => p.id === currentWheelPrizeId);
    if (!prize || prize.entries.length === 0) return;

    isSpinning = true;
    const spinButton = document.getElementById('spinButton');
    spinButton.disabled = true;
    spinButton.style.opacity = '0.5';
    spinButton.style.cursor = 'not-allowed';

    const canvas = document.getElementById('wheelCanvas');
    const entries = prize.entries;
    const anglePerSegment = (2 * Math.PI) / entries.length;

    // Random winner
    const winnerIndex = Math.floor(Math.random() * entries.length);
    const winner = entries[winnerIndex];

    // Calculate target rotation
    const spins = 5 + Math.random() * 3; // 5-8 full rotations
    const targetAngle = (spins * 2 * Math.PI) + (winnerIndex * anglePerSegment) + (anglePerSegment / 2);

    const duration = 5000; // 5 seconds
    const startTime = Date.now();
    const startRotation = currentRotation;

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        currentRotation = startRotation + (targetAngle * easeOut);

        // Rotate canvas
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(currentRotation);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        // Redraw wheel
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = canvas.width / 2 - 10;

        entries.forEach((entry, index) => {
            const startAngle = index * anglePerSegment;
            const endAngle = startAngle + anglePerSegment;
            const color = wheelColors[index % wheelColors.length];

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + anglePerSegment / 2);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px Kanit, sans-serif';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 4;

            let displayName = entry.name;
            if (displayName.length > 12) {
                displayName = displayName.substring(0, 10) + '...';
            }

            ctx.fillText(displayName, radius * 0.65, 5);
            ctx.restore();
        });

        // Center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.restore();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Spinning complete - show winner
            setTimeout(() => {
                announceWinner(prize, winner);
            }, 500);
        }
    }

    animate();
}

function announceWinner(prize, winner) {
    // Save winner
    prize.winner = winner;
    savePrizes();

    // Close wheel modal
    document.getElementById('wheelModal').classList.add('hidden');

    // Show winner with confetti
    setTimeout(() => {
        alert(`🎉 ผู้โชคดีคือ: ${winner.name} (@${winner.twitter})`);

        // Refresh lists
        renderDrawPrizesList();
        renderWinnersList();
        renderAdminPrizesList();

        isSpinning = false;
        currentWheelPrizeId = null;
    }, 300);
}

