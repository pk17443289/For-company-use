// ===== 全域變數 =====
let personnel = [];
let tasks = [];
let history = [];

// 工作性質分類（可自訂）
let WORK_CATEGORIES = {};

// 取得預設工作性質分類
function getDefaultWorkCategories() {
    return {
        'patrol': '巡邏巡視',
        'monitor': '監控值勤',
        'service': '客戶服務',
        'admin': '行政文書',
        'meeting': '會議出席',
        'maintenance': '設備維護',
        'training': '教育訓練',
        'support': '支援協助',
        'inspection': '檢查驗收',
        'reception': '接待引導',
        'guard': '警衛站崗',
        'other': '其他雜務'
    };
}

// 階級設定
let MAX_RANK = 10; // 最高階級（可自訂）

// 階級標籤（可自訂）
let RANK_LABELS = {};

// 取得預設階級標籤
function getDefaultRankLabels() {
    return {
        '10': '最高階',
        '9': '高階',
        '8': '中高階',
        '7': '中高階',
        '6': '中階',
        '5': '中階',
        '4': '基層',
        '3': '基層',
        '2': '新進',
        '1': '新進'
    };
}

// 當前篩選設定
let currentDate = new Date(); // 當前查詢的日期
let currentDateString = ''; // 格式化的日期字串 (YYYY-MM-DD)
let currentTimeMode = 'now';
let currentStartHour = 8;
let currentEndHour = 17;
let currentStatusFilter = 'all';
let currentRankFilter = 'all';
let currentSearchText = '';
let currentTaskFilter = 'all';

// 編輯狀態
let editingPersonId = null;
let editingTaskId = null;

// 拖拉狀態
let draggedTask = null;

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('初始化人員管理系統...');
    initializeDate();
    loadData();
    setupEventListeners();
    updateDisplay();
});

// ===== 日期初始化 =====
function initializeDate() {
    currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // 設為當天 00:00:00
    currentDateString = formatDate(currentDate);
    updateDateDisplay();
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ===== 事件監聽器設定 =====
function setupEventListeners() {
    // 日期選擇按鈕
    document.querySelectorAll('.date-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const mode = this.dataset.mode;
            const offset = this.dataset.offset;

            if (mode === 'custom') {
                // 直接觸發日期選擇器
                const dateInput = document.getElementById('customDate');
                dateInput.value = currentDateString; // 預設為當前選擇的日期
                dateInput.showPicker(); // 直接打開日曆
            } else {
                document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                applyDateOffset(parseInt(offset));
            }
        });
    });

    // 日期選擇器改變時自動套用
    document.getElementById('customDate').addEventListener('change', function() {
        const dateInput = this.value;
        if (dateInput) {
            currentDate = new Date(dateInput + 'T00:00:00');
            currentDateString = formatDate(currentDate);
            updateDateDisplay();
            updateDisplay();

            // 更新按鈕狀態
            document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.date-btn[data-mode="custom"]').classList.add('active');
        }
    });

    // 時段選擇按鈕
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const mode = this.dataset.mode;
            currentTimeMode = mode;

            if (mode === 'custom') {
                document.querySelector('.time-custom-range').classList.remove('hidden');
            } else {
                document.querySelector('.time-custom-range').classList.add('hidden');
                applyTimeMode(mode);
            }
        });
    });

    // 自訂時段套用
    document.getElementById('applyCustomTime').addEventListener('click', function() {
        currentStartHour = parseInt(document.getElementById('startHour').value) || 0;
        currentEndHour = parseInt(document.getElementById('endHour').value) || 23;
        updateTimeDisplay();
        updateDisplay();
    });

    // 狀態篩選按鈕
    document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentStatusFilter = this.dataset.filter;
            updateDisplay();
        });
    });

    // 位階篩選
    document.getElementById('rankFilter').addEventListener('change', function(e) {
        currentRankFilter = e.target.value;
        updateDisplay();
    });

    // 搜尋
    document.getElementById('searchInput').addEventListener('input', function(e) {
        currentSearchText = e.target.value.toLowerCase();
        updateDisplay();
    });

    // 任務篩選標籤
    document.querySelectorAll('.task-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.task-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentTaskFilter = this.dataset.type;
            renderTaskList();
        });
    });

    // 點擊任務池外部區域，也拖到任務池可以移除人員
    document.getElementById('taskList').addEventListener('dragover', handleTaskListDragOver);
    document.getElementById('taskList').addEventListener('drop', handleTaskListDrop);

    // 操作選單下拉功能
    const actionMenuBtn = document.getElementById('actionMenuBtn');
    const actionMenuDropdown = document.getElementById('actionMenuDropdown');

    actionMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        actionMenuDropdown.classList.toggle('hidden');
    });

    // 點擊外部關閉選單
    document.addEventListener('click', (e) => {
        if (!actionMenuDropdown.classList.contains('hidden')) {
            actionMenuDropdown.classList.add('hidden');
        }
    });

    // 防止下拉選單內部點擊時關閉
    actionMenuDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // 操作按鈕（點擊後關閉選單）
    document.getElementById('addPersonBtn').addEventListener('click', () => {
        showAddPersonModal();
        actionMenuDropdown.classList.add('hidden');
    });
    document.getElementById('importPersonListBtn').addEventListener('click', () => {
        showImportPersonListModal();
        actionMenuDropdown.classList.add('hidden');
    });
    document.getElementById('addTaskBtn').addEventListener('click', () => {
        showAddTaskModal();
        actionMenuDropdown.classList.add('hidden');
    });
    document.getElementById('manageWorkCategoryBtn').addEventListener('click', () => {
        showWorkCategoryModal();
        actionMenuDropdown.classList.add('hidden');
    });
    document.getElementById('manageRankLabelBtn').addEventListener('click', () => {
        showRankLabelModal();
        actionMenuDropdown.classList.add('hidden');
    });
    document.getElementById('previewScheduleBtn').addEventListener('click', () => {
        showSchedulePreview();
        actionMenuDropdown.classList.add('hidden');
    });
    document.getElementById('exportDataBtn').addEventListener('click', () => {
        exportData();
        actionMenuDropdown.classList.add('hidden');
    });
    document.getElementById('importDataBtn').addEventListener('click', () => {
        document.getElementById('importFileInput').click();
        actionMenuDropdown.classList.add('hidden');
    });
    document.getElementById('importFileInput').addEventListener('change', importData);
    document.getElementById('resetDataBtn').addEventListener('click', () => {
        resetToSampleData();
        actionMenuDropdown.classList.add('hidden');
    });

    // 調試日誌函數（生產環境改為 console.log）
    window.debugLog = function(msg) {
        // 調試模式：將下面改為 true 可以顯示調試面板
        const debugMode = false;

        if (debugMode && window.innerWidth <= 768) {
            let debugDiv = document.getElementById('debugInfo');
            if (!debugDiv) {
                debugDiv = document.createElement('div');
                debugDiv.id = 'debugInfo';
                debugDiv.style.cssText = `
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0, 0, 0, 0.9);
                    color: #0f0;
                    padding: 10px;
                    font-size: 12px;
                    z-index: 9999;
                    max-height: 150px;
                    overflow-y: auto;
                    font-family: monospace;
                `;
                document.body.appendChild(debugDiv);
            }
            const time = new Date().toLocaleTimeString();
            debugDiv.innerHTML = `[${time}] ${msg}<br>` + debugDiv.innerHTML;
        }
        // 所有訊息都記錄到控制台
        console.log(msg);
    };

    // 折疊功能 - 使用直接綁定的方式
    window.toggleCollapsible = function(targetId) {
        const content = document.getElementById(targetId);
        const title = document.querySelector(`[data-target="${targetId}"]`);

        if (content && title) {
            title.classList.toggle('collapsed');
            content.classList.toggle('collapsed');
        }
    };

    // 為每個折疊標題添加 onclick
    document.querySelectorAll('.collapsible-title').forEach((title, index) => {
        const targetId = title.dataset.target;

        // 直接設置 onclick 屬性（最可靠的方式）
        title.onclick = function() {
            window.toggleCollapsible(targetId);
        };

        // 添加觸控視覺反饋
        title.addEventListener('touchstart', function(e) {
            this.style.opacity = '0.7';
        }, { passive: true });

        title.addEventListener('touchend', function(e) {
            this.style.opacity = '1';
        }, { passive: true });

        title.addEventListener('touchcancel', function(e) {
            this.style.opacity = '1';
        }, { passive: true });
    });

    // 手機版默認折疊時段選擇和任務池
    if (window.innerWidth <= 768) {
        const timeTitle = document.querySelector('.time-selector-panel .collapsible-title');
        const timeContent = document.getElementById('timeContent');
        if (timeTitle && timeContent) {
            timeTitle.classList.add('collapsed');
            timeContent.classList.add('collapsed');
        }

        const taskPoolTitle = document.querySelector('.task-pool .collapsible-title');
        const taskPoolContent = document.getElementById('taskPoolContent');
        if (taskPoolTitle && taskPoolContent) {
            taskPoolTitle.classList.add('collapsed');
            taskPoolContent.classList.add('collapsed');
        }
    }

    // 監聽視窗大小改變，切換到電腦版時自動展開所有面板
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768) {
                // 電腦版：移除所有折疊狀態
                document.querySelectorAll('.collapsible-title.collapsed').forEach(title => {
                    title.classList.remove('collapsed');
                });
                document.querySelectorAll('.collapsible-content.collapsed').forEach(content => {
                    content.classList.remove('collapsed');
                });
            }
        }, 250); // 延遲 250ms 避免頻繁觸發
    });

    // 排班預覽匯出按鈕
    document.getElementById('exportScheduleTextBtn').addEventListener('click', exportScheduleAsText);
    document.getElementById('exportScheduleImageBtn').addEventListener('click', exportScheduleAsImage);

    // 批量匯入人員
    document.getElementById('addPersonRowBtn').addEventListener('click', addPersonRow);
    document.getElementById('confirmImportPersonList').addEventListener('click', importPersonList);

    // 儲存按鈕
    document.getElementById('savePersonBtn').addEventListener('click', savePerson);
    document.getElementById('saveTaskBtn').addEventListener('click', saveTask);

    // 位階滑桿
    document.getElementById('personRank').addEventListener('input', function(e) {
        updateRankDisplay(parseInt(e.target.value));
    });
}

// ===== 資料管理 =====
function loadData() {
    // 確保 currentDateString 已經初始化
    if (!currentDateString) {
        currentDateString = formatDate(new Date());
    }

    const savedData = localStorage.getItem('personnelManagementData');
    if (savedData) {
        const data = JSON.parse(savedData);
        personnel = data.personnel || [];
        tasks = data.tasks || [];
        history = data.history || [];
        WORK_CATEGORIES = data.workCategories || getDefaultWorkCategories();
        RANK_LABELS = data.rankLabels || getDefaultRankLabels();
        MAX_RANK = data.maxRank || 10;

        // 修正舊資料格式：將 assignee (單數) 轉換為 assignees (複數陣列)
        tasks.forEach(task => {
            if (!task.assignees) {
                // 如果沒有 assignees 陣列
                if (task.assignee) {
                    // 如果有舊的 assignee 欄位，轉換為陣列
                    task.assignees = [task.assignee];
                    delete task.assignee;
                } else {
                    // 如果都沒有，初始化為空陣列
                    task.assignees = [];
                }
            }

            // 為舊任務加上日期欄位（預設為今天）
            if (!task.date) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                task.date = formatDate(today);
            }
        });

        // 儲存修正後的資料
        saveData();
    } else {
        createSampleData();
    }
    console.log('載入資料:', personnel.length, '人,', tasks.length, '任務');
}

