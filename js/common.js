// ===== Data =====
let prizes = JSON.parse(localStorage.getItem('prizes')) || [];
let labels = JSON.parse(localStorage.getItem('labels'));

if (!labels) {
    labels = [
        {
            id: Date.now(),
            text: 'TWICE OFFICIAL FANCLUB (2ND GENERATION)',
            createdAt: new Date().toISOString()
        }
    ];
    localStorage.setItem('labels', JSON.stringify(labels));
}

// ===== Helper Functions =====
function savePrizes() {
    localStorage.setItem('prizes', JSON.stringify(prizes));
}

function saveLabels() {
    localStorage.setItem('labels', JSON.stringify(labels));
}

function renderLabels() {
    const labelsContainer = document.getElementById('labelsContainer');
    if (!labelsContainer) return;

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

// ===== Image Gallery Functions (Shared) =====
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

// ===== Full Image Viewer (Shared) =====
function openImageViewer(imageUrl) {
    const imageViewerModal = document.getElementById('imageViewerModal');
    const fullSizeImage = document.getElementById('fullSizeImage');

    if (imageViewerModal && fullSizeImage) {
        fullSizeImage.src = imageUrl;
        imageViewerModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeImageViewerFunc() {
    const imageViewerModal = document.getElementById('imageViewerModal');
    if (imageViewerModal) {
        imageViewerModal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Setup global event listeners for image viewer if elements exist
document.addEventListener('DOMContentLoaded', () => {
    const closeImageViewer = document.getElementById('closeImageViewer');
    const imageViewerModal = document.getElementById('imageViewerModal');

    if (closeImageViewer) {
        closeImageViewer.addEventListener('click', closeImageViewerFunc);
    }

    if (imageViewerModal) {
        const overlay = imageViewerModal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', closeImageViewerFunc);
        }
    }
});
