// =============================================================================
// 產品查看頁面 JavaScript (Product View Page JavaScript)
// 功能：圖片切換、條形碼生成、產品操作、全屏查看
// =============================================================================

console.log('Product View JS file loaded successfully!');

// =============================================================================
// 全局變量 (Global Variables)
// =============================================================================

let currentImageIndex = 0;
let totalImages = 0;
let productImages = [];

// =============================================================================
// 頁面初始化 (Page Initialization)
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Starting View page initialization...');

    try {
        // 初始化頁面
        initializePage();

        // 綁定事件
        bindEvents();

        console.log('All View page initialization completed successfully');
    } catch (error) {
        console.error('Error during View page initialization:', error);
        alert('JavaScript initialization error: ' + error.message);
    }
});

function initializePage() {
    console.log('Product View Page Initialized');

    // 初始化圖片數據
    initializeImageData();

    // 生成條形碼
    generateBarcode();
}

function initializeImageData() {
    // 收集所有圖片
    const coverImage = document.querySelector('.main-image');
    const thumbnailItems = document.querySelectorAll('.thumbnail-item');

    if (coverImage) {
        productImages.push(coverImage.src);
    }

    thumbnailItems.forEach(item => {
        const img = item.querySelector('img');
        if (img && !productImages.includes(img.src)) {
            productImages.push(img.src);
        }
    });

    totalImages = productImages.length;
    console.log('Total images:', totalImages);
}

// =============================================================================
// 事件綁定 (Event Binding)
// =============================================================================

function bindEvents() {
    // 綁定鍵盤事件
    bindKeyboardEvents();

    // 綁定全屏事件
    bindFullscreenEvents();
}

function bindKeyboardEvents() {
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                previousImage();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextImage();
                break;
            case 'Escape':
                e.preventDefault();
                closeFullscreen();
                break;
        }
    });
}

function bindFullscreenEvents() {
    document.addEventListener('fullscreenchange', function() {
        if (!document.fullscreenElement) {
            exitFullscreen();
        }
    });
}

// =============================================================================
// 圖片切換功能 (Image Switching Functions)
// =============================================================================

function switchMainImage(imageSrc, thumbnailElement, index) {
    console.log('Switching to image:', imageSrc, 'Index:', index);

    // 更新主圖片
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.src = imageSrc;
    }

    // 更新當前索引
    currentImageIndex = index;

    // 更新縮略圖活動狀態
    document.querySelectorAll('.thumbnail-item').forEach(item => {
        item.classList.remove('active');
    });
    thumbnailElement.classList.add('active');

    // 更新圖片計數器
    updateImageCounter();
}

function previousImage() {
    if (totalImages <= 1) return;

    currentImageIndex = (currentImageIndex - 1 + totalImages) % totalImages;
    const thumbnailItems = document.querySelectorAll('.thumbnail-item');

    if (thumbnailItems[currentImageIndex]) {
        const img = thumbnailItems[currentImageIndex].querySelector('img');
        if (img) {
            switchMainImage(img.src, thumbnailItems[currentImageIndex], currentImageIndex);
        }
    }
}

function nextImage() {
    if (totalImages <= 1) return;

    currentImageIndex = (currentImageIndex + 1) % totalImages;
    const thumbnailItems = document.querySelectorAll('.thumbnail-item');

    if (thumbnailItems[currentImageIndex]) {
        const img = thumbnailItems[currentImageIndex].querySelector('img');
        if (img) {
            switchMainImage(img.src, thumbnailItems[currentImageIndex], currentImageIndex);
        }
    }
}

function updateImageCounter() {
    const currentIndexElement = document.getElementById('currentImageIndex');
    const totalImagesElement = document.getElementById('totalImages');

    if (currentIndexElement) {
        currentIndexElement.textContent = currentImageIndex + 1;
    }
    if (totalImagesElement) {
        totalImagesElement.textContent = totalImages;
    }
}

// =============================================================================
// 圖片查看功能 (Image Viewing Functions)
// =============================================================================

function openImageModal(imageSrc) {
    console.log('Opening image modal for:', imageSrc);

    const modalImage = document.getElementById('modalImage');
    if (modalImage) {
        modalImage.src = imageSrc;

        // 使用 Bootstrap 模態框
        const modal = new bootstrap.Modal(document.getElementById('imageModal'));
        modal.show();
    }
}

function toggleFullscreen() {
    console.log('Toggling fullscreen');

    const mainImageWrapper = document.querySelector('.main-image-wrapper');
    if (!mainImageWrapper) return;

    if (!document.fullscreenElement) {
        enterFullscreen(mainImageWrapper);
    } else {
        exitFullscreen();
    }
}

function enterFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

// =============================================================================
// 條形碼功能 (Barcode Functions)
// =============================================================================

function generateBarcode() {
    const barcodeCanvas = document.getElementById('barcodeCanvas');
    const barcodeNumber = document.querySelector('.barcode-number')?.textContent;

    if (barcodeCanvas && barcodeNumber) {
        try {
            JsBarcode(barcodeCanvas, barcodeNumber, {
                format: "CODE128",
                width: 2,
                height: 60,
                displayValue: false,
                background: "#ffffff",
                lineColor: "#000000",
            });
            console.log('Barcode generated successfully');
        } catch (error) {
            console.error('Barcode generation failed:', error);
        }
    }
}

