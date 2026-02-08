import { addPrize, updatePrize, deletePrize, addLabel, updateLabel, deleteLabel } from './common.js';

// ===== DOM Elements =====
const adminPanel = document.getElementById('adminPanel'); // Main container
const prizeForm = document.getElementById('prizeForm');
const adminPrizesList = document.getElementById('adminPrizesList');
const drawPrizesList = document.getElementById('drawPrizesList');
const labelsList = document.getElementById('labelsList');
const labelTextInput = document.getElementById('labelText');
const addLabelBtn = document.getElementById('addLabelBtn');
const cancelLabelEditBtn = document.getElementById('cancelLabelEditBtn');

// Winner Modal (Simple View for Admin)
const winnerModal = document.getElementById('winnerModal');
const closeWinnerModal = document.getElementById('closeWinnerModal');
const winnerName = document.getElementById('winnerName');
const winnerTwitter = document.getElementById('winnerTwitter');
const winnerPrizeName = document.getElementById('winnerPrizeName');

// Participants Modal
const participantsModal = document.getElementById('participantsModal');
const closeParticipants = document.getElementById('closeParticipants');
const participantsPrizeName = document.getElementById('participantsPrizeName');
const participantsCount = document.getElementById('participantsCount');
const participantsList = document.getElementById('participantsList');

// Wheel Modal
const wheelModal = document.getElementById('wheelModal');
const closeWheel = document.getElementById('closeWheel');
const wheelPrizeName = document.getElementById('wheelPrizeName');
const spinButton = document.getElementById('spinButton');
const wheelCanvas = document.getElementById('wheelCanvas');

// ===== State =====
let editingPrizeId = null;
let editingLabelId = null;
let isAdminAuthenticated = false;
const DEFAULT_ADMIN_PASSWORD = 'admin123';

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    initializeAdminPassword();

    // Force Authentication Check
    if (!checkAdminPassword()) {
        document.body.innerHTML = `
            <div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;gap:1.5rem; background:linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color:white; font-family:'Kanit', sans-serif;">
                <div style="font-size:3rem;">🔒</div>
                <h2 style="font-size:2rem; margin:0;">Access Denied</h2>
                <p style="color:#a0a0a0;">ต้องใช้รหัสผ่าน Admin เพื่อเข้าถึงหน้านี้</p>
                <div style="display:flex; gap:1rem;">
                    <button onclick="location.href='index.html'" style="padding:0.75rem 1.5rem; border:none; border-radius:8px; background:rgba(255,255,255,0.1); color:white; cursor:pointer;">🏠 กลับหน้าหลัก</button>
                    <button onclick="location.reload()" style="padding:0.75rem 1.5rem; border:none; border-radius:8px; background:#4facfe; color:white; cursor:pointer; font-weight:600;">🔄 ลองใหม่อีกครั้ง</button>
                </div>
            </div>`;
        return;
    }

    // Subscribe to data updates
    window.addEventListener('labelsUpdated', renderAdminLabels);
    window.addEventListener('prizesUpdated', () => {
        renderAdminPrizesList();
        renderDrawPrizesList();
    });

    // Initial render attempt (though events will fire shortly after connect)
    renderAdminLabels();
    renderAdminPrizesList();
    renderDrawPrizesList();

    initializeAdminTabs();
    setMinDateTime();
});

// ===== Helper: Set Min DateTime =====
function setMinDateTime() {
    const input = document.getElementById('prizeDeadline');
    if (!input) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    input.min = now.toISOString().slice(0, 16);
}

// ===== Admin Password Management =====
function initializeAdminPassword() {
    if (!localStorage.getItem('adminPassword')) {
        localStorage.setItem('adminPassword', DEFAULT_ADMIN_PASSWORD);
    }
}

function checkAdminPassword() {
    const savedPassword = localStorage.getItem('adminPassword');
    const inputPassword = prompt('🔐 กรุณาใส่รหัสผ่าน Admin:\n\n(รหัสเริ่มต้น: admin123)');

    if (inputPassword === null) return false;

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

const changePasswordBtn = document.getElementById('changePasswordBtn');
if (changePasswordBtn) changePasswordBtn.addEventListener('click', changeAdminPassword);

// ===== Tab Switching =====
function initializeAdminTabs() {
    const adminTabs = document.querySelectorAll('.admin-tab');
    const adminTabContents = document.querySelectorAll('.admin-tab-content');

    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');

            adminTabs.forEach(t => t.classList.remove('active'));
            adminTabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`tab-${tabName}`).classList.add('active');

            if (tabName === 'draw') renderDrawPrizesList();
            if (tabName === 'list') renderAdminPrizesList();
            if (tabName === 'labels') renderAdminLabels();
        });
    });
}

