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
        // For demo purposes, we'll simulate the API call with a mock QR code
        // In production, this would call your actual API endpoint
        const mockQRCode = await generateMockQRCode(url, fillColor, backColor);
        
        currentImageData = mockQRCode;
        qrImage.src = `data:image/png;base64,${mockQRCode}`;
        result.style.display = 'block';
        showSuccess('QR Code generated successfully!');

    } catch (error) {
        console.error('Error:', error);
        showError(`Error: ${error.message}`);
    } finally {
        generateBtn.disabled = false;
        loading.style.display = 'none';
    }
});

// Mock QR code generator for demo purposes
async function generateMockQRCode(url, fillColor, backColor) {
    // This is a simple mock - in reality, this would be handled by your Python backend
    return new Promise((resolve) => {
        setTimeout(() => {
            // This is a base64 encoded small QR code image for demo
            const mockBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TpSIVBzuIOGSoThZERRy1CkWohFqhVQdz6YdQm5Ik1cXRdXBtcPCjddXBVQdXQFBXB9e3FHfzgkj8h+TlbBs3Ll7S+/+Bv5mTc67gOx1wC80ZKzYhkcpkRW9HkUAqQFSkGDCj0FeP3+cE7rP4Kqk6xo5o9nGfRLQOms8jnmqkUbSfGGkxaiPGF12TBt0iXhPpMaE5xJcJI5a4Qey4sS7YLxKbJplJ/E46ZrW9OJGULgAriCzaRhspKFaZ5EhyiiMEsifIUlMu8ePG4iLjAtZiQIy7v/QHjr2GlHmroJLBeE6h7SLFF5a7S/u9l2SqExJSBBg9RHgfkUy0MhcnV3w5QvCkA8pVK8cKBKrSNiTzUqalFnHPh6+f4D39+kJP6tKc5ib';
            resolve(mockBase64);
        }, 1000);
    });
}

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