function copyBarcode(barcodeNumber) {
    console.log('Copying barcode:', barcodeNumber);

    // 檢查瀏覽器是否支持 Clipboard API
    if (!navigator.clipboard) {
        console.log('Clipboard API not supported, using fallback method');
        fallbackCopyTextToClipboard(barcodeNumber);
        return;
    }

    // 檢查是否有權限
    navigator.permissions.query({name: 'clipboard-write'}).then(function(result) {
        if (result.state === 'granted' || result.state === 'prompt') {
            // 使用 Clipboard API
            navigator.clipboard.writeText(barcodeNumber).then(function() {
                showSuccessMessage();
            }).catch(function(err) {
                console.error('Clipboard API failed:', err);
                fallbackCopyTextToClipboard(barcodeNumber);
            });
        } else {
            console.log('Clipboard permission denied, using fallback method');
            fallbackCopyTextToClipboard(barcodeNumber);
        }
    }).catch(function(err) {
        console.log('Permission query failed, using fallback method:', err);
        fallbackCopyTextToClipboard(barcodeNumber);
    });

    function showSuccessMessage() {
        // 顯示成功提示
        if (typeof showAlert === 'function') {
            showAlert('Barcode copied to clipboard!', 'success');
        } else {
            alert('Barcode copied to clipboard!');
        }

        // 視覺反饋
        const btn = event.target.closest('.barcode-copy-btn');
        if (btn) {
            const originalIcon = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-check"></i>';
            btn.classList.add('copied');

            setTimeout(() => {
                btn.innerHTML = originalIcon;
                btn.classList.remove('copied');
            }, 2000);
        }

        console.log('Barcode copied successfully');
    }

    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // 避免滾動到底部
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) {
                showSuccessMessage();
            } else {
                showErrorMessage('Failed to copy barcode using fallback method');
            }
        } catch (err) {
            document.body.removeChild(textArea);
            console.error('Fallback copy failed:', err);
            showErrorMessage('Failed to copy barcode. Please try manually selecting and copying the text.');
        }
    }

    function showErrorMessage(message) {
        if (typeof showAlert === 'function') {
            showAlert(message, 'error');
        } else {
            alert(message);
        }
    }
}

// =============================================================================
// 產品操作功能 (Product Operations)
// =============================================================================

function editProduct(productId) {
    console.log('Editing product:', productId);

    const editUrl = window.editProductUrl.replace(':id', productId);
    window.location.href = editUrl;
}

function deleteProduct(productId) {
    console.log('Deleting product:', productId);

    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        const deleteUrl = window.deleteProductUrl.replace(':id', productId);

        fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert(data.message, 'success');
                setTimeout(() => {
                    window.location.href = window.productIndexUrl || '/products';
                }, 1500);
            } else {
                showAlert(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('An error occurred while deleting the product', 'error');
        });
    }
}

function setAvailable(productId) {
    console.log('Setting product as available:', productId);

    const availableUrl = window.availableProductUrl.replace(':id', productId);
    console.log('Available URL:', availableUrl);

    fetch(availableUrl, {
        method: 'PATCH',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        }
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        if (data.success) {
            if (typeof showAlert === 'function') {
                showAlert(data.message, 'success');
            } else {
                alert(data.message);
            }
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            if (typeof showAlert === 'function') {
                showAlert(data.message, 'error');
            } else {
                alert(data.message);
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        const errorMessage = 'An error occurred while updating the product status: ' + error.message;
        if (typeof showAlert === 'function') {
            showAlert(errorMessage, 'error');
        } else {
            alert(errorMessage);
        }
    });
}

function setUnavailable(productId) {
    console.log('Setting product as unavailable:', productId);

    const unavailableUrl = window.unavailableProductUrl.replace(':id', productId);
    console.log('Unavailable URL:', unavailableUrl);

    fetch(unavailableUrl, {
        method: 'PATCH',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        }
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        if (data.success) {
            if (typeof showAlert === 'function') {
                showAlert(data.message, 'success');
            } else {
                alert(data.message);
            }
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            if (typeof showAlert === 'function') {
                showAlert(data.message, 'error');
            } else {
                alert(data.message);
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        const errorMessage = 'An error occurred while updating the product status: ' + error.message;
        if (typeof showAlert === 'function') {
            showAlert(errorMessage, 'error');
        } else {
            alert(errorMessage);
        }
    });
}

// =============================================================================
// 向後兼容性函數 (Backward Compatibility Functions)
// =============================================================================

// 為了向後兼容，保留舊的函數名
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.activateProduct = setAvailable;
window.deactivateProduct = setUnavailable;

// =============================================================================
// 注意事項 (Notes)
// =============================================================================

// 此文件包含產品查看頁面的所有 JavaScript 功能
// 包括圖片切換、條形碼生成、產品操作等
