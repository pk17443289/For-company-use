// ===== 倉庫工時回報系統 v2.5 - JavaScript =====

// Google Apps Script Web App URL - 請替換成你自己的 URL
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby0Eesy88gEDVOuBDw1ATq-gRerfeiW3CfWOYixZOsfUmp__GH6VLrMLflRT1yvBykw/exec';

// 自訂項目計數器
let customItemCounter = 0;

// DOM 元素
let form, totalTimeEl, remainingTimeEl, averageTimeEl, statusMessageEl, submitBtn;

// 備份版本號（修改資料結構時需要更新這個版本號）
const BACKUP_VERSION = '2.5';

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 獲取 DOM 元素
    form = document.getElementById('timeReportForm');
    totalTimeEl = document.getElementById('totalTime');
    remainingTimeEl = document.getElementById('remainingTime');
    averageTimeEl = document.getElementById('averageTime');
    statusMessageEl = document.getElementById('statusMessage');
    submitBtn = document.getElementById('submitBtn');

    // 清除舊版本的備份
    clearOldBackup();

    // 設定今天日期為預設值，且只能選擇今天
    const dateInput = document.getElementById('reportDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today; // 只能選擇今天或之後
    dateInput.max = today; // 不允許選擇未來日期
    // 結果：只能選擇今天

    // 監聽所有輸入欄位
    setupInputListeners();

    // 表單提交
    form.addEventListener('submit', handleSubmit);

    // 初始計算
    calculateAllStats();

    // 載入備份（延遲執行）
    setTimeout(loadBackup, 500);
});

// ===== 清除舊版本的備份 =====
function clearOldBackup() {
    try {
        const backup = localStorage.getItem('warehouseTimeReport_backup');
        if (!backup) return;

        const data = JSON.parse(backup);

        // 檢查版本號，如果沒有版本號或版本不符，清除備份
        if (!data.version || data.version !== BACKUP_VERSION) {
            console.log('發現舊版本備份，自動清除...');
            localStorage.removeItem('warehouseTimeReport_backup');
            return;
        }

        // 檢查備份日期，如果不是今天的備份，清除
        const today = new Date().toISOString().split('T')[0];
        if (data.backupDate && data.backupDate !== today) {
            console.log('發現過期備份，自動清除...');
            localStorage.removeItem('warehouseTimeReport_backup');
            return;
        }
    } catch (e) {
        // 如果備份格式錯誤，直接清除
        console.log('備份格式錯誤，自動清除...');
        localStorage.removeItem('warehouseTimeReport_backup');
    }
}

// ===== 卡片展開/收合 =====
function toggleCard(element, event) {
    // 如果點擊的是輸入框、按鈕或其他互動元素，不執行展開/收合
    if (event && (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'BUTTON' ||
        event.target.tagName === 'SELECT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.closest('.detail-item') ||
        event.target.closest('.custom-item')
    )) {
        return;
    }

    const card = element.closest('.expandable-card');
    if (card) {
        card.classList.toggle('expanded');
    }
}

// ===== 設定所有輸入監聽器 =====
function setupInputListeners() {
    // 簡單卡片（無細項）- 監聽時間輸入框
    document.getElementById('morning').addEventListener('input', calculateAllStats);
    document.getElementById('packaging_machine').addEventListener('input', calculateAllStats);
    document.getElementById('cleaning').addEventListener('input', calculateAllStats);

    // 簡單卡片的數量輸入框 - 防止輸入負數
    ['morning_quantity', 'packaging_machine_quantity', 'cleaning_quantity'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('change', function() {
                if (this.value < 0) {
                    this.value = 0;
                }
            });
        }
    });

    // 可展開卡片的子項目 - 監聽所有輸入框（數量和時間）
    const allDetailInputs = document.querySelectorAll('[data-area][data-subitem]');
    allDetailInputs.forEach(input => {
        input.addEventListener('input', function() {
            // 只有時間欄位才需要更新統計
            if (this.dataset.field === 'time') {
                updateSubtotal(this.dataset.area);
                calculateAllStats();
            }
        });

        // 防止輸入負數
        input.addEventListener('change', function() {
            if (this.value < 0) {
                this.value = 0;
            }
        });
    });

    // 自動備份（每1秒）
    setInterval(autoSave, 1000);
}

