/**
 * 产品查看页面 JavaScript 类
 *
 * 功能模块：
 * - 图片预览和切换功能
 * - 产品操作（编辑、删除）
 * - 交互效果和动画
 * - 响应式处理
 *
 * @author WMS Team
 * @version 1.0.0
 */
class ProductView {
    constructor() {
        this.currentImageIndex = 0;
        this.images = [];
        this.init();
    }

    // =============================================================================
    // 初始化模块 (Initialization Module)
    // =============================================================================
    init() {
        this.setupImagePreview();
        this.setupThumbnailNavigation();
        this.setupHoverEffects();
    }

    // =============================================================================
    // 图片预览功能 (Image Preview Functions)
    // =============================================================================

    /**
     * 设置图片预览功能
     */
    setupImagePreview() {
        const mainImage = document.getElementById('mainImage');
        const thumbnails = document.querySelectorAll('.thumbnail-item');

        if (!mainImage) return;

        // 收集所有图片
        this.images = Array.from(thumbnails).map(thumb => {
            const img = thumb.querySelector('img');
            return {
                src: img ? img.src : '',
                element: thumb
            };
        });

        // 为每个缩略图添加点击事件
        thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => {
                this.switchToImage(index);
            });
        });

        // 键盘导航
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousImage();
            } else if (e.key === 'ArrowRight') {
                this.nextImage();
            }
        });
    }

    /**
     * 切换到指定图片
     * @param {number} index 图片索引
     */
    switchToImage(index) {
        if (index < 0 || index >= this.images.length) return;

        const mainImage = document.getElementById('mainImage');
        const thumbnails = document.querySelectorAll('.thumbnail-item');

        // 如果点击的是当前图片，不执行切换
        if (index === this.currentImageIndex) return;

        // 更新缩略图状态
        thumbnails.forEach((thumb, i) => {
            thumb.classList.remove('active');
            if (i === index) {
                thumb.classList.add('active');
            }
        });

        // 更新图片计数器
        this.updateImageCounter(index + 1);

        // 平滑切换动画
        mainImage.style.opacity = '0';
        mainImage.style.transform = 'scale(0.95)';

        // 预加载图片
        const newImage = new Image();
        newImage.onload = () => {
            setTimeout(() => {
                // 更新图片源
                mainImage.src = this.images[index].src;
                this.currentImageIndex = index;

                // 淡入效果
                mainImage.style.opacity = '1';
                mainImage.style.transform = 'scale(1)';
            }, 100);
        };
        newImage.src = this.images[index].src;
    }

    /**
     * 更新图片计数器
     * @param {number} currentIndex 当前图片索引
     */
    updateImageCounter(currentIndex) {
        const currentElement = document.getElementById('currentImageIndex');
        if (currentElement) {
            currentElement.textContent = currentIndex;
        }
    }

    /**
     * 切换到上一张图片
     */
    previousImage() {
        const prevIndex = this.currentImageIndex > 0
            ? this.currentImageIndex - 1
            : this.images.length - 1;
        this.switchToImage(prevIndex);
    }

    /**
     * 切换到下一张图片
     */
    nextImage() {
        const nextIndex = this.currentImageIndex < this.images.length - 1
            ? this.currentImageIndex + 1
            : 0;
        this.switchToImage(nextIndex);
    }

    /**
     * 设置缩略图导航
     */
    setupThumbnailNavigation() {
        const thumbnails = document.querySelectorAll('.thumbnail-item');

        thumbnails.forEach((thumbnail, index) => {
            // 添加悬停效果
            thumbnail.addEventListener('mouseenter', () => {
                thumbnail.style.transform = 'scale(1.1)';
            });

            thumbnail.addEventListener('mouseleave', () => {
                if (!thumbnail.classList.contains('active')) {
                    thumbnail.style.transform = 'scale(1)';
                }
            });
        });
    }

    // =============================================================================
    // 产品操作模块 (Product Operations Module)
    // =============================================================================

    /**
     * 编辑产品
     * @param {number} productId 产品ID
     */
    editProduct(productId) {
        const url = window.editProductUrl.replace(':id', productId);
        window.location.href = url;
    }

    /**
     * 删除产品
     * @param {number} productId 产品ID
     */
    deleteProduct(productId) {
        this.submitForm(
            window.deleteProductUrl.replace(':id', productId),
            'DELETE',
            'Are you sure you want to delete this product?'
        );
    }

    /**
     * 激活产品
     * @param {number} productId 产品ID
     */
    setAvailable(productId) {
        this.submitForm(
            window.availableProductUrl.replace(':id', productId),
            'PATCH',
            'Are you sure you want to activate this product?'
        );
    }

    /**
     * 停用产品
     * @param {number} productId 产品ID
     */
    setUnavailable(productId) {
        this.submitForm(
            window.unavailableProductUrl.replace(':id', productId),
            'PATCH',
            'Are you sure you want to deactivate this product?'
        );
    }

    /**
     * 通用表单提交函数 - 使用表单提交方式，像Zone管理一样
     * @param {string} url 提交URL
     * @param {string} method HTTP方法
     * @param {string} confirmMessage 确认消息
     */
    submitForm(url, method, confirmMessage) {
        if (!confirm(confirmMessage)) return;

        // 创建隐藏表单
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;

        // 添加CSRF token
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = '_token';
        tokenInput.value = $('meta[name="csrf-token"]').attr('content');

        // 添加方法覆盖
        const methodInput = document.createElement('input');
        methodInput.type = 'hidden';
        methodInput.name = '_method';
        methodInput.value = method;

        form.appendChild(tokenInput);
        form.appendChild(methodInput);
        document.body.appendChild(form);
        form.submit();
    }

    // =============================================================================
    // 交互效果 (Interactive Effects)
    // =============================================================================

    /**
     * 设置悬停效果
     */
    setupHoverEffects() {
        // 信息项悬停效果
        const infoItems = document.querySelectorAll('.product-info-item');
        infoItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = 'rgba(13, 110, 253, 0.02)';
                item.style.paddingLeft = '0.5rem';
                item.style.borderRadius = '8px';
            });

            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = '';
                item.style.paddingLeft = '';
                item.style.borderRadius = '';
            });
        });

        // 卡片悬停效果
        const cards = document.querySelectorAll('.product-view-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-2px)';
                card.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.boxShadow = '';
            });
        });
    }

}

