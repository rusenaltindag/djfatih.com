/**
 * DJ Fatih From Istanbul - Main Application Script
 * Vanilla JavaScript for audio player, filtering, gallery, and interactions
 */

// ===================================
// Data: Will be loaded from JSON files
// ===================================
let mixesData = [];
let galleryData = [];

// ===================================
// App State
// ===================================
const state = {
    currentFilter: 'all',
    currentTrackIndex: -1,
    isPlaying: false,
    visibleMixes: 6,
    sound: null,
    galleryIndex: 0,
    dataLoaded: false
};

// ===================================
// DOM Elements
// ===================================
const elements = {
    // Navigation
    navbar: document.getElementById('navbar'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    mobileMenu: document.getElementById('mobile-menu'),

    // Mixes
    mixesGrid: document.getElementById('mixes-grid'),
    filterButtons: document.querySelectorAll('.filter-btn'),
    loadMoreBtn: document.getElementById('load-more-btn'),

    // Player
    globalPlayer: document.getElementById('global-player'),
    playPauseBtn: document.getElementById('play-pause-btn'),
    playIcon: document.getElementById('play-icon'),
    pauseIcon: document.getElementById('pause-icon'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    closePlayerBtn: document.getElementById('close-player-btn'),
    progressContainer: document.getElementById('progress-container'),
    progressBar: document.getElementById('progress-bar'),
    progressHandle: document.getElementById('progress-handle'),
    currentTimeEl: document.getElementById('current-time'),
    durationEl: document.getElementById('duration'),
    playerTitle: document.getElementById('player-title'),
    playerGenre: document.getElementById('player-genre'),
    playerArtwork: document.getElementById('player-artwork'),
    fullTrackLink: document.getElementById('full-track-link'),

    // Gallery
    gallerySwiper: null,

    // Lightbox
    lightbox: document.getElementById('lightbox'),
    lightboxImage: document.getElementById('lightbox-image'),
    lightboxTitle: document.getElementById('lightbox-title'),
    lightboxMeta: document.getElementById('lightbox-meta'),
    lightboxClose: document.getElementById('lightbox-close'),
    lightboxPrev: document.getElementById('lightbox-prev'),
    lightboxNext: document.getElementById('lightbox-next'),

    // Contact Form
    contactForm: document.getElementById('contact-form'),
    formMessage: document.getElementById('form-message')
};

// ===================================
// Data Loading
// ===================================
async function loadData() {
    try {
        // Load mixes data
        const mixesResponse = await fetch('./data/mixes.json');
        const mixesJson = await mixesResponse.json();
        mixesData = mixesJson.mixes || [];

        // Load gallery data
        const galleryResponse = await fetch('./data/gallery.json');
        const galleryJson = await galleryResponse.json();
        galleryData = galleryJson.gallery || [];

        state.dataLoaded = true;
        console.log('Data loaded successfully:', { mixes: mixesData.length, gallery: galleryData.length });

        return true;
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback: show error message or use empty arrays
        return false;
    }
}

// ===================================
// Initialization
// ===================================
document.addEventListener('DOMContentLoaded', async () => {
    initLucide();
    initNavigation();

    // Load data first, then initialize components that need it
    await loadData();

    initMixes();
    initFilters();
    initPlayer();
    initGallery();
    initLightbox();
    initContactForm();
    initScrollAnimations();

    // Pause music when user navigates away or switches tabs
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && state.sound && state.isPlaying) {
            state.sound.pause();
        }
    });
});