// ===== 更新區域小計和平均值 =====
function updateSubtotal(areaName) {
    // 只計算時間欄位（data-field="time"）
    const inputs = document.querySelectorAll(`[data-area="${areaName}"][data-subitem][data-field="time"]`);
    let subtotal = 0;
    let filledCount = 0;

    inputs.forEach(input => {
        const value = parseInt(input.value) || 0;
        if (value > 0) {
            subtotal += value;
            filledCount++;
        }
    });

    // 計算平均值
    const average = filledCount > 0 ? Math.round(subtotal / filledCount) : 0;

    // 更新總計
    const subtotalEl = document.querySelector(`[data-subtotal="${areaName}"]`);
    if (subtotalEl) {
        subtotalEl.textContent = subtotal;

        // 視覺效果
        if (subtotal > 0) {
            subtotalEl.style.color = 'var(--gaming-yellow)';
            subtotalEl.style.textShadow = '0 0 10px var(--gaming-yellow)';
        } else {
            subtotalEl.style.color = 'var(--gaming-cyan)';
            subtotalEl.style.textShadow = '0 0 5px var(--gaming-cyan)';
        }
    }

    // 更新平均值
    const averageEl = document.querySelector(`[data-average="${areaName}"]`);
    if (averageEl) {
        averageEl.textContent = average;

        // 視覺效果
        if (average > 0) {
            averageEl.style.color = 'var(--gaming-yellow)';
            averageEl.style.textShadow = '0 0 10px var(--gaming-yellow)';
        } else {
            averageEl.style.color = 'var(--gaming-yellow)';
            averageEl.style.textShadow = '0 0 5px var(--gaming-yellow)';
        }
    }
}

// ===== 計算所有統計數據 =====
function calculateAllStats() {
    let totalTime = 0;
    let filledAreasCount = 0;

    // 1. 簡單卡片（無細項）
    const simpleInputs = ['morning', 'packaging_machine', 'cleaning'];
    simpleInputs.forEach(id => {
        const input = document.getElementById(id);
        const value = parseInt(input.value) || 0;
        if (value > 0) {
            totalTime += value;
            filledAreasCount++;
        }
    });

    // 2. 可展開卡片（有細項）- 只計算時間欄位
    const expandableAreas = ['receiving', 'picking', 'packing', 'returns', 'mo_shop', 'kupon', 'inventory'];
    expandableAreas.forEach(area => {
        const inputs = document.querySelectorAll(`[data-area="${area}"][data-subitem][data-field="time"]`);
        let areaTotal = 0;
        let hasValue = false;

        inputs.forEach(input => {
            const value = parseInt(input.value) || 0;
            if (value > 0) {
                areaTotal += value;
                hasValue = true;
            }
        });

        if (hasValue) {
            totalTime += areaTotal;
            filledAreasCount++;
        }

        updateSubtotal(area);
    });

    // 3. 其他區域（自訂項目）
    const othersInputs = document.querySelectorAll('#othersCustomItems input[type="number"]');
    let othersTotal = 0;
    let othersHasValue = false;

    othersInputs.forEach(input => {
        const value = parseInt(input.value) || 0;
        if (value > 0) {
            othersTotal += value;
            othersHasValue = true;
        }
    });

    if (othersHasValue) {
        totalTime += othersTotal;
        filledAreasCount++;
    }

    updateSubtotal('others');

    // 計算剩餘時間
    const remainingTime = 480 - totalTime;

    // 計算平均時間
    const averageTime = filledAreasCount > 0 ? Math.round(totalTime / filledAreasCount) : 0;

    // 更新顯示
    totalTimeEl.textContent = totalTime;
    remainingTimeEl.textContent = remainingTime;
    averageTimeEl.textContent = averageTime;

    // 視覺提示
    const statsPanel = document.querySelector('.stats-panel');

    if (totalTime > 480) {
        // 超過 480 分鐘 - 紅色警告
        statsPanel.classList.add('overtime');
        remainingTimeEl.style.color = 'var(--cyber-red)';
        showMessage('⚠️ 警告：總時間超過 8 小時（480 分鐘）！', 'warning');
    } else if (totalTime === 480) {
        // 剛好 480 分鐘 - 綠色
        statsPanel.classList.remove('overtime');
        remainingTimeEl.style.color = '#00ff00';
        remainingTimeEl.style.textShadow = '0 0 10px #00ff00';
        hideMessage();
    } else {
        // 小於 480 分鐘 - 正常黃色
        statsPanel.classList.remove('overtime');
        remainingTimeEl.style.color = 'var(--cyber-yellow)';
        remainingTimeEl.style.textShadow = 'var(--neon-glow-yellow)';
        hideMessage();
    }

    // 時間分配警告
    if (remainingTime < 0) {
        totalTimeEl.style.color = 'var(--cyber-red)';
        totalTimeEl.style.textShadow = 'var(--neon-glow-red)';
    } else {
        totalTimeEl.style.color = 'var(--cyber-yellow)';
        totalTimeEl.style.textShadow = 'var(--neon-glow-yellow)';
    }
}

