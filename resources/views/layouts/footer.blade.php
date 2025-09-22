<!-- Footer -->
<footer class="custom-footer">
    <!-- 波浪效果 -->
    <div class="footer-wave">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0,0 C150,40 350,0 500,20 C650,40 800,80 1000,60 C1200,40 1400,0 1440,0 L1440,100 L0,100 Z"></path>
        </svg>
    </div>

    <div class="footer-content">
        <!-- 主要内容区 -->
        <div class="container-fluid py-4">
            <div class="row g-4 align-items-center">
                <!-- Logo部分 -->
                <div class="col-lg-4 text-center text-lg-start">
                    <div class="footer-brand">
                        <i class="bi bi-box-seam-fill me-2"></i><span class="brand-text">Warehouse Management System</span>
                    </div>
                    <p class="footer-desc mt-2">Efficient inventory management solution for modern businesses</p>
                </div>

                <!-- 快速链接 -->
                <div class="col-lg-6 text-center">
                    <div class="footer-links">
                        <a href="#" class="footer-link"><i class="bi bi-shield-check me-1"></i>Privacy Policy</a>
                        <span class="separator"></span>
                        <a href="#" class="footer-link"><i class="bi bi-file-text me-1"></i>Terms of Service</a>
                        <span class="separator"></span>
                        <a href="#" class="footer-link"><i class="bi bi-question-circle me-1"></i>Help Center</a>
                    </div>
                </div>

                <!-- 社交媒体 -->
                <div class="col-lg-2 text-center text-lg-end">
                    <div class="social-links">
                        <a href="#" class="social-link" data-tooltip="GitHub"><i class="bi bi-github"></i></a>
                        <a href="#" class="social-link" data-tooltip="Instagram"><i class="bi bi-instagram"></i></a>
                        <a href="#" class="social-link" data-tooltip="Facebook"><i class="bi bi-facebook"></i></a>
                    </div>
                </div>
            </div>
        </div>

        <!-- 版权信息 -->
        <div class="footer-bottom">
            <div class="container-fluid">
                <p class="copyright">
                    &copy; <span id="year">2024</span> Warehouse Management System. All rights reserved.
                    <span class="status-dot"></span>
                    <span class="status-text">System Online</span>
                </p>
            </div>
        </div>
    </div>
</footer>

<script>
// 自动更新年份
document.getElementById('year').textContent = new Date().getFullYear();
</script>
