import { db } from './firebase-config.js';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ... (existing code) ...

export async function addEntry(prizeId, entryData) {
    try {
        const prizeRef = doc(db, 'prizes', prizeId);
        await updateDoc(prizeRef, {
            entries: arrayUnion(entryData)
        });
        return true;
    } catch (e) {
        console.error("Error adding entry: ", e);
        return false;
    }
}

// ===== Data (Exposed to Window for compatibility) =====
window.prizes = [];
window.labels = [];

// ===== Subscriptions =====
function subscribeToPrizes() {
    const q = query(collection(db, 'prizes'), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
        window.prizes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        window.dispatchEvent(new Event('prizesUpdated'));
    }, (error) => {
        console.error("Error fetching prizes:", error);
        showNotification('Error loading prizes', 'error');
    });
}

function subscribeToLabels() {
    const q = query(collection(db, 'labels'), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
        window.labels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Initialize default label if empty and not just loading
        if (window.labels.length === 0 && !localStorage.getItem('defaultLabelInitialized')) {
            // We could auto-create one, but let's leave it to admin or manual init
        }

        window.dispatchEvent(new Event('labelsUpdated'));
    }, (error) => {
        console.error("Error fetching labels:", error);
    });
}

// Start Listeners
subscribeToPrizes();
subscribeToLabels();

// ===== CRUD Operations (Exported for Admin) =====
export async function addPrize(prizeData) {
    try {
        await addDoc(collection(db, 'prizes'), prizeData);
        return true;
    } catch (e) {
        console.error("Error adding prize: ", e);
        showNotification('Failed to add prize', 'error');
        return false;
    }
}

export async function updatePrize(id, data) {
    try {
        const prizeRef = doc(db, 'prizes', id);
        await updateDoc(prizeRef, data);
        return true;
    } catch (e) {
        console.error("Error updating prize: ", e);
        showNotification('Failed to update prize', 'error');
        return false;
    }
}

export async function deletePrize(id) {
    try {
        await deleteDoc(doc(db, 'prizes', id));
        return true;
    } catch (e) {
        console.error("Error deleting prize: ", e);
        showNotification('Failed to delete prize', 'error');
        return false;
    }
}

export async function addLabel(labelData) {
    try {
        await addDoc(collection(db, 'labels'), labelData);
        return true;
    } catch (e) {
        console.error("Error adding label: ", e);
        return false;
    }
}

export async function updateLabel(id, text) {
    try {
        const labelRef = doc(db, 'labels', id);
        await updateDoc(labelRef, { text });
        return true;
    } catch (e) {
        console.error("Error updating label: ", e);
        return false;
    }
}

export async function deleteLabel(id) {
    try {
        await deleteDoc(doc(db, 'labels', id));
        return true;
    } catch (e) {
        console.error("Error deleting label: ", e);
        return false;
    }
}


// ===== Helper Functions (Global) =====
window.formatDateTime = function (dateTimeString) {
    if (!dateTimeString) return '';
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

window.showNotification = function (message, type = 'success') {
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
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ===== Image Gallery Functions (Shared & Global) =====
const galleryStates = new Map();

window.changeGalleryImage = function (prizeId, direction) {
    // prizeId from Firestore might be string, compare carefully? 
    // In local it was number (Date.now()), in Firestore it's string.
    // We should ensure ID comparison is robust.
    const prize = window.prizes.find(p => p.id == prizeId);
    if (!prize) return;

    const images = prize.images || (prize.image ? [prize.image] : []);
    if (images.length <= 1) return;

    let currentIndex = galleryStates.get(prizeId) || 0;
    currentIndex = (currentIndex + direction + images.length) % images.length;
    galleryStates.set(prizeId, currentIndex);

    updateGalleryDisplay(prizeId, currentIndex, images);
}

window.setGalleryImage = function (prizeId, index) {
    const prize = window.prizes.find(p => p.id == prizeId);
    if (!prize) return;

    const images = prize.images || (prize.image ? [prize.image] : []);
    if (index < 0 || index >= images.length) return;

    galleryStates.set(prizeId, index);
    updateGalleryDisplay(prizeId, index, images);
}

function updateGalleryDisplay(prizeId, currentIndex, images) {
    const galleryImg = document.querySelector(`.gallery-main-image[data-prize-id="${prizeId}"]`);
    if (galleryImg) {
        galleryImg.src = images[currentIndex];
        galleryImg.onclick = (e) => {
            e.stopPropagation();
            window.openImageViewer(images[currentIndex]);
        };
    }
    const card = galleryImg?.closest('.prize-card');
    if (card) {
        const dots = card.querySelectorAll('.gallery-dot');
        dots.forEach((dot, index) => {
            if (index === currentIndex) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    }
}

window.openImageViewer = function (imageUrl) {
    const imageViewerModal = document.getElementById('imageViewerModal');
    const fullSizeImage = document.getElementById('fullSizeImage');
    if (imageViewerModal && fullSizeImage) {
        fullSizeImage.src = imageUrl;
        imageViewerModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

window.closeImageViewerFunc = function () {
    const imageViewerModal = document.getElementById('imageViewerModal');
    if (imageViewerModal) {
        imageViewerModal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const closeImageViewer = document.getElementById('closeImageViewer');
    if (closeImageViewer) {
        closeImageViewer.addEventListener('click', window.closeImageViewerFunc);
    }
});