// ===== Labels Management =====
function renderAdminLabels() {
    if (!labelsList) return;
    const labels = window.labels || [];

    if (labels.length === 0) {
        labelsList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 1rem;">ยังไม่มีป้ายประกาศ</p>';
        return;
    }
    labelsList.innerHTML = labels.map(label => `
        <div class="admin-label-item">
            <div class="admin-label-text">${label.text}</div>
            <div class="admin-label-actions">
                <button class="label-edit-btn" onclick="editLabel('${label.id}')">✏️</button>
                <button class="label-delete-btn" onclick="deleteLabel('${label.id}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

async function addOrUpdateLabel() {
    const text = labelTextInput.value.trim();
    if (text === '') {
        showNotification('กรุณากรอกข้อความ!', 'error');
        return;
    }

    addLabelBtn.disabled = true;

    if (editingLabelId !== null) {
        const success = await updateLabel(editingLabelId, text);
        if (success) {
            showNotification('แก้ไขป้ายสำเร็จ! 💾');
            cancelLabelEdit();
        }
    } else {
        const newLabel = {
            text: text,
            createdAt: new Date().toISOString()
        };
        const success = await addLabel(newLabel);
        if (success) {
            showNotification('เพิ่มป้ายสำเร็จ! 🎉');
            labelTextInput.value = '';
        }
    }
    addLabelBtn.disabled = false;
}

function editLabel(labelId) {
    const label = window.labels.find(l => l.id == labelId);
    if (!label) return;
    editingLabelId = labelId;
    labelTextInput.value = label.text;
    addLabelBtn.innerHTML = '<span class="icon">💾</span> บันทึกการแก้ไข';
    cancelLabelEditBtn.style.display = 'block';
    labelTextInput.focus();
}

async function deleteLabelWrapper(labelId) {
    if (!confirm('คุณต้องการลบป้ายนี้ใช่หรือไม่?')) return;
    const success = await deleteLabel(labelId);
    if (success) {
        showNotification('ลบป้ายสำเร็จ! 🗑️');
    }
}

function cancelLabelEdit() {
    editingLabelId = null;
    labelTextInput.value = '';
    addLabelBtn.innerHTML = '<span class="icon">➕</span> เพิ่มป้าย';
    cancelLabelEditBtn.style.display = 'none';
}

if (addLabelBtn) addLabelBtn.addEventListener('click', addOrUpdateLabel);
if (cancelLabelEditBtn) cancelLabelEditBtn.addEventListener('click', cancelLabelEdit);


// ===== Prize Management =====
prizeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const editingId = editingPrizeId; // Use state variable directly

    const name = document.getElementById('prizeName').value;
    const desc = document.getElementById('prizeDescription').value;
    const imageInput = document.getElementById('prizeImage').value;
    const images = imageInput.split(',').map(url => url.trim()).filter(url => url.length > 0);
    const deadline = document.getElementById('prizeDeadline').value;

    const submitBtn = document.getElementById('savePrizeBtn') || document.querySelector('#prizeForm button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    if (editingId) {
        const prize = window.prizes.find(p => p.id == editingId);
        if (prize) {
            const success = await updatePrize(editingId, {
                name: name,
                description: desc,
                images: images,
                deadline: deadline
            });

            if (success) {
                showNotification('แก้ไขของรางวัลสำเร็จ! 💾');
                cancelEdit();
            }
        }
    } else {
        const prize = {
            name: name,
            description: desc,
            images: images,
            deadline: deadline,
            entries: [],
            winner: null,
            createdAt: new Date().toISOString()
        };
        const success = await addPrize(prize);
        if (success) {
            showNotification('เพิ่มของรางวัลสำเร็จ! 🎉');
            prizeForm.reset();
            setMinDateTime();
        }
    }
    if (submitBtn) submitBtn.disabled = false;
});

function editPrize(prizeId) {
    const prize = window.prizes.find(p => p.id == prizeId);
    if (!prize) return;

    editingPrizeId = prizeId;
    // prizeForm.dataset.id = prizeId; // No longer needed if we use state variable

    document.getElementById('prizeName').value = prize.name;
    document.getElementById('prizeDescription').value = prize.description || '';

    const images = prize.images || (prize.image ? [prize.image] : []);
    document.getElementById('prizeImage').value = images.join(', ');

    const deadline = new Date(prize.deadline);
    deadline.setMinutes(deadline.getMinutes() - deadline.getTimezoneOffset());
    document.getElementById('prizeDeadline').value = deadline.toISOString().slice(0, 16);

    // Switch to Add Tab
    document.querySelector('.admin-tab[data-tab="add"]').click();

    // Update UI
    const submitBtn = document.getElementById('savePrizeBtn');
    submitBtn.innerHTML = '<span class="icon">💾</span> บันทึกการแก้ไข';
    submitBtn.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';

    const cancelBtn = document.getElementById('cancelEditBtn');
    cancelBtn.style.display = 'block';

    showNotification('กำลังแก้ไขของรางวัล ✏️');
}

function cancelEdit() {
    editingPrizeId = null;
    prizeForm.reset();
    setMinDateTime();

    const submitBtn = document.getElementById('savePrizeBtn');
    submitBtn.innerHTML = '<span class="icon">➕</span> เพิ่มของรางวัล';
    submitBtn.style.background = ''; // reset
    document.getElementById('cancelEditBtn').style.display = 'none';
}

// Global scope for onclick handlers
window.cancelEdit = cancelEdit;

async function deletePrizeWrapper(prizeId) {
    const prize = window.prizes.find(p => p.id == prizeId);
    if (!prize) return;
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบของรางวัล "${prize.name}"?`)) return;

    const success = await deletePrize(prizeId);
    if (success) {
        showNotification('ลบของรางวัลสำเร็จ! 🗑️');
    }
}