// ===== 新增自訂項目 =====
function addCustomItem() {
    customItemCounter++;
    const container = document.getElementById('othersCustomItems');

    const customItem = document.createElement('div');
    customItem.className = 'custom-item';
    customItem.dataset.customId = customItemCounter;

    customItem.innerHTML = `
        <input type="text" placeholder="項目名稱" class="cyber-input" data-custom-name="${customItemCounter}">
        <input type="number" min="0" placeholder="0" class="cyber-input time-input-small"
               data-area="others" data-custom="${customItemCounter}">
        <span class="unit">分</span>
        <button type="button" class="remove-custom-item-btn" onclick="removeCustomItem(${customItemCounter})">✕</button>
    `;

    container.appendChild(customItem);

    // 監聽新增的輸入框
    const numberInput = customItem.querySelector('input[type="number"]');
    numberInput.addEventListener('input', function() {
        updateSubtotal('others');
        calculateAllStats();
    });

    numberInput.addEventListener('change', function() {
        if (this.value < 0) {
            this.value = 0;
        }
    });

    // 自動聚焦到名稱輸入框
    customItem.querySelector('input[type="text"]').focus();
}

// ===== 移除自訂項目 =====
function removeCustomItem(id) {
    const customItem = document.querySelector(`[data-custom-id="${id}"]`);
    if (customItem) {
        customItem.remove();
        updateSubtotal('others');
        calculateAllStats();
    }
}

// ===== 收集表單資料 =====
function collectFormData() {
    const employeeName = document.getElementById('employeeName').value.trim();
    const reportDate = document.getElementById('reportDate').value;

    const data = {
        timestamp: new Date().toLocaleString('zh-TW'),
        employeeName: employeeName,
        reportDate: reportDate,

        // 簡單區域 - 收集數量和時間
        morning: {
            quantity: parseInt(document.getElementById('morning_quantity').value) || 0,
            time: parseInt(document.getElementById('morning').value) || 0
        },
        packaging_machine: {
            quantity: parseInt(document.getElementById('packaging_machine_quantity').value) || 0,
            time: parseInt(document.getElementById('packaging_machine').value) || 0
        },
        cleaning: {
            quantity: parseInt(document.getElementById('cleaning_quantity').value) || 0,
            time: parseInt(document.getElementById('cleaning').value) || 0
        },

        // 進貨區
        receiving: {},
        // 檢貨區
        picking: {},
        // 包貨區
        packing: {},
        // 退貨區
        returns: {},
        // MO+店區
        mo_shop: {},
        // 酷澎區
        kupon: {},
        // 盤點區
        inventory: {},
        // 其他
        others: {}
    };

    // 收集可展開區域的細項 - 同時收集數量和時間
    const areas = ['receiving', 'picking', 'packing', 'returns', 'mo_shop', 'kupon', 'inventory'];
    areas.forEach(area => {
        // 獲取該區域的所有子項目名稱（去重）
        const subitems = [...new Set(
            Array.from(document.querySelectorAll(`[data-area="${area}"][data-subitem]`))
                .map(input => input.dataset.subitem)
        )];

        // 初始化區域資料，包含細項和統計
        data[area] = {
            items: {},
            subtotal: 0,
            average: 0
        };

        // 對每個子項目收集數量和時間
        subitems.forEach(subitem => {
            const quantityInput = document.querySelector(`[data-area="${area}"][data-subitem="${subitem}"][data-field="quantity"]`);
            const timeInput = document.querySelector(`[data-area="${area}"][data-subitem="${subitem}"][data-field="time"]`);

            data[area].items[subitem] = {
                quantity: quantityInput ? (parseInt(quantityInput.value) || 0) : 0,
                time: timeInput ? (parseInt(timeInput.value) || 0) : 0
            };
        });

        // 收集該區域的總計和平均值
        const subtotalEl = document.querySelector(`[data-subtotal="${area}"]`);
        const averageEl = document.querySelector(`[data-average="${area}"]`);

        data[area].subtotal = subtotalEl ? (parseInt(subtotalEl.textContent) || 0) : 0;
        data[area].average = averageEl ? (parseInt(averageEl.textContent) || 0) : 0;
    });

    // 收集其他區域的自訂項目
    const customItems = document.querySelectorAll('#othersCustomItems .custom-item');
    const othersArray = [];
    customItems.forEach(item => {
        const nameInput = item.querySelector('input[type="text"]');
        const valueInput = item.querySelector('input[type="number"]');
        const name = nameInput.value.trim();
        const value = parseInt(valueInput.value) || 0;

        if (name && value > 0) {
            othersArray.push({ name, value });
        }
    });

    // 收集其他區域的統計
    const othersSubtotalEl = document.querySelector('[data-subtotal="others"]');
    const othersAverageEl = document.querySelector('[data-average="others"]');

    data.others = {
        items: othersArray,
        subtotal: othersSubtotalEl ? (parseInt(othersSubtotalEl.textContent) || 0) : 0,
        average: othersAverageEl ? (parseInt(othersAverageEl.textContent) || 0) : 0
    };

    // 統計資料
    data.totalTime = parseInt(totalTimeEl.textContent);
    data.remainingTime = parseInt(remainingTimeEl.textContent);
    data.averageTime = parseInt(averageTimeEl.textContent);

    return data;
}