// =============================================================================
// 全局函数 (Global Functions)
// =============================================================================


// =============================================================================
// 全局实例初始化 (Global Instance Initialization)
// =============================================================================
let productView;

$(document).ready(function() {
    // 初始化ProductView
    productView = new ProductView();
    console.log('ProductView initialized with jQuery');
});

// 使用原生JavaScript的DOMContentLoaded作为备用
document.addEventListener('DOMContentLoaded', function() {
    // 如果jQuery没有加载，使用原生JavaScript初始化
    if (typeof $ === 'undefined' && !productView) {
        productView = new ProductView();
        console.log('ProductView initialized with native JS');
    }
});

// 图片切换功能 - 全局函数
function switchMainImage(imageSrc, thumbnailElement, imageIndex) {
    // 更新主图片
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.src = imageSrc;
    }

    // 更新缩略图激活状态
    document.querySelectorAll('.thumbnail-item').forEach(item => {
        item.classList.remove('active');
    });
    thumbnailElement.classList.add('active');

    // 更新图片计数器
    const currentElement = document.getElementById('currentImageIndex');
    if (currentElement) {
        currentElement.textContent = imageIndex + 1;
    }
}

// 全屏切换功能
function toggleFullscreen() {
    const mainImage = document.getElementById('mainImage');
    if (!mainImage) return;

    if (!document.fullscreenElement) {
        // 进入全屏
        if (mainImage.requestFullscreen) {
            mainImage.requestFullscreen();
        } else if (mainImage.webkitRequestFullscreen) {
            mainImage.webkitRequestFullscreen();
        } else if (mainImage.msRequestFullscreen) {
            mainImage.msRequestFullscreen();
        }
    } else {
        // 退出全屏
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// 复制条码功能
function copyBarcode(barcodeNumber) {
    if (navigator.clipboard && window.isSecureContext) {
        // 使用现代 Clipboard API
        navigator.clipboard.writeText(barcodeNumber).then(() => {
            showToast('条码已复制到剪贴板', 'success');
        }).catch(() => {
            fallbackCopyTextToClipboard(barcodeNumber);
        });
    } else {
        // 降级方案
        fallbackCopyTextToClipboard(barcodeNumber);
    }
}

// 降级复制方案
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        showToast('条码已复制到剪贴板', 'success');
    } catch (err) {
        showToast('复制失败，请手动复制', 'error');
    }

    document.body.removeChild(textArea);
}

// 显示提示消息
function showToast(message, type = 'info') {
    // 创建提示元素
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    // 添加样式
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;

    document.body.appendChild(toast);

    // 显示动画
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 100);

    // 自动隐藏
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 打开图片模态框 - 全局函数
function openImageModal(imageSrc) {
    const modalImage = document.getElementById('modalImage');
    if (modalImage) {
        modalImage.src = imageSrc;
    }

    const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
    imageModal.show();
}

// 图片导航全局函数
function previousImage() {
    if (productView && productView.previousImage) {
        productView.previousImage();
    } else {
        console.error('Product view not initialized or previousImage method not available');
    }
}

function nextImage() {
    if (productView && productView.nextImage) {
        productView.nextImage();
    } else {
        console.error('Product view not initialized or nextImage method not available');
    }
}

// 全局fallback函数，以防productView对象没有正确初始化
function activateProduct(productId) {
    if (productView && productView.setAvailable) {
        productView.setAvailable(productId);
    } else {
        console.error('Product view not initialized or setAvailable method not available');
    }
}

function deactivateProduct(productId) {
    if (productView && productView.setUnavailable) {
        productView.setUnavailable(productId);
    } else {
        console.error('Product view not initialized or setUnavailable method not available');
    }
}

function deleteProduct(productId) {
    if (productView && productView.deleteProduct) {
        productView.deleteProduct(productId);
    } else {
        console.error('productView not initialized or deleteProduct method not available');
    }
}