function initLucide() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// ===================================
// Navigation
// ===================================
function initNavigation() {
    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            elements.navbar.classList.add('scrolled');
        } else {
            elements.navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    elements.mobileMenuBtn.addEventListener('click', () => {
        elements.mobileMenu.classList.toggle('hidden');

        const icon = elements.mobileMenuBtn.querySelector('i');
        if (elements.mobileMenu.classList.contains('hidden')) {
            icon.setAttribute('data-lucide', 'menu');
        } else {
            icon.setAttribute('data-lucide', 'x');
        }
        lucide.createIcons();
    });

    // Close mobile menu on link click
    elements.mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            elements.mobileMenu.classList.add('hidden');
            const icon = elements.mobileMenuBtn.querySelector('i');
            icon.setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===================================
// Mixes Grid
// ===================================
function initMixes() {
    renderMixes();

    elements.loadMoreBtn.addEventListener('click', () => {
        state.visibleMixes += 3;
        renderMixes();
    });
}

function renderMixes() {
    const filteredMixes = state.currentFilter === 'all'
        ? mixesData
        : mixesData.filter(mix => mix.genre === state.currentFilter);

    const mixesToShow = filteredMixes.slice(0, state.visibleMixes);

    elements.mixesGrid.innerHTML = mixesToShow.map((mix, index) => {
        const isCurrentTrack = state.currentTrackIndex === mixesData.indexOf(mix);
        const isPlaying = isCurrentTrack && state.isPlaying;

        return `
        <div class="mix-list-item ${isCurrentTrack ? 'active' : ''} ${isPlaying ? 'playing' : ''}" 
             data-id="${mix.id}" 
             data-index="${mixesData.indexOf(mix)}">
            
            <!-- Track Number / Play indicator -->
            <div class="mix-list-number">
                ${isPlaying
                ? '<div class="equalizer"><div class="equalizer-bar"></div><div class="equalizer-bar"></div><div class="equalizer-bar"></div><div class="equalizer-bar"></div></div>'
                : `<span class="track-number">${index + 1}</span>
                       <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`
            }
            </div>
            
            <!-- Artwork -->
            <div class="mix-list-artwork">
                <img src="${mix.artwork}" alt="${mix.title}" loading="lazy">
            </div>
            
            <!-- Track Info -->
            <div class="mix-list-info">
                <h3 class="mix-list-title ${isCurrentTrack ? 'text-accent-gold' : ''}">${mix.title}</h3>
                <p class="mix-list-artist">${mix.description}</p>
            </div>
            
            <!-- Genre Tag -->
            <div class="mix-list-genre">
                <span class="genre-tag">${mix.genre}</span>
            </div>
            
            <!-- Duration -->
            <div class="mix-list-duration">
                ${mix.duration}
            </div>
            
            <!-- External Link -->
            <a href="${mix.fullLink}" target="_blank" class="mix-list-link" onclick="event.stopPropagation();">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
        </div>
    `}).join('');

    // Re-init Lucide icons
    lucide.createIcons();

    // Add click listeners to mix items
    elements.mixesGrid.querySelectorAll('.mix-list-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            playTrack(index);
        });
    });

    // Update load more button visibility
    if (mixesToShow.length >= filteredMixes.length) {
        elements.loadMoreBtn.classList.add('hidden');
    } else {
        elements.loadMoreBtn.classList.remove('hidden');
    }
}

// ===================================
// Filters
// ===================================
function initFilters() {
    elements.filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            elements.filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update filter and re-render
            state.currentFilter = btn.dataset.filter;
            state.visibleMixes = 6;
            renderMixes();
        });
    });
}