function renderAdminPrizesList() {
    if (!adminPrizesList) return;
    const now = new Date();
    const prizes = window.prizes || [];

    if (prizes.length === 0) {
        adminPrizesList.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted);">ยังไม่มีของรางวัล</div>';
        return;
    }

    adminPrizesList.innerHTML = prizes.map(prize => {
        const isExpired = now >= new Date(prize.deadline);
        let statusHtml;

        if (prize.winner) {
            statusHtml = '<span style="color:#4caf50; font-size: 0.85rem; font-weight:bold;">🏆 ได้ผู้โชคดีแล้ว</span>';
        } else if (isExpired) {
            statusHtml = '<span style="color:#ff9800; font-size: 0.85rem;">⏰ หมดเวลา (รอสุ่ม)</span>';
        } else {
            statusHtml = '<span style="color:#2ecc71; font-size: 0.85rem;">✅ เปิดรับ</span>';
        }

        // Image
        const images = prize.images || (prize.image ? [prize.image] : []);
        const imageHtml = images.length > 0
            ? `<img src="${images[0]}" style="width:80px;height:80px;object-fit:cover;border-radius:6px;cursor:pointer;" onclick="openImageViewer('${images[0]}')">`
            : '<div style="width:80px;height:80px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.1);border-radius:6px;font-size:2rem;">🎁</div>';

        // Description (truncated)
        const desc = prize.description ? (prize.description.length > 50 ? prize.description.substring(0, 50) + '...' : prize.description) : 'ไม่มีรายละเอียด';

        return `
            <div style="display:flex; gap:1.2rem; align-items:start; background:rgba(255,255,255,0.03); padding:1rem; border-radius:12px; border:1px solid rgba(255,255,255,0.05); transition:all 0.3s ease;">
                ${imageHtml}
                <div style="flex:1;">
                    <h4 style="margin:0 0 0.4rem 0; font-size:1.1rem; font-weight:600; color:var(--text-primary);">${prize.name}</h4>
                    <p style="margin:0 0 0.5rem 0; font-size:0.9rem; color:var(--text-secondary); line-height:1.4;">${desc}</p>
                    <div style="display:flex; gap:0.75rem; align-items:center; font-size:0.85rem; color:var(--text-muted);">
                        <span>${statusHtml}</span>
                        <span>•</span>
                        <span>👥 ${prize.entries ? prize.entries.length : 0} คน</span>
                        <span>•</span>
                        <span>⏰ ${formatDateTime(prize.deadline)}</span>
                    </div>
                </div>
                <div style="display:flex; gap:0.5rem;">
                   <button onclick="showParticipantsList('${prize.id}')" title="ดูผู้เข้าร่วม" style="padding:0.4rem 0.8rem; border-radius:6px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); cursor:pointer;">👥</button>
                   <button onclick="editPrize('${prize.id}')" title="แก้ไข" style="padding:0.4rem 0.8rem; border-radius:6px; border:1px solid rgba(79, 172, 254, 0.3); background:rgba(79, 172, 254, 0.1); color:#4facfe; cursor:pointer;">✏️</button>
                   <button onclick="deletePrize('${prize.id}')" title="ลบ" style="padding:0.4rem 0.8rem; border-radius:6px; border:1px solid rgba(245, 87, 108, 0.3); background:rgba(245, 87, 108, 0.1); color:#f5576c; cursor:pointer;">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}


// ===== Sub-tabs Logic =====
function switchDrawTab(tab) {
    const readyBtn = document.getElementById('drawTabReady');
    const historyBtn = document.getElementById('drawTabHistory');
    const readyContainer = document.getElementById('drawReadyContainer');
    const historyContainer = document.getElementById('drawHistoryContainer');

    if (tab === 'ready') {
        if (readyBtn) {
            readyBtn.classList.add('btn-primary');
            readyBtn.classList.remove('btn-secondary');
        }
        if (historyBtn) {
            historyBtn.classList.add('btn-secondary');
            historyBtn.classList.remove('btn-primary');
        }

        if (readyContainer) readyContainer.classList.remove('hidden');
        if (historyContainer) historyContainer.classList.add('hidden');
    } else {
        if (readyBtn) {
            readyBtn.classList.add('btn-secondary');
            readyBtn.classList.remove('btn-primary');
        }
        if (historyBtn) {
            historyBtn.classList.add('btn-primary');
            historyBtn.classList.remove('btn-secondary');
        }

        if (readyContainer) readyContainer.classList.add('hidden');
        if (historyContainer) historyContainer.classList.remove('hidden');
    }
}
// Expose for onClick
window.switchDrawTab = switchDrawTab;

// ===== Draw & Winners =====
function renderDrawPrizesList() {
    const readyList = document.getElementById('drawReadyList');
    const historyList = document.getElementById('drawHistoryList');

    if (!readyList || !historyList) return;

    const now = new Date();
    const prizes = window.prizes || [];

    // Only expired prizes can be drawn (and not yet won)
    const readyToDraw = prizes.filter(p => !p.winner && now >= new Date(p.deadline));
    const history = prizes.filter(p => p.winner);

    // Render Ready List
    if (readyToDraw.length === 0) {
        readyList.innerHTML = '<div style="text-align:center; color:var(--text-muted); padding:2rem;">ไม่มีรายการที่ต้องสุ่ม</div>';
    } else {
        readyList.innerHTML = `<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap:1.5rem; width:100%;">` +
            readyToDraw.map(p => {
                const images = p.images || (p.image ? [p.image] : []);
                const imageHtml = images.length > 0 ? `<img src="${images[0]}" style="width:100%; height:180px; object-fit:contain; background:rgba(0,0,0,0.2); border-radius:8px; margin-bottom:1rem;">` : '<div style="height:150px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.05); border-radius:8px; margin-bottom:1rem; font-size:3rem;">🎁</div>';

                return `
            <div class="draw-item" style="padding:1.25rem; background:rgba(102,126,234,0.08); border:1px solid rgba(102,126,234,0.2); border-radius:12px; display:flex; flex-direction:column; align-items:center; text-align:center;">
                ${imageHtml}
                <div class="prize-header" style="margin-bottom:0.5rem;">
                   <span class="prize-status" style="background:rgba(255, 152, 0, 0.2); color:#ff9800; border:1px solid rgba(255, 152, 0, 0.3); font-size:0.8rem; padding:0.2rem 0.6rem; border-radius:4px;">รอสุ่มผู้โชคดี</span>
                </div>
                <h4 style="font-size:1.2rem; margin-bottom:0.5rem; color:var(--text-primary);">${p.name}</h4>
                <p style="color:var(--text-secondary); margin-bottom:1rem; font-size:0.9rem;">${p.description || ''}</p>
                
                <button onclick="showParticipantsList('${p.id}')" style="margin-bottom:1rem; padding:0.5rem 1rem; background:rgba(102, 126, 234, 0.2); border:1px solid rgba(102, 126, 234, 0.3); border-radius:20px; font-size:0.9rem; color: #fff; cursor: pointer; transition: all 0.2s ease; display:flex; align-items:center; gap:0.5rem;" onmouseover="this.style.background='rgba(102, 126, 234, 0.4)'" onmouseout="this.style.background='rgba(102, 126, 234, 0.2)'">
                    <span style="font-size:1rem;">👥</span> ผู้เข้าร่วม: ${p.entries ? p.entries.length : 0} คน
                </button>

                <button onclick="showWheelModal('${p.id}')" class="btn-primary" style="width:100%;">🎡 สุ่มผู้โชคดี</button>
            </div>
            `;
            }).join('') + '</div>';
    }

    // Render History List
    if (history.length === 0) {
        historyList.innerHTML = '<div style="text-align:center; color:var(--text-muted); padding:2rem;">ยังไม่มีประวัติการสุ่ม</div>';
    } else {
        historyList.innerHTML = `<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap:1.5rem; width:100%;">` +
            history.map(p => {
                const images = p.images || (p.image ? [p.image] : []);
                const imageHtml = images.length > 0 ? `<img src="${images[0]}" style="width:100%; height:180px; object-fit:contain; background:rgba(0,0,0,0.2); border-radius:8px; margin-bottom:1rem; opacity:0.8;">` : '<div style="height:150px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.05); border-radius:8px; margin-bottom:1rem; font-size:3rem; opacity:0.8;">🎁</div>';

                return `
            <div class="draw-item" style="padding:1.25rem; background:rgba(40, 44, 52, 0.6); border:1px solid rgba(255,255,255,0.1); border-radius:12px; display:flex; flex-direction:column; align-items:center; text-align:center;">
                ${imageHtml}
                 <div class="prize-header" style="margin-bottom:0.5rem;">
                   <span class="prize-status" style="background:rgba(76, 175, 80, 0.2); color:#4caf50; border:1px solid rgba(76, 175, 80, 0.3); font-size:0.8rem; padding:0.2rem 0.6rem; border-radius:4px;">🏆 ประกาศผลแล้ว</span>
                </div>
                <h4 style="font-size:1.2rem; margin-bottom:0.5rem; color:var(--text-muted);">${p.name}</h4>
                <p style="color:var(--text-secondary); margin-bottom:1rem; font-size:0.9rem;">${p.description || ''}</p>
                
                <div style="background:rgba(255,255,255,0.1); padding:1rem; border-radius:8px; width:100%; margin-top:0.5rem; text-align:left;">
                    <div style="font-size:1rem; font-weight:bold; color:#fff; margin-bottom:0.3rem;">
                        <span style="font-size:0.85rem; color:var(--text-secondary); font-weight:normal; display:inline-block; width:80px;">Name :</span> ${p.winner.name}
                    </div>
                    <div style="font-size:0.95rem; color:#4facfe;">
                        <span style="font-size:0.85rem; color:var(--text-secondary); font-weight:normal; display:inline-block; width:80px;">X account :</span> @${p.winner.twitter}
                    </div>
                </div>
            </div>
            `;
            }).join('') + '</div>';
    }
}