// ===== 處理表單提交 =====
async function handleSubmit(e) {
    e.preventDefault();

    // 驗證
    const employeeName = document.getElementById('employeeName').value.trim();
    const reportDate = document.getElementById('reportDate').value;

    if (!employeeName) {
        showMessage('❌ 請輸入員工姓名！', 'error');
        return;
    }

    // 檢查姓名是否為純數字
    if (/^\d+$/.test(employeeName)) {
        showMessage('❌ 姓名不能是純數字！', 'error');
        return;
    }

    // 檢查是否至少填寫一個區域
    const totalTime = parseInt(totalTimeEl.textContent) || 0;
    if (totalTime === 0) {
        showMessage('❌ 請至少填寫一個工作區域的時間！', 'error');
        return;
    }

    // 收集資料
    const formData = collectFormData();

    // 除錯：顯示收集到的資料
    console.log('=== 即將提交的資料 ===');
    console.log(JSON.stringify(formData, null, 2));

    // 顯示載入狀態
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.textContent = '⏳ 提交中...';
    showMessage('📤 正在提交資料到 Google Sheets...', 'warning');

    try {
        // 發送到 Google Sheets
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        // 因為 no-cors 模式，我們無法讀取 response
        // 等待 1 秒確保資料已傳送
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 顯示成功訊息（更明顯）
        submitBtn.textContent = '✅ 提交成功！';
        submitBtn.style.background = 'linear-gradient(135deg, #00ff00 0%, #00cc00 100%)';
        showMessage('🎉 回報成功！資料已成功送出到 Google Sheets。頁面將在 3 秒後重置...', 'success');

        // 清除備份
        localStorage.removeItem('warehouseTimeReport_backup');

        // 倒數計時
        let countdown = 3;
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                showMessage(`🎉 回報成功！頁面將在 ${countdown} 秒後重置...`, 'success');
            } else {
                clearInterval(countdownInterval);
            }
        }, 1000);

        // 3 秒後重置表單
        setTimeout(() => {
            resetForm();
            submitBtn.textContent = '提交回報';
            submitBtn.style.background = '';
        }, 3000);

    } catch (error) {
        console.error('提交錯誤:', error);
        submitBtn.textContent = '❌ 提交失敗';
        submitBtn.style.background = 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)';
        showMessage('❌ 提交失敗！請檢查網路連線或聯絡管理員。點擊按鈕重試。', 'error');

        // 5 秒後恢復按鈕
        setTimeout(() => {
            submitBtn.textContent = '提交回報';
            submitBtn.style.background = '';
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }, 5000);
    } finally {
        // 注意：如果成功，按鈕會在 3 秒後由 resetForm 重置
        // 如果失敗，會在 5 秒後由 catch 區塊重置
        if (submitBtn.textContent !== '❌ 提交失敗') {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    }
}

