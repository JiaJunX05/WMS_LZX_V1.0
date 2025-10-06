/**
 * Location Update Page JavaScript
 * 位置更新頁面交互邏輯
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化頁面
    initializeLocationUpdate();
});

function initializeLocationUpdate() {
    // 使用通用函數初始化位置頁面
    initializeLocationPage({
        events: {
            formSubmit: function(e) {
                e.preventDefault();

                // 获取表单数据
                const formData = new FormData(e.target);
                const locationData = Object.fromEntries(formData);

                // 獲取當前位置ID
                const locationId = window.location.pathname.split('/').pop();

                // 使用新的驗證函數（包含重複檢查）
                validateLocationUpdateForm(locationData, { currentId: locationId })
                    .then(validation => {
                        if (!validation.isValid) {
                            showAlert(validation.errors.join(', '), 'warning');
                            return;
                        }

                        // 使用通用函數提交
                        handleLocationRequest(
                            window.updateLocationUrl,
                            'POST',
                            formData,
                            function(data) {
                                showAlert('Location updated successfully', 'success');
                                setTimeout(() => {
                                    window.location.href = window.locationManagementRoute;
                                }, 1500);
                            },
                            function(error) {
                                showAlert(error || 'Failed to update location', 'error');
                            }
                        );
                    })
                    .catch(error => {
                        console.error('Validation error:', error);
                        showAlert('Validation failed. Please try again.', 'error');
                    });
            }
        },
        onInit: function() {
            // 綁定特定事件
            bindEvents();
        }
    });
}

function bindEvents() {
    // 區域選擇變化事件
    const zoneSelect = document.getElementById('zone_id');
    if (zoneSelect) {
        zoneSelect.addEventListener('change', updateZoneInfo);
    }
}

function updateZoneInfo() {
    // 更新區域信息顯示
    const zoneSelect = document.getElementById('zone_id');
    if (zoneSelect) {
        const selectedOption = zoneSelect.options[zoneSelect.selectedIndex];
        const zoneName = selectedOption.text;

        // 更新顯示
        const zoneDisplay = document.querySelector('#selectedZone');
        if (zoneDisplay) {
            zoneDisplay.textContent = zoneName;
        }
    }
}