// ===================================
// Audio Player
// ===================================
function initPlayer() {
    // Play/Pause button
    elements.playPauseBtn.addEventListener('click', togglePlayPause);

    // Previous/Next buttons
    elements.prevBtn.addEventListener('click', playPrevious);
    elements.nextBtn.addEventListener('click', playNext);

    // Close player button
    elements.closePlayerBtn.addEventListener('click', closePlayer);

    // Progress bar click
    elements.progressContainer.addEventListener('click', seekTo);

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && state.currentTrackIndex !== -1) {
            e.preventDefault();
            togglePlayPause();
        }
    });

    // Mobile track info modal
    const showInfoBtn = document.getElementById('show-track-info-btn');
    const trackInfoArea = document.getElementById('track-info-area');
    const trackInfoModal = document.getElementById('track-info-modal');
    const trackInfoContent = document.getElementById('track-info-content');
    const closeTrackInfo = document.getElementById('close-track-info');

    function openTrackInfoModal() {
        if (state.currentTrackIndex === -1 || window.innerWidth >= 640) return;

        const mix = mixesData[state.currentTrackIndex];
        if (!mix) return;

        // Populate modal
        document.getElementById('modal-artwork').src = mix.artwork;
        document.getElementById('modal-title').textContent = mix.title;
        document.getElementById('modal-genre').textContent = mix.genre;
        document.getElementById('modal-description').textContent = mix.description;
        document.getElementById('modal-duration').textContent = mix.duration;
        document.getElementById('modal-date').textContent = '';
        document.getElementById('modal-full-link').href = mix.fullLink;

        // Show modal
        trackInfoModal.classList.remove('hidden');
        trackInfoModal.classList.add('flex');

        // Animate in
        setTimeout(() => {
            trackInfoContent.classList.remove('translate-y-full');
        }, 10);

        lucide.createIcons();
    }

    function closeTrackInfoModal() {
        trackInfoContent.classList.add('translate-y-full');
        setTimeout(() => {
            trackInfoModal.classList.add('hidden');
            trackInfoModal.classList.remove('flex');
        }, 300);
    }

    if (showInfoBtn) {
        showInfoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openTrackInfoModal();
        });
    }

    if (trackInfoArea) {
        trackInfoArea.addEventListener('click', openTrackInfoModal);
    }

    if (closeTrackInfo) {
        closeTrackInfo.addEventListener('click', closeTrackInfoModal);
    }

    if (trackInfoModal) {
        trackInfoModal.addEventListener('click', (e) => {
            if (e.target === trackInfoModal) {
                closeTrackInfoModal();
            }
        });
    }

    // Explicit click handler for mobile full track link
    const mobileFullLink = document.getElementById('full-track-link-mobile');
    if (mobileFullLink) {
        mobileFullLink.addEventListener('click', (e) => {
            e.preventDefault();
            const href = mobileFullLink.getAttribute('href');
            if (href && href !== '#' && href !== 'javascript:void(0)') {
                window.location.href = href;
            }
        });
    }

    // Explicit click handler for desktop full track link
    const desktopFullLink = document.getElementById('full-track-link');
    if (desktopFullLink) {
        desktopFullLink.addEventListener('click', (e) => {
            e.preventDefault();
            const href = desktopFullLink.getAttribute('href');
            if (href && href !== '#' && href !== 'javascript:void(0)') {
                window.location.href = href;
            }
        });
    }

    // Explicit click handler for modal full track link
    const modalFullLink = document.getElementById('modal-full-link');
    if (modalFullLink) {
        modalFullLink.addEventListener('click', (e) => {
            e.preventDefault();
            const href = modalFullLink.getAttribute('href');
            if (href && href !== '#' && href !== 'javascript:void(0)') {
                window.location.href = href;
            }
        });
    }
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function playTrack(index) {
    const mix = mixesData[index];

    // Stop current sound if playing
    if (state.sound) {
        state.sound.unload();
    }

    // Update state
    state.currentTrackIndex = index;

    // Create new Howl instance
    state.sound = new Howl({
        src: [mix.previewUrl],
        html5: true,
        onplay: () => {
            state.isPlaying = true;
            updatePlayerUI();
            requestAnimationFrame(updateProgress);
        },
        onpause: () => {
            state.isPlaying = false;
            updatePlayerUI();
        },
        onend: () => {
            playNext();
        },
        onload: () => {
            elements.durationEl.textContent = formatTime(state.sound.duration());
        }
    });

    // Update player info
    elements.playerTitle.textContent = mix.title;
    elements.playerGenre.textContent = mix.genre.charAt(0).toUpperCase() + mix.genre.slice(1);
    elements.playerArtwork.querySelector('img').src = mix.artwork;
    elements.playerArtwork.querySelector('img').classList.remove('hidden');
    elements.fullTrackLink.href = mix.fullLink;

    // Update mobile link as well
    const mobileLink = document.getElementById('full-track-link-mobile');
    if (mobileLink) {
        mobileLink.href = mix.fullLink;
    }

    // Show player
    elements.globalPlayer.classList.add('visible');

    // Start playing
    state.sound.play();

    // Update mixes grid
    renderMixes();
}

function togglePlayPause() {
    if (state.currentTrackIndex === -1) return;

    if (state.isPlaying) {
        state.sound.pause();
    } else {
        state.sound.play();
    }
}

function playPrevious() {
    if (state.currentTrackIndex > 0) {
        playTrack(state.currentTrackIndex - 1);
    } else {
        playTrack(mixesData.length - 1);
    }
}

