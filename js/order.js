// Order Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('orderForm');
    const fileUpload = document.getElementById('fileUpload');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInfo = document.getElementById('fileInfo');
    const submitButton = document.getElementById('submitOrder');
    const submitText = document.getElementById('submitText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    let selectedFile = null;

    // File upload handling
    fileUpload.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            selectedFile = e.target.files[0];
            
            // Validate file size (max 10MB)
            if (selectedFile.size > 10 * 1024 * 1024) {
                showNotification('File terlalu besar. Maksimal 10MB', 'error');
                fileUpload.value = '';
                selectedFile = null;
                fileInfo.innerHTML = '';
                return;
            }
            
            // Validate file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/illustrator', 'application/photoshop'];
            if (!allowedTypes.includes(selectedFile.type) && 
                !selectedFile.name.toLowerCase().endsWith('.ai') &&
                !selectedFile.name.toLowerCase().endsWith('.psd') &&
                !selectedFile.name.toLowerCase().endsWith('.cdr')) {
                showNotification('Format file tidak didukung. Gunakan PDF, JPG, PNG, AI, PSD, atau CDR', 'error');
                fileUpload.value = '';
                selectedFile = null;
                fileInfo.innerHTML = '';
                return;
            }
            
            // Show file info
            fileInfo.innerHTML = `
                <div class="file-preview">
                    <i class="fas fa-file ${getFileIcon(selectedFile.type)}"></i>
                    <div>
                        <strong>${selectedFile.name}</strong>
                        <span>${formatFileSize(selectedFile.size)}</span>
                    </div>
                    <button type="button" class="remove-file" onclick="removeSelectedFile()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            fileUploadArea.classList.add('has-file');
        }
    });

    // Drag and drop functionality
    fileUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
    });

    fileUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
    });

    fileUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            fileUpload.files = e.dataTransfer.files;
            fileUpload.dispatchEvent(new Event('change'));
        }
    });

    // Form submission
    orderForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateOrderForm()) {
            return;
        }
        
        // Check file
        if (!selectedFile) {
            showNotification('Silakan upload file desain Anda', 'warning');
            return;
        }
        
        // Show loading
        submitButton.disabled = true;
        submitText.style.display = 'none';
        loadingSpinner.style.display = 'block';
        loadingSpinner.innerHTML = '<div class="loading-spinner"></div>';
        
        try {
            // Get form data
            const formData = {
                serviceType: document.getElementById('serviceType').value,
                quantity: parseInt(document.getElementById('quantity').value),
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                company: document.getElementById('company').value,
                address: document.getElementById('address').value,
                notes: document.getElementById('notes').value,
                paperType: document.getElementById('paperType').value,
                size: document.getElementById('size').value,
                file: selectedFile
            };
            
            // Send order
            const result = await window.naoziAPI.createOrder(formData);
            
            if (result.success) {
                showNotification(`Pesanan berhasil dikirim! ID: ${result.orderId}`, 'success');
                
                // Reset form
                orderForm.reset();
                selectedFile = null;
                fileInfo.innerHTML = '';
                fileUploadArea.classList.remove('has-file');
                
                // Redirect to thank you page or show confirmation
                setTimeout(() => {
                    window.location.href = 'thankyou.html?id=' + result.orderId;
                }, 2000);
                
            } else {
                showNotification(result.message || 'Gagal mengirim pesanan', 'error');
            }
            
        } catch (error) {
            console.error('Order error:', error);
            showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
        } finally {
            // Hide loading
            submitButton.disabled = false;
            submitText.style.display = 'inline';
            loadingSpinner.style.display = 'none';
            loadingSpinner.innerHTML = '';
        }
    });

    // Form validation
    function validateOrderForm() {
        const requiredFields = [
            'serviceType', 'quantity', 'name', 'email', 'phone'
        ];
        
        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                showNotification(`Field ${field.previousElementSibling.textContent} harus diisi`, 'warning');
                field.focus();
                return false;
            }
        }
        
        // Validate email
        const email = document.getElementById('email').value;
        if (!validateEmail(email)) {
            showNotification('Format email tidak valid', 'warning');
            document.getElementById('email').focus();
            return false;
        }
        
        // Validate phone
        const phone = document.getElementById('phone').value;
        if (!validatePhone(phone)) {
            showNotification('Format nomor telepon tidak valid', 'warning');
            document.getElementById('phone').focus();
            return false;
        }
        
        return true;
    }
});

// Helper functions
function getFileIcon(mimeType) {
    if (mimeType.includes('pdf')) return 'fa-file-pdf';
    if (mimeType.includes('image')) return 'fa-file-image';
    if (mimeType.includes('illustrator')) return 'fa-file-ai';
    if (mimeType.includes('photoshop')) return 'fa-file-psd';
    return 'fa-file';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function removeSelectedFile() {
    document.getElementById('fileUpload').value = '';
    document.getElementById('fileInfo').innerHTML = '';
    document.getElementById('fileUploadArea').classList.remove('has-file');
    window.selectedFile = null;
}

// Add CSS for file upload
const fileUploadStyles = document.createElement('style');
fileUploadStyles.textContent = `
    .file-upload-area {
        border: 2px dashed #ccc;
        border-radius: 10px;
        padding: 40px 20px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
        background-color: #fafafa;
    }
    
    .file-upload-area:hover {
        border-color: var(--black);
        background-color: #f0f0f0;
    }
    
    .file-upload-area.dragover {
        border-color: var(--success);
        background-color: #e8f5e9;
    }
    
    .file-upload-area.has-file {
        border-color: var(--success);
        background-color: #e8f5e9;
    }
    
    .file-upload-area i {
        font-size: 48px;
        color: #ccc;
        margin-bottom: 15px;
    }
    
    .file-upload-area p {
        color: #666;
        margin-bottom: 20px;
    }
    
    .file-info {
        margin-top: 20px;
    }
    
    .file-preview {
        display: flex;
        align-items: center;
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .file-preview i {
        font-size: 24px;
        margin-right: 15px;
        color: var(--black);
    }
    
    .file-preview div {
        flex-grow: 1;
        text-align: left;
    }
    
    .file-preview strong {
        display: block;
        color: var(--black);
    }
    
    .file-preview span {
        color: #666;
        font-size: 14px;
    }
    
    .remove-file {
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        font-size: 18px;
        padding: 5px;
    }
    
    .remove-file:hover {
        color: var(--danger);
    }
    
    .file-hint {
        font-size: 14px;
        color: #666;
        margin-top: 10px;
    }
    
    .form-section-title {
        font-size: 1.5rem;
        margin: 30px 0 20px;
        padding-bottom: 10px;
        border-bottom: 2px solid var(--primary-light);
        color: var(--black);
    }
    
    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
    }
    
    @media (max-width: 768px) {
        .form-grid {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(fileUploadStyles);
