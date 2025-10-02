/**
 * Storage Location Update Page JavaScript
 * 存储位置更新页面交互逻辑
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initializeLocationUpdate();
});

function initializeLocationUpdate() {
    // 使用通用初始化函数
    initializeUpdatePage({
        formId: 'updateLocationForm',
        updateUrl: window.updateLocationUrl,
        redirectRoute: window.locationManagementRoute,
        successMessage: 'Location updated successfully',
        errorMessage: 'Failed to update location',
        warningMessage: 'This location combination already exists. Please choose different zone and rack.',
        additionalSelectors: [
            {
                id: 'zone_id',
                event: 'change',
                handler: updateZoneInfo
            }
        ]
    });
}

function updateZoneInfo() {
    // 更新区域信息显示
    const zoneSelect = document.getElementById('zone_id');
    if (zoneSelect) {
        const selectedOption = zoneSelect.options[zoneSelect.selectedIndex];
        const zoneName = selectedOption.text;

        // 更新显示
        const zoneDisplay = document.querySelector('#selectedZone');
        if (zoneDisplay) {
            zoneDisplay.textContent = zoneName;
        }
    }
}