function playNext() {
    if (state.currentTrackIndex < mixesData.length - 1) {
        playTrack(state.currentTrackIndex + 1);
    } else {
        playTrack(0);
    }
}

function closePlayer() {
    if (state.sound) {
        state.sound.unload();
    }
    state.currentTrackIndex = -1;
    state.isPlaying = false;
    elements.globalPlayer.classList.remove('visible');
    renderMixes();
}

function seekTo(e) {
    if (!state.sound) return;

    const rect = elements.progressContainer.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const seekTime = percent * state.sound.duration();

    state.sound.seek(seekTime);
    updateProgress();
}

function updateProgress() {
    if (!state.sound || !state.isPlaying) return;

    const seek = state.sound.seek() || 0;
    const duration = state.sound.duration() || 1;
    const percent = (seek / duration) * 100;

    elements.progressBar.style.width = `${percent}%`;
    elements.progressHandle.style.left = `${percent}%`;
    elements.currentTimeEl.textContent = formatTime(seek);

    if (state.isPlaying) {
        requestAnimationFrame(updateProgress);
    }
}

function updatePlayerUI() {
    const playPauseBtn = document.getElementById('play-pause-btn');

    if (state.isPlaying) {
        // Show pause icon
        playPauseBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
    } else {
        // Show play icon
        playPauseBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    }
    renderMixes();
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ===================================
// Gallery
// ===================================
function initGallery() {
    const swiperWrapper = document.querySelector('.gallery-swiper .swiper-wrapper');

    // Populate gallery slides with support for images and videos
    // All items use uniform square aspect ratio for consistency
    swiperWrapper.innerHTML = galleryData.map((item, index) => {
        const isVideo = item.type === 'video';
        const previewSrc = item.preview || item.src;

        if (isVideo) {
            return `
                <div class="swiper-slide">
                    <div class="gallery-slide aspect-square relative group" data-index="${index}" data-type="video">
                        <img 
                            src="${previewSrc}" 
                            alt="${item.title}"
                            loading="lazy"
                            class="w-full h-full object-cover"
                        >
                        <div class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                            <button class="video-play-btn w-16 h-16 rounded-full bg-accent-gold/90 flex items-center justify-center text-dark-900 hover:scale-110 transition-transform">
                                <svg class="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="overlay">
                            <span class="text-accent-gold text-sm font-medium">${item.venue || ''}</span>
                            <h4 class="font-heading font-semibold text-lg mt-1">${item.title}</h4>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="swiper-slide">
                    <div class="gallery-slide aspect-square" data-index="${index}" data-type="image">
                        <img src="${previewSrc}" alt="${item.title}" loading="lazy" class="w-full h-full object-cover">
                        <div class="overlay">
                            <span class="text-accent-gold text-sm font-medium">${item.venue || ''}</span>
                            <h4 class="font-heading font-semibold text-lg mt-1">${item.title}</h4>
                        </div>
                    </div>
                </div>
            `;
        }
    }).join('');

    // Initialize Swiper
    elements.gallerySwiper = new Swiper('.gallery-swiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination-custom',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
            },
            1024: {
                slidesPerView: 3,
            },
        },
    });

    // Add click listeners to gallery slides
    document.querySelectorAll('.gallery-slide').forEach(slide => {
        slide.addEventListener('click', (e) => {
            const index = parseInt(slide.dataset.index);
            openLightbox(index);
        });
    });

    // Add video play button listeners - opens lightbox and plays video
    document.querySelectorAll('.video-play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const slide = btn.closest('.gallery-slide');
            const index = parseInt(slide.dataset.index);
            openLightbox(index);
        });
    });
}