function saveData() {
    const data = {
        personnel,
        tasks,
        history,
        workCategories: WORK_CATEGORIES,
        rankLabels: RANK_LABELS,
        maxRank: MAX_RANK
    };
    localStorage.setItem('personnelManagementData', JSON.stringify(data));
    console.log('儲存資料成功');
}

function createSampleData() {
    // 建立示範資料（20人）
    const names = ['王大明', '李小華', '張三', '陳四', '劉五', '趙六', '錢七', '孫八', '周九', '吳十',
                   '鄭十一', '馮十二', '陳十三', '楚十四', '魏十五', '蔣十六', '沈十七', '韓十八', '楊十九', '朱二十'];
    const ranks = [9, 7, 7, 5, 5, 4, 4, 3, 3, 3, 2, 2, 2, 1, 1, 6, 8, 5, 4, 3];
    const specialPeople = [0, 2, 16]; // 王大明、張三、沈十七為特殊人員

    personnel = names.map((name, i) => ({
        id: i + 1,
        name,
        rank: ranks[i],
        contact: `分機${101 + i}`,
        isSpecial: specialPeople.includes(i),
        status: 'normal' // normal, leave, mission, lunch
    }));

    // 建立今天和明天的任務
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDate(today);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDate(tomorrow);

    tasks = [
        // 今天的任務
        { id: 1, name: '夜班值勤', type: 'daily', workCategory: 'monitor', date: todayStr, startHour: 0, endHour: 6, assignees: [14, 15], requiredPeople: 2, description: '凌晨時段監控' },
        { id: 2, name: '早班準備', type: 'daily', workCategory: 'admin', date: todayStr, startHour: 6, endHour: 8, assignees: [16, 17], requiredPeople: 2, description: '' },
        { id: 3, name: '早晨巡視', type: 'daily', workCategory: 'patrol', date: todayStr, startHour: 8, endHour: 10, assignees: [18], requiredPeople: 2, description: '' },
        { id: 4, name: '主管會議', type: 'important', workCategory: 'meeting', date: todayStr, startHour: 10, endHour: 12, assignees: [1, 2], requiredPeople: 5, description: '' },
        { id: 5, name: '午間服務', type: 'daily', workCategory: 'service', date: todayStr, startHour: 12, endHour: 14, assignees: [5, 6], requiredPeople: 3, description: '' },
        { id: 6, name: '下午作業', type: 'daily', workCategory: 'admin', date: todayStr, startHour: 14, endHour: 18, assignees: [7, 8], requiredPeople: 4, description: '' },
        { id: 7, name: '晚班交接', type: 'important', workCategory: 'admin', date: todayStr, startHour: 18, endHour: 20, assignees: [9], requiredPeople: 2, description: '' },
        { id: 8, name: '夜間巡檢', type: 'daily', workCategory: 'patrol', date: todayStr, startHour: 20, endHour: 24, assignees: [10, 11], requiredPeople: 2, description: '' },

        // 明天的任務（未分配）
        { id: 9, name: '夜班值勤', type: 'daily', workCategory: 'monitor', date: tomorrowStr, startHour: 0, endHour: 6, assignees: [], requiredPeople: 2, description: '凌晨時段監控' },
        { id: 10, name: '早班準備', type: 'daily', workCategory: 'admin', date: tomorrowStr, startHour: 6, endHour: 8, assignees: [], requiredPeople: 2, description: '' },
        { id: 11, name: '主管會議', type: 'important', workCategory: 'meeting', date: tomorrowStr, startHour: 10, endHour: 12, assignees: [], requiredPeople: 5, description: '' }
    ];

    history = [];
    WORK_CATEGORIES = getDefaultWorkCategories();
    RANK_LABELS = getDefaultRankLabels();
    saveData();
}

function syncData() {
    if (typeof syncWithGoogleSheets === 'function') {
        syncWithGoogleSheets();
    } else {
        alert('Google Sheets 同步功能尚未設定\n目前使用本地儲存模式');
    }
}

function resetToSampleData() {
    if (confirm('確定要重置為示範資料嗎？\n這將會清除所有目前的資料（包括自己新增的人員和任務）！')) {
        localStorage.removeItem('personnelManagementData');
        createSampleData();
        updateDisplay();
        alert('已重置為示範資料！');
    }
}