// ===== Wheel Interaction =====
let isSpinning = false;
let currentWheelPrizeId = null;
const wheelColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'];

function showWheelModal(prizeId) {
    const prize = window.prizes.find(p => p.id == prizeId);
    if (!prize) return;
    currentWheelPrizeId = prizeId;

    document.getElementById('wheelPrizeName').textContent = prize.name;
    wheelModal.classList.remove('hidden');
    drawWheel(prize.entries || []);
}

document.getElementById('closeWheel').addEventListener('click', () => wheelModal.classList.add('hidden'));

function drawWheel(entries) {
    const ctx = wheelCanvas.getContext('2d');
    const width = wheelCanvas.width;
    const height = wheelCanvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = cx - 10;

    ctx.clearRect(0, 0, width, height);
    if (!entries || entries.length === 0) return;

    const arc = (2 * Math.PI) / entries.length;

    entries.forEach((entry, i) => {
        const start = i * arc;
        const end = start + arc;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, start, end);
        ctx.fillStyle = wheelColors[i % wheelColors.length];
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(start + arc / 2);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(entry.name.substring(0, 10), radius * 0.6, 5);
        ctx.restore();
    });
}

window.spinWheel = function () { // Make global
    if (isSpinning) return;
    isSpinning = true;
    const prize = window.prizes.find(p => p.id == currentWheelPrizeId);
    const entries = prize.entries || [];
    if (entries.length === 0) {
        isSpinning = false;
        return;
    }

    const winnerIndex = Math.floor(Math.random() * entries.length);
    const winner = entries[winnerIndex];

    const arc = (2 * Math.PI) / entries.length;
    const spins = 10;
    const targetRotation = (spins * 2 * Math.PI) + (winnerIndex * arc) + (arc / 2);

    let start = Date.now();
    let duration = 3000;

    function animate() {
        let now = Date.now();
        let p = Math.min((now - start) / duration, 1);
        let ease = 1 - Math.pow(1 - p, 4);

        let currentRot = targetRotation * ease;

        const ctx = wheelCanvas.getContext('2d');
        ctx.save();
        ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
        ctx.translate(wheelCanvas.width / 2, wheelCanvas.height / 2);
        ctx.rotate(currentRot);
        ctx.translate(-wheelCanvas.width / 2, -wheelCanvas.height / 2);
        drawWheel(entries);
        ctx.restore();

        if (p < 1) requestAnimationFrame(animate);
        else {
            isSpinning = false;
            announceWinner(prize, winner);
        }
    }
    animate();
}

