const form = document.getElementById('qrForm');
const urlInput = document.getElementById('urlInput');
const fillColorInput = document.getElementById('fillColor');
const backColorInput = document.getElementById('backColor');
const fillColorPreview = document.getElementById('fillColorPreview');
const backColorPreview = document.getElementById('backColorPreview');
const generateBtn = document.getElementById('generateBtn');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const qrImage = document.getElementById('qrImage');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const errorDiv = document.getElementById('error');
const successDiv = document.getElementById('success');
const themeToggle = document.getElementById('themeToggle');

let currentImageData = null;

// Theme functionality - Remove localStorage dependency for artifacts
function initTheme() {
    // Default to light theme in artifact environment
    document.documentElement.removeAttribute('data-theme');
    themeToggle.checked = false;
}

// Color preview functionality
function updateColorPreviews() {
    fillColorPreview.style.backgroundColor = fillColorInput.value;
    backColorPreview.style.backgroundColor = backColorInput.value;
}

// Initialize color previews
function initColorPreviews() {
    updateColorPreviews();
}

// Color change event listeners
fillColorInput.addEventListener('input', updateColorPreviews);
fillColorInput.addEventListener('change', updateColorPreviews);
backColorInput.addEventListener('input', updateColorPreviews);
backColorInput.addEventListener('change', updateColorPreviews);

themeToggle.addEventListener('change', function() {
    if (this.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
});

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    successDiv.style.display = 'none';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        // Try with https:// prefix
        try {
            new URL('https://' + string);
            return true;
        } catch (_) {
            return false;
        }
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    let url = urlInput.value.trim();
    const fillColor = fillColorInput.value;
    const backColor = backColorInput.value;
    
    if (!url) {
        showError('Please enter a URL');
        return;
    }

    // Auto-add https:// if no protocol is specified
    if (!url.match(/^https?:\/\//)) {
        url = 'https://' + url;
        urlInput.value = url; // Update the input field
    }

    if (!isValidUrl(url)) {
        showError('Please enter a valid URL');
        return;
    }

    // Show loading state
    generateBtn.disabled = true;
    loading.style.display = 'block';
    result.style.display = 'none';
    errorDiv.style.display = 'none';

    try {
        // Call the actual Vercel API endpoint
        const response = await fetch('/api/generate_qr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: url,
                fill_color: fillColor,
                back_color: backColor
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to generate QR code');
        }

        // Set the image with proper data URI
        currentImageData = data.image;
        qrImage.src = `data:image/png;base64,${data.image}`;
        
        // Wait for image to load before showing result
        qrImage.onload = function() {
            result.style.display = 'block';
            showSuccess('QR Code generated successfully!');
        };
        
        qrImage.onerror = function() {
            showError('Failed to load generated QR code image');
            result.style.display = 'none';
        };

    } catch (error) {
        console.error('Error:', error);
        showError(`Error: ${error.message}`);
    } finally {
        generateBtn.disabled = false;
        loading.style.display = 'none';
    }
});

downloadBtn.addEventListener('click', () => {
    if (currentImageData) {
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${currentImageData}`;
        link.download = 'qrcode.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSuccess('QR Code downloaded!');
    }
});

copyBtn.addEventListener('click', async () => {
    if (currentImageData) {
        try {
            // Convert base64 to blob
            const response = await fetch(`data:image/png;base64,${currentImageData}`);
            const blob = await response.blob();
            
            // Copy to clipboard
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            
            showSuccess('QR Code copied to clipboard!');
        } catch (error) {
            console.error('Copy failed:', error);
            showError('Failed to copy to clipboard. Try downloading instead.');
        }
    }
});

// Initialize theme and color previews on page load
initTheme();
initColorPreviews();

// Auto-focus on input
urlInput.focus();

// Clear previous results when typing or changing colors
urlInput.addEventListener('input', clearResults);
fillColorInput.addEventListener('change', clearResults);
backColorInput.addEventListener('change', clearResults);

function clearResults() {
    result.style.display = 'none';
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
}