// ===== 資料匯出/匯入 =====
function exportData() {
    // 準備要匯出的資料
    const exportData = {
        personnel: personnel,
        tasks: tasks,
        history: history,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    // 轉換為 JSON 字串
    const dataStr = JSON.stringify(exportData, null, 2);

    // 建立下載連結
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // 設定檔名（包含日期時間）
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
    const timeStr = `${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
    link.download = `人員排班資料_${dateStr}_${timeStr}.json`;

    link.href = url;
    link.click();

    // 清理
    URL.revokeObjectURL(url);

    alert('資料已匯出！請妥善保存此檔案。');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // 驗證資料格式
            if (!importedData.personnel || !importedData.tasks) {
                alert('檔案格式錯誤！請確認是否為正確的備份檔案。');
                return;
            }

            // 確認是否要覆蓋現有資料
            if (!confirm('匯入資料將會覆蓋目前所有資料！\n確定要繼續嗎？')) {
                return;
            }

            // 載入資料
            personnel = importedData.personnel;
            tasks = importedData.tasks;
            history = importedData.history || [];

            // 儲存到 localStorage
            saveData();

            // 更新顯示
            updateDisplay();

            alert(`資料匯入成功！\n人員：${personnel.length} 人\n任務：${tasks.length} 項`);

        } catch (error) {
            console.error('匯入錯誤:', error);
            alert('匯入失敗！檔案可能已損壞或格式不正確。');
        }
    };

    reader.readAsText(file);

    // 清空 input 以允許重複選擇同一個檔案
    event.target.value = '';
}

// ===== 日期管理 =====
function applyDateOffset(offset) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() + offset);
    currentDateString = formatDate(currentDate);
    updateDateDisplay();
    updateDisplay();
}

function updateDateDisplay() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = formatDate(today);

    let displayText = currentDateString;

    const daysDiff = Math.round((currentDate - today) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
        displayText += ' (今天)';
    } else if (daysDiff === 1) {
        displayText += ' (明天)';
    } else if (daysDiff === 2) {
        displayText += ' (後天)';
    } else if (daysDiff > 0) {
        displayText += ` (${daysDiff}天後)`;
    } else if (daysDiff === -1) {
        displayText += ' (昨天)';
    } else if (daysDiff < 0) {
        displayText += ` (${-daysDiff}天前)`;
    }

    // 加上星期
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[currentDate.getDay()];
    displayText += ` 星期${weekday}`;

    document.getElementById('currentDateDisplay').textContent = displayText;

    // 更新排班一覽
    updateScheduleOverview();
}

// ===== 排班一覽 =====
function updateScheduleOverview() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overviewSelect = document.getElementById('scheduleOverview');
    overviewSelect.innerHTML = '';

    // 顯示過去3天 + 今天 + 未來6天 = 共10天
    for (let i = -3; i <= 6; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateString = formatDate(date);

        // 統計該日期的任務數量
        const taskCount = tasks.filter(t => (t.date || formatDate(new Date())) === dateString).length;

        // 生成日期標籤
        let dateLabel = '';
        if (i === 0) {
            dateLabel = '今天';
        } else if (i === 1) {
            dateLabel = '明天';
        } else if (i === 2) {
            dateLabel = '後天';
        } else if (i === -1) {
            dateLabel = '昨天';
        } else if (i === -2) {
            dateLabel = '前天';
        } else if (i < 0) {
            dateLabel = `${-i}天前`;
        } else {
            const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
            dateLabel = `星期${weekdays[date.getDay()]}`;
        }

        // 建立選項
        const option = document.createElement('option');
        option.value = dateString;
        option.textContent = `${dateString.substring(5)} (${dateLabel}) - ${taskCount} 個任務`;

        if (dateString === currentDateString) {
            option.selected = true;
        }

        overviewSelect.appendChild(option);
    }

    // 移除舊的事件監聽器（如果有）
    overviewSelect.onchange = null;

    // 添加 change 事件監聽器
    overviewSelect.addEventListener('change', function() {
        const selectedDateString = this.value;
        currentDate = new Date(selectedDateString + 'T00:00:00');
        currentDateString = selectedDateString;
        updateDateDisplay();
        updateDisplay();

        // 更新日期按鈕狀態
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysDiff = Math.round((currentDate - today) / (1000 * 60 * 60 * 24));

        document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
        if (daysDiff === 0) {
            document.querySelector('.date-btn[data-offset="0"]').classList.add('active');
        } else if (daysDiff === 1) {
            document.querySelector('.date-btn[data-offset="1"]').classList.add('active');
        } else {
            document.querySelector('.date-btn[data-mode="custom"]').classList.add('active');
        }
    });
}

// ===== 時段管理 =====
function applyTimeMode(mode) {
    const now = new Date();
    const currentHour = now.getHours();

    switch(mode) {
        case 'now':
            currentStartHour = currentHour;
            currentEndHour = currentHour;
            break;
        case 'night':
            currentStartHour = 0;
            currentEndHour = 6;
            break;
        case 'morning':
            currentStartHour = 6;
            currentEndHour = 12;
            break;
        case 'afternoon':
            currentStartHour = 12;
            currentEndHour = 18;
            break;
        case 'evening':
            currentStartHour = 18;
            currentEndHour = 24;
            break;
    }

    updateTimeDisplay();
    updateDisplay();
}

function updateTimeDisplay() {
    let displayText;
    if (currentTimeMode === 'now') {
        displayText = `現在 (${String(currentStartHour).padStart(2, '0')}:00)`;
    } else {
        const endDisplay = currentEndHour === 24 ? '00:00(隔日)' : `${String(currentEndHour).padStart(2, '0')}:00`;
        displayText = `${String(currentStartHour).padStart(2, '0')}:00 - ${endDisplay}`;
    }

    document.getElementById('currentTimeDisplay').textContent = displayText;
}

// ===== 顯示更新 =====
function updateDisplay() {
    renderPersonnelGrid();
    renderTaskList();
    updateStats();
    updateScheduleOverview(); // 更新排班一覽
}

// ===== 人員網格渲染（核心功能）=====
function renderPersonnelGrid() {
    const container = document.getElementById('personnelGrid');
    container.innerHTML = '';

    // 篩選人員
    let filteredPersonnel = filterPersonnel();

    if (filteredPersonnel.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--gaming-cyan); padding: 40px;">找不到符合條件的人員</div>';
        return;
    }

    // 按位階排序
    filteredPersonnel.sort((a, b) => b.rank - a.rank);

    // 渲染每個人員卡片
    filteredPersonnel.forEach(person => {
        const card = createPersonCardGrid(person);
        container.appendChild(card);
    });
}

function filterPersonnel() {
    return personnel.filter(person => {
        // 搜尋過濾
        if (currentSearchText && !person.name.toLowerCase().includes(currentSearchText)) {
            return false;
        }

        // 位階過濾
        if (currentRankFilter !== 'all') {
            if (currentRankFilter === 'special') {
                // 特殊人員篩選
                if (!person.isSpecial) {
                    return false;
                }
            } else {
                const [minRank, maxRank] = currentRankFilter.split('-').map(Number);
                if (person.rank < minRank || person.rank > maxRank) {
                    return false;
                }
            }
        }

        // 狀態過濾
        if (currentStatusFilter !== 'all') {
            const status = getPersonStatus(person);

            // 特殊狀態篩選（請假、出任務、午休）
            if (currentStatusFilter === 'leave' && status !== 'leave') {
                return false;
            }
            if (currentStatusFilter === 'mission' && status !== 'mission') {
                return false;
            }
            if (currentStatusFilter === 'lunch' && status !== 'lunch') {
                return false;
            }

            // 一般狀態篩選（空閒、忙碌）
            if (currentStatusFilter === 'free' && status !== 'free') {
                return false;
            }
            if (currentStatusFilter === 'busy' && status === 'free') {
                return false;
            }
        }

        return true;
    });
}

function getPersonStatus(person) {
    // 取得該人員在當前日期和時段的任務
    const personTasks = tasks.filter(t => {
        if (!t.assignees || !t.assignees.includes(person.id)) return false;

        // 檢查日期
        const taskDate = t.date || formatDate(new Date());
        if (taskDate !== currentDateString) return false;

        // 檢查任務時段是否與當前查詢時段重疊
        return !(t.endHour <= currentStartHour || t.startHour > currentEndHour);
    });

    // 優先檢查是否有特殊任務（請假、出任務、午休）
    const specialTask = personTasks.find(t => t.type === 'leave' || t.type === 'mission' || t.type === 'lunch');
    if (specialTask) {
        return specialTask.type; // 返回特殊狀態：leave, mission, lunch
    }

    // 如果沒有特殊任務，但人員狀態標記為特殊狀態，也返回該狀態
    const personStatus = person.status || 'normal';
    if (personStatus !== 'normal') {
        return personStatus;
    }

    // 檢查一般工作任務
    if (personTasks.length === 0) {
        return 'free'; // 完全空閒
    }

    // 檢查是否完全被占用
    const totalQueryHours = currentEndHour - currentStartHour + 1;
    let busyHours = 0;

    for (let hour = currentStartHour; hour <= currentEndHour; hour++) {
        const hasTask = personTasks.some(t => hour >= t.startHour && hour < t.endHour);
        if (hasTask) busyHours++;
    }

    if (busyHours >= totalQueryHours) {
        return 'busy'; // 完全忙碌
    } else {
        return 'partial'; // 部分空閒
    }
}

// 取得人員的空閒時段詳情
function getPersonFreeHours(person) {
    // 只考慮當前日期的任務
    const allPersonTasks = tasks.filter(t => {
        if (!t.assignees || !t.assignees.includes(person.id)) return false;
        const taskDate = t.date || formatDate(new Date());
        return taskDate === currentDateString;
    });

    let freeHours = [];
    for (let hour = currentStartHour; hour <= currentEndHour; hour++) {
        const isBusy = allPersonTasks.some(t => hour >= t.startHour && hour < t.endHour);
        if (!isBusy) {
            freeHours.push(hour);
        }
    }

    return freeHours;
}

function createPersonCardGrid(person) {
    const card = document.createElement('div');
    const status = getPersonStatus(person);
    const freeHours = getPersonFreeHours(person);

    card.className = `person-card-grid status-${status}`;
    card.dataset.personId = person.id;

    // 點擊顯示詳細資訊
    card.addEventListener('click', () => showPersonDetail(person.id));

    // 拖放事件
    card.addEventListener('dragover', handlePersonDragOver);
    card.addEventListener('dragleave', handlePersonDragLeave);
    card.addEventListener('drop', handlePersonDrop);

    const statusText = {
        'free': '空閒',
        'busy': '忙碌',
        'partial': '部分空閒',
        'leave': '🏖️ 請假',
        'mission': '🚀 出任務',
        'lunch': '🍱 午休'
    };

    const rankLabel = getRankLabel(person.rank);

    // 取得該人員在當前日期的所有任務
    const allPersonTasks = tasks.filter(t => {
        if (!t.assignees || !t.assignees.includes(person.id)) return false;
        // 只顯示當前查詢日期的任務
        const taskDate = t.date || formatDate(new Date());
        return taskDate === currentDateString;
    });

    // 顯示任務列表（依時間排序）
    let tasksDisplay = '';
    if (allPersonTasks.length > 0) {
        // 按開始時間排序
        const sortedTasks = [...allPersonTasks].sort((a, b) => a.startHour - b.startHour);

        const taskItems = sortedTasks.map(task => {
            const startTime = `${String(task.startHour).padStart(2, '0')}:00`;
            const endTime = task.endHour === 24 ? '00:00' : `${String(task.endHour).padStart(2, '0')}:00`;

            // 檢查任務是否在當前查詢時段內
            const isInCurrentRange = !(task.endHour <= currentStartHour || task.startHour > currentEndHour);
            const highlightClass = isInCurrentRange ? 'task-current' : 'task-other';

            return `<div class="task-item-mini ${highlightClass}">📋 ${task.name} (${startTime}-${endTime})</div>`;
        }).join('');
        tasksDisplay = `<div class="person-tasks-list">${taskItems}</div>`;
    }

    // 格式化空閒時段（簡化顯示）
    let freeTimeDisplay = '';
    if (freeHours.length === 0) {
        freeTimeDisplay = '<div class="free-hours-none">❌ 完全忙碌</div>';
    } else {
        const totalQueryHours = currentEndHour - currentStartHour + 1;
        const freeCount = freeHours.length;

        if (freeCount === totalQueryHours) {
            freeTimeDisplay = `<div class="free-hours-all">✅ 完全空閒</div>`;
        } else {
            // 顯示連續時段
            const ranges = getHourRanges(freeHours);
            freeTimeDisplay = `<div class="free-hours-partial">⚠️ 空閒 ${ranges}</div>`;
        }
    }

    const specialBadge = person.isSpecial ? '<span class="special-badge">🔸 特殊人員</span>' : '';

    // 特殊狀態徽章（請假、出任務、午休）
    const personStatus = person.status || 'normal';
    let statusBadge = '';
    if (personStatus === 'leave') {
        statusBadge = '<span class="person-status-badge status-badge-leave">🏖️ 請假中</span>';
    } else if (personStatus === 'mission') {
        statusBadge = '<span class="person-status-badge status-badge-mission">🚀 出任務</span>';
    } else if (personStatus === 'lunch') {
        statusBadge = '<span class="person-status-badge status-badge-lunch">🍱 午休中</span>';
    }

    card.innerHTML = `
        <div class="person-name-grid">
            ${person.name} ${specialBadge}
            ${statusBadge}
        </div>
        <div class="person-rank-display">
            <span class="rank-badge-grid">LV ${person.rank} - ${rankLabel}</span>
        </div>
        <div class="person-status-grid status-${status}">
            <span class="status-text">${statusText[status]}</span>
        </div>
        ${tasksDisplay}
        ${freeTimeDisplay}
        <div class="person-contact-grid">${person.contact}</div>
    `;

    return card;
}

// 將小時陣列轉換為時段範圍顯示（簡化版：使用 24 小時制）
function getHourRanges(hours) {
    if (hours.length === 0) return '無';

    hours.sort((a, b) => a - b);
    const ranges = [];
    let start = hours[0];
    let end = hours[0];

    for (let i = 1; i < hours.length; i++) {
        if (hours[i] === end + 1) {
            end = hours[i];
        } else {
            ranges.push(start === end ? `${String(start).padStart(2, '0')}:00` : `${String(start).padStart(2, '0')}-${String(end).padStart(2, '0')}:00`);
            start = hours[i];
            end = hours[i];
        }
    }
    ranges.push(start === end ? `${String(start).padStart(2, '0')}:00` : `${String(start).padStart(2, '0')}-${String(end).padStart(2, '0')}:00`);

    return ranges.join(', ');
}

function getRankLabel(rank) {
    return RANK_LABELS[String(rank)] || `LV${rank}`;
}

// ===== 統計更新 =====
function updateStats() {
    const filteredPersonnel = filterPersonnel();

    let freeCount = 0;
    let busyCount = 0;
    let leaveCount = 0;
    let missionCount = 0;
    let lunchCount = 0;

    filteredPersonnel.forEach(person => {
        const status = getPersonStatus(person);
        if (status === 'free') freeCount++;
        else if (status === 'busy') busyCount++;
        else if (status === 'leave') leaveCount++;
        else if (status === 'mission') missionCount++;
        else if (status === 'lunch') lunchCount++;
    });

    document.getElementById('totalCount').textContent = filteredPersonnel.length;
    document.getElementById('freeCount').textContent = freeCount;
    document.getElementById('busyCount').textContent = busyCount;
    document.getElementById('leaveCount').textContent = leaveCount;
    document.getElementById('missionCount').textContent = missionCount;
    document.getElementById('lunchCount').textContent = lunchCount;
}

// ===== 任務列表渲染 =====
function renderTaskList() {
    const container = document.getElementById('taskList');
    container.innerHTML = '';

    // 先篩選當前日期的任務
    let filteredTasks = tasks.filter(t => {
        // 如果任務沒有日期欄位，預設為今天（相容舊資料）
        const taskDate = t.date || formatDate(new Date());
        return taskDate === currentDateString;
    });

    // 再依類型篩選
    if (currentTaskFilter === 'understaffed') {
        // 未達標：分配人數少於需求人數的任務
        filteredTasks = filteredTasks.filter(t => {
            const assignees = t.assignees || [];
            const required = t.requiredPeople || 1;
            return assignees.length < required;
        });
    } else if (currentTaskFilter !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.type === currentTaskFilter);
    }

    // 更新任務計數
    document.getElementById('taskCount').textContent = filteredTasks.length;

    if (filteredTasks.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--gaming-cyan); padding: 20px;">無任務</div>';
        return;
    }

    filteredTasks.forEach(task => {
        const card = createTaskCard(task);
        container.appendChild(card);
    });
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card ${task.type}`;
    card.draggable = true;
    card.dataset.taskId = task.id;

    const assignees = task.assignees || [];
    const required = task.requiredPeople || 1;
    const assigned = assignees.length;
    const isFull = assigned >= required;

    const typeText = {
        'daily': '日常',
        'important': '重要',
        'urgent': '臨時',
        'leave': '🏖️ 請假',
        'mission': '🚀 出任務',
        'lunch': '🍱 午休'
    };

    // 建立成員列表
    let membersList = '';
    if (assigned > 0) {
        const memberNames = assignees
            .map(id => personnel.find(p => p.id === id)?.name || '?')
            .slice(0, 3);

        membersList = `<div class="task-members">
            <span class="members-icon">👥</span>
            ${memberNames.join(', ')}${assigned > 3 ? ` +${assigned - 3}人` : ''}
        </div>`;
    } else {
        membersList = '<div class="task-members-empty">尚無成員</div>';
    }

    // 人數進度條
    const progress = Math.min((assigned / required) * 100, 100);
    const progressClass = isFull ? 'full' : assigned > 0 ? 'partial' : 'empty';

    // 格式化時間顯示
    const startTime = `${String(task.startHour).padStart(2, '0')}:00`;
    const endTime = task.endHour === 24 ? '00:00' : `${String(task.endHour).padStart(2, '0')}:00`;

    // 未達標警告標示
    const understaffedBadge = !isFull ? '<span class="understaffed-badge">⚠️ 缺人</span>' : '';

    // 工作性質標籤
    const categoryName = task.workCategory ? WORK_CATEGORIES[task.workCategory] : '';
    const categoryBadge = categoryName ? `<span class="work-category-badge">📋 ${categoryName}</span>` : '';

    card.innerHTML = `
        <div class="task-card-header">
            <span class="task-card-name">${task.name} ${understaffedBadge}</span>
            <span class="task-type-badge ${task.type}">${typeText[task.type]}</span>
        </div>
        ${categoryBadge}
        <div class="task-card-time">${startTime} - ${endTime}</div>
        <div class="task-progress-section">
            <div class="task-people-count ${progressClass}">
                <span class="count-current">${assigned}</span>
                <span class="count-separator">/</span>
                <span class="count-required">${required}</span>
                <span class="count-label">人</span>
            </div>
            <div class="task-progress-bar">
                <div class="task-progress-fill ${progressClass}" style="width: ${progress}%"></div>
            </div>
        </div>
        ${membersList}
    `;

    // 拖拉事件
    card.addEventListener('dragstart', handleTaskDragStart);
    card.addEventListener('dragend', handleTaskDragEnd);

    // 點擊查看詳情
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.dragging')) {
            showTaskDetail(task.id);
        }
    });

    // 右鍵編輯
    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        editTask(task.id);
    });

    return card;
}