// ===== 顯示訊息 =====
function showMessage(message, type) {
    statusMessageEl.textContent = message;
    statusMessageEl.className = 'status-message ' + type;
}

// ===== 隱藏訊息 =====
function hideMessage() {
    statusMessageEl.className = 'status-message';
}

// ===== 重置表單 =====
function resetForm() {
    form.reset();

    // 重新設定日期為今天
    const dateInput = document.getElementById('reportDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // 清除所有展開狀態
    document.querySelectorAll('.expandable-card.expanded').forEach(card => {
        card.classList.remove('expanded');
    });

    // 清除所有自訂項目
    document.getElementById('othersCustomItems').innerHTML = '';
    customItemCounter = 0;

    // 重新計算統計
    calculateAllStats();

    // 清除訊息
    setTimeout(() => {
        hideMessage();
    }, 500);
}

// ===== 自動儲存功能（LocalStorage 備份） =====
function autoSave() {
    const data = {
        version: BACKUP_VERSION,  // 備份版本號
        backupDate: new Date().toISOString().split('T')[0],  // 備份日期
        employeeName: document.getElementById('employeeName').value,
        // 簡單區域 - 儲存數量和時間
        morning: {
            quantity: document.getElementById('morning_quantity').value,
            time: document.getElementById('morning').value
        },
        packaging_machine: {
            quantity: document.getElementById('packaging_machine_quantity').value,
            time: document.getElementById('packaging_machine').value
        },
        cleaning: {
            quantity: document.getElementById('cleaning_quantity').value,
            time: document.getElementById('cleaning').value
        },
        details: {},
        customItems: []
    };

    // 儲存細項 - 同時儲存數量和時間
    const areas = ['receiving', 'picking', 'packing', 'returns', 'mo_shop', 'kupon', 'inventory'];
    areas.forEach(area => {
        // 獲取該區域的所有子項目名稱（去重）
        const subitems = [...new Set(
            Array.from(document.querySelectorAll(`[data-area="${area}"][data-subitem]`))
                .map(input => input.dataset.subitem)
        )];

        data.details[area] = {};

        // 對每個子項目儲存數量和時間
        subitems.forEach(subitem => {
            const quantityInput = document.querySelector(`[data-area="${area}"][data-subitem="${subitem}"][data-field="quantity"]`);
            const timeInput = document.querySelector(`[data-area="${area}"][data-subitem="${subitem}"][data-field="time"]`);

            data.details[area][subitem] = {
                quantity: quantityInput ? quantityInput.value : '',
                time: timeInput ? timeInput.value : ''
            };
        });
    });

    // 儲存自訂項目
    const customItems = document.querySelectorAll('#othersCustomItems .custom-item');
    customItems.forEach(item => {
        const nameInput = item.querySelector('input[type="text"]');
        const valueInput = item.querySelector('input[type="number"]');
        data.customItems.push({
            name: nameInput.value,
            value: valueInput.value
        });
    });

    localStorage.setItem('warehouseTimeReport_backup', JSON.stringify(data));
}

// ===== 載入備份 =====
function loadBackup() {
    const backup = localStorage.getItem('warehouseTimeReport_backup');
    if (!backup) return;

    try {
        const data = JSON.parse(backup);

        // 檢查備份是否有實際內容
        let hasContent = false;

        // 檢查員工姓名
        if (data.employeeName && data.employeeName.trim()) {
            hasContent = true;
        }

        // 檢查簡單區域是否有時間填寫
        if (!hasContent) {
            const simpleAreas = ['morning', 'packaging_machine', 'cleaning'];
            for (const area of simpleAreas) {
                if (data[area]) {
                    const timeValue = typeof data[area] === 'object' ? data[area].time : data[area];
                    if (timeValue && parseInt(timeValue) > 0) {
                        hasContent = true;
                        break;
                    }
                }
            }
        }

        // 檢查詳細區域是否有時間填寫
        if (!hasContent && data.details) {
            for (const area in data.details) {
                for (const subitem in data.details[area]) {
                    const subitemData = data.details[area][subitem];
                    const timeValue = typeof subitemData === 'object' ? subitemData.time : subitemData;
                    if (timeValue && parseInt(timeValue) > 0) {
                        hasContent = true;
                        break;
                    }
                }
                if (hasContent) break;
            }
        }

        // 檢查自訂項目
        if (!hasContent && data.customItems && data.customItems.length > 0) {
            for (const item of data.customItems) {
                if (item.value && parseInt(item.value) > 0) {
                    hasContent = true;
                    break;
                }
            }
        }

        // 如果沒有實際內容，自動清除備份
        if (!hasContent) {
            localStorage.removeItem('warehouseTimeReport_backup');
            return;
        }

        // 有內容才詢問是否載入備份
        if (!confirm('發現未完成的回報資料，是否載入？')) {
            localStorage.removeItem('warehouseTimeReport_backup');
            return;
        }

        // 載入基本資料
        if (data.employeeName) {
            document.getElementById('employeeName').value = data.employeeName;
        }

        // 載入簡單區域 - 支援新舊格式
        if (data.morning) {
            if (typeof data.morning === 'object') {
                // 新格式：{quantity, time}
                if (data.morning.quantity) {
                    document.getElementById('morning_quantity').value = data.morning.quantity;
                }
                if (data.morning.time) {
                    document.getElementById('morning').value = data.morning.time;
                }
            } else {
                // 舊格式：直接是時間值
                document.getElementById('morning').value = data.morning;
            }
        }

        if (data.packaging_machine) {
            if (typeof data.packaging_machine === 'object') {
                if (data.packaging_machine.quantity) {
                    document.getElementById('packaging_machine_quantity').value = data.packaging_machine.quantity;
                }
                if (data.packaging_machine.time) {
                    document.getElementById('packaging_machine').value = data.packaging_machine.time;
                }
            } else {
                document.getElementById('packaging_machine').value = data.packaging_machine;
            }
        }

        if (data.cleaning) {
            if (typeof data.cleaning === 'object') {
                if (data.cleaning.quantity) {
                    document.getElementById('cleaning_quantity').value = data.cleaning.quantity;
                }
                if (data.cleaning.time) {
                    document.getElementById('cleaning').value = data.cleaning.time;
                }
            } else {
                document.getElementById('cleaning').value = data.cleaning;
            }
        }

        // 載入細項 - 支援新舊格式
        if (data.details) {
            Object.keys(data.details).forEach(area => {
                Object.keys(data.details[area]).forEach(subitem => {
                    const subitemData = data.details[area][subitem];

                    if (typeof subitemData === 'object') {
                        // 新格式：{quantity, time}
                        const quantityInput = document.querySelector(`[data-area="${area}"][data-subitem="${subitem}"][data-field="quantity"]`);
                        const timeInput = document.querySelector(`[data-area="${area}"][data-subitem="${subitem}"][data-field="time"]`);

                        if (quantityInput && subitemData.quantity) {
                            quantityInput.value = subitemData.quantity;
                        }
                        if (timeInput && subitemData.time) {
                            timeInput.value = subitemData.time;
                        }
                    } else {
                        // 舊格式：直接是值（假設是時間）
                        const input = document.querySelector(`[data-area="${area}"][data-subitem="${subitem}"]`);
                        if (input && subitemData) {
                            input.value = subitemData;
                        }
                    }
                });
            });
        }

        // 載入自訂項目
        if (data.customItems && data.customItems.length > 0) {
            data.customItems.forEach(item => {
                addCustomItem();
                const lastItem = document.querySelector('#othersCustomItems .custom-item:last-child');
                if (lastItem) {
                    lastItem.querySelector('input[type="text"]').value = item.name;
                    lastItem.querySelector('input[type="number"]').value = item.value;
                }
            });
        }

        calculateAllStats();

    } catch (e) {
        console.error('載入備份失敗:', e);
    }
}

// ===== 監聽輸入變化進行自動儲存 =====
let autoSaveTimer;
document.addEventListener('input', function() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(autoSave, 1000); // 1 秒後儲存
});

// ===== 防止意外離開 =====
window.addEventListener('beforeunload', function(e) {
    const totalTime = parseInt(totalTimeEl.textContent) || 0;
    if (totalTime > 0) {
        e.preventDefault();
        e.returnValue = '你有未提交的資料，確定要離開嗎？';
        return e.returnValue;
    }
});

// ===== 鍵盤快捷鍵 =====
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter 快速提交
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        form.dispatchEvent(new Event('submit', { cancelable: true }));
    }

    // Esc 清除訊息
    if (e.key === 'Escape') {
        hideMessage();
    }
});