// Toggle video play/pause in gallery
function toggleGalleryVideo(slide) {
    const video = slide.querySelector('video');
    const playBtn = slide.querySelector('.video-play-btn');

    if (!video || !playBtn) return;

    if (video.paused) {
        // Pause all other videos first
        document.querySelectorAll('.gallery-slide video').forEach(v => {
            if (v !== video) {
                v.pause();
                const otherBtn = v.closest('.gallery-slide').querySelector('.video-play-btn');
                if (otherBtn) {
                    otherBtn.innerHTML = '<svg class="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
                    otherBtn.parentElement.classList.remove('opacity-0');
                }
            }
        });

        video.play();
        playBtn.innerHTML = '<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        playBtn.parentElement.classList.add('opacity-0', 'hover:opacity-100');

        // Pause swiper autoplay while video plays
        if (elements.gallerySwiper) {
            elements.gallerySwiper.autoplay.stop();
        }
    } else {
        video.pause();
        playBtn.innerHTML = '<svg class="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
        playBtn.parentElement.classList.remove('opacity-0');

        // Resume swiper autoplay
        if (elements.gallerySwiper) {
            elements.gallerySwiper.autoplay.start();
        }
    }
}

// ===================================
// Lightbox
// ===================================
function initLightbox() {
    elements.lightboxClose.addEventListener('click', closeLightbox);
    elements.lightboxPrev.addEventListener('click', lightboxPrevious);
    elements.lightboxNext.addEventListener('click', lightboxNext);

    // Close on background click
    elements.lightbox.addEventListener('click', (e) => {
        if (e.target === elements.lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!elements.lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') lightboxPrevious();
        if (e.key === 'ArrowRight') lightboxNext();
    });
}

function openLightbox(index) {
    state.galleryIndex = index;
    updateLightboxContent();
    elements.lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    elements.lightbox.classList.remove('active');
    document.body.style.overflow = '';

    // Pause any playing video in lightbox
    const lightboxVideo = elements.lightbox.querySelector('video');
    if (lightboxVideo) {
        lightboxVideo.pause();
    }
}

function lightboxPrevious() {
    state.galleryIndex = state.galleryIndex > 0
        ? state.galleryIndex - 1
        : galleryData.length - 1;
    updateLightboxContent();
}

function lightboxNext() {
    state.galleryIndex = state.galleryIndex < galleryData.length - 1
        ? state.galleryIndex + 1
        : 0;
    updateLightboxContent();
}

function updateLightboxContent() {
    const item = galleryData[state.galleryIndex];
    const isVideo = item.type === 'video';
    const mediaContainer = document.getElementById('lightbox-media-container');

    // Clear any existing video
    const existingVideo = mediaContainer.querySelector('video');
    if (existingVideo) {
        existingVideo.remove();
    }

    if (isVideo) {
        // Hide the image and show video
        elements.lightboxImage.style.display = 'none';

        const video = document.createElement('video');
        video.src = item.src;
        video.className = 'max-h-[80vh] max-w-full rounded-lg';
        video.controls = true;
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;

        // Insert video before the image element
        mediaContainer.insertBefore(video, elements.lightboxImage);
    } else {
        // Show the image
        elements.lightboxImage.style.display = '';
        elements.lightboxImage.src = item.src || item.image;
        elements.lightboxImage.alt = item.title;
    }

    elements.lightboxTitle.textContent = `${item.title}${item.venue ? ' - ' + item.venue : ''}`;
    elements.lightboxMeta.textContent = item.date || '';
}

// ===================================
// Contact Form
// ===================================
function initContactForm() {
    elements.contactForm.addEventListener('submit', handleFormSubmit);
}

function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    // Basic validation
    const name = formData.get('Isim').trim();
    const email = formData.get('E-posta').trim();
    const subject = formData.get('Konu');
    const message = formData.get('Mesaj').trim();

    let isValid = true;
    let errorMessage = '';

    if (!name || name.length < 2) {
        isValid = false;
        errorMessage = 'Lütfen geçerli bir isim girin.';
    } else if (!isValidEmail(email)) {
        isValid = false;
        errorMessage = 'Lütfen geçerli bir e-posta adresi girin.';
    } else if (!subject) {
        isValid = false;
        errorMessage = 'Lütfen bir konu seçin.';
    } else if (!message || message.length < 10) {
        isValid = false;
        errorMessage = 'Mesajınız en az 10 karakter olmalıdır.';
    }

    if (!isValid) {
        showFormMessage(errorMessage, 'error');
        return;
    }

    // Show loading state
    showFormMessage('Mesajınız gönderiliyor...', 'info');
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Gönderiliyor...</span>';
    }

    // Submit to FormSubmit via fetch
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                showFormMessage('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.', 'success');
                form.reset();
            } else {
                throw new Error('Form gönderilemedi');
            }
        })
        .catch(error => {
            showFormMessage('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
        })
        .finally(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Gönder</span><i data-lucide="send" class="w-5 h-5"></i>';
                lucide.createIcons();
            }
        });
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showFormMessage(message, type) {
    elements.formMessage.textContent = message;
    elements.formMessage.className = `text-center py-3 rounded-xl ${type === 'success' ? 'bg-purple-900/30 text-purple-300 border border-purple-500/30' :
        type === 'error' ? 'bg-purple-900/20 text-purple-200 border border-purple-400/30' :
            'bg-purple-900/20 text-purple-300 border border-purple-500/30'
        }`;
    elements.formMessage.classList.remove('hidden');

    if (type === 'success') {
        // Show toast for success
        showToast('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.', 'success');
        setTimeout(() => {
            elements.formMessage.classList.add('hidden');
        }, 3000);
    } else if (type === 'error') {
        setTimeout(() => {
            elements.formMessage.classList.add('hidden');
        }, 5000);
    }
}