// ===== 拖拉功能 =====
function handleTaskDragStart(e) {
    draggedTask = parseInt(this.dataset.taskId);
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';

    // 高亮顯示可用/不可用的人員
    highlightAvailablePersonnel(draggedTask);
}

function handleTaskDragEnd(e) {
    this.classList.remove('dragging');
    draggedTask = null;

    // 移除所有高亮
    clearAvailabilityHighlight();
}

// 檢查兩個時段是否衝突
function hasTimeConflict(start1, end1, start2, end2) {
    // 如果 end 是 24，轉換為 0（隔日）
    const e1 = end1 === 24 ? 0 : end1;
    const e2 = end2 === 24 ? 0 : end2;

    // 檢查是否有重疊
    if (e1 === 0) {
        // 任務1跨越午夜
        return start2 >= start1 || e2 <= 0 || e2 > start1;
    }
    if (e2 === 0) {
        // 任務2跨越午夜
        return start1 >= start2 || e1 <= 0 || e1 > start2;
    }

    // 正常時段檢查
    return !(end1 <= start2 || end2 <= start1);
}

// 高亮顯示可用人員
function highlightAvailablePersonnel(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        console.log('找不到任務:', taskId);
        return;
    }

    const taskStart = task.startHour;
    const taskEnd = task.endHour;
    const taskDate = task.date || formatDate(new Date());

    console.log('開始檢查人員可用性 - 任務:', task.name, '時段:', taskStart, '-', taskEnd, '日期:', taskDate);

    // 取得目前畫面上顯示的所有人員卡片
    const allPersonCards = document.querySelectorAll('.person-card-grid');
    console.log('找到', allPersonCards.length, '個人員卡片');

    allPersonCards.forEach(personCard => {
        const personId = parseInt(personCard.dataset.personId);
        const person = personnel.find(p => p.id === personId);
        if (!person) return;

        // 檢查此人是否已經在這個任務中
        const assignees = task.assignees || [];
        if (assignees.includes(personId)) {
            personCard.classList.add('already-assigned');
            console.log(person.name, '已在此任務中');
            return;
        }

        // 檢查人員是否處於特殊狀態（請假、出任務、午休）
        const personStatus = person.status || 'normal';
        if (personStatus !== 'normal') {
            personCard.classList.add('time-conflict');
            console.log(person.name, '處於特殊狀態:', personStatus);
            return;
        }

        // 檢查是否在過去7天內做過相同性質的工作
        const taskCategory = task.workCategory;
        if (taskCategory && hasRecentWorkCategory(personId, taskCategory, 7)) {
            personCard.classList.add('work-repeat');
            console.log(person.name, '近7天內已做過此性質工作:', WORK_CATEGORIES[taskCategory] || taskCategory);
            return;
        }

        // 找出此人在同一天的所有任務
        const personTasks = tasks.filter(t => {
            const tDate = t.date || formatDate(new Date());
            return tDate === taskDate &&
                   t.assignees &&
                   t.assignees.includes(person.id) &&
                   t.id !== taskId; // 排除正在拖拉的任務本身
        });

        // 檢查是否有時間衝突
        let hasConflict = false;
        for (const pTask of personTasks) {
            if (hasTimeConflict(taskStart, taskEnd, pTask.startHour, pTask.endHour)) {
                hasConflict = true;
                console.log(person.name, '時段衝突 -', pTask.name, '(', pTask.startHour, '-', pTask.endHour, ')');
                break;
            }
        }

        // 標記卡片
        if (hasConflict) {
            personCard.classList.add('time-conflict');
        } else {
            personCard.classList.add('time-available');
            console.log(person.name, '有空');
        }
    });
}

// 清除可用性高亮
function clearAvailabilityHighlight() {
    document.querySelectorAll('.person-card-grid').forEach(card => {
        card.classList.remove('time-conflict', 'time-available', 'already-assigned', 'work-repeat');
    });
}

function handlePersonDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!this.classList.contains('drag-over')) {
        this.classList.add('drag-over');
    }
}

function handlePersonDragLeave(e) {
    this.classList.remove('drag-over');
}

function handlePersonDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');

    if (!draggedTask) return;

    const personId = parseInt(this.dataset.personId);
    const task = tasks.find(t => t.id === draggedTask);

    if (task) {
        const person = personnel.find(p => p.id === personId);

        // 初始化 assignees 陣列（處理舊資料）
        if (!task.assignees) {
            task.assignees = task.assignee ? [task.assignee] : [];
            delete task.assignee;
        }

        // 檢查人員是否處於特殊狀態
        const personStatus = person.status || 'normal';
        if (personStatus !== 'normal') {
            const statusNames = {
                'leave': '請假中',
                'mission': '出任務中',
                'lunch': '午休中'
            };
            alert(`${person.name} 目前${statusNames[personStatus]}，無法分配任務！`);
            return;
        }

        // 檢查是否已經在任務中
        if (task.assignees.includes(personId)) {
            alert(`${person.name} 已經在任務「${task.name}」中！`);
            return;
        }

        // 檢查是否在過去7天內做過相同性質的工作
        const taskCategory = task.workCategory;
        if (taskCategory && hasRecentWorkCategory(personId, taskCategory, 7)) {
            const categoryName = WORK_CATEGORIES[taskCategory] || taskCategory;
            const confirmMsg = `⚠️ 工作性質重複警告\n\n${person.name} 在過去 7 天內已經執行過「${categoryName}」性質的工作。\n\n為了工作多樣性，建議安排其他性質的任務。\n\n仍要分配嗎？`;
            if (!confirm(confirmMsg)) {
                return;
            }
        }

        // 檢查是否已滿
        const required = task.requiredPeople || 1;
        if (task.assignees.length >= required) {
            const confirmMsg = `任務「${task.name}」已滿 (${task.assignees.length}/${required}人)\n仍要加入 ${person.name} 嗎？`;
            if (!confirm(confirmMsg)) {
                return;
            }
        }

        // 新增到任務
        task.assignees.push(personId);
        addHistory(`加入任務「${task.name}」: ${person.name} (${task.assignees.length}/${required}人)`);
        saveData();
        updateDisplay();

        console.log(`${person.name} 已加入任務「${task.name}」`);
    }
}

// ===== 人員管理 =====
function showAddPersonModal() {
    editingPersonId = null;
    document.getElementById('personModalTitle').textContent = '新增人員';
    document.getElementById('personName').value = '';
    document.getElementById('personRank').value = '3';
    document.getElementById('personContact').value = '';
    document.getElementById('personIsSpecial').checked = false;
    updateRankDisplay(3);
    document.getElementById('personModal').classList.remove('hidden');
}

// ===== 批量匯入人員 =====
function showImportPersonListModal() {
    document.getElementById('clearExistingPersonnel').checked = false;
    const tbody = document.getElementById('importTableBody');
    tbody.innerHTML = ''; // 清空表格

    // 預設新增 5 行
    for (let i = 0; i < 5; i++) {
        addPersonRow();
    }

    document.getElementById('importPersonListModal').classList.remove('hidden');
}

function addPersonRow() {
    const tbody = document.getElementById('importTableBody');
    const row = document.createElement('tr');
    row.className = 'import-row';

    // 生成等級選項
    let rankOptions = '';
    for (let i = 1; i <= 10; i++) {
        rankOptions += `<option value="${i}">${i}</option>`;
    }

    row.innerHTML = `
        <td><input type="text" class="import-input" placeholder="請輸入姓名"></td>
        <td>
            <select class="import-select">
                <option value="">請選擇</option>
                ${rankOptions}
            </select>
        </td>
        <td><input type="text" class="import-input" placeholder="分機或手機"></td>
        <td style="text-align: center;">
            <input type="checkbox" class="cyber-checkbox">
        </td>
        <td style="text-align: center;">
            <button class="btn-delete-row" onclick="removePersonRow(this)">🗑️</button>
        </td>
    `;

    tbody.appendChild(row);
}

function removePersonRow(button) {
    const row = button.closest('tr');
    row.remove();
}

function importPersonList() {
    const tbody = document.getElementById('importTableBody');
    const rows = tbody.querySelectorAll('tr');
    const clearExisting = document.getElementById('clearExistingPersonnel').checked;

    const newPersonnel = [];
    const errors = [];

    rows.forEach((row, index) => {
        const inputs = row.querySelectorAll('.import-input');
        const select = row.querySelector('.import-select');
        const checkbox = row.querySelector('.cyber-checkbox');

        const name = inputs[0].value.trim();
        const rank = parseInt(select.value);
        const contact = inputs[1].value.trim() || '未提供';
        const isSpecial = checkbox.checked;

        // 如果姓名和等級都是空的，跳過這一行
        if (!name && !select.value) {
            return;
        }

        // 驗證
        if (!name) {
            errors.push(`第 ${index + 1} 行：姓名不能為空`);
            return;
        }

        if (!select.value || isNaN(rank) || rank < 1 || rank > 10) {
            errors.push(`第 ${index + 1} 行：請選擇等級 (1-10)`);
            return;
        }

        newPersonnel.push({
            id: Date.now() + index + Math.random() * 1000,
            name,
            rank,
            contact,
            isSpecial,
            status: 'normal' // 預設為正常狀態
        });
    });

    if (errors.length > 0) {
        alert('匯入失敗！\n\n' + errors.join('\n'));
        return;
    }

    if (newPersonnel.length === 0) {
        alert('沒有可匯入的人員！\n請至少填寫一行的姓名和等級。');
        return;
    }

    // 確認匯入
    const confirmMsg = clearExisting
        ? `確定要清除現有 ${personnel.length} 個人員，並匯入 ${newPersonnel.length} 個新人員嗎？`
        : `確定要新增 ${newPersonnel.length} 個人員嗎？（不會刪除現有人員）`;

    if (!confirm(confirmMsg)) {
        return;
    }

    // 執行匯入
    if (clearExisting) {
        personnel = newPersonnel;
        addHistory(`清除舊人員並批量匯入 ${newPersonnel.length} 個人員`);
    } else {
        personnel.push(...newPersonnel);
        addHistory(`批量匯入 ${newPersonnel.length} 個人員`);
    }

    saveData();
    updateDisplay();
    closeModal('importPersonListModal');

    alert(`成功匯入 ${newPersonnel.length} 個人員！`);
}

function savePerson() {
    const name = document.getElementById('personName').value.trim();
    const rank = parseInt(document.getElementById('personRank').value);
    const contact = document.getElementById('personContact').value.trim();
    const isSpecial = document.getElementById('personIsSpecial').checked;

    if (!name) {
        alert('請輸入姓名');
        return;
    }

    if (editingPersonId) {
        const person = personnel.find(p => p.id === editingPersonId);
        if (person) {
            person.name = name;
            person.rank = rank;
            person.contact = contact;
            person.isSpecial = isSpecial;
            addHistory(`編輯人員: ${name}${isSpecial ? ' (特殊人員)' : ''}`);
        }
    } else {
        const newPerson = {
            id: Date.now(),
            name,
            rank,
            contact,
            isSpecial,
            status: 'normal' // 預設為正常狀態
        };
        personnel.push(newPerson);
        addHistory(`新增人員: ${name}${isSpecial ? ' (特殊人員)' : ''}`);
    }

    saveData();
    updateDisplay();
    closeModal('personModal');
}