async function announceWinner(prize, winner) {
    // prize.winner = winner; // Wait, we should update Firestore
    const success = await updatePrize(prize.id, { winner: winner });

    if (success) {
        // renderDrawPrizesList(); // Listener will trigger this
        wheelModal.classList.add('hidden');
        showNotification(`ผู้ชนะคือ ${winner.name}!`);
        // Show winner card
        // Need to wait for update to reflect locally? 
        // Not necessarily, we can pass ID.
        // But showWinner looks up prize by ID from window.prizes.
        // Since subscription is async, window.prizes might not be updated yet.
        // We can pass the winner object directly or just rely on eventual consistency?
        // Let's rely on eventual consistency but for UX let's simulate?
        // Or just wait a bit? 
        // Or refactor showWinner to take prize object.
        // Let's refactor showWinner to attempt finding from window.prizes, 
        // but if not found? It should be there. 
        // The issue is if the winner field is updated.
        // For modal, we need the priz/winner data. 
        // We have `prize` and `winner` in this scope.
        // So we can manually construct the modal call or update state locally?
        // But window.prizes is overwritten by snapshot.
        // Let's just call showWinner(prize.id) and trust Firestore is fast enough OR 
        // modify showWinner to accept data.
        // For now, let's keep it simple. Local reflection might lag.
        // To fix UX: Manually show winner modal with known data? 
        // Or just override local object temporarily? 
        // window.prizes will be updated.
        showWinnerWithData(prize, winner);
    }
}