// ===================================
// Toast Notification System
// ===================================
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `
        transform translate-x-full opacity-0 transition-all duration-300 ease-out
        max-w-sm p-4 rounded-xl shadow-2xl backdrop-blur-lg border
        flex items-center gap-3
        ${type === 'success' ? 'bg-purple-900/90 border-purple-500/30 text-purple-100' :
            type === 'error' ? 'bg-purple-800/90 border-purple-400/30 text-purple-100' :
                'bg-purple-900/90 border-purple-500/30 text-purple-100'}
    `;

    const iconSvg = type === 'success'
        ? '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
        : type === 'error'
            ? '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
            : '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';

    toast.innerHTML = `
        ${iconSvg}
        <span class="text-sm font-medium">${message}</span>
        <button onclick="this.parentElement.remove()" class="ml-auto p-1 hover:bg-white/10 rounded transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
    });

    // Auto remove
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ===================================
// Copy Email Function (iOS Compatible)
// ===================================
function copyEmail() {
    const emailText = document.getElementById('email-text');
    const copyBtn = document.getElementById('copy-email-btn');

    if (!emailText) return;

    const email = emailText.textContent;

    // iOS-compatible copy function
    function copyToClipboard(text) {
        // Try modern Clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }

        // Fallback for iOS and older browsers
        return new Promise((resolve, reject) => {
            const textArea = document.createElement('textarea');
            textArea.value = text;

            // Avoid scrolling to bottom on iOS
            textArea.style.position = 'fixed';
            textArea.style.top = '0';
            textArea.style.left = '0';
            textArea.style.width = '2em';
            textArea.style.height = '2em';
            textArea.style.padding = '0';
            textArea.style.border = 'none';
            textArea.style.outline = 'none';
            textArea.style.boxShadow = 'none';
            textArea.style.background = 'transparent';
            textArea.style.fontSize = '16px'; // Prevent iOS zoom

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            // iOS specific: use setSelectionRange
            textArea.setSelectionRange(0, text.length);

            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    resolve();
                } else {
                    reject();
                }
            } catch (err) {
                document.body.removeChild(textArea);
                reject(err);
            }
        });
    }

    copyToClipboard(email).then(() => {
        showToast('E-posta adresi kopyalandı!', 'success', 2000);

        // Visual feedback on button
        if (copyBtn) {
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span class="hidden sm:inline">Kopyalandı!</span>';
            copyBtn.classList.add('bg-green-600', 'text-white');
            copyBtn.classList.remove('bg-dark-600');

            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.classList.remove('bg-green-600', 'text-white');
                copyBtn.classList.add('bg-dark-600');
                // Re-init lucide icons for the button
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 2000);
        }
    }).catch(() => {
        // If copy fails, show the email in an alert so user can manually copy
        showToast('Kopyalamak için e-postayı basılı tutun: ' + email, 'info', 4000);
    });
}

// Make copyEmail global
window.copyEmail = copyEmail;

// ===================================
// Scroll Animations
// ===================================
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('section > .container').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// ===================================
// Utility: Debounce
// ===================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