function updateRankDisplay(rank) {
    document.getElementById('rankNumber').textContent = rank;
    document.getElementById('rankLabel').textContent = getRankLabel(rank);
}

// ===== 任務管理 =====
function showAddTaskModal() {
    editingTaskId = null;
    document.getElementById('taskModalTitle').textContent = '新增任務';
    document.getElementById('taskName').value = '';
    document.getElementById('taskDate').value = currentDateString; // 預設為當前查詢的日期
    document.getElementById('taskType').value = 'daily';
    updateTaskWorkCategoryOptions();
    document.getElementById('taskWorkCategory').value = Object.keys(WORK_CATEGORIES)[0] || '';
    document.getElementById('taskStartHour').value = '';
    document.getElementById('taskEndHour').value = '';
    document.getElementById('taskRequiredPeople').value = '1';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskModal').classList.remove('hidden');
}

function saveTask() {
    const name = document.getElementById('taskName').value.trim();
    const date = document.getElementById('taskDate').value;
    const type = document.getElementById('taskType').value;
    const workCategory = document.getElementById('taskWorkCategory').value;
    const startHour = parseInt(document.getElementById('taskStartHour').value);
    const endHour = parseInt(document.getElementById('taskEndHour').value);
    const requiredPeople = parseInt(document.getElementById('taskRequiredPeople').value);
    const description = document.getElementById('taskDescription').value.trim();

    if (!name) {
        alert('請輸入任務名稱');
        return;
    }

    if (!date) {
        alert('請選擇任務日期');
        return;
    }

    if (isNaN(startHour) || isNaN(endHour)) {
        alert('請輸入開始和結束時間');
        return;
    }

    if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 24) {
        alert('時間必須在 0-23 之間（結束時間可以是 24）');
        return;
    }

    if (startHour >= endHour) {
        alert('結束時間必須大於開始時間');
        return;
    }

    if (isNaN(requiredPeople) || requiredPeople < 1) {
        alert('需求人數必須至少為 1');
        return;
    }

    if (editingTaskId) {
        const task = tasks.find(t => t.id === editingTaskId);
        if (task) {
            task.name = name;
            task.date = date;
            task.type = type;
            task.workCategory = workCategory;
            task.startHour = startHour;
            task.endHour = endHour;
            task.requiredPeople = requiredPeople;
            task.description = description;
            // 保留現有的 assignees
            addHistory(`編輯任務: ${name} (${date})`);
        }
    } else {
        const newTask = {
            id: Date.now(),
            name,
            date,
            type,
            workCategory,
            startHour,
            endHour,
            assignees: [],
            requiredPeople,
            description
        };
        tasks.push(newTask);
        addHistory(`新增任務: ${name} (${date}, 需要${requiredPeople}人, ${startHour}:00-${endHour}:00)`);
    }

    saveData();
    updateDisplay();
    closeModal('taskModal');
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    editingTaskId = taskId;
    document.getElementById('taskModalTitle').textContent = '編輯任務';
    document.getElementById('taskName').value = task.name;
    document.getElementById('taskDate').value = task.date || currentDateString;
    document.getElementById('taskType').value = task.type;
    updateTaskWorkCategoryOptions();
    document.getElementById('taskWorkCategory').value = task.workCategory || Object.keys(WORK_CATEGORIES)[0] || '';
    document.getElementById('taskStartHour').value = task.startHour;
    document.getElementById('taskEndHour').value = task.endHour;
    document.getElementById('taskRequiredPeople').value = task.requiredPeople || 1;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskModal').classList.remove('hidden');
}

function updateTaskAssigneeOptions() {
    const select = document.getElementById('taskAssignee');
    select.innerHTML = '<option value="">未分配</option>';

    const sortedPersonnel = [...personnel].sort((a, b) => b.rank - a.rank);
    sortedPersonnel.forEach(person => {
        const option = document.createElement('option');
        option.value = person.id;
        option.textContent = `${person.name} (LV ${person.rank})`;
        select.appendChild(option);
    });
}

// ===== 詳細面板 =====
function showPersonDetail(personId) {
    const person = personnel.find(p => p.id === personId);
    if (!person) return;

    const panel = document.getElementById('detailPanel');
    const content = document.getElementById('detailContent');

    // 取得該人員的所有任務
    const personTasks = tasks.filter(t => t.assignees && t.assignees.includes(person.id));

    const rankLabel = getRankLabel(person.rank);
    const status = getPersonStatus(person);
    const statusText = {
        'free': '空閒',
        'busy': '忙碌',
        'partial': '部分空閒',
        'leave': '🏖️ 請假',
        'mission': '🚀 出任務',
        'lunch': '🍱 午休'
    };

    let html = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--gaming-yellow); font-size: 1.5rem; margin-bottom: 10px;">${person.name}</h3>
            <div style="color: var(--gaming-cyan); margin-bottom: 5px;">等級 ${person.rank} - ${rankLabel}</div>
            <div style="color: var(--gaming-white); margin-bottom: 5px;">${person.contact}</div>
            <div style="margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.4); border-radius: 5px;">
                <span style="color: var(--gaming-cyan); font-size: 0.9rem;">當前狀態: </span>
                <span style="color: var(--status-${status}); font-weight: bold; text-shadow: var(--glow-${status === 'free' ? 'green' : status === 'busy' ? 'red' : 'yellow'});">${statusText[status]}</span>
            </div>
        </div>

        <div style="margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.4); border-radius: 8px;">
            <h4 style="color: var(--gaming-yellow); margin: 0 0 15px 0; font-size: 1rem;">設定人員狀態</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <button onclick="setPersonStatus(${person.id}, 'normal')"
                    style="padding: 8px; background: ${(person.status || 'normal') === 'normal' ? 'var(--gaming-yellow)' : 'rgba(255,255,255,0.1)'};
                    color: ${(person.status || 'normal') === 'normal' ? 'var(--gaming-black)' : 'var(--gaming-white)'};
                    border: 1px solid var(--gaming-yellow); border-radius: 5px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                    ✅ 正常
                </button>
                <button onclick="setPersonStatus(${person.id}, 'leave')"
                    style="padding: 8px; background: ${(person.status || 'normal') === 'leave' ? '#FF6B6B' : 'rgba(255,255,255,0.1)'};
                    color: var(--gaming-white);
                    border: 1px solid #FF6B6B; border-radius: 5px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                    🏖️ 請假
                </button>
                <button onclick="setPersonStatus(${person.id}, 'mission')"
                    style="padding: 8px; background: ${(person.status || 'normal') === 'mission' ? '#4ECDC4' : 'rgba(255,255,255,0.1)'};
                    color: var(--gaming-white);
                    border: 1px solid #4ECDC4; border-radius: 5px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                    🚀 出任務
                </button>
                <button onclick="setPersonStatus(${person.id}, 'lunch')"
                    style="padding: 8px; background: ${(person.status || 'normal') === 'lunch' ? '#FFB84D' : 'rgba(255,255,255,0.1)'};
                    color: var(--gaming-white);
                    border: 1px solid #FFB84D; border-radius: 5px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                    🍱 午休
                </button>
            </div>
        </div>

        <div style="margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.4); border-radius: 8px; border: 1px solid rgba(255, 184, 77, 0.3);">
            <h4 style="color: var(--gaming-yellow); margin: 0 0 15px 0; font-size: 1rem;">📊 過去 7 天工作記錄</h4>
            <div id="workHistorySection"></div>
        </div>
    `;

    if (personTasks.length === 0) {
        html += '<div style="text-align: center; color: var(--gaming-cyan); padding: 20px;">目前沒有分配任務</div>';
    } else {
        html += '<h4 style="color: var(--gaming-yellow); margin-bottom: 15px; border-bottom: 1px solid rgba(255,215,0,0.3); padding-bottom: 10px;">任務列表</h4>';

        personTasks.sort((a, b) => a.startHour - b.startHour);

        personTasks.forEach(task => {
            const typeText = {
                'daily': '日常',
                'important': '重要',
                'urgent': '臨時',
                'leave': '🏖️ 請假',
                'mission': '🚀 出任務',
                'lunch': '🍱 午休'
            };

            const taskStartTime = `${String(task.startHour).padStart(2, '0')}:00`;
            const taskEndTime = task.endHour === 24 ? '00:00' : `${String(task.endHour).padStart(2, '0')}:00`;

            html += `
                <div style="padding: 12px; margin-bottom: 10px; background: rgba(0,0,0,0.4); border-left: 3px solid var(--status-${task.type === 'daily' ? 'free' : task.type === 'important' ? 'busy' : 'partial'}); border-radius: 5px;">
                    <div style="font-weight: bold; color: var(--gaming-white); margin-bottom: 5px;">${task.name}</div>
                    <div style="font-size: 0.85rem; color: var(--gaming-yellow); margin-bottom: 3px;">${taskStartTime} - ${taskEndTime}</div>
                    <div style="font-size: 0.8rem; color: var(--gaming-cyan);">${typeText[task.type]}任務</div>
                    ${task.description ? `<div style="font-size: 0.8rem; color: var(--gaming-white); margin-top: 5px; opacity: 0.8;">${task.description}</div>` : ''}
                </div>
            `;
        });
    }

    content.innerHTML = html;
    panel.classList.remove('hidden');
    document.querySelector('.main-workspace').classList.add('with-detail');

    // 渲染工作歷史記錄
    renderWorkHistory(person.id);
}

// 渲染工作歷史記錄
function renderWorkHistory(personId) {
    const container = document.getElementById('workHistorySection');
    if (!container) return;

    const workHistory = getPersonWorkHistory(personId, 7);

    if (workHistory.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--gaming-cyan); padding: 15px; opacity: 0.7;">近 7 天無工作記錄</div>';
        return;
    }

    // 統計工作性質
    const categoryCount = {};
    workHistory.forEach(task => {
        const category = task.workCategory || 'other';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    // 生成統計標籤
    let statsHtml = '<div style="display: flex; flex-wrap: wrap; gap: 8px;">';

    Object.entries(categoryCount).forEach(([category, count]) => {
        const categoryName = WORK_CATEGORIES[category] || category;
        statsHtml += `
            <div style="display: inline-flex; align-items: center; gap: 5px; padding: 6px 14px; background: rgba(255, 184, 77, 0.2); border: 1px solid rgba(255, 184, 77, 0.4); border-radius: 15px; font-size: 0.9rem;">
                <span style="color: var(--gaming-white);">${categoryName}</span>
                <span style="color: var(--gaming-yellow); font-weight: bold;">×${count}</span>
            </div>
        `;
    });
    statsHtml += '</div>';

    container.innerHTML = statsHtml;
}

function closeDetailPanel() {
    document.getElementById('detailPanel').classList.add('hidden');
    document.querySelector('.main-workspace').classList.remove('with-detail');
}

// ===== 統計報表 =====
function showStatsModal() {
    const modal = document.getElementById('statsModal');
    const statsGrid = document.getElementById('statsGrid');

    // 計算統計數據
    const totalPersonnel = personnel.length;
    const totalTasks = tasks.length;
    const unassignedTasks = tasks.filter(t => !t.assignee).length;
    const assignedTasks = tasks.filter(t => t.assignee).length;

    // 各類型任務統計
    const dailyTasks = tasks.filter(t => t.type === 'daily').length;
    const importantTasks = tasks.filter(t => t.type === 'important').length;
    const urgentTasks = tasks.filter(t => t.type === 'urgent').length;

    // 各位階人數統計
    const highRank = personnel.filter(p => p.rank >= 9).length;
    const midHighRank = personnel.filter(p => p.rank >= 7 && p.rank < 9).length;
    const midRank = personnel.filter(p => p.rank >= 5 && p.rank < 7).length;
    const lowRank = personnel.filter(p => p.rank >= 3 && p.rank < 5).length;
    const newbieRank = personnel.filter(p => p.rank < 3).length;

    statsGrid.innerHTML = `
        <div class="stat-card-large">
            <div class="stat-label">總人數</div>
            <div class="stat-value">${totalPersonnel}</div>
            <div class="stat-unit">人</div>
        </div>
        <div class="stat-card-large">
            <div class="stat-label">總任務數</div>
            <div class="stat-value">${totalTasks}</div>
            <div class="stat-unit">項</div>
        </div>
        <div class="stat-card-large">
            <div class="stat-label">已分配任務</div>
            <div class="stat-value">${assignedTasks}</div>
            <div class="stat-unit">項</div>
        </div>
        <div class="stat-card-large">
            <div class="stat-label">未分配任務</div>
            <div class="stat-value">${unassignedTasks}</div>
            <div class="stat-unit">項</div>
        </div>
        <div class="stat-card-large">
            <div class="stat-label">日常任務</div>
            <div class="stat-value">${dailyTasks}</div>
            <div class="stat-unit">項</div>
        </div>
        <div class="stat-card-large">
            <div class="stat-label">重要任務</div>
            <div class="stat-value">${importantTasks}</div>
            <div class="stat-unit">項</div>
        </div>
        <div class="stat-card-large">
            <div class="stat-label">臨時任務</div>
            <div class="stat-value">${urgentTasks}</div>
            <div class="stat-unit">項</div>
        </div>
        <div class="stat-card-large">
            <div class="stat-label">高階人員</div>
            <div class="stat-value">${highRank}</div>
            <div class="stat-unit">人 (9-10級)</div>
        </div>
        <div class="stat-card-large">
            <div class="stat-label">中高階人員</div>
            <div class="stat-value">${midHighRank}</div>
            <div class="stat-unit">人 (7-8級)</div>
        </div>
        <div class="stat-card-large">
            <div class="stat-label">中階人員</div>
            <div class="stat-value">${midRank}</div>
            <div class="stat-unit">人 (5-6級)</div>
        </div>
        <div class="stat-card-large">
            <div class="stat-label">基層人員</div>
            <div class="stat-value">${lowRank}</div>
            <div class="stat-unit">人 (3-4級)</div>
        </div>
        <div class="stat-card-large">
            <div class="stat-label">新進人員</div>
            <div class="stat-value">${newbieRank}</div>
            <div class="stat-unit">人 (1-2級)</div>
        </div>
    `;

    renderHistoryList();
    modal.classList.remove('hidden');
}

function renderHistoryList() {
    const container = document.getElementById('historyList');
    container.innerHTML = '';

    if (history.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--gaming-cyan); padding: 20px;">尚無歷史記錄</div>';
        return;
    }

    const recentHistory = history.slice(0, 20);

    recentHistory.forEach(record => {
        const item = document.createElement('div');
        item.className = 'history-item-compact';

        const date = new Date(record.timestamp);
        const timeStr = `${date.getMonth()+1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

        item.innerHTML = `
            <div class="history-time-compact">${timeStr}</div>
            <div class="history-action-compact">${record.action}</div>
        `;
        container.appendChild(item);
    });
}