// ===== Participants List =====
function showParticipantsList(prizeId) {
    const prize = window.prizes.find(p => p.id == prizeId);
    if (!prize) return;

    participantsPrizeName.textContent = prize.name;
    const entries = prize.entries || [];
    participantsCount.textContent = `จำนวน: ${entries.length} คน`;

    participantsList.innerHTML = entries.map((e, i) => `
        <div style="padding:0.5rem;border-bottom:1px solid #eee;">
            ${i + 1}. <strong>${e.name}</strong> (@${e.twitter})
        </div>
    `).join('');

    participantsModal.classList.remove('hidden');
}

closeParticipants.addEventListener('click', () => participantsModal.classList.add('hidden'));

// ===== Show Winner (Simple) =====
function showWinner(prizeId) {
    const prize = window.prizes.find(p => p.id == prizeId);
    if (!prize || !prize.winner) return;
    showWinnerWithData(prize, prize.winner);
}

function showWinnerWithData(prize, winner) {
    winnerName.textContent = winner.name;
    winnerTwitter.textContent = `@${winner.twitter}`;
    winnerPrizeName.textContent = prize.name;
    const descEl = document.getElementById('winnerPrizeDescription');
    if (descEl) descEl.textContent = prize.description || '';

    const imgEl = document.getElementById('winnerPrizeImage');
    const images = prize.images || (prize.image ? [prize.image] : []);
    if (imgEl) {
        if (images.length > 0) {
            imgEl.src = images[0];
            imgEl.style.display = 'inline-block';
        } else {
            imgEl.style.display = 'none';
        }
    }

    winnerModal.classList.remove('hidden');
}

closeWinnerModal.addEventListener('click', () => winnerModal.classList.add('hidden'));

// Make functions global for inline onclick
window.editLabel = editLabel;
window.deleteLabel = deleteLabelWrapper; // Use wrapper
window.editPrize = editPrize;
window.deletePrize = deletePrizeWrapper; // Use wrapper
window.showParticipantsList = showParticipantsList;
window.showWheelModal = showWheelModal;
window.showWinner = showWinner;