// ===== 歷史記錄 =====
function addHistory(action) {
    const record = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        action
    };
    history.unshift(record);

    if (history.length > 100) {
        history = history.slice(0, 100);
    }

    saveData();
}

// ===== 工具函數 =====
function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// ===== 任務詳情面板 =====
function showTaskDetail(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const panel = document.getElementById('detailPanel');
    const content = document.getElementById('detailContent');

    const assignees = task.assignees || [];
    const required = task.requiredPeople || 1;

    const typeText = {
        'daily': '日常任務',
        'important': '重要任務',
        'urgent': '臨時任務',
        'leave': '🏖️ 請假',
        'mission': '🚀 出任務',
        'lunch': '🍱 午休'
    };

    const progress = Math.min((assignees.length / required) * 100, 100);
    const progressClass = assignees.length >= required ? 'full' : assignees.length > 0 ? 'partial' : 'empty';

    // 格式化時間顯示
    const detailStartTime = `${String(task.startHour).padStart(2, '0')}:00`;
    const detailEndTime = task.endHour === 24 ? '00:00' : `${String(task.endHour).padStart(2, '0')}:00`;
    const duration = (task.endHour === 24 ? 24 : task.endHour) - task.startHour;

    let html = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--gaming-yellow); font-size: 1.5rem; margin-bottom: 10px;">${task.name}</h3>
            <div style="color: var(--gaming-cyan); margin-bottom: 5px;">${typeText[task.type]}</div>
            <div style="color: var(--gaming-white); margin-bottom: 10px;">${detailStartTime} - ${detailEndTime} (${duration}小時)</div>
            ${task.description ? `<div style="color: var(--gaming-white); opacity: 0.8; font-size: 0.9rem; margin-top: 10px;">${task.description}</div>` : ''}
        </div>

        <div style="margin: 20px 0; padding: 15px; background: rgba(0,0,0,0.4); border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="color: var(--gaming-cyan); font-size: 0.9rem;">人力配置</span>
                <span style="color: var(--gaming-yellow); font-size: 1.2rem; font-weight: bold;">${assignees.length} / ${required} 人</span>
            </div>
            <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: ${progress}%; background: var(--gaming-${progressClass === 'full' ? 'yellow' : progressClass === 'partial' ? 'cyan' : 'white'}); transition: width 0.3s;"></div>
            </div>
        </div>
    `;

    if (assignees.length === 0) {
        html += '<div style="text-align: center; color: var(--gaming-cyan); padding: 20px;">尚無成員<br><small style="opacity: 0.7;">拖拉任務卡片到人員卡片上即可分配</small></div>';
    } else {
        html += '<h4 style="color: var(--gaming-yellow); margin: 20px 0 15px 0; border-bottom: 1px solid rgba(255,215,0,0.3); padding-bottom: 10px;">成員列表</h4>';

        assignees.forEach((personId, index) => {
            const person = personnel.find(p => p.id === personId);
            if (!person) return;

            const rankLabel = getRankLabel(person.rank);

            html += `
                <div style="padding: 12px; margin-bottom: 10px; background: rgba(0,0,0,0.4); border-left: 3px solid var(--gaming-cyan); border-radius: 5px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: bold; color: var(--gaming-white); margin-bottom: 5px;">
                            ${index + 1}. ${person.name}
                            <span style="font-size: 0.8rem; color: var(--gaming-yellow); margin-left: 8px;">LV ${person.rank} - ${rankLabel}</span>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--gaming-cyan);">${person.contact}</div>
                    </div>
                    <button onclick="removePersonFromTask(${task.id}, ${personId})"
                            style="padding: 5px 10px; background: rgba(255,0,0,0.2); border: 1px solid #FF0000; color: #FF0000; border-radius: 4px; cursor: pointer; font-size: 0.85rem; transition: all 0.3s;"
                            onmouseover="this.style.background='rgba(255,0,0,0.4)'"
                            onmouseout="this.style.background='rgba(255,0,0,0.2)'">
                        移除
                    </button>
                </div>
            `;
        });
    }

    // 編輯和刪除按鈕
    html += `
        <div style="margin-top: 25px; display: flex; gap: 10px;">
            <button onclick="editTask(${task.id}); closeDetailPanel();"
                    style="flex: 1; padding: 10px; background: var(--gaming-yellow); color: var(--gaming-black); border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-family: 'Consolas', monospace;">
                編輯任務
            </button>
            <button onclick="deleteTask(${task.id}); closeDetailPanel();"
                    style="flex: 1; padding: 10px; background: rgba(255,0,0,0.2); color: #FF0000; border: 1px solid #FF0000; border-radius: 5px; font-weight: bold; cursor: pointer; font-family: 'Consolas', monospace;">
                刪除任務
            </button>
        </div>
    `;

    content.innerHTML = html;
    panel.classList.remove('hidden');
    document.querySelector('.main-workspace').classList.add('with-detail');
}

// 從任務中移除人員
function removePersonFromTask(taskId, personId) {
    const task = tasks.find(t => t.id === taskId);
    const person = personnel.find(p => p.id === personId);

    if (task && person) {
        if (confirm(`確定要將 ${person.name} 從任務「${task.name}」中移除嗎？`)) {
            task.assignees = task.assignees.filter(id => id !== personId);
            addHistory(`移除任務成員: ${person.name} 從「${task.name}」`);
            saveData();
            updateDisplay();
            showTaskDetail(taskId); // 重新顯示詳情
        }
    }
}

// 刪除任務
function deleteTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (confirm(`確定要刪除任務「${task.name}」嗎？\n此操作無法復原。`)) {
        tasks = tasks.filter(t => t.id !== taskId);
        addHistory(`刪除任務: ${task.name}`);
        saveData();
        updateDisplay();
    }
}

// 輔助函數：處理拖拉到任務列表（暫時不實作）
function handleTaskListDragOver(e) {
    e.preventDefault();
}

function handleTaskListDrop(e) {
    e.preventDefault();
}

// 初始化時套用預設時段
applyTimeMode('now');

// ===== 排班預覽功能 =====
function showSchedulePreview() {
    const modal = document.getElementById('schedulePreviewModal');
    const content = document.getElementById('schedulePreviewContent');
    const dateDisplay = document.getElementById('previewDate');

    // 設定日期顯示
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = formatDate(today);

    const daysDiff = Math.round((currentDate - today) / (1000 * 60 * 60 * 24));
    let dateLabel = currentDateString;
    if (daysDiff === 0) {
        dateLabel += ' (今天)';
    } else if (daysDiff === 1) {
        dateLabel += ' (明天)';
    } else if (daysDiff === 2) {
        dateLabel += ' (後天)';
    } else if (daysDiff > 0) {
        dateLabel += ` (${daysDiff}天後)`;
    } else if (daysDiff === -1) {
        dateLabel += ' (昨天)';
    } else if (daysDiff < 0) {
        dateLabel += ` (${-daysDiff}天前)`;
    }

    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[currentDate.getDay()];
    dateLabel += ` 星期${weekday}`;

    dateDisplay.textContent = dateLabel;

    // 取得當前日期的所有任務
    const dayTasks = tasks.filter(t => {
        const taskDate = t.date || formatDate(new Date());
        return taskDate === currentDateString;
    });

    if (dayTasks.length === 0) {
        content.innerHTML = '<div style="text-align: center; color: var(--gaming-cyan); padding: 40px;">此日期尚無任務安排</div>';
        modal.classList.remove('hidden');
        return;
    }

    // 按時間排序
    dayTasks.sort((a, b) => a.startHour - b.startHour);

    // 生成時間軸
    let html = '<div class="schedule-timeline">';

    dayTasks.forEach(task => {
        const typeColors = {
            'daily': '#00FF88',
            'important': '#FF0080',
            'urgent': '#FF6B00',
            'leave': '#FF6B6B',
            'mission': '#4ECDC4',
            'lunch': '#FFB84D'
        };
        const typeNames = {
            'daily': '日常',
            'important': '重要',
            'urgent': '臨時',
            'leave': '🏖️ 請假',
            'mission': '🚀 出任務',
            'lunch': '🍱 午休'
        };

        const startTime = `${String(task.startHour).padStart(2, '0')}:00`;
        const endTime = task.endHour === 24 ? '00:00(隔日)' : `${String(task.endHour).padStart(2, '0')}:00`;
        const duration = (task.endHour === 24 ? 24 : task.endHour) - task.startHour;

        // 取得分配的人員
        const assignees = task.assignees || [];
        const required = task.requiredPeople || 1;
        let assigneeList = '';

        if (assignees.length === 0) {
            assigneeList = '<div class="preview-assignee-empty">❌ 尚未分配人員</div>';
        } else {
            assigneeList = '<div class="preview-assignee-list">';
            assignees.forEach((personId, index) => {
                const person = personnel.find(p => p.id === personId);
                if (person) {
                    const rankLabel = getRankLabel(person.rank);
                    assigneeList += `
                        <div class="preview-assignee-item">
                            <span class="assignee-number">${index + 1}.</span>
                            <span class="assignee-name">${person.name}</span>
                            <span class="assignee-rank">LV${person.rank} ${rankLabel}</span>
                            <span class="assignee-contact">${person.contact}</span>
                        </div>
                    `;
                }
            });
            assigneeList += '</div>';
        }

        const understaffedWarning = assignees.length < required
            ? `<div class="preview-warning">⚠️ 缺少 ${required - assignees.length} 人</div>`
            : '';

        html += `
            <div class="preview-task-block" data-task-id="${task.id}">
                <div class="preview-task-header" style="border-left: 4px solid ${typeColors[task.type]};">
                    <div class="preview-task-title">
                        <span class="task-icon">📋</span>
                        <span class="task-name">${task.name}</span>
                        <span class="task-type-tag" style="background: ${typeColors[task.type]}40; border-color: ${typeColors[task.type]}; color: ${typeColors[task.type]};">
                            ${typeNames[task.type]}
                        </span>
                        ${task.workCategory ? `<span class="task-category-tag" style="background: rgba(255, 184, 77, 0.2); border: 1px solid rgba(255, 184, 77, 0.4); color: var(--gaming-yellow);">
                            ${WORK_CATEGORIES[task.workCategory] || task.workCategory}
                        </span>` : ''}
                    </div>
                    <div class="preview-task-time">
                        <span class="time-icon">🕐</span>
                        <span class="time-range">${startTime} - ${endTime}</span>
                        <span class="time-duration">(${duration}小時)</span>
                    </div>
                    <div class="preview-task-people">
                        <span class="people-icon">👥</span>
                        <span class="people-count ${assignees.length >= required ? 'count-full' : 'count-short'}">
                            ${assignees.length} / ${required} 人
                        </span>
                    </div>
                </div>
                ${understaffedWarning}
                ${assigneeList}
                ${task.description ? `<div class="preview-task-desc">💡 ${task.description}</div>` : ''}
            </div>
        `;
    });

    html += '</div>';

    // 統計人員狀態
    const statusStats = {
        leave: [],
        mission: [],
        lunch: []
    };

    personnel.forEach(person => {
        if (person.status === 'leave') {
            statusStats.leave.push(person.name);
        } else if (person.status === 'mission') {
            statusStats.mission.push(person.name);
        } else if (person.status === 'lunch') {
            statusStats.lunch.push(person.name);
        }
    });

    // 加上人員狀態統計區塊
    if (statusStats.leave.length > 0 || statusStats.mission.length > 0 || statusStats.lunch.length > 0 || personnel.length > 0) {
        html += `
            <div style="margin-top: 30px; padding: 20px; background: rgba(0, 212, 255, 0.1); border: 2px solid var(--gaming-cyan); border-radius: 10px;">
                <div style="font-size: 1.2rem; font-weight: bold; color: var(--gaming-cyan); margin-bottom: 15px; text-align: center;">
                    📊 人員狀態統計
                </div>

                <div style="display: grid; gap: 12px;">
                    <div style="padding: 10px; background: rgba(0, 255, 136, 0.1); border-left: 4px solid var(--gaming-green); border-radius: 5px;">
                        <span style="color: var(--gaming-green); font-weight: bold;">今日總人數：</span>
                        <span style="color: var(--gaming-white); font-size: 1.1rem; font-weight: bold;">${personnel.length} 人</span>
                    </div>
        `;

        if (statusStats.leave.length > 0) {
            html += `
                    <div style="padding: 10px; background: rgba(255, 0, 128, 0.1); border-left: 4px solid var(--status-busy); border-radius: 5px;">
                        <span style="color: var(--status-busy); font-weight: bold;">請假 (${statusStats.leave.length}人)：</span>
                        <span style="color: var(--gaming-white);">${statusStats.leave.join('、')}</span>
                    </div>
            `;
        }

        if (statusStats.mission.length > 0) {
            html += `
                    <div style="padding: 10px; background: rgba(255, 107, 0, 0.1); border-left: 4px solid var(--gaming-orange); border-radius: 5px;">
                        <span style="color: var(--gaming-orange); font-weight: bold;">出任務 (${statusStats.mission.length}人)：</span>
                        <span style="color: var(--gaming-white);">${statusStats.mission.join('、')}</span>
                    </div>
            `;
        }

        if (statusStats.lunch.length > 0) {
            html += `
                    <div style="padding: 10px; background: rgba(255, 184, 77, 0.1); border-left: 4px solid var(--gaming-yellow); border-radius: 5px;">
                        <span style="color: var(--gaming-yellow); font-weight: bold;">午休 (${statusStats.lunch.length}人)：</span>
                        <span style="color: var(--gaming-white);">${statusStats.lunch.join('、')}</span>
                    </div>
            `;
        }

        html += `
                </div>
            </div>
        `;
    }

    content.innerHTML = html;
    modal.classList.remove('hidden');
}

// 匯出為文字格式
function exportScheduleAsText() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysDiff = Math.round((currentDate - today) / (1000 * 60 * 60 * 24));
    let dateLabel = currentDateString;
    if (daysDiff === 0) {
        dateLabel += ' (今天)';
    } else if (daysDiff === 1) {
        dateLabel += ' (明天)';
    }

    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[currentDate.getDay()];
    dateLabel += ` 星期${weekday}`;

    // 取得當前日期的所有任務
    const dayTasks = tasks.filter(t => {
        const taskDate = t.date || formatDate(new Date());
        return taskDate === currentDateString;
    });

    if (dayTasks.length === 0) {
        alert('此日期尚無任務安排');
        return;
    }

    // 建立人員時間表 (每個人 0-24 點的任務安排)
    const personnelSchedule = new Map();

    // 收集所有有任務的人員
    dayTasks.forEach(task => {
        const assignees = task.assignees || [];
        assignees.forEach(personId => {
            const person = personnel.find(p => p.id === personId);
            if (person) {
                if (!personnelSchedule.has(personId)) {
                    personnelSchedule.set(personId, {
                        name: person.name,
                        tasks: []
                    });
                }
                personnelSchedule.get(personId).tasks.push({
                    name: task.name,
                    startHour: task.startHour,
                    endHour: task.endHour,
                    type: task.type
                });
            }
        });
    });

    if (personnelSchedule.size === 0) {
        alert('此日期尚無人員分配');
        return;
    }

    // 統計人員狀態
    const statusStats = {
        leave: [],
        mission: [],
        lunch: []
    };

    personnel.forEach(person => {
        if (person.status === 'leave') {
            statusStats.leave.push(person.name);
        } else if (person.status === 'mission') {
            statusStats.mission.push(person.name);
        } else if (person.status === 'lunch') {
            statusStats.lunch.push(person.name);
        }
    });

    // 生成文字格式 - 按人員列出（正式版本，無 emoji）
    let text = `排班表 - ${dateLabel}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // 執勤人員
    text += `【執勤人員】\n\n`;

    // 將人員按名稱排序
    const sortedPersonnel = Array.from(personnelSchedule.entries()).sort((a, b) => {
        return a[1].name.localeCompare(b[1].name);
    });

    sortedPersonnel.forEach(([personId, personData], index) => {
        text += `${personData.name}\n`;

        // 將任務按時間排序
        const sortedTasks = personData.tasks.sort((a, b) => a.startHour - b.startHour);

        sortedTasks.forEach(task => {
            const startTime = `${String(task.startHour).padStart(2, '0')}:00`;
            const endTime = task.endHour === 24 ? '24:00' : `${String(task.endHour).padStart(2, '0')}:00`;
            text += `   ${startTime}-${endTime}  ${task.name}\n`;
        });

        text += `\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `總計：${personnelSchedule.size} 人執勤\n\n`;

    // 人員狀態
    let hasStatus = false;
    if (statusStats.leave.length > 0 || statusStats.mission.length > 0 || statusStats.lunch.length > 0) {
        text += `【人員狀態】\n\n`;
        hasStatus = true;
    }

    // 今日總人數
    text += `今日總人數：${personnel.length} 人\n\n`;

    if (statusStats.leave.length > 0) {
        text += `請假 (${statusStats.leave.length}人)：${statusStats.leave.join('、')}\n\n`;
    }

    if (statusStats.mission.length > 0) {
        text += `出任務 (${statusStats.mission.length}人)：${statusStats.mission.join('、')}\n\n`;
    }

    if (statusStats.lunch.length > 0) {
        text += `午休 (${statusStats.lunch.length}人)：${statusStats.lunch.join('、')}\n\n`;
    }

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;

    // 複製到剪貼簿
    navigator.clipboard.writeText(text).then(() => {
        alert('排班表已複製到剪貼簿！\n可以直接貼到通訊軟體。');
    }).catch(err => {
        // 如果複製失敗，顯示文字讓用戶手動複製
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('✅ 排班表已複製到剪貼簿！');
    });
}

// 匯出為圖片
function exportScheduleAsImage() {
    const content = document.getElementById('schedulePreviewContent');
    const dateLabel = document.getElementById('previewDate').textContent;

    // 建立一個臨時容器用於生成圖片
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 1200px;
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
        padding: 40px;
        font-family: 'Microsoft JhengHei', 'Consolas', sans-serif;
        color: #FFFFFF;
    `;

    container.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #00D4FF 0%, #00FF88 100%); border-radius: 10px;">
            <h1 style="margin: 0; font-size: 32px; color: #000000; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">📅 排班表</h1>
            <p style="margin: 10px 0 0 0; font-size: 20px; color: #000000; font-weight: bold;">${dateLabel}</p>
        </div>
        ${content.innerHTML}
    `;

    document.body.appendChild(container);

    // 使用 html2canvas 生成圖片
    // 注意：需要引入 html2canvas 庫
    if (typeof html2canvas !== 'undefined') {
        html2canvas(container, {
            backgroundColor: '#0a0a0a',
            scale: 2
        }).then(canvas => {
            document.body.removeChild(container);

            // 下載圖片
            const link = document.createElement('a');
            const now = new Date();
            const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
            link.download = `排班表_${dateStr}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            alert('✅ 排班表已匯出為圖片！');
        });
    } else {
        document.body.removeChild(container);
        alert('⚠️ 圖片匯出功能需要載入 html2canvas 函式庫。\n目前僅支援文字匯出功能。');
    }
}

// ===== 工作性質追蹤功能 =====
// 取得人員過去N天的工作記錄
function getPersonWorkHistory(personId, days = 7) {
    const targetDate = new Date(currentDate);
    targetDate.setHours(0, 0, 0, 0);

    const startDate = new Date(targetDate);
    startDate.setDate(startDate.getDate() - days);

    // 取得該人員在此期間的所有任務
    const workHistory = tasks.filter(t => {
        if (!t.assignees || !t.assignees.includes(personId)) return false;

        const taskDate = new Date(t.date + 'T00:00:00');
        taskDate.setHours(0, 0, 0, 0);

        // 包含過去N天（不包含當前選擇的日期）
        return taskDate >= startDate && taskDate < targetDate;
    });

    // 按日期排序（由近到遠）
    workHistory.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
    });

    return workHistory;
}

// 取得人員在過去N天內做過的工作性質清單
function getPersonWorkCategories(personId, days = 7) {
    const history = getPersonWorkHistory(personId, days);
    const categories = new Set();

    history.forEach(task => {
        if (task.workCategory) {
            categories.add(task.workCategory);
        }
    });

    return Array.from(categories);
}

// 檢查人員是否在過去N天內做過該性質的工作
function hasRecentWorkCategory(personId, workCategory, days = 7) {
    const categories = getPersonWorkCategories(personId, days);
    return categories.includes(workCategory);
}

// ===== 工作性質分類管理 =====
function showWorkCategoryModal() {
    document.getElementById('newCategoryKey').value = '';
    document.getElementById('newCategoryName').value = '';
    renderCategoryList();
    document.getElementById('workCategoryModal').classList.remove('hidden');
}

function renderCategoryList() {
    const container = document.getElementById('categoryListContainer');
    if (!container) return;

    const categories = Object.entries(WORK_CATEGORIES);

    if (categories.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--gaming-cyan); padding: 20px;">尚無分類</div>';
        return;
    }

    let html = '';
    categories.forEach(([key, name]) => {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 10px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255, 184, 77, 0.3); border-radius: 8px;">
                <div>
                    <div style="color: var(--gaming-white); font-weight: bold; margin-bottom: 3px;">${name}</div>
                    <div style="color: var(--gaming-cyan); font-size: 0.8rem; opacity: 0.7;">${key}</div>
                </div>
                <button onclick="deleteWorkCategory('${key}')" class="delete-category-btn" style="padding: 6px 12px; background: rgba(255, 0, 128, 0.2); border: 1px solid var(--status-busy); border-radius: 5px; color: var(--status-busy); cursor: pointer; font-weight: bold; transition: all 0.3s;">
                    🗑️ 刪除
                </button>
            </div>
        `;
    });

    container.innerHTML = html;
}

function addWorkCategory() {
    const key = document.getElementById('newCategoryKey').value.trim();
    const name = document.getElementById('newCategoryName').value.trim();

    if (!key) {
        alert('請輸入分類代碼');
        return;
    }

    if (!name) {
        alert('請輸入分類名稱');
        return;
    }

    // 驗證代碼格式（只能英文和底線）
    if (!/^[a-zA-Z_]+$/.test(key)) {
        alert('分類代碼只能使用英文字母和底線');
        return;
    }

    // 檢查是否已存在
    if (WORK_CATEGORIES[key]) {
        alert('此分類代碼已存在');
        return;
    }

    // 新增分類
    WORK_CATEGORIES[key] = name;
    saveData();
    addHistory(`新增工作性質分類: ${name} (${key})`);

    // 清空輸入並更新列表
    document.getElementById('newCategoryKey').value = '';
    document.getElementById('newCategoryName').value = '';
    renderCategoryList();
    updateTaskWorkCategoryOptions();

    alert(`✅ 成功新增分類「${name}」`);
}

function deleteWorkCategory(key) {
    const name = WORK_CATEGORIES[key];

    const confirmMsg = `確定要刪除分類「${name}」(${key})嗎？\n\n注意：刪除後不會影響已建立的任務，但新建任務時將無法選擇此分類。`;

    if (!confirm(confirmMsg)) {
        return;
    }

    delete WORK_CATEGORIES[key];
    saveData();
    addHistory(`刪除工作性質分類: ${name} (${key})`);
    renderCategoryList();
    updateTaskWorkCategoryOptions();

    alert(`✅ 已刪除分類「${name}」`);
}

function updateTaskWorkCategoryOptions() {
    const select = document.getElementById('taskWorkCategory');
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '';

    Object.entries(WORK_CATEGORIES).forEach(([key, name]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = name;
        select.appendChild(option);
    });

    // 恢復原來的選擇
    if (currentValue && WORK_CATEGORIES[currentValue]) {
        select.value = currentValue;
    }
}

// ===== 階級範圍設定 =====
function setMaxRank() {
    const currentMax = MAX_RANK;
    const newMax = prompt(`請輸入最高階級數字（1-20）\n\n目前設定：LV${currentMax}`, currentMax);

    if (newMax === null) return; // 取消

    const maxRankNum = parseInt(newMax);

    if (isNaN(maxRankNum) || maxRankNum < 1 || maxRankNum > 20) {
        alert('請輸入 1-20 之間的數字');
        return;
    }

    MAX_RANK = maxRankNum;
    saveData();

    // 更新顯示
    document.getElementById('currentMaxRankDisplay').textContent = `目前最高階級：LV${MAX_RANK}`;
    renderRankLabelList();

    addHistory(`修改最高階級為 LV${MAX_RANK}`);
    alert(`已設定最高階級為 LV${MAX_RANK}`);
}

// ===== 階級名稱管理 =====
function showRankLabelModal() {
    document.getElementById('currentMaxRankDisplay').textContent = `目前最高階級：LV${MAX_RANK}`;
    renderRankLabelList();
    document.getElementById('rankLabelModal').classList.remove('hidden');
}

function renderRankLabelList() {
    const container = document.getElementById('rankLabelListContainer');
    container.innerHTML = '';

    // 從最高階級到 LV1 顯示
    for (let rank = MAX_RANK; rank >= 1; rank--) {
        const rankStr = String(rank);
        const label = RANK_LABELS[rankStr] || '';

        const item = document.createElement('div');
        item.style.cssText = `
            padding: 15px;
            background: rgba(0, 212, 255, 0.05);
            border: 1px solid rgba(0, 212, 255, 0.2);
            border-radius: 8px;
        `;

        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <div style="
                    background: linear-gradient(135deg, var(--neon-blue), var(--gaming-cyan));
                    color: var(--gaming-black);
                    padding: 5px 12px;
                    border-radius: 5px;
                    font-weight: bold;
                    font-size: 0.9rem;
                    min-width: 60px;
                    text-align: center;
                ">LV${rank}</div>
                <input
                    type="text"
                    value="${label}"
                    placeholder="例如: 高階主管"
                    maxlength="10"
                    onchange="updateRankLabel('${rankStr}', this.value)"
                    style="
                        flex: 1;
                        padding: 8px 12px;
                        background: rgba(0, 0, 0, 0.3);
                        border: 1px solid rgba(0, 212, 255, 0.3);
                        border-radius: 5px;
                        color: var(--gaming-white);
                        font-family: 'Consolas', monospace;
                    "
                >
            </div>
        `;

        container.appendChild(item);
    }
}

function updateRankLabel(rank, newLabel) {
    RANK_LABELS[rank] = newLabel.trim();
    saveData();
    updateDisplay(); // 更新所有顯示
    addHistory(`修改階級標籤: LV${rank} = ${newLabel}`);
}

// ===== 人員狀態管理 =====
function setPersonStatus(personId, newStatus) {
    const person = personnel.find(p => p.id === personId);
    if (!person) return;

    const statusNames = {
        'normal': '正常',
        'leave': '請假',
        'mission': '出任務',
        'lunch': '午休'
    };

    const oldStatus = person.status || 'normal';

    // 如果設為正常，直接恢復
    if (newStatus === 'normal') {
        person.status = 'normal';
        addHistory(`恢復 ${person.name} 為正常狀態`);
        saveData();
        updateDisplay();
        showPersonDetail(personId);
        return;
    }

    // 如果設為特殊狀態（請假/出任務/午休），彈出時間選擇對話框
    if (newStatus === 'leave' || newStatus === 'mission' || newStatus === 'lunch') {
        showStatusTimeRangeModal(personId, newStatus);
        return;
    }
}

// 顯示狀態時間範圍選擇對話框
function showStatusTimeRangeModal(personId, statusType) {
    const person = personnel.find(p => p.id === personId);
    if (!person) return;

    const statusNames = {
        'leave': '請假',
        'mission': '出任務',
        'lunch': '午休'
    };

    const statusIcons = {
        'leave': '🏖️',
        'mission': '🚀',
        'lunch': '🍱'
    };

    // 設定對話框標題
    document.getElementById('statusTimeRangeTitle').textContent = `${statusIcons[statusType]} 設定${statusNames[statusType]}時間 - ${person.name}`;

    // 設定預設日期為今天
    const today = formatDate(new Date());
    document.getElementById('statusStartDate').value = today;
    document.getElementById('statusEndDate').value = today;

    // 根據狀態類型設定預設時間
    if (statusType === 'lunch') {
        // 午休預設 12:00-13:00
        document.getElementById('statusStartHour').value = 12;
        document.getElementById('statusEndHour').value = 13;
    } else if (statusType === 'mission') {
        // 出任務預設 8:00-17:00
        document.getElementById('statusStartHour').value = 8;
        document.getElementById('statusEndHour').value = 17;
    } else {
        // 請假預設全天 0:00-24:00
        document.getElementById('statusStartHour').value = 0;
        document.getElementById('statusEndHour').value = 24;
    }

    document.getElementById('statusDescription').value = '';

    // 顯示對話框
    document.getElementById('statusTimeRangeModal').classList.remove('hidden');

    // 設定確認按鈕事件
    const confirmBtn = document.getElementById('confirmStatusTimeRange');
    confirmBtn.onclick = function() {
        confirmStatusTimeRange(personId, statusType);
    };
}

// 確認設定狀態時間範圍
function confirmStatusTimeRange(personId, statusType) {
    const person = personnel.find(p => p.id === personId);
    if (!person) return;

    const startDate = document.getElementById('statusStartDate').value;
    const startHour = parseInt(document.getElementById('statusStartHour').value);
    const endDate = document.getElementById('statusEndDate').value;
    const endHour = parseInt(document.getElementById('statusEndHour').value);
    const description = document.getElementById('statusDescription').value.trim();

    // 驗證輸入
    if (!startDate || !endDate) {
        alert('請選擇開始和結束日期');
        return;
    }

    if (isNaN(startHour) || startHour < 0 || startHour > 23) {
        alert('開始時間必須在 0-23 之間');
        return;
    }

    if (isNaN(endHour) || endHour < 1 || endHour > 24) {
        alert('結束時間必須在 1-24 之間');
        return;
    }

    const statusNames = {
        'leave': '請假',
        'mission': '出任務',
        'lunch': '午休'
    };

    // 創建特殊任務
    const taskName = `${statusNames[statusType]} - ${person.name}`;
    const newTask = {
        id: Date.now(),
        name: taskName,
        type: statusType,
        date: startDate,
        startHour: startHour,
        endHour: endDate === startDate ? endHour : 24,
        assignees: [personId],
        requiredPeople: 1,
        description: description,
        workCategory: null
    };

    tasks.push(newTask);

    // 如果跨日，創建第二天的任務
    if (endDate !== startDate) {
        const nextDayTask = {
            id: Date.now() + 1,
            name: taskName,
            type: statusType,
            date: endDate,
            startHour: 0,
            endHour: endHour,
            assignees: [personId],
            requiredPeople: 1,
            description: description,
            workCategory: null
        };
        tasks.push(nextDayTask);
    }

    // 設定人員狀態
    person.status = statusType;

    // 記錄歷史
    addHistory(`${person.name} ${statusNames[statusType]}: ${startDate} ${String(startHour).padStart(2, '0')}:00 - ${endDate} ${String(endHour).padStart(2, '0')}:00`);

    // 儲存資料
    saveData();

    // 更新顯示
    updateDisplay();

    // 關閉對話框
    closeModal('statusTimeRangeModal');

    // 重新顯示人員詳細資訊
    showPersonDetail(personId);
}
