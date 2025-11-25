// ===== 全域變數 =====
let personnel = [];
let tasks = [];
let history = [];
let compensatoryLeaves = []; // 補休記錄
let departments = []; // 部門列表
let taskTemplates = []; // 每日任務模板

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

// 出任務類型分類（獨立管理）
let MISSION_CATEGORIES = {};

// 取得預設出任務類型分類
function getDefaultMissionCategories() {
    return {
        'court': '法院出庭',
        'escort': '護送任務',
        'inspection': '外部檢查',
        'patrol': '巡邏任務',
        'training': '外訓課程',
        'support': '支援協助',
        'meeting': '外部會議',
        'emergency': '緊急任務',
        'other': '其他任務'
    };
}

// 取得預設部門列表
function getDefaultDepartments() {
    return [
        { id: 1, name: '行政部', color: '#FF6B6B', description: '負責行政管理與文書作業' },
        { id: 2, name: '業務部', color: '#4ECDC4', description: '負責業務開發與客戶服務' },
        { id: 3, name: '技術部', color: '#FFD93D', description: '負責技術支援與系統維護' },
        { id: 4, name: '總務部', color: '#95E1D3', description: '負責總務採購與設備管理' }
    ];
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
let currentDepartmentFilter = 'all';
let currentSearchText = '';
let currentTaskFilter = 'all';

// 編輯狀態
let editingPersonId = null;
let editingTaskId = null;
let currentTemplateType = 'daily'; // 當前選擇的任務模板類型

// 拖拉狀態
let draggedTask = null;
let autoScrollInterval = null; // 自動滾動計時器
let lastDragY = 0; // 記錄最後的拖移 Y 座標

// 手機版任務分配模式
let selectedTaskForAssignment = null; // 選中要分配的任務
let longPressTimer = null; // 長按計時器

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('初始化人員管理系統...');
    initializeDate();
    loadData();
    generateTasksFromTemplates(currentDateString); // 從模板生成當日任務
    setupEventListeners();
    initializeRankSliders(); // 初始化階級滑動條
    updateRankFilterOptions(); // 初始化階級篩選下拉選單
    updateDepartmentFilter(); // 初始化部門篩選下拉選單
    updateDisplay();
});

// 初始化階級滑動條的最大值
function initializeRankSliders() {
    updatePersonRankSelect();
}

// 更新人員新增/編輯介面的階級下拉選單
function updatePersonRankSelect() {
    const rankSelect = document.getElementById('personRankSelect');
    if (!rankSelect) return;

    // 保存當前選中的值
    const currentValue = rankSelect.value;

    // 清空選項
    rankSelect.innerHTML = '';

    // 添加「特殊人員」選項（最高職位）
    const specialOption = document.createElement('option');
    specialOption.value = 'special';
    specialOption.textContent = '🔸 特殊人員（最高職位）';
    rankSelect.appendChild(specialOption);

    // 動態生成階級選項（從高到低）
    for (let i = MAX_RANK; i >= 1; i--) {
        const option = document.createElement('option');
        option.value = i;
        const rankLabel = getRankLabel(i);
        option.textContent = `LV${i} - ${rankLabel}`;
        rankSelect.appendChild(option);
    }

    // 嘗試恢復之前的選擇
    if (currentValue) {
        rankSelect.value = currentValue;
    } else {
        rankSelect.value = '3'; // 預設選擇 LV3
    }

    // 同步更新隱藏欄位
    syncRankHiddenFields();
}

// 同步階級選擇到隱藏欄位
function syncRankHiddenFields() {
    const rankSelect = document.getElementById('personRankSelect');
    const personRank = document.getElementById('personRank');
    const personIsSpecial = document.getElementById('personIsSpecial');

    if (!rankSelect || !personRank || !personIsSpecial) return;

    const value = rankSelect.value;
    if (value === 'special') {
        personRank.value = MAX_RANK; // 特殊人員使用最高階級
        personIsSpecial.value = 'true';
    } else {
        personRank.value = value;
        personIsSpecial.value = 'false';
    }
}

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
    document.getElementById('departmentFilter').addEventListener('change', function(e) {
        currentDepartmentFilter = e.target.value;
        updateDisplay();
    });

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
    document.getElementById('importPersonListBtn').addEventListener('click', () => {
        showImportPersonListModal();
        actionMenuDropdown.classList.add('hidden');
    });
    document.getElementById('addTaskBtn').addEventListener('click', () => {
        showAddTaskModal();
        actionMenuDropdown.classList.add('hidden');
    });
    document.getElementById('manageTaskTemplateBtn').addEventListener('click', () => {
        showTaskTemplateModal();
        actionMenuDropdown.classList.add('hidden');
    });
    document.getElementById('manageWorkCategoryBtn').addEventListener('click', () => {
        showWorkCategoryModal();
        actionMenuDropdown.classList.add('hidden');
    });
    document.getElementById('manageDepartmentBtn').addEventListener('click', () => {
        showDepartmentModal();
        actionMenuDropdown.classList.add('hidden');
    });
    document.getElementById('manageRankLabelBtn').addEventListener('click', () => {
        showRankLabelModal();
        actionMenuDropdown.classList.add('hidden');
    });
    document.getElementById('manageCompLeaveBtn').addEventListener('click', () => {
        showCompensatoryLeaveManager();
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
            const isMobile = window.innerWidth <= 768;

            if (!isMobile) {
                // 切換到電腦版：移除所有折疊狀態
                document.querySelectorAll('.collapsible-title.collapsed').forEach(title => {
                    title.classList.remove('collapsed');
                });
                document.querySelectorAll('.collapsible-content.collapsed').forEach(content => {
                    content.classList.remove('collapsed');
                });

                // 如果手機版 modal 是開啟的，關閉它們
                const taskModal = document.getElementById('taskDetailModal');
                const personModal = document.getElementById('personDetailModal');
                if (taskModal && !taskModal.classList.contains('hidden')) {
                    taskModal.classList.add('hidden');
                }
                if (personModal && !personModal.classList.contains('hidden')) {
                    personModal.classList.add('hidden');
                }
            } else {
                // 切換到手機版：關閉桌面版的詳細面板
                const detailPanel = document.getElementById('detailPanel');
                if (detailPanel && !detailPanel.classList.contains('hidden')) {
                    closeDetailPanel();
                }
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

    // 階級選擇器
    const rankSelect = document.getElementById('personRankSelect');
    if (rankSelect) {
        rankSelect.addEventListener('change', function() {
            syncRankHiddenFields();
        });
    }
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
        compensatoryLeaves = data.compensatoryLeaves || []; // 載入補休記錄
        departments = data.departments || getDefaultDepartments(); // 載入部門資料
        taskTemplates = data.taskTemplates || []; // 載入任務模板
        WORK_CATEGORIES = data.workCategories || getDefaultWorkCategories();
        MISSION_CATEGORIES = data.missionCategories || getDefaultMissionCategories();
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

        // 為舊人員資料加上部門欄位（預設分配到第一個部門）
        let needSaveDeptFix = false;
        personnel.forEach(person => {
            if (!person.departmentId && departments.length > 0) {
                person.departmentId = departments[0].id;
                needSaveDeptFix = true;
            }
        });

        // 儲存修正後的資料
        if (needSaveDeptFix) {
            console.log('已為舊人員資料自動分配部門');
        }
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
        compensatoryLeaves, // 儲存補休記錄
        departments, // 儲存部門資料
        taskTemplates, // 儲存任務模板
        workCategories: WORK_CATEGORIES,
        missionCategories: MISSION_CATEGORIES,
        rankLabels: RANK_LABELS,
        maxRank: MAX_RANK
    };
    localStorage.setItem('personnelManagementData', JSON.stringify(data));
    console.log('儲存資料成功');
}

function createSampleData() {
    // 初始化部門
    departments = getDefaultDepartments();

    // 建立示範資料（20人）
    const names = ['王大明', '李小華', '張三', '陳四', '劉五', '趙六', '錢七', '孫八', '周九', '吳十',
                   '鄭十一', '馮十二', '陳十三', '楚十四', '魏十五', '蔣十六', '沈十七', '韓十八', '楊十九', '朱二十'];
    const ranks = [9, 7, 7, 5, 5, 4, 4, 3, 3, 3, 2, 2, 2, 1, 1, 6, 8, 5, 4, 3];
    const specialPeople = [0, 2, 16]; // 王大明、張三、沈十七為特殊人員
    // 分配部門：前5人行政部(1)，6-10人業務部(2)，11-15人技術部(3)，16-20人總務部(4)
    const deptAssignments = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4];

    personnel = names.map((name, i) => ({
        id: i + 1,
        name,
        rank: ranks[i],
        contact: `分機${101 + i}`,
        isSpecial: specialPeople.includes(i),
        departmentId: deptAssignments[i], // 新增部門 ID
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
        { id: 5, name: '午間服務', type: 'daily', workCategory: 'service', date: todayStr, startHour: 12, endHour: 13, assignees: [5, 6], requiredPeople: 3, description: '午休時段工作' },
        { id: 6, name: '下午作業', type: 'daily', workCategory: 'admin', date: todayStr, startHour: 14, endHour: 18, assignees: [7, 8], requiredPeople: 4, description: '' },
        { id: 7, name: '晚班交接', type: 'important', workCategory: 'admin', date: todayStr, startHour: 18, endHour: 20, assignees: [9], requiredPeople: 2, description: '' },
        { id: 8, name: '夜間巡檢', type: 'daily', workCategory: 'patrol', date: todayStr, startHour: 22, endHour: 24, assignees: [10, 11], requiredPeople: 2, description: '晚上10點後工作' },

        // 明天的任務（未分配）
        { id: 9, name: '夜班值勤', type: 'daily', workCategory: 'monitor', date: tomorrowStr, startHour: 0, endHour: 6, assignees: [], requiredPeople: 2, description: '凌晨時段監控' },
        { id: 10, name: '早班準備', type: 'daily', workCategory: 'admin', date: tomorrowStr, startHour: 6, endHour: 8, assignees: [], requiredPeople: 2, description: '' },
        { id: 11, name: '主管會議', type: 'important', workCategory: 'meeting', date: tomorrowStr, startHour: 10, endHour: 12, assignees: [], requiredPeople: 5, description: '' }
    ];

    history = [];
    WORK_CATEGORIES = getDefaultWorkCategories();
    MISSION_CATEGORIES = getDefaultMissionCategories();
    RANK_LABELS = getDefaultRankLabels();
    saveData();

    // 自動計算補休
    calculateCompensatoryLeaves();
}

function syncData() {
    if (typeof syncWithGoogleSheets === 'function') {
        syncWithGoogleSheets();
    } else {
        alert('Google Sheets 同步功能尚未設定\n目前使用本地儲存模式');
    }
}

function resetToSampleData() {
    if (confirm('確定要重置為示範資料嗎？\n這將會清除所有目前的資料（包括自己新增的人員和任務）！\n\n注意：已審核的補休記錄將會保留。')) {
        // 備份現有的補休記錄
        const existingCompLeaves = [...compensatoryLeaves];

        // 清除資料並建立示範資料
        localStorage.removeItem('personnelManagementData');
        createSampleData();

        // 將舊的補休記錄合併回來，並根據人員名稱重新對應 personId
        if (existingCompLeaves.length > 0) {
            existingCompLeaves.forEach(oldComp => {
                // 根據人員名稱找到新的 personId
                const person = personnel.find(p => p.name === oldComp.personName);
                if (person) {
                    // 更新 personId 為新的 ID
                    oldComp.personId = person.id;

                    // 檢查是否已經有相同的補休記錄（避免重複）
                    const isDuplicate = compensatoryLeaves.some(cl =>
                        cl.personId === oldComp.personId &&
                        cl.date === oldComp.date &&
                        cl.scheduledDate === oldComp.scheduledDate &&
                        cl.scheduledStartHour === oldComp.scheduledStartHour
                    );

                    if (!isDuplicate) {
                        compensatoryLeaves.push(oldComp);
                    }
                } else {
                    // 如果找不到對應的人員（可能是自訂人員），仍然保留記錄
                    // 但 personId 可能會失效
                    compensatoryLeaves.push(oldComp);
                }
            });

            // 儲存合併後的資料
            saveData();
            console.log('已保留', existingCompLeaves.length, '筆舊的補休記錄');
        }

        updateDisplay();
        const totalComp = compensatoryLeaves.length;
        const preserved = existingCompLeaves.length;
        alert(`已重置為示範資料！\n${preserved > 0 ? `\n✅ 已保留 ${preserved} 筆舊的補休記錄\n📋 當前共 ${totalComp} 筆補休記錄` : ''}`);
    }
}

// ===== 資料匯出/匯入 =====
function exportData() {
    // 準備要匯出的資料（完整版本）
    const exportData = {
        version: '2.1', // 版本號（加入部門後升版）
        exportDate: new Date().toISOString(),

        // 核心資料
        personnel: personnel,
        tasks: tasks,
        history: history,
        departments: departments, // 加入部門資料

        // 設定資料
        compensatoryLeaves: compensatoryLeaves,
        workCategories: WORK_CATEGORIES,
        missionCategories: MISSION_CATEGORIES,
        rankLabels: RANK_LABELS,
        maxRank: MAX_RANK
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

            // 版本檢測與提示
            const dataVersion = importedData.version || '1.0';
            let versionMsg = `\n資料版本：${dataVersion}`;
            if (dataVersion === '1.0') {
                versionMsg += '\n⚠️ 這是舊版資料，將自動升級並補齊預設設定';
            }

            // 確認是否要覆蓋現有資料
            if (!confirm(`匯入資料將會覆蓋目前所有資料！${versionMsg}\n\n確定要繼續嗎？`)) {
                return;
            }

            // 載入核心資料
            personnel = importedData.personnel;
            tasks = importedData.tasks;
            history = importedData.history || [];
            departments = importedData.departments || getDefaultDepartments(); // 載入部門資料（向後相容）

            // 載入設定資料（向後相容）
            compensatoryLeaves = importedData.compensatoryLeaves || [];
            WORK_CATEGORIES = importedData.workCategories || getDefaultWorkCategories();
            MISSION_CATEGORIES = importedData.missionCategories || getDefaultMissionCategories();
            RANK_LABELS = importedData.rankLabels || getDefaultRankLabels();
            MAX_RANK = importedData.maxRank || 10;

            // 為舊資料的人員補充部門ID（如果需要）
            let needDeptFix = false;
            personnel.forEach(person => {
                if (!person.departmentId && departments.length > 0) {
                    person.departmentId = departments[0].id;
                    needDeptFix = true;
                }
            });

            // 儲存到 localStorage
            saveData();

            // 更新介面元素
            updateRankFilterOptions(); // 更新階級篩選器
            updateDepartmentFilter(); // 更新部門篩選器
            updatePersonDepartmentOptions(); // 更新人員新增介面的部門選項
            updateDisplay();

            // 成功訊息
            let successMsg = `✅ 資料匯入成功！\n\n人員：${personnel.length} 人\n任務：${tasks.length} 項\n部門：${departments.length} 個\n歷史記錄：${history.length} 筆`;

            if (dataVersion === '1.0') {
                successMsg += '\n\n💡 舊版資料已自動升級，預設設定已補齊';
            }

            if (needDeptFix) {
                successMsg += '\n⚠️ 部分人員已自動分配至預設部門';
            }

            alert(successMsg);

        } catch (error) {
            console.error('匯入錯誤:', error);
            alert('匯入失敗！檔案可能已損壞或格式不正確。\n\n錯誤訊息：' + error.message);
        }
    };

    reader.readAsText(file);

    // 清空 input 以允許重複選擇同一個檔案
    event.target.value = '';
}

// ===== 日期管理 =====

// 切換日期（供按鈕 onclick 呼叫）
function switchDate(offset) {
    document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.date-btn[data-offset="${offset}"]`).classList.add('active');
    applyDateOffset(offset);
}

// 開啟日期選擇器
function openDatePicker() {
    const dateInput = document.getElementById('customDate');
    dateInput.value = currentDateString;
    dateInput.showPicker();
}

// 自訂日期變更時的處理
function onCustomDateChange(dateInput) {
    if (dateInput) {
        currentDate = new Date(dateInput + 'T00:00:00');
        currentDateString = formatDate(currentDate);
        generateTasksFromTemplates(currentDateString); // 為該日期生成模板任務
        updateDateDisplay();
        updateDisplay();

        // 更新按鈕狀態
        document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.date-btn[data-mode="custom"]').classList.add('active');
    }
}

function applyDateOffset(offset) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() + offset);
    currentDateString = formatDate(currentDate);
    generateTasksFromTemplates(currentDateString); // 為該日期生成模板任務
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

    // 添加 change 事件監聯器
    overviewSelect.addEventListener('change', function() {
        const selectedDateString = this.value;
        currentDate = new Date(selectedDateString + 'T00:00:00');
        currentDateString = selectedDateString;
        generateTasksFromTemplates(currentDateString); // 為該日期生成模板任務
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

        // 部門過濾
        if (currentDepartmentFilter !== 'all') {
            if (currentDepartmentFilter === 'none') {
                // 篩選無部門的人員
                if (person.departmentId !== null && person.departmentId !== undefined) {
                    return false;
                }
            } else if (person.departmentId !== parseInt(currentDepartmentFilter)) {
                return false;
            }
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

            // 補休特殊處理：顯示所有有補休記錄的人員
            if (currentStatusFilter === 'comp_leave') {
                const hasCompLeave = compensatoryLeaves.some(cl =>
                    cl.personId === person.id && cl.status === 'scheduled'
                );
                if (!hasCompLeave) {
                    return false;
                }
            }
            // 其他特殊狀態篩選（請假、出任務、午休）
            else if (currentStatusFilter === 'leave' && status !== 'leave') {
                return false;
            }
            else if (currentStatusFilter === 'mission' && status !== 'mission') {
                return false;
            }
            else if (currentStatusFilter === 'lunch' && status !== 'lunch') {
                return false;
            }
            // 一般狀態篩選（空閒、忙碌）
            else if (currentStatusFilter === 'free' && status !== 'free') {
                return false;
            }
            else if (currentStatusFilter === 'busy' && status === 'free') {
                return false;
            }
        }

        return true;
    });
}

function getPersonStatus(person) {
    // 優先檢查是否在補休時段
    // 但只有在補休時段尚未結束時才顯示「補休中」
    const now = new Date();
    const today = formatDate(now);
    const currentHour = now.getHours();

    const scheduledCompLeave = compensatoryLeaves.find(cl => {
        if (cl.personId !== person.id || cl.status !== 'scheduled') return false;
        if (cl.scheduledDate !== currentDateString) return false;
        if (cl.scheduledStartHour === null || cl.scheduledEndHour === null) return false;

        // 檢查補休時段是否與查詢時段重疊
        const hasOverlap = !(cl.scheduledEndHour <= currentStartHour || cl.scheduledStartHour > currentEndHour);
        if (!hasOverlap) return false;

        // 檢查補休是否已經結束
        const compLeaveDate = new Date(cl.scheduledDate + 'T00:00:00');
        const todayDate = new Date(today + 'T00:00:00');

        // 如果補休日期早於今天，則已結束
        if (compLeaveDate < todayDate) {
            return false;
        }

        // 如果補休日期是今天，且補休結束時間 <= 當前實際時間，則已結束
        if (cl.scheduledDate === today && cl.scheduledEndHour <= currentHour) {
            return false;
        }

        return true;
    });

    if (scheduledCompLeave) {
        return 'comp_leave'; // 補休中
    }

    // 取得該人員在當前日期和時段的任務
    const personTasks = tasks.filter(t => {
        if (!t.assignees || !t.assignees.includes(person.id)) return false;

        // 檢查日期
        const taskDate = t.date || formatDate(new Date());
        if (taskDate !== currentDateString) return false;

        // 檢查任務時段是否與當前查詢時段重疊
        return !(t.endHour <= currentStartHour || t.startHour > currentEndHour);
    });

    // 優先檢查是否有特殊任務（請假、出任務）
    // 注意：午休不再作為手動設定的特殊狀態，而是系統自動判斷
    const specialTask = personTasks.find(t => t.type === 'leave' || t.type === 'mission');
    if (specialTask) {
        return specialTask.type; // 返回特殊狀態：leave, mission
    }

    // 如果沒有特殊任務，但人員狀態標記為特殊狀態，也返回該狀態
    const personStatus = person.status || 'normal';
    if (personStatus !== 'normal' && personStatus !== 'lunch') {
        return personStatus;
    }

    // 檢查是否在午休時段（12:00-13:00）
    // 如果當前查詢時段與午休時段有重疊，顯示午休狀態
    const lunchStart = 12;
    const lunchEnd = 13;
    const hasLunchOverlap = !(lunchEnd <= currentStartHour || lunchStart > currentEndHour);
    if (hasLunchOverlap) {
        // 檢查是否有一般工作任務與午休時段衝突
        const hasWorkDuringLunch = personTasks.some(t =>
            t.type !== 'leave' && t.type !== 'mission' &&
            !(t.endHour <= lunchStart || t.startHour >= lunchEnd)
        );
        if (!hasWorkDuringLunch) {
            return 'lunch'; // 午休中（沒有工作任務）
        }
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

    // 點擊事件：如果在分配模式，則分配任務；否則顯示詳細資訊
    card.addEventListener('click', () => {
        if (selectedTaskForAssignment) {
            // 分配模式：點擊人員卡片分配任務
            assignTaskToPerson(selectedTaskForAssignment, person.id);
        } else {
            // 普通模式：顯示人員詳情
            showPersonDetail(person.id);
        }
    });

    // 拖放事件（桌面版）
    card.addEventListener('dragover', handlePersonDragOver);
    card.addEventListener('dragleave', handlePersonDragLeave);
    card.addEventListener('drop', handlePersonDrop);

    const statusText = {
        'free': '空閒',
        'busy': '忙碌',
        'partial': '部分空閒',
        'leave': '🏖️ 請假',
        'mission': '🚀 出任務',
        'lunch': '🍱 午休',
        'comp_leave': '⏰ 補休中'
    };

    const rankLabel = getRankLabel(person.rank);

    // 取得部門資訊
    const department = departments.find(d => d.id === person.departmentId);
    const deptName = department ? department.name : '無部門';
    const deptColor = department ? department.color : '#ff6b6b';

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

    // 檢查當天的補休狀態
    const scheduledCompLeave = compensatoryLeaves.find(cl =>
        cl.personId === person.id &&
        cl.status === 'scheduled' &&
        cl.scheduledDate === currentDateString
    );

    // 取得所有補休記錄（用於補休篩選模式）
    const allCompLeaves = compensatoryLeaves.filter(cl =>
        cl.personId === person.id && cl.status === 'scheduled'
    ).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

    // 檢查今天是否有請假或出任務的記錄
    const todayLeaveTasks = allPersonTasks.filter(t => t.type === 'leave');
    const todayMissionTasks = allPersonTasks.filter(t => t.type === 'mission');

    // 特殊狀態徽章（請假、出任務、午休、補休）
    let statusBadge = '';

    // 顯示補休資訊（如果有）
    if (scheduledCompLeave) {
        const startTime = String(scheduledCompLeave.scheduledStartHour).padStart(2, '0');
        const endTime = String(scheduledCompLeave.scheduledEndHour).padStart(2, '0');
        statusBadge = `<span class="person-status-badge status-badge-comp-leave">⏰ 補休 ${startTime}:00-${endTime}:00</span>`;
    }

    // 顯示請假資訊（即使已經結束）
    if (todayLeaveTasks.length > 0) {
        const leaveTimes = todayLeaveTasks.map(t => {
            const start = String(t.startHour).padStart(2, '0');
            const end = t.endHour === 24 ? '24' : String(t.endHour).padStart(2, '0');
            return `${start}:00-${end}:00`;
        }).join(', ');
        statusBadge += `<span class="person-status-badge status-badge-leave">🏖️ 請假 ${leaveTimes}</span>`;
    }

    // 顯示出任務資訊（即使已經結束）
    if (todayMissionTasks.length > 0) {
        todayMissionTasks.forEach(t => {
            const start = String(t.startHour).padStart(2, '0');
            const end = t.endHour === 24 ? '24' : String(t.endHour).padStart(2, '0');
            const timeStr = `${start}:00-${end}:00`;
            const missionType = t.missionCategory && MISSION_CATEGORIES[t.missionCategory]
                ? `(${MISSION_CATEGORIES[t.missionCategory]})`
                : '';
            statusBadge += `<span class="person-status-badge status-badge-mission">🚀 出任務 ${timeStr} ${missionType}</span>`;
        });
    }

    // 補休列表顯示（當處於補休篩選模式時）
    let compLeaveListDisplay = '';
    if (currentStatusFilter === 'comp_leave' && allCompLeaves.length > 0) {
        const compLeaveItems = allCompLeaves.map(cl => {
            const startTime = String(cl.scheduledStartHour).padStart(2, '0');
            const endTime = String(cl.scheduledEndHour).padStart(2, '0');
            const isToday = cl.scheduledDate === currentDateString;
            const isPast = cl.scheduledDate < currentDateString;
            const isFuture = cl.scheduledDate > currentDateString;

            let timeClass = 'comp-leave-future';
            let timeLabel = '';
            if (isToday) {
                timeClass = 'comp-leave-today';
                timeLabel = '今天';
            } else if (isPast) {
                timeClass = 'comp-leave-past';
                timeLabel = '已結束';
            } else {
                timeLabel = cl.scheduledDate;
            }

            return `<div class="comp-leave-item ${timeClass}">
                <span class="comp-leave-date-label">${timeLabel}</span>
                <span class="comp-leave-time">⏰ ${startTime}:00-${endTime}:00</span>
                <span class="comp-leave-hours">(${cl.earnedHours}h)</span>
            </div>`;
        }).join('');

        compLeaveListDisplay = `<div class="person-comp-leave-list">
            <div class="comp-leave-list-title">📅 補休時段</div>
            ${compLeaveItems}
        </div>`;
    }

    card.innerHTML = `
        <div class="person-name-grid">
            <div>${person.name} ${specialBadge}</div>
            ${statusBadge ? `<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; margin-top: 5px;">${statusBadge}</div>` : ''}
        </div>
        <div class="person-rank-display">
            <span class="rank-badge-grid">LV ${person.rank} - ${rankLabel}</span>
        </div>
        <div class="person-dept-display" style="text-align: center; padding: 4px 0; margin: 3px 0;">
            <span style="display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; background: ${deptColor}22; color: ${deptColor}; border: 1px solid ${deptColor};">
                🏢 ${deptName}
            </span>
        </div>
        <div class="person-status-grid status-${status}">
            <span class="status-text">${statusText[status]}</span>
        </div>
        ${compLeaveListDisplay}
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

// 更新階級篩選下拉選單
function updateRankFilterOptions() {
    const rankFilter = document.getElementById('rankFilter');
    if (!rankFilter) return;

    // 保存當前選中的值
    const currentValue = rankFilter.value;

    // 清空選項
    rankFilter.innerHTML = '';

    // 添加「所有階級」選項
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = '所有階級';
    rankFilter.appendChild(allOption);

    // 添加「特殊人員」選項（最高職位，放在最上面）
    const specialOption = document.createElement('option');
    specialOption.value = 'special';
    specialOption.textContent = '🔸 特殊人員';
    rankFilter.appendChild(specialOption);

    // 動態生成階級選項（一階一欄，從高到低）
    for (let i = MAX_RANK; i >= 1; i--) {
        const option = document.createElement('option');
        option.value = `${i}-${i}`; // 單一階級

        // 取得階級名稱
        const rankLabel = getRankLabel(i);
        option.textContent = `LV${i} - ${rankLabel}`;

        rankFilter.appendChild(option);
    }

    // 嘗試恢復之前的選擇，如果無效則選擇「所有階級」
    const options = Array.from(rankFilter.options).map(opt => opt.value);
    if (options.includes(currentValue)) {
        rankFilter.value = currentValue;
    } else {
        rankFilter.value = 'all';
    }
}

// ===== 統計更新 =====
function updateStats() {
    const filteredPersonnel = filterPersonnel();

    let freeCount = 0;
    let busyCount = 0;
    let leaveCount = 0;
    let missionCount = 0;
    let lunchCount = 0;
    let compLeaveCount = 0;

    filteredPersonnel.forEach(person => {
        const status = getPersonStatus(person);
        if (status === 'free') freeCount++;
        else if (status === 'busy') busyCount++;
        else if (status === 'leave') leaveCount++;
        else if (status === 'mission') missionCount++;
        else if (status === 'lunch') lunchCount++;
        else if (status === 'comp_leave') compLeaveCount++;
    });

    // 補休人數：有補休記錄的總人數（不限於當前時段）
    const totalCompLeavePeople = personnel.filter(person => {
        return compensatoryLeaves.some(cl =>
            cl.personId === person.id && cl.status === 'scheduled'
        );
    }).length;

    document.getElementById('totalCount').textContent = filteredPersonnel.length;
    document.getElementById('freeCount').textContent = freeCount;
    document.getElementById('busyCount').textContent = busyCount;
    document.getElementById('leaveCount').textContent = leaveCount;
    document.getElementById('missionCount').textContent = missionCount;
    document.getElementById('lunchCount').textContent = lunchCount;
    document.getElementById('compLeaveCount').textContent = totalCompLeavePeople;
}

// ===== 任務列表渲染 =====
// 判斷任務是否逾時（逾時且未達標才算）
function isTaskOverdue(task) {
    const now = new Date();
    const today = formatDate(now);
    const currentHour = now.getHours();

    const taskDate = task.date || formatDate(new Date());

    // 先檢查時間是否已過
    let timePassed = false;

    // 如果任務日期在今天之前，時間已過
    if (taskDate < today) {
        timePassed = true;
    }
    // 如果任務日期是今天，檢查結束時間是否已過
    else if (taskDate === today && task.endHour <= currentHour) {
        timePassed = true;
    }

    // 如果時間未過，不算逾時
    if (!timePassed) {
        return false;
    }

    // 時間已過，但如果已經分配足夠人員，也不算逾時（已經處理好了）
    const assignees = task.assignees || [];
    const required = task.requiredPeople || 1;
    const isUnderstaffed = assignees.length < required;

    // 只有時間已過且人員不足，才算逾時
    return isUnderstaffed;
}

function renderTaskList() {
    const container = document.getElementById('taskList');
    container.innerHTML = '';

    // 先篩選當前日期的任務，排除請假、出任務、午休
    let filteredTasks = tasks.filter(t => {
        // 如果任務沒有日期欄位，預設為今天（相容舊資料）
        const taskDate = t.date || formatDate(new Date());
        // 排除請假、出任務、午休任務
        if (t.type === 'leave' || t.type === 'mission' || t.type === 'lunch') {
            return false;
        }
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
    } else if (currentTaskFilter === 'overdue') {
        // 已逾時：只顯示逾時任務
        filteredTasks = filteredTasks.filter(t => isTaskOverdue(t));
    } else if (currentTaskFilter !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.type === currentTaskFilter);
    }

    // 分離正常任務和逾時任務
    const normalTasks = filteredTasks.filter(t => !isTaskOverdue(t));
    const overdueTasks = filteredTasks.filter(t => isTaskOverdue(t));

    // 更新任務計數
    document.getElementById('taskCount').textContent = filteredTasks.length;

    if (filteredTasks.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--gaming-cyan); padding: 20px;">無任務</div>';
        return;
    }

    // 如果篩選器選擇「已逾時」，只顯示逾時任務，不顯示區塊標題
    if (currentTaskFilter === 'overdue') {
        overdueTasks.forEach(task => {
            const card = createTaskCard(task, true);
            container.appendChild(card);
        });
        return;
    }

    // 一般篩選：顯示正常任務和逾時任務區
    // 渲染正常任務
    if (normalTasks.length > 0) {
        const normalSection = document.createElement('div');
        normalSection.style.marginBottom = '20px';

        normalTasks.forEach(task => {
            const card = createTaskCard(task, false);
            normalSection.appendChild(card);
        });

        container.appendChild(normalSection);
    }

    // 渲染逾時任務區
    if (overdueTasks.length > 0) {
        const overdueHeader = document.createElement('div');
        overdueHeader.style.cssText = `
            background: rgba(255, 107, 107, 0.2);
            border: 2px solid rgba(255, 107, 107, 0.5);
            border-radius: 8px;
            padding: 12px 15px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        overdueHeader.innerHTML = `
            <span style="font-size: 1.2rem;">⚠️</span>
            <span style="color: #FF6B6B; font-weight: bold; font-size: 1rem;">逾時區 (${overdueTasks.length})</span>
            <span style="color: var(--gaming-cyan); font-size: 0.85rem; margin-left: auto;">無法分配，請修改時間或刪除</span>
        `;
        container.appendChild(overdueHeader);

        const overdueSection = document.createElement('div');
        overdueSection.style.cssText = `
            background: rgba(255, 107, 107, 0.05);
            border: 1px solid rgba(255, 107, 107, 0.3);
            border-radius: 8px;
            padding: 10px;
        `;

        overdueTasks.forEach(task => {
            const card = createTaskCard(task, true);
            overdueSection.appendChild(card);
        });

        container.appendChild(overdueSection);
    }
}

function createTaskCard(task, isOverdue = false) {
    const card = document.createElement('div');
    card.className = `task-card ${task.type}`;

    // 逾時任務：完全禁用拖移和分配功能
    if (isOverdue) {
        card.draggable = false;
        card.style.opacity = '0.7';
        card.style.cursor = 'not-allowed';
        card.dataset.overdue = 'true';
    } else {
        // 正常任務：啟用拖移功能（桌面版可用，手機版透過觸控事件處理）
        card.draggable = true;
    }

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

    // 逾時標記
    const overdueBadge = isOverdue ? '<span style="background: rgba(255, 107, 107, 0.9); color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; margin-left: 8px;">⏰ 逾時</span>' : '';

    // 工作性質標籤（支援模板類型）
    let categoryName = '';
    if (task.workCategory) {
        if (task.workCategory.startsWith('template_')) {
            // 模板類型的工作性質
            const templateTypes = {
                'template_daily': '日常任務',
                'template_important': '重要任務',
                'template_urgent': '臨時任務'
            };
            categoryName = templateTypes[task.workCategory] || '';
        } else {
            categoryName = WORK_CATEGORIES[task.workCategory] || '';
        }
    }
    const categoryBadge = categoryName ? `<span class="work-category-badge">📋 ${categoryName}</span>` : '';

    card.innerHTML = `
        <div class="task-card-header">
            <span class="task-card-name">${task.name} ${understaffedBadge}${overdueBadge}</span>
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

    // 逾時任務：只允許查看詳情和編輯，不允許分配
    if (isOverdue) {
        // 手機版和桌面版都只允許點擊查看詳情
        card.addEventListener('click', (e) => {
            showTaskDetail(task.id);
        });
    } else {
        // 正常任務：同時支援手機版和桌面版（響應式）
        let touchStartTime = 0;
        let touchStartY = 0;
        let hasMoved = false;
        let hasTriggeredLongPress = false;
        let touchHandled = false; // 標記觸控事件是否已處理

        // 觸控事件（手機版）
        card.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchStartY = e.touches[0].clientY;
            hasMoved = false;
            hasTriggeredLongPress = false;
            touchHandled = false;

            // 視覺反饋
            card.style.transform = 'scale(0.98)';
            card.style.transition = 'transform 0.1s';

            // 長按計時器
            longPressTimer = setTimeout(() => {
                if (!hasMoved) {
                    card.style.transform = '';
                    hasTriggeredLongPress = true;
                    touchHandled = true;
                    enterTaskAssignmentMode(task.id);
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                }
            }, 500);
        }, { passive: true });

        card.addEventListener('touchmove', (e) => {
            const moveY = Math.abs(e.touches[0].clientY - touchStartY);
            if (moveY > 10) {
                hasMoved = true;
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
                card.style.transform = '';
            }
        }, { passive: true });

        card.addEventListener('touchend', (e) => {
            const duration = Date.now() - touchStartTime;
            card.style.transform = '';

            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }

            // 短按且沒有移動，且沒有觸發長按，且不在分配模式
            if (duration < 500 && !hasMoved && !hasTriggeredLongPress && !selectedTaskForAssignment) {
                console.log('觸控結束，短按任務，顯示詳情', task.id);
                // 只在確實要處理時才阻止默認行為
                touchHandled = true;
                showTaskDetail(task.id);
                // 延遲阻止點擊事件，避免干擾其他功能
                setTimeout(() => { touchHandled = false; }, 100);
            }
        }, { passive: true });

        card.addEventListener('touchcancel', (e) => {
            card.style.transform = '';
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        });

        // 桌面版：拖移事件
        card.addEventListener('dragstart', handleTaskDragStart);
        card.addEventListener('drag', handleTaskDrag);
        card.addEventListener('dragend', handleTaskDragEnd);

        // 點擊事件（桌面版，但也作為手機版的後備）
        card.addEventListener('click', (e) => {
            // 如果剛剛觸控事件已處理過，就不處理點擊
            if (touchHandled) {
                touchHandled = false;
                return;
            }

            // 不在分配模式且不在拖移中
            if (!selectedTaskForAssignment && !e.target.closest('.dragging')) {
                showTaskDetail(task.id);
            }
        });
    }

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
    const task = tasks.find(t => t.id === draggedTask);

    // 檢查任務是否逾時
    if (task && isTaskOverdue(task)) {
        e.preventDefault();
        this.classList.remove('dragging');

        // 顯示逾時提示
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 107, 107, 0.95);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: bold;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        toast.textContent = '⚠️ 逾時任務無法分配，請先修改時間或刪除';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
        return;
    }

    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';

    // 高亮顯示可用/不可用的人員
    highlightAvailablePersonnel(draggedTask);

    // 手機版：自動滾動到人員選擇區域
    if (window.innerWidth <= 768) {
        const personnelGrid = document.getElementById('personnelGrid');
        if (personnelGrid) {
            // 平滑滾動到人員網格
            personnelGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // 添加視覺提示
            personnelGrid.style.outline = '3px solid #FFD700';
            personnelGrid.style.outlineOffset = '5px';

            // 顯示提示訊息
            const existingHint = document.getElementById('dragHint');
            if (existingHint) existingHint.remove();

            const hint = document.createElement('div');
            hint.id = 'dragHint';
            hint.style.cssText = `
                position: fixed;
                top: 60px;
                left: 50%;
                transform: translateX(-50%);
                background: #FFD700;
                color: #000000;
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: bold;
                z-index: 9999;
                box-shadow: 0 4px 20px rgba(255, 215, 0, 0.5);
                animation: fadeIn 0.3s;
            `;
            hint.textContent = '👆 拖放到人員卡片上';
            document.body.appendChild(hint);
        }
    }
}

function handleTaskDrag(e) {
    // 記錄拖移位置
    if (e.clientY > 0) {
        lastDragY = e.clientY;
    }

    // 手機版：啟動自動滾動
    if (window.innerWidth <= 768 && lastDragY > 0) {
        const scrollThreshold = 100; // 距離邊緣多少像素開始滾動
        const scrollSpeed = 5; // 滾動速度

        // 清除現有的滾動計時器
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }

        // 靠近頂部 - 向上滾動
        if (lastDragY < scrollThreshold) {
            autoScrollInterval = setInterval(() => {
                window.scrollBy(0, -scrollSpeed);
            }, 16); // 約 60fps
        }
        // 靠近底部 - 向下滾動
        else if (lastDragY > window.innerHeight - scrollThreshold) {
            autoScrollInterval = setInterval(() => {
                window.scrollBy(0, scrollSpeed);
            }, 16);
        }
    }
}

function handleTaskDragEnd(e) {
    this.classList.remove('dragging');
    draggedTask = null;
    lastDragY = 0;

    // 停止自動滾動
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }

    // 移除所有高亮
    clearAvailabilityHighlight();

    // 移除手機版的視覺提示
    if (window.innerWidth <= 768) {
        const personnelGrid = document.getElementById('personnelGrid');
        if (personnelGrid) {
            personnelGrid.style.outline = '';
            personnelGrid.style.outlineOffset = '';
        }

        const hint = document.getElementById('dragHint');
        if (hint) hint.remove();
    }
}

// ===== 手機版任務分配模式 =====
function enterTaskAssignmentMode(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // 檢查任務是否逾時
    if (isTaskOverdue(task)) {
        // 顯示逾時提示
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 107, 107, 0.95);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: bold;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        toast.textContent = '⚠️ 逾時任務無法分配，請先修改時間或刪除';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
        return;
    }

    selectedTaskForAssignment = taskId;

    // 高亮顯示可用/不可用的人員
    highlightAvailablePersonnel(taskId);

    // 滾動到人員區域
    const personnelGrid = document.getElementById('personnelGrid');
    if (personnelGrid) {
        personnelGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // 添加視覺提示
        personnelGrid.style.outline = '3px solid #FFD700';
        personnelGrid.style.outlineOffset = '5px';
    }

    // 顯示浮動提示條
    const existingBar = document.getElementById('assignmentModeBar');
    if (existingBar) existingBar.remove();

    const bar = document.createElement('div');
    bar.id = 'assignmentModeBar';
    bar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #FFD700;
        color: #000000;
        padding: 15px;
        z-index: 9999;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 4px 20px rgba(255, 215, 0, 0.5);
        font-weight: bold;
    `;

    const startTime = String(task.startHour).padStart(2, '0');
    const endTime = task.endHour === 24 ? '00' : String(task.endHour).padStart(2, '0');

    bar.innerHTML = `
        <div>
            <div style="font-size: 0.9rem; margin-bottom: 3px;">📋 選擇人員分配任務</div>
            <div style="font-size: 0.75rem; opacity: 0.8;">${task.name} (${startTime}:00-${endTime}:00)</div>
        </div>
        <button onclick="exitTaskAssignmentMode()" style="background: rgba(0,0,0,0.2); border: none; color: #000000; padding: 8px 15px; border-radius: 5px; font-weight: bold; font-size: 0.9rem; cursor: pointer;">
            ✕ 取消
        </button>
    `;
    document.body.appendChild(bar);

    // 添加點擊背景取消功能
    document.addEventListener('click', handleAssignmentModeBackgroundClick);
}

function exitTaskAssignmentMode() {
    selectedTaskForAssignment = null;

    // 移除高亮
    clearAvailabilityHighlight();

    // 移除視覺提示
    const personnelGrid = document.getElementById('personnelGrid');
    if (personnelGrid) {
        personnelGrid.style.outline = '';
        personnelGrid.style.outlineOffset = '';
    }

    const bar = document.getElementById('assignmentModeBar');
    if (bar) bar.remove();

    // 移除背景點擊監聽
    document.removeEventListener('click', handleAssignmentModeBackgroundClick);
}

function handleAssignmentModeBackgroundClick(e) {
    // 如果點擊的不是人員卡片或提示條，則退出分配模式
    if (!e.target.closest('.person-card-grid') &&
        !e.target.closest('#assignmentModeBar') &&
        !e.target.closest('.task-card')) {
        exitTaskAssignmentMode();
    }
}

function assignTaskToPerson(taskId, personId) {
    const task = tasks.find(t => t.id === taskId);
    const person = personnel.find(p => p.id === personId);

    if (!task || !person) {
        exitTaskAssignmentMode();
        return;
    }

    // 檢查人數是否已滿
    const required = task.requiredPeople || 1;
    const currentAssigned = task.assignees ? task.assignees.length : 0;

    if (currentAssigned >= required) {
        // 人數已滿，顯示提示並退出分配模式
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 215, 0, 0.95);
            color: #000000;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: bold;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            border: 2px solid #FFD700;
        `;
        toast.textContent = `✓ 任務「${task.name}」人數已滿 (${currentAssigned}/${required})`;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 2500);

        // 立即退出分配模式
        exitTaskAssignmentMode();
        return;
    }

    // 檢查是否已經分配
    if (task.assignees && task.assignees.includes(personId)) {
        // 已分配，顯示提示
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 107, 107, 0.95);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: bold;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        toast.textContent = `${person.name} 已被分配到此任務`;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 2000);
        return;
    }

    // 檢查時間衝突
    const personTasks = tasks.filter(t =>
        t.assignees &&
        t.assignees.includes(personId) &&
        (t.date || formatDate(new Date())) === (task.date || formatDate(new Date()))
    );

    let hasConflict = false;
    for (const pt of personTasks) {
        if (hasTimeConflict(task.startHour, task.endHour, pt.startHour, pt.endHour)) {
            hasConflict = true;
            break;
        }
    }

    // 檢查補休衝突
    const taskDate = task.date || formatDate(new Date());
    const scheduledCompLeave = compensatoryLeaves.find(cl =>
        cl.personId === personId &&
        cl.status === 'scheduled' &&
        cl.scheduledDate === taskDate &&
        !(cl.scheduledEndHour <= task.startHour || cl.scheduledStartHour > task.endHour)
    );

    // 檢查是否在午休時段（12:00-13:00）
    const lunchStart = 12;
    const lunchEnd = 13;
    const hasLunchConflict = !(task.endHour <= lunchStart || task.startHour >= lunchEnd);

    // 顯示警告
    let warningMessage = '';
    if (hasConflict) {
        warningMessage = `${person.name} 在此時段已有其他任務`;
    } else if (scheduledCompLeave) {
        warningMessage = `${person.name} 在此時段有補休`;
    } else if (hasLunchConflict) {
        warningMessage = `⚠️ ${person.name} 在此時段為午休時間 (12:00-13:00)\n\n排班將自動產生補休記錄`;
    }

    if (warningMessage) {
        // 創建視覺警告提示
        const warningBox = document.createElement('div');
        warningBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(26, 26, 46, 0.98);
            color: white;
            padding: 30px;
            border-radius: 12px;
            z-index: 10001;
            max-width: 400px;
            box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
            border: 2px solid ${hasLunchConflict ? '#FFD700' : '#FF6B6B'};
            text-align: center;
        `;
        warningBox.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 15px;">${hasLunchConflict ? '🍱' : '⚠️'}</div>
            <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 15px; color: ${hasLunchConflict ? '#FFD700' : '#FF6B6B'};">
                ${hasLunchConflict ? '午休時段提醒' : '時段衝突'}
            </div>
            <div style="margin-bottom: 25px; line-height: 1.6; white-space: pre-wrap;">
                ${warningMessage}
            </div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="warningConfirm" style="
                    padding: 12px 30px;
                    background: #FFD700;
                    color: #000000;
                    border: none;
                    border-radius: 6px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 1rem;
                ">確定分配</button>
                <button id="warningCancel" style="
                    padding: 12px 30px;
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    border-radius: 6px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 1rem;
                ">取消</button>
            </div>
        `;

        // 添加遮罩
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
        `;
        document.body.appendChild(overlay);
        document.body.appendChild(warningBox);

        // 等待用戶決定
        return new Promise((resolve) => {
            document.getElementById('warningConfirm').onclick = () => {
                overlay.remove();
                warningBox.remove();
                // 繼續分配任務
                performTaskAssignment(task, person, personId, hasLunchConflict);
            };
            document.getElementById('warningCancel').onclick = () => {
                overlay.remove();
                warningBox.remove();
            };
        });
    }

    // 沒有衝突，直接分配
    performTaskAssignment(task, person, personId, hasLunchConflict);
}

// 執行任務分配的實際操作
function performTaskAssignment(task, person, personId, isLunchTime) {
    // 分配任務
    if (!task.assignees) {
        task.assignees = [];
    }
    task.assignees.push(personId);

    // 如果是午休時段，自動產生補休記錄
    if (isLunchTime) {
        const taskDate = task.date || formatDate(new Date());
        const lunchStart = 12;
        const lunchEnd = 13;

        // 計算實際的午休工作時段（任務時段與午休時段的交集）
        const workStart = Math.max(task.startHour, lunchStart);
        const workEnd = Math.min(task.endHour, lunchEnd);
        const earnedHours = workEnd - workStart;

        if (earnedHours > 0) {
            const compLeave = {
                id: Date.now(),
                personId: personId,
                personName: person.name,
                taskId: task.id,
                taskName: task.name,
                date: taskDate,
                type: 'lunch_work', // 午休工作
                reason: `午休時段工作 (${String(workStart).padStart(2, '0')}:00-${String(workEnd).padStart(2, '0')}:00)`,
                earnedHours: earnedHours,
                remainingHours: earnedHours,
                scheduledDate: null,
                scheduledStartHour: null,
                scheduledEndHour: null,
                status: 'pending', // 待安排
                createdAt: new Date().toISOString()
            };

            compensatoryLeaves.push(compLeave);
            addHistory(`🍱 午休工作補休：${person.name} - ${task.name}（${earnedHours}小時）`);
        }
    }

    addHistory(`分配任務: ${person.name} → 「${task.name}」`);
    saveData();
    updateDisplay();

    // 如果仍在分配模式，重新高亮顯示可用人員（更新狀態）
    if (selectedTaskForAssignment) {
        highlightAvailablePersonnel(selectedTaskForAssignment);
    }

    // 顯示成功提示
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 255, 136, 0.95);
        color: var(--gaming-black);
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    toast.textContent = `✓ 已分配給 ${person.name}`;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2000);

    // 震動回饋
    if (navigator.vibrate) {
        navigator.vibrate(30);
    }

    // 檢查是否已達到需求人數
    const required = task.requiredPeople || 1;
    const assigned = task.assignees.length;

    if (assigned >= required) {
        // 顯示完成提示
        const completeToast = document.createElement('div');
        completeToast.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 215, 0, 0.95);
            color: #000000;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: bold;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            border: 2px solid #FFD700;
        `;
        completeToast.textContent = `✓ 任務「${task.name}」人數已滿 (${assigned}/${required})`;
        document.body.appendChild(completeToast);

        setTimeout(() => completeToast.remove(), 2500);

        // 立即退出分配模式，防止用戶誤點
        exitTaskAssignmentMode();
    }

    // 不要立即退出分配模式，讓用戶可以繼續分配給其他人（除非已達標）
    // exitTaskAssignmentMode();
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

        // 不再直接根據狀態排除人員，而是檢查具體時間衝突
        // 這樣即使人員有請假，只要時間不衝突，依然可以分配其他時段的任務

        // 檢查是否在補休時段
        const hasCompLeaveConflict = compensatoryLeaves.some(cl =>
            cl.personId === personId &&
            cl.status === 'scheduled' &&
            cl.scheduledDate === taskDate &&
            cl.scheduledStartHour !== null &&
            cl.scheduledEndHour !== null &&
            hasTimeConflict(taskStart, taskEnd, cl.scheduledStartHour, cl.scheduledEndHour)
        );

        if (hasCompLeaveConflict) {
            personCard.classList.add('time-conflict');
            console.log(person.name, '補休時段衝突');
            return;
        }

        // 檢查是否在過去7天內做過相同性質的工作（根據任務類型判斷）
        const taskCategory = task.workCategory;
        if (taskCategory && isWorkCategoryRepeated(personId, taskCategory, task.type, 7)) {
            const count = getWorkCategoryCount(personId, taskCategory, 7);
            personCard.classList.add('work-repeat');
            console.log(person.name, `近7天內已做過此性質工作 ${count} 次:`, WORK_CATEGORIES[taskCategory] || taskCategory);
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

        // 檢查是否在過去7天內做過相同性質的工作（根據任務類型判斷閾值）
        const taskCategory = task.workCategory;
        if (taskCategory && isWorkCategoryRepeated(personId, taskCategory, task.type, 7)) {
            const categoryName = WORK_CATEGORIES[taskCategory] || taskCategory;
            const count = getWorkCategoryCount(personId, taskCategory, 7);
            const threshold = task.type === 'daily' ? 7 : task.type === 'important' ? 3 : 0;
            const confirmMsg = `⚠️ 工作性質重複警告\n\n${person.name} 在過去 7 天內已經執行過「${categoryName}」性質的工作 ${count} 次（閾值：${threshold}次）。\n\n為了工作多樣性，建議安排其他性質的任務。\n\n仍要分配嗎？`;
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

    // 更新階級下拉選單
    updatePersonRankSelect();

    // 設定預設值（LV3）
    const defaultRank = Math.min(3, MAX_RANK);
    const rankSelect = document.getElementById('personRankSelect');
    rankSelect.value = defaultRank;
    syncRankHiddenFields();

    // 更新部門選項
    updatePersonDepartmentOptions();
    document.getElementById('personDepartment').value = '';

    document.getElementById('personContact').value = '';
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

    // 生成等級選項（特殊人員在最前面，然後從高到低）
    let rankOptions = '<option value="special">🔸 特殊人員</option>';
    for (let i = MAX_RANK; i >= 1; i--) {
        const rankLabel = getRankLabel(i);
        rankOptions += `<option value="${i}">LV${i} - ${rankLabel}</option>`;
    }

    // 生成部門選項
    let deptOptions = '<option value="">無部門</option>';
    departments.forEach(dept => {
        deptOptions += `<option value="${dept.id}">${dept.name}</option>`;
    });

    row.innerHTML = `
        <td><input type="text" class="import-input" placeholder="請輸入姓名"></td>
        <td>
            <select class="import-select rank-select">
                <option value="">請選擇</option>
                ${rankOptions}
            </select>
        </td>
        <td>
            <select class="import-select dept-select">
                ${deptOptions}
            </select>
        </td>
        <td><input type="text" class="import-input" placeholder="分機或手機"></td>
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

// 更新批量匯入表格中的部門選項
function updateImportTableDeptSelects() {
    const tbody = document.getElementById('importTableBody');
    if (!tbody) return;

    const deptSelects = tbody.querySelectorAll('.dept-select');
    deptSelects.forEach(select => {
        const currentValue = select.value;

        // 重新生成部門選項
        let deptOptions = '<option value="">無部門</option>';
        departments.forEach(dept => {
            deptOptions += `<option value="${dept.id}">${dept.name}</option>`;
        });
        select.innerHTML = deptOptions;

        // 嘗試恢復之前的選擇（如果部門仍存在）
        if (currentValue && departments.some(d => d.id === parseInt(currentValue))) {
            select.value = currentValue;
        }
    });
}

function importPersonList() {
    const tbody = document.getElementById('importTableBody');
    const rows = tbody.querySelectorAll('tr');
    const clearExisting = document.getElementById('clearExistingPersonnel').checked;

    const newPersonnel = [];
    const errors = [];

    rows.forEach((row, index) => {
        const inputs = row.querySelectorAll('.import-input');
        const rankSelect = row.querySelector('.rank-select');
        const deptSelect = row.querySelector('.dept-select');

        const name = inputs[0].value.trim();
        const rankValue = rankSelect.value;
        const isSpecial = rankValue === 'special';
        const rank = isSpecial ? MAX_RANK : parseInt(rankValue);
        const departmentId = deptSelect.value ? parseInt(deptSelect.value) : null; // 空值為無部門
        const contact = inputs[1].value.trim() || '未提供';

        // 如果姓名和等級都是空的，跳過這一行
        if (!name && !rankValue) {
            return;
        }

        // 驗證
        if (!name) {
            errors.push(`第 ${index + 1} 行：姓名不能為空`);
            return;
        }

        if (!rankValue || (!isSpecial && (isNaN(rank) || rank < 1 || rank > MAX_RANK))) {
            errors.push(`第 ${index + 1} 行：請選擇職位等級`);
            return;
        }

        newPersonnel.push({
            id: Date.now() + index + Math.random() * 1000,
            name,
            rank,
            departmentId, // 可為 null（無部門）
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
    const deptValue = document.getElementById('personDepartment').value;
    const departmentId = deptValue ? parseInt(deptValue) : null; // 空值為無部門
    const contact = document.getElementById('personContact').value.trim();
    const isSpecial = document.getElementById('personIsSpecial').value === 'true';

    if (!name) {
        alert('請輸入姓名');
        return;
    }

    if (editingPersonId) {
        const person = personnel.find(p => p.id === editingPersonId);
        if (person) {
            person.name = name;
            person.rank = rank;
            person.departmentId = departmentId; // 可為 null（無部門）
            person.contact = contact;
            person.isSpecial = isSpecial;
            addHistory(`編輯人員: ${name}${isSpecial ? ' (特殊人員)' : ''}`);
        }
    } else {
        const newPerson = {
            id: Date.now(),
            name,
            rank,
            departmentId, // 可為 null（無部門）
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

    // 如果部門管理視窗開著，更新它
    if (!document.getElementById('departmentModal').classList.contains('hidden')) {
        renderDepartmentList();
        if (selectedDeptId !== undefined) {
            renderDeptDetail(selectedDeptId);
        }
    }
}

function editPerson(personId) {
    const person = personnel.find(p => p.id === personId);
    if (!person) return;

    editingPersonId = personId;
    document.getElementById('personModalTitle').textContent = '編輯人員';
    document.getElementById('personName').value = person.name;

    // 更新階級下拉選單
    updatePersonRankSelect();

    // 設定階級選擇器的值
    const rankSelect = document.getElementById('personRankSelect');
    if (person.isSpecial) {
        rankSelect.value = 'special';
    } else {
        const adjustedRank = Math.min(person.rank, MAX_RANK);
        rankSelect.value = adjustedRank;
    }
    syncRankHiddenFields();

    // 更新部門選項並設定當前部門
    updatePersonDepartmentOptions();
    document.getElementById('personDepartment').value = person.departmentId || '';

    document.getElementById('personContact').value = person.contact || '';
    document.getElementById('personModal').classList.remove('hidden');

    // 關閉人員詳細資訊面板/彈窗
    closeDetailPanel();
    closeModal('personDetailModal');
}

function deletePerson(personId) {
    const person = personnel.find(p => p.id === personId);
    if (!person) return;

    // 檢查該人員是否有任務分配
    const assignedTasks = tasks.filter(t => t.assignees && t.assignees.includes(personId));
    const hasCompLeaves = compensatoryLeaves.some(cl => cl.personId === personId);

    let warningMessage = `確定要刪除 ${person.name} 嗎？`;
    if (assignedTasks.length > 0 || hasCompLeaves) {
        warningMessage = `${person.name} 有以下資料：\n`;
        if (assignedTasks.length > 0) {
            warningMessage += `• ${assignedTasks.length} 個任務分配\n`;
        }
        if (hasCompLeaves) {
            warningMessage += `• 補休記錄\n`;
        }
        warningMessage += `\n刪除後這些資料也會一併移除，確定要刪除嗎？`;
    }

    if (!confirm(warningMessage)) {
        return;
    }

    // 從人員列表中移除
    const personIndex = personnel.findIndex(p => p.id === personId);
    if (personIndex !== -1) {
        personnel.splice(personIndex, 1);
    }

    // 從所有任務中移除該人員的分配
    tasks.forEach(task => {
        if (task.assignees && task.assignees.includes(personId)) {
            task.assignees = task.assignees.filter(id => id !== personId);
        }
    });

    // 移除該人員的所有補休記錄
    const removedCompLeaves = compensatoryLeaves.filter(cl => cl.personId === personId);
    compensatoryLeaves.splice(0, compensatoryLeaves.length, ...compensatoryLeaves.filter(cl => cl.personId !== personId));

    addHistory(`刪除人員: ${person.name}（移除 ${assignedTasks.length} 個任務分配${removedCompLeaves.length > 0 ? `、${removedCompLeaves.length} 筆補休記錄` : ''}）`);

    saveData();
    updateDisplay();

    // 關閉人員詳細資訊面板/彈窗
    closeDetailPanel();
    closeModal('personDetailModal');

    // 顯示成功提示
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 255, 136, 0.95);
        color: var(--gaming-black);
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    toast.textContent = `已刪除 ${person.name}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

function removePersonFromTask(personId, taskId) {
    const person = personnel.find(p => p.id === personId);
    const task = tasks.find(t => t.id === taskId);

    if (!person || !task) return;

    // 確認是否要移除
    if (!confirm(`確定要將 ${person.name} 從任務「${task.name}」中移除嗎？\n\n移除後該任務將回到任務池中，可重新分配給其他人。`)) {
        return;
    }

    // 從任務的 assignees 中移除該人員
    if (task.assignees && task.assignees.includes(personId)) {
        task.assignees = task.assignees.filter(id => id !== personId);

        addHistory(`移除任務分配: ${person.name} 的「${task.name}」任務已回到任務池`);

        saveData();
        updateDisplay();

        // 重新顯示人員詳細資訊
        showPersonDetail(personId);

        // 顯示成功提示
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(79, 193, 201, 0.95);
            color: var(--gaming-black);
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: bold;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        toast.textContent = `已將「${task.name}」從 ${person.name} 的任務中移除`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }
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

    // 檢測是否為手機版
    const isMobile = window.innerWidth <= 768;

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
        'lunch': '🍱 午休',
        'comp_leave': '⏰ 補休中'
    };

    let html = `
        <div style="text-align: center; margin-bottom: ${isMobile ? '15px' : '20px'};">
            <h3 style="color: var(--gaming-yellow); font-size: ${isMobile ? '1.25rem' : '1.5rem'}; margin-bottom: 10px;">${person.name}</h3>
            <div style="color: var(--gaming-cyan); margin-bottom: 5px; font-size: ${isMobile ? '0.9rem' : '1rem'};">等級 ${person.rank} - ${rankLabel}</div>
            <div style="color: var(--gaming-white); margin-bottom: 5px; font-size: ${isMobile ? '0.85rem' : '0.95rem'};">${person.contact}</div>
            <div style="margin-top: ${isMobile ? '12px' : '15px'}; padding: ${isMobile ? '8px' : '10px'}; background: rgba(0,0,0,0.4); border-radius: 5px;">
                <span style="color: var(--gaming-cyan); font-size: ${isMobile ? '0.85rem' : '0.9rem'};">當前狀態: </span>
                <span style="color: var(--status-${status}); font-weight: bold; text-shadow: var(--glow-${status === 'free' ? 'green' : status === 'busy' ? 'red' : 'yellow'}); font-size: ${isMobile ? '0.9rem' : '1rem'};">${statusText[status]}</span>
            </div>
            <div style="margin-top: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-width: ${isMobile ? '100%' : '300px'}; margin-left: auto; margin-right: auto;">
                <button onclick="editPerson(${person.id})" style="
                    padding: ${isMobile ? '12px 8px' : '10px 20px'};
                    background: var(--gaming-cyan);
                    color: var(--gaming-black);
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: ${isMobile ? '0.85rem' : '0.9rem'};
                    transition: all 0.3s;
                ">✏️ 編輯</button>
                <button onclick="deletePerson(${person.id})" style="
                    padding: ${isMobile ? '12px 8px' : '10px 20px'};
                    background: #FF6B6B;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: ${isMobile ? '0.85rem' : '0.9rem'};
                    transition: all 0.3s;
                ">🗑️ 刪除</button>
            </div>
        </div>

        <div style="margin-bottom: 20px; padding: ${isMobile ? '12px' : '15px'}; background: rgba(0,0,0,0.4); border-radius: 8px;">
            <h4 style="color: #FFD700; margin: 0 0 15px 0; font-size: ${isMobile ? '0.95rem' : '1rem'};">設定人員狀態</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: ${isMobile ? '8px' : '10px'};">
                <button onclick="setPersonStatus(${person.id}, 'normal')"
                    style="padding: ${isMobile ? '10px 4px' : '10px 8px'};
                    background: ${(person.status || 'normal') === 'normal' ? '#FFD700' : 'rgba(255,255,255,0.1)'};
                    color: ${(person.status || 'normal') === 'normal' ? '#000000' : '#FFFFFF'};
                    border: 1px solid #FFD700;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: ${isMobile ? '0.8rem' : '0.9rem'};
                    transition: all 0.3s;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;">
                    ✅ 正常
                </button>
                <button onclick="setPersonStatus(${person.id}, 'leave')"
                    style="padding: ${isMobile ? '10px 4px' : '10px 8px'};
                    background: ${(person.status || 'normal') === 'leave' ? '#FF6B6B' : 'rgba(255,255,255,0.1)'};
                    color: #FFFFFF;
                    border: 1px solid #FF6B6B;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: ${isMobile ? '0.8rem' : '0.9rem'};
                    transition: all 0.3s;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;">
                    🏖️ 請假
                </button>
                <button onclick="setPersonStatus(${person.id}, 'mission')"
                    style="padding: ${isMobile ? '10px 4px' : '10px 8px'};
                    background: ${(person.status || 'normal') === 'mission' ? '#4ECDC4' : 'rgba(255,255,255,0.1)'};
                    color: #FFFFFF;
                    border: 1px solid #4ECDC4;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: ${isMobile ? '0.8rem' : '0.9rem'};
                    transition: all 0.3s;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;">
                    🚀 出任務
                </button>
            </div>
            <div style="margin-top: 10px; padding: ${isMobile ? '8px' : '10px'}; background: rgba(255, 184, 77, 0.1); border: 1px solid rgba(255, 184, 77, 0.3); border-radius: 5px;">
                <small style="color: var(--gaming-cyan); font-size: ${isMobile ? '0.75rem' : '0.85rem'}; line-height: 1.4;">💡 午休時間 (12:00-13:00) 系統自動判斷，無需手動設定</small>
            </div>
        </div>

        <div style="margin-bottom: 20px; padding: ${isMobile ? '12px' : '15px'}; background: rgba(0,0,0,0.4); border-radius: 8px; border: 1px solid rgba(255, 184, 77, 0.3);">
            <h4 style="color: var(--gaming-yellow); margin: 0 0 15px 0; font-size: ${isMobile ? '0.95rem' : '1rem'};">📊 過去 7 天工作記錄</h4>
            <div id="workHistorySection"></div>
        </div>
    `;

    if (personTasks.length === 0) {
        html += `<div style="text-align: center; color: var(--gaming-cyan); padding: ${isMobile ? '15px' : '20px'}; font-size: ${isMobile ? '0.85rem' : '1rem'};">目前沒有分配任務</div>`;
    } else {
        html += `<h4 style="color: var(--gaming-yellow); margin-bottom: 15px; border-bottom: 1px solid rgba(255,215,0,0.3); padding-bottom: 10px; font-size: ${isMobile ? '0.95rem' : '1rem'};">任務列表</h4>`;

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
                <div style="padding: ${isMobile ? '10px' : '12px'}; margin-bottom: ${isMobile ? '8px' : '10px'}; background: rgba(0,0,0,0.4); border-left: 3px solid var(--status-${task.type === 'daily' ? 'free' : task.type === 'important' ? 'busy' : 'partial'}); border-radius: 5px; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: start; gap: 10px;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; color: var(--gaming-white); margin-bottom: 5px; font-size: ${isMobile ? '0.9rem' : '1rem'};">${task.name}</div>
                            <div style="font-size: ${isMobile ? '0.8rem' : '0.85rem'}; color: var(--gaming-yellow); margin-bottom: 3px;">${taskStartTime} - ${taskEndTime}</div>
                            <div style="font-size: ${isMobile ? '0.75rem' : '0.8rem'}; color: var(--gaming-cyan);">${typeText[task.type]}任務</div>
                            ${task.description ? `<div style="font-size: ${isMobile ? '0.75rem' : '0.8rem'}; color: var(--gaming-white); margin-top: 5px; opacity: 0.8; line-height: 1.4;">${task.description}</div>` : ''}
                        </div>
                        <button onclick="removePersonFromTask(${person.id}, ${task.id})" style="
                            padding: ${isMobile ? '6px 10px' : '8px 12px'};
                            background: rgba(255, 107, 107, 0.8);
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            font-weight: bold;
                            font-size: ${isMobile ? '0.75rem' : '0.85rem'};
                            transition: all 0.3s;
                            white-space: nowrap;
                            flex-shrink: 0;
                        " onmouseover="this.style.background='rgba(255, 107, 107, 1)'" onmouseout="this.style.background='rgba(255, 107, 107, 0.8)'">
                            🗑️ 移除
                        </button>
                    </div>
                </div>
            `;
        });
    }

    // 根據裝置類型顯示不同的介面
    if (isMobile) {
        // 手機版：使用 Modal
        const modalContent = document.getElementById('personDetailModalContent');
        const personModal = document.getElementById('personDetailModal');
        modalContent.innerHTML = html;
        personModal.style.display = ''; // 確保移除任何 display 設定
        personModal.classList.remove('hidden');

        // 渲染工作歷史記錄（延遲以確保 Modal 已顯示）
        setTimeout(() => {
            renderWorkHistory(person.id);
        }, 100);
    } else {
        // 桌面版：使用右側 Panel
        const panel = document.getElementById('detailPanel');
        const content = document.getElementById('detailContent');
        content.innerHTML = html;
        panel.classList.remove('hidden');
        document.querySelector('.main-workspace').classList.add('with-detail');

        // 渲染工作歷史記錄
        renderWorkHistory(person.id);
    }
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
    const modal = document.getElementById(modalId);
    modal.classList.add('hidden');

    // 重設 z-index（如果有被修改過）
    if (modalId === 'personModal') {
        modal.style.zIndex = '';
    }

    // 手機版：關閉 statusTimeRangeModal 時，恢復 personDetailModal 的顯示
    if (modalId === 'statusTimeRangeModal') {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            const personModal = document.getElementById('personDetailModal');
            if (personModal && !personModal.classList.contains('hidden')) {
                personModal.style.display = ''; // 恢復顯示
            }
        }
    }
}

// ===== 任務詳情面板 =====
function showTaskDetail(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // 檢測是否為手機版
    const isMobile = window.innerWidth <= 768;

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

    // 決定關閉函數（桌面版關閉 panel，手機版關閉 modal）
    const closeFunction = isMobile ? "closeModal('taskDetailModal')" : "closeDetailPanel()";

    // 檢查任務是否逾時
    const taskIsOverdue = isTaskOverdue(task);

    let html = '';

    // 如果任務逾時，顯示醒目的警告提示
    if (taskIsOverdue) {
        html += `
            <div style="margin-bottom: 20px; padding: 15px; background: rgba(255, 107, 107, 0.2); border: 2px solid rgba(255, 107, 107, 0.6); border-radius: 10px; animation: pulse 2s infinite;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <span style="font-size: 2rem;">⚠️</span>
                    <div>
                        <div style="color: #FF6B6B; font-weight: bold; font-size: 1.1rem;">逾時任務</div>
                        <div style="color: var(--gaming-white); font-size: 0.9rem; opacity: 0.9;">此任務已逾時且人員不足，無法分配更多人員</div>
                    </div>
                </div>
                <div style="padding: 10px; background: rgba(0, 0, 0, 0.3); border-radius: 5px; margin-top: 10px;">
                    <div style="color: var(--gaming-cyan); font-size: 0.9rem; line-height: 1.6;">
                        💡 <strong>解決方法：</strong><br>
                        • 點擊下方「<span style="color: var(--gaming-yellow);">編輯任務</span>」按鈕修改時間<br>
                        • 或點擊「<span style="color: #FF6B6B);">刪除任務</span>」移除此任務
                    </div>
                </div>
            </div>
        `;
    }

    html += `
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
                <div class="task-member-card">
                    <div class="task-member-info">
                        <div style="font-weight: bold; color: var(--gaming-white); margin-bottom: 5px;">
                            ${index + 1}. ${person.name}
                            <span style="font-size: 0.8rem; color: var(--gaming-yellow); margin-left: 8px;">LV ${person.rank} - ${rankLabel}</span>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--gaming-cyan);">${person.contact}</div>
                    </div>
                    <button onclick="removePersonFromTask(${task.id}, ${personId})"
                            class="task-member-remove-btn"
                            onmouseover="this.style.background='rgba(255,0,0,0.4)'"
                            onmouseout="this.style.background='rgba(255,0,0,0.2)'">
                        移除
                    </button>
                </div>
            `;
        });
    }

    // 新增人員按鈕（只在非逾時任務顯示）
    if (!taskIsOverdue) {
        html += `
            <div style="margin-top: 25px;">
                <button onclick="addPersonToTaskFromDetail(${task.id}, ${isMobile})"
                        style="width: 100%; padding: 12px; background: rgba(0, 255, 255, 0.2); color: #00FFFF; border: 2px solid #00FFFF; border-radius: 5px; font-weight: bold; cursor: pointer; font-family: 'Consolas', monospace; transition: all 0.3s;"
                        onmouseover="this.style.background='rgba(0, 255, 255, 0.3)'"
                        onmouseout="this.style.background='rgba(0, 255, 255, 0.2)'">
                    👥 新增人員
                </button>
            </div>
        `;
    }

    // 編輯和刪除按鈕
    const editButtonText = taskIsOverdue ? "⏰ 編輯時間" : "編輯任務";

    html += `
        <div style="margin-top: 10px; display: flex; gap: 10px; flex-wrap: wrap;">
            <button onclick="editTask(${task.id}); ${closeFunction}"
                    style="flex: 1; min-width: 120px; padding: 10px; background: #FFD700; color: #000000; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-family: 'Consolas', monospace;">
                ${editButtonText}
            </button>
            <button onclick="deleteTask(${task.id}); ${closeFunction}"
                    style="flex: 1; min-width: 120px; padding: 10px; background: rgba(255,0,0,0.2); color: #FF0000; border: 1px solid #FF0000; border-radius: 5px; font-weight: bold; cursor: pointer; font-family: 'Consolas', monospace;">
                刪除任務
            </button>
        </div>
    `;

    // 根據裝置類型顯示不同的介面
    if (isMobile) {
        // 手機版：使用 Modal
        const modalContent = document.getElementById('taskDetailModalContent');
        modalContent.innerHTML = html;
        document.getElementById('taskDetailModal').classList.remove('hidden');
    } else {
        // 桌面版：使用右側 Panel
        const panel = document.getElementById('detailPanel');
        const content = document.getElementById('detailContent');
        content.innerHTML = html;
        panel.classList.remove('hidden');
        document.querySelector('.main-workspace').classList.add('with-detail');
    }
}

// 從任務詳情視窗點擊新增人員
function addPersonToTaskFromDetail(taskId, isMobile) {
    // 先關閉任務詳情視窗
    if (isMobile) {
        closeModal('taskDetailModal');
    } else {
        closeDetailPanel();
    }

    // 延遲一點再進入分配模式，確保視窗已關閉
    setTimeout(() => {
        enterTaskAssignmentMode(taskId);
    }, 100);
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

    // 統計人員狀態（從當天任務中讀取）
    const statusStats = {
        leave: [],
        mission: [],
        lunch: []
    };

    // 從當天的任務中收集請假、出任務、午休的人員
    dayTasks.forEach(task => {
        if (task.type === 'leave' || task.type === 'mission' || task.type === 'lunch') {
            const assignees = task.assignees || [];
            assignees.forEach(personId => {
                const person = personnel.find(p => p.id === personId);
                if (person) {
                    // 避免重複加入
                    if (task.type === 'leave' && !statusStats.leave.includes(person.name)) {
                        statusStats.leave.push(person.name);
                    } else if (task.type === 'mission' && !statusStats.mission.includes(person.name)) {
                        statusStats.mission.push(person.name);
                    } else if (task.type === 'lunch' && !statusStats.lunch.includes(person.name)) {
                        statusStats.lunch.push(person.name);
                    }
                }
            });
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

    // 統計人員狀態（從當天任務中讀取）
    const statusStats = {
        leave: [],
        mission: [],
        lunch: []
    };

    // 從當天的任務中收集請假、出任務、午休的人員
    dayTasks.forEach(task => {
        if (task.type === 'leave' || task.type === 'mission' || task.type === 'lunch') {
            const assignees = task.assignees || [];
            assignees.forEach(personId => {
                const person = personnel.find(p => p.id === personId);
                if (person) {
                    // 避免重複加入
                    if (task.type === 'leave' && !statusStats.leave.includes(person.name)) {
                        statusStats.leave.push(person.name);
                    } else if (task.type === 'mission' && !statusStats.mission.includes(person.name)) {
                        statusStats.mission.push(person.name);
                    } else if (task.type === 'lunch' && !statusStats.lunch.includes(person.name)) {
                        statusStats.lunch.push(person.name);
                    }
                }
            });
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

    // 計算各類人員數量
    const totalLeave = statusStats.leave.length;
    const totalMission = statusStats.mission.length;
    const totalLunch = statusStats.lunch.length;
    const totalAll = personnelSchedule.size; // 所有有任務的人員

    text += `總計：${totalAll} 人`;
    if (totalLeave > 0 || totalMission > 0 || totalLunch > 0) {
        text += `（含`;
        const parts = [];
        if (totalLeave > 0) parts.push(`請假 ${totalLeave} 人`);
        if (totalMission > 0) parts.push(`出任務 ${totalMission} 人`);
        if (totalLunch > 0) parts.push(`午休 ${totalLunch} 人`);
        text += parts.join('、');
        text += `）`;
    }
    text += `\n\n`;

    // 人員狀態
    if (statusStats.leave.length > 0 || statusStats.mission.length > 0 || statusStats.lunch.length > 0) {
        text += `【人員狀態】\n\n`;
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

// 計算人員在過去N天內做過某性質工作的次數
function getWorkCategoryCount(personId, workCategory, days = 7) {
    const history = getPersonWorkHistory(personId, days);
    let count = 0;

    history.forEach(task => {
        if (task.workCategory === workCategory) {
            count++;
        }
    });

    return count;
}

// 檢查人員是否工作重複（根據任務類型使用不同閾值）
function isWorkCategoryRepeated(personId, workCategory, taskType, days = 7) {
    const count = getWorkCategoryCount(personId, workCategory, days);

    // 根據任務類型設定不同的閾值
    let threshold;
    if (taskType === 'daily') {
        threshold = 7; // 日常任務：近7天做過7次才算重複
    } else if (taskType === 'important') {
        threshold = 3; // 重要任務：近7天做過3次才算重複
    } else {
        // 其他類型任務（臨時、請假、出任務等）不檢查重複
        return false;
    }

    return count >= threshold;
}

// ===== 工作性質分類管理 =====
function showWorkCategoryModal() {
    document.getElementById('newCategoryKey').value = '';
    document.getElementById('newCategoryName').value = '';
    renderCategoryList();
    renderMissionCategoryList();
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

function clearAllWorkCategories() {
    const categories = Object.entries(WORK_CATEGORIES);

    if (categories.length === 0) {
        alert('目前沒有任何分類');
        return;
    }

    const confirmMsg = `⚠️ 確定要清空所有工作性質分類嗎？\n\n目前共有 ${categories.length} 個分類\n\n注意：\n• 此操作無法復原\n• 已建立的任務不會受影響\n• 但新建任務時將無法選擇這些分類`;

    if (!confirm(confirmMsg)) {
        return;
    }

    // 二次確認
    if (!confirm('🔴 最後確認：真的要清空全部分類嗎？')) {
        return;
    }

    WORK_CATEGORIES = {};
    saveData();
    addHistory('清空所有工作性質分類');
    renderCategoryList();
    updateTaskWorkCategoryOptions();

    alert(`✅ 已清空所有分類（共刪除 ${categories.length} 個）`);
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

// ===== 出任務類型管理 =====
function renderMissionCategoryList() {
    const container = document.getElementById('missionCategoryListContainer');
    if (!container) return;

    const categories = Object.entries(MISSION_CATEGORIES);

    if (categories.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #4ECDC4; padding: 20px;">尚無類型</div>';
        return;
    }

    let html = '';
    categories.forEach(([key, name]) => {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 10px; background: rgba(0,0,0,0.3); border: 1px solid rgba(78, 205, 196, 0.3); border-radius: 8px;">
                <div>
                    <div style="color: var(--gaming-white); font-weight: bold; margin-bottom: 3px;">${name}</div>
                    <div style="color: #4ECDC4; font-size: 0.8rem; opacity: 0.7;">${key}</div>
                </div>
                <button onclick="deleteMissionCategory('${key}')" class="delete-category-btn" style="padding: 6px 12px; background: rgba(255, 0, 128, 0.2); border: 1px solid var(--status-busy); border-radius: 5px; color: var(--status-busy); cursor: pointer; font-weight: bold; transition: all 0.3s;">
                    🗑️ 刪除
                </button>
            </div>
        `;
    });

    container.innerHTML = html;
}

function addMissionCategory() {
    const key = document.getElementById('newMissionKey').value.trim();
    const name = document.getElementById('newMissionName').value.trim();

    if (!key) {
        alert('請輸入類型代碼');
        return;
    }

    if (!name) {
        alert('請輸入類型名稱');
        return;
    }

    // 驗證代碼格式（只能英文和底線）
    if (!/^[a-zA-Z_]+$/.test(key)) {
        alert('類型代碼只能使用英文字母和底線');
        return;
    }

    // 檢查是否已存在
    if (MISSION_CATEGORIES[key]) {
        alert('此類型代碼已存在');
        return;
    }

    // 新增類型
    MISSION_CATEGORIES[key] = name;
    saveData();
    addHistory(`新增出任務類型: ${name} (${key})`);

    // 清空輸入並更新列表
    document.getElementById('newMissionKey').value = '';
    document.getElementById('newMissionName').value = '';
    renderMissionCategoryList();

    alert(`✅ 成功新增出任務類型「${name}」`);
}

function deleteMissionCategory(key) {
    const name = MISSION_CATEGORIES[key];

    const confirmMsg = `確定要刪除出任務類型「${name}」(${key})嗎？\n\n注意：刪除後不會影響已建立的任務，但設定出任務時將無法選擇此類型。`;

    if (!confirm(confirmMsg)) {
        return;
    }

    delete MISSION_CATEGORIES[key];
    saveData();
    addHistory(`刪除出任務類型: ${name} (${key})`);
    renderMissionCategoryList();

    alert(`✅ 已刪除出任務類型「${name}」`);
}

function clearAllMissionCategories() {
    const categories = Object.entries(MISSION_CATEGORIES);

    if (categories.length === 0) {
        alert('目前沒有任何出任務類型');
        return;
    }

    const confirmMsg = `⚠️ 確定要清空所有出任務類型嗎？\n\n目前共有 ${categories.length} 個類型\n\n注意：\n• 此操作無法復原\n• 已建立的任務不會受影響\n• 但設定出任務時將無法選擇這些類型`;

    if (!confirm(confirmMsg)) {
        return;
    }

    // 二次確認
    if (!confirm('🔴 最後確認：真的要清空全部出任務類型嗎？')) {
        return;
    }

    MISSION_CATEGORIES = {};
    saveData();
    addHistory('清空所有出任務類型');
    renderMissionCategoryList();

    alert(`✅ 已清空所有出任務類型（共刪除 ${categories.length} 個）`);
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

    const oldMax = MAX_RANK;
    MAX_RANK = maxRankNum;

    // 如果降低了最高階級，需要調整超過上限的人員
    if (maxRankNum < oldMax) {
        let adjustedCount = 0;
        let adjustedPersons = [];

        personnel.forEach(person => {
            if (person.rank > maxRankNum) {
                adjustedPersons.push(`${person.name} (LV${person.rank} → LV${maxRankNum})`);
                person.rank = maxRankNum;
                adjustedCount++;
            }
        });

        if (adjustedCount > 0) {
            const adjustMsg = `⚠️ 降低最高階級後，以下人員的階級已自動調整：\n\n${adjustedPersons.join('\n')}\n\n共 ${adjustedCount} 人`;
            alert(adjustMsg);
            addHistory(`降低最高階級至 LV${MAX_RANK}，調整了 ${adjustedCount} 位人員的階級`);
        }
    }

    saveData();

    // 更新階級滑動條的最大值和標籤
    initializeRankSliders();

    // 更新編輯模式的階級滑動條（如果存在的話）
    const editRankSlider = document.getElementById('editPersonRank');
    if (editRankSlider) {
        editRankSlider.max = MAX_RANK;
        if (parseInt(editRankSlider.value) > MAX_RANK) {
            editRankSlider.value = MAX_RANK;
            const editRankValue = document.getElementById('editRankValue');
            if (editRankValue) {
                editRankValue.textContent = `LV${MAX_RANK}`;
            }
        }
    }

    // 如果新增人員 modal 當前打開，更新階級下拉選單
    updatePersonRankSelect();

    // 更新顯示
    document.getElementById('currentMaxRankDisplay').textContent = `目前最高階級：LV${MAX_RANK}`;
    renderRankLabelList();
    updateRankFilterOptions(); // 更新階級篩選下拉選單
    updateDisplay(); // 重新渲染人員列表

    addHistory(`修改最高階級為 LV${MAX_RANK}`);

    if (maxRankNum < oldMax) {
        alert(`✅ 已設定最高階級為 LV${MAX_RANK}\n\n階級滑動條範圍已更新`);
    } else {
        alert(`✅ 已設定最高階級為 LV${MAX_RANK}\n\n階級滑動條範圍已更新`);
    }
}

// ===== 部門管理 =====
function showDepartmentModal() {
    renderDepartmentList();
    document.getElementById('departmentModal').classList.remove('hidden');
    // 更新顏色預覽
    updateColorPreview();
}

// 當前選中的部門ID（null 表示無部門）
let selectedDeptId = undefined;

function renderDepartmentList() {
    const container = document.getElementById('departmentListContainer');
    container.innerHTML = '';

    // 更新無部門人數
    const noDeptCount = personnel.filter(p => !p.departmentId).length;
    document.getElementById('noDeptCount').textContent = noDeptCount;

    if (departments.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--gaming-cyan); opacity: 0.6;">尚未建立任何部門<br><br>點擊上方「➕ 新增」按鈕建立部門</div>';
        return;
    }

    departments.forEach(dept => {
        const deptPersonnelCount = personnel.filter(p => p.departmentId === dept.id).length;
        const isSelected = selectedDeptId === dept.id;

        const item = document.createElement('div');
        item.className = 'dept-list-item';
        item.onclick = () => selectDepartment(dept.id);
        item.style.cssText = `
            padding: 12px;
            background: ${isSelected ? 'rgba(0, 212, 255, 0.2)' : 'rgba(0, 212, 255, 0.05)'};
            border: 1px solid ${isSelected ? 'var(--gaming-cyan)' : 'rgba(0, 212, 255, 0.2)'};
            border-left: 4px solid ${dept.color};
            border-radius: 8px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.3s;
        `;

        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 16px; height: 16px; background: ${dept.color}; border-radius: 3px;"></div>
                    <span style="font-weight: bold; color: var(--gaming-white); font-size: 0.95rem;">${dept.name}</span>
                </div>
                <span style="background: ${dept.color}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;">${deptPersonnelCount}</span>
            </div>
        `;

        container.appendChild(item);
    });
}

// 選擇部門，顯示詳細資訊
function selectDepartment(deptId) {
    selectedDeptId = deptId;
    renderDepartmentList(); // 更新左側列表的選中狀態
    renderDeptDetail(deptId);
}

// 渲染部門詳細資訊與人員列表
function renderDeptDetail(deptId) {
    const content = document.getElementById('deptDetailContent');

    if (deptId === null) {
        // 無部門人員
        const noDeptPersonnel = personnel.filter(p => !p.departmentId);
        content.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="color: #ff6b6b; margin: 0;">⚠️ 無部門人員</h3>
                    <button onclick="showAddPersonToDept(null)" class="cyber-btn-small" style="padding: 5px 10px; font-size: 0.85rem;">👤 新增人員</button>
                </div>
                <p style="color: var(--gaming-cyan); font-size: 0.9rem; margin-bottom: 15px;">
                    這些人員尚未分配到任何部門，請將他們移動到適當的部門。
                </p>
            </div>
            ${renderDeptPersonnelList(noDeptPersonnel, null)}
        `;
    } else {
        const dept = departments.find(d => d.id === deptId);
        if (!dept) return;

        const deptPersonnel = personnel.filter(p => p.departmentId === deptId);

        content.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 24px; height: 24px; background: ${dept.color}; border-radius: 5px;"></div>
                        <h3 style="color: var(--gaming-white); margin: 0;">${dept.name}</h3>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="showAddPersonToDept(${dept.id})" class="cyber-btn-small" style="padding: 5px 10px; font-size: 0.85rem;">👤 新增人員</button>
                        <button onclick="showEditDepartmentForm(${dept.id})" class="cyber-btn-small" style="padding: 5px 10px; font-size: 0.85rem;">✏️ 編輯</button>
                        <button onclick="deleteDepartment(${dept.id})" class="cyber-btn-small cyber-btn-danger" style="padding: 5px 10px; font-size: 0.85rem;">🗑️ 刪除</button>
                    </div>
                </div>
                <p style="color: var(--gaming-cyan); font-size: 0.9rem; margin-bottom: 5px;">${dept.description || '無描述'}</p>
                <p style="color: var(--gaming-yellow); font-size: 0.9rem;">👥 共 ${deptPersonnel.length} 人</p>
            </div>
            ${renderDeptPersonnelList(deptPersonnel, deptId)}
        `;
    }
}

// 渲染部門內的人員列表
function renderDeptPersonnelList(personnelList, currentDeptId) {
    if (personnelList.length === 0) {
        return '<div style="text-align: center; padding: 30px; color: var(--gaming-cyan); opacity: 0.6;">此部門目前沒有人員</div>';
    }

    // 生成其他部門的選項
    let deptOptions = '<option value="">-- 選擇目標部門 --</option>';
    deptOptions += '<option value="none">⚠️ 無部門</option>';
    departments.forEach(dept => {
        if (dept.id !== currentDeptId) {
            deptOptions += `<option value="${dept.id}">${dept.name}</option>`;
        }
    });

    let html = `
        <div style="margin-bottom: 15px; padding: 12px; background: rgba(0,255,255,0.1); border-radius: 8px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <label style="color: var(--gaming-cyan); font-weight: bold;">批量移動選中人員到：</label>
            <select id="batchMoveDept" class="cyber-select" style="flex: 1; min-width: 150px;">
                ${deptOptions}
            </select>
            <button onclick="batchMovePersonnel()" class="cyber-btn-primary" style="padding: 8px 15px;">📦 移動</button>
            <button onclick="toggleSelectAll()" class="cyber-btn-small" style="padding: 8px 12px;">☑️ 全選</button>
        </div>
        <div style="max-height: 350px; overflow-y: auto;">
    `;

    personnelList.forEach(person => {
        const rankLabel = getRankLabel(person.rank);
        const specialBadge = person.isSpecial ? '<span style="color: #FFD700; margin-left: 5px;">🔸</span>' : '';

        html += `
            <div class="dept-person-item" style="display: flex; align-items: center; gap: 12px; padding: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; margin-bottom: 8px;">
                <input type="checkbox" class="person-checkbox cyber-checkbox" data-person-id="${person.id}">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: var(--gaming-white); font-weight: bold;">${person.name}</span>
                        ${specialBadge}
                        <span style="color: var(--gaming-cyan); font-size: 0.85rem;">LV${person.rank} - ${rankLabel}</span>
                    </div>
                    <div style="color: var(--gaming-white); font-size: 0.8rem; opacity: 0.6; margin-top: 3px;">${person.contact || '未提供聯絡方式'}</div>
                </div>
                <select class="cyber-select-small" onchange="movePersonToDept(${person.id}, this.value)" style="width: auto; padding: 5px 8px; font-size: 0.85rem;">
                    <option value="">移動到...</option>
                    <option value="none">⚠️ 無部門</option>
                    ${departments.filter(d => d.id !== currentDeptId).map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                </select>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

// 移動單一人員到其他部門
function movePersonToDept(personId, targetDeptId) {
    if (!targetDeptId) return;

    const person = personnel.find(p => p.id === personId);
    if (!person) return;

    const oldDept = departments.find(d => d.id === person.departmentId);
    const newDeptId = targetDeptId === 'none' ? null : parseInt(targetDeptId);
    const newDept = departments.find(d => d.id === newDeptId);

    person.departmentId = newDeptId;

    const oldDeptName = oldDept ? oldDept.name : '無部門';
    const newDeptName = newDept ? newDept.name : '無部門';
    addHistory(`移動人員 ${person.name}：${oldDeptName} → ${newDeptName}`);

    saveData();
    renderDepartmentList();
    renderDeptDetail(selectedDeptId);
    updateDisplay();
}

// 批量移動人員
function batchMovePersonnel() {
    const targetDeptId = document.getElementById('batchMoveDept').value;
    if (!targetDeptId) {
        alert('請選擇目標部門');
        return;
    }

    const checkboxes = document.querySelectorAll('.person-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('請先勾選要移動的人員');
        return;
    }

    const newDeptId = targetDeptId === 'none' ? null : parseInt(targetDeptId);
    const newDept = departments.find(d => d.id === newDeptId);
    const newDeptName = newDept ? newDept.name : '無部門';

    if (!confirm(`確定要將 ${checkboxes.length} 位人員移動到「${newDeptName}」嗎？`)) {
        return;
    }

    checkboxes.forEach(cb => {
        const personId = parseInt(cb.dataset.personId);
        const person = personnel.find(p => p.id === personId);
        if (person) {
            person.departmentId = newDeptId;
        }
    });

    addHistory(`批量移動 ${checkboxes.length} 位人員到「${newDeptName}」`);
    saveData();
    renderDepartmentList();
    renderDeptDetail(selectedDeptId);
    updateDisplay();
}

// 全選/取消全選
function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('.person-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);

    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
}

// 在部門管理中新增人員
function showAddPersonToDept(deptId) {
    editingPersonId = null;
    document.getElementById('personModalTitle').textContent = '新增人員';
    document.getElementById('personName').value = '';

    // 更新階級下拉選單
    updatePersonRankSelect();

    // 設定預設值（LV3）
    const defaultRank = Math.min(3, MAX_RANK);
    const rankSelect = document.getElementById('personRankSelect');
    rankSelect.value = defaultRank;
    syncRankHiddenFields();

    // 更新部門選項並預設選中當前部門
    updatePersonDepartmentOptions();
    document.getElementById('personDepartment').value = deptId || '';

    document.getElementById('personContact').value = '';

    // 設定較高的 z-index 讓 personModal 顯示在 departmentModal 之上
    const personModal = document.getElementById('personModal');
    personModal.style.zIndex = '10001';
    personModal.classList.remove('hidden');
}

// 顯示新增部門表單
function showAddDepartmentForm() {
    document.getElementById('deptEditModalTitle').textContent = '➕ 新增部門';
    document.getElementById('deptName').value = '';
    document.getElementById('deptDescription').value = '';
    document.getElementById('deptColor').value = '#4ECDC4';
    document.getElementById('editingDeptId').value = '';
    updateColorPreview();
    document.getElementById('deptEditModal').classList.remove('hidden');
}

// 顯示編輯部門表單
function showEditDepartmentForm(deptId) {
    const dept = departments.find(d => d.id === deptId);
    if (!dept) return;

    document.getElementById('deptEditModalTitle').textContent = '✏️ 編輯部門';
    document.getElementById('deptName').value = dept.name;
    document.getElementById('deptDescription').value = dept.description || '';
    document.getElementById('deptColor').value = dept.color;
    document.getElementById('editingDeptId').value = dept.id;
    updateColorPreview();
    document.getElementById('deptEditModal').classList.remove('hidden');
}

function saveDepartment() {
    const name = document.getElementById('deptName').value.trim();
    const description = document.getElementById('deptDescription').value.trim();
    const color = document.getElementById('deptColor').value;
    const editingId = document.getElementById('editingDeptId').value;

    if (!name) {
        alert('請輸入部門名稱');
        return;
    }

    let savedDeptId;
    if (editingId) {
        // 編輯模式
        const dept = departments.find(d => d.id === parseInt(editingId));
        if (dept) {
            dept.name = name;
            dept.description = description;
            dept.color = color;
            addHistory(`編輯部門：${name}`);
            savedDeptId = dept.id;
        }
    } else {
        // 新增模式
        const newDept = {
            id: departments.length > 0 ? Math.max(...departments.map(d => d.id)) + 1 : 1,
            name,
            description,
            color
        };
        departments.push(newDept);
        addHistory(`新增部門：${name}`);
        savedDeptId = newDept.id;
    }

    saveData();
    closeModal('deptEditModal');
    renderDepartmentList();
    updatePersonDepartmentOptions(); // 更新人員新增介面的部門選項
    updateDepartmentFilter(); // 更新部門篩選器
    updateImportTableDeptSelects(); // 更新批量匯入表格的部門選項

    // 如果有選中的部門，更新詳情面板
    if (selectedDeptId !== undefined) {
        renderDeptDetail(selectedDeptId);
    }
}

function deleteDepartment(id) {
    const dept = departments.find(d => d.id === id);
    if (!dept) return;

    // 檢查是否有人員屬於這個部門
    const deptPersonnel = personnel.filter(p => p.departmentId === id);
    let confirmMessage = `確定要刪除部門「${dept.name}」嗎？`;

    if (deptPersonnel.length > 0) {
        confirmMessage = `⚠️ 部門「${dept.name}」還有 ${deptPersonnel.length} 位人員。\n\n刪除後，這些人員將變成「無部門」狀態。\n確定要刪除嗎？`;
    }

    if (!confirm(confirmMessage)) {
        return;
    }

    // 將該部門的人員設為無部門
    personnel.forEach(person => {
        if (person.departmentId === id) {
            person.departmentId = null;
        }
    });

    departments = departments.filter(d => d.id !== id);
    addHistory(`刪除部門：${dept.name}` + (deptPersonnel.length > 0 ? `（${deptPersonnel.length} 位人員已移除部門）` : ''));
    saveData();

    // 如果刪除的是當前選中的部門，清除選中狀態
    if (selectedDeptId === id) {
        selectedDeptId = undefined;
        document.getElementById('deptDetailContent').innerHTML = `
            <div style="color: var(--gaming-white); text-align: center; padding: 50px 20px;">
                <div style="font-size: 3rem; margin-bottom: 15px;">👈</div>
                <div style="color: var(--gaming-cyan);">請從左側選擇一個部門</div>
            </div>
        `;
    }

    renderDepartmentList();
    updatePersonDepartmentOptions(); // 更新人員新增介面的部門選項
    updateDepartmentFilter(); // 更新部門篩選器
    updateImportTableDeptSelects(); // 更新批量匯入表格的部門選項
    renderPersonnelGrid(); // 重新渲染人員網格
}

function updateColorPreview() {
    const color = document.getElementById('deptColor').value;
    const preview = document.getElementById('deptColorPreview');
    preview.style.background = color;
}

// 監聽顏色變化
document.addEventListener('DOMContentLoaded', function() {
    const deptColorInput = document.getElementById('deptColor');
    if (deptColorInput) {
        deptColorInput.addEventListener('input', updateColorPreview);
    }
});

// 更新人員新增介面的部門選項
function updatePersonDepartmentOptions() {
    const select = document.getElementById('personDepartment');
    if (!select) return;

    // 保存當前選中的值
    const currentValue = select.value;

    // 清空選項
    select.innerHTML = '<option value="">無部門</option>';

    // 添加部門選項
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.id;
        option.textContent = dept.name;
        option.style.color = dept.color;
        select.appendChild(option);
    });

    // 恢復之前的選擇（如果仍然存在）
    if (currentValue && departments.some(d => d.id === parseInt(currentValue))) {
        select.value = currentValue;
    }
}

// 更新部門篩選器
function updateDepartmentFilter() {
    const deptFilter = document.getElementById('departmentFilter');
    if (!deptFilter) return;

    // 保存當前選中的值
    const currentValue = deptFilter.value;

    // 清空選項
    deptFilter.innerHTML = '<option value="all">所有部門</option>';

    // 添加部門選項
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.id;
        option.textContent = `🏢 ${dept.name}`;
        deptFilter.appendChild(option);
    });

    // 添加「無部門」選項
    const noDeptOption = document.createElement('option');
    noDeptOption.value = 'none';
    noDeptOption.textContent = '⚠️ 無部門';
    deptFilter.appendChild(noDeptOption);

    // 嘗試恢復之前的選擇
    const options = Array.from(deptFilter.options).map(opt => opt.value);
    if (options.includes(currentValue)) {
        deptFilter.value = currentValue;
    } else {
        deptFilter.value = 'all';
    }
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

    // 如果設為正常，恢復並刪除所有請假/出任務/午休任務
    if (newStatus === 'normal') {
        person.status = 'normal';

        // 找出並刪除該人員所有的特殊狀態任務（請假、出任務、午休）
        const specialStatusTypes = ['leave', 'mission', 'lunch'];
        const tasksToRemove = tasks.filter(t =>
            t.assignees &&
            t.assignees.includes(personId) &&
            specialStatusTypes.includes(t.type)
        );

        // 逐一刪除這些任務
        tasksToRemove.forEach(task => {
            const index = tasks.findIndex(t => t.id === task.id);
            if (index !== -1) {
                tasks.splice(index, 1);
            }
        });

        const removedCount = tasksToRemove.length;
        if (removedCount > 0) {
            addHistory(`恢復 ${person.name} 為正常狀態（已刪除 ${removedCount} 個特殊狀態任務）`);
        } else {
            addHistory(`恢復 ${person.name} 為正常狀態`);
        }

        saveData();
        updateDisplay();
        showPersonDetail(personId);
        return;
    }

    // 如果設為特殊狀態（請假/出任務），彈出時間選擇對話框
    // 午休已改為系統自動判斷 12:00-13:00，不再需要手動設定
    if (newStatus === 'leave' || newStatus === 'mission') {
        showStatusTimeRangeModal(personId, newStatus);
        return;
    }
}

// 切換狀態時間設定模式
function switchStatusTimeMode(mode) {
    const hourlyBtn = document.getElementById('selectHourlyMode');
    const dailyBtn = document.getElementById('selectDailyMode');
    const hourlyFields = document.getElementById('hourlyModeFields');
    const dailyFields = document.getElementById('dailyModeFields');

    if (mode === 'hourly') {
        // 按小時模式 - 選中狀態使用純黑色文字
        hourlyBtn.style.background = '#FFD700';
        hourlyBtn.style.color = '#000000';
        hourlyBtn.style.borderColor = '#FFD700';
        hourlyBtn.style.fontSize = '1rem';
        dailyBtn.style.background = 'rgba(255,255,255,0.1)';
        dailyBtn.style.color = '#FFFFFF';
        dailyBtn.style.borderColor = 'rgba(255,255,255,0.3)';
        dailyBtn.style.fontSize = '1rem';

        hourlyFields.style.display = 'block';
        dailyFields.style.display = 'none';
    } else {
        // 按天數模式 - 選中狀態使用純黑色文字
        dailyBtn.style.background = '#FFD700';
        dailyBtn.style.color = '#000000';
        dailyBtn.style.borderColor = '#FFD700';
        dailyBtn.style.fontSize = '1rem';
        hourlyBtn.style.background = 'rgba(255,255,255,0.1)';
        hourlyBtn.style.color = '#FFFFFF';
        hourlyBtn.style.borderColor = 'rgba(255,255,255,0.3)';
        hourlyBtn.style.fontSize = '1rem';

        hourlyFields.style.display = 'none';
        dailyFields.style.display = 'block';
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

    // 手機版：暫時隱藏人員詳情 Modal，避免遮擋
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        const personModal = document.getElementById('personDetailModal');
        if (personModal && !personModal.classList.contains('hidden')) {
            personModal.style.display = 'none'; // 暫時隱藏但不關閉
        }
    }

    // 設定對話框標題
    document.getElementById('statusTimeRangeTitle').textContent = `${statusIcons[statusType]} 設定${statusNames[statusType]}時間 - ${person.name}`;

    // 設定預設日期為今天
    const today = formatDate(new Date());
    document.getElementById('statusSingleDate').value = today;
    document.getElementById('statusStartDate').value = today;
    document.getElementById('statusEndDate').value = today;

    // 根據狀態類型設定預設模式和時間
    if (statusType === 'lunch') {
        // 午休預設按小時模式 12:00-13:00
        switchStatusTimeMode('hourly');
        document.getElementById('statusStartHour').value = 12;
        document.getElementById('statusEndHour').value = 13;
    } else if (statusType === 'mission') {
        // 出任務預設按小時模式 8:00-17:00
        switchStatusTimeMode('hourly');
        document.getElementById('statusStartHour').value = 8;
        document.getElementById('statusEndHour').value = 17;
    } else {
        // 請假預設按天數模式
        switchStatusTimeMode('daily');
        document.getElementById('statusStartHour').value = 0;
        document.getElementById('statusEndHour').value = 24;
    }

    document.getElementById('statusDescription').value = '';

    // 處理出任務類型選單（只在出任務時顯示）
    const missionCategoryField = document.getElementById('missionCategoryField');
    const missionCategorySelect = document.getElementById('missionCategorySelect');

    if (statusType === 'mission') {
        // 顯示出任務類型選單
        missionCategoryField.style.display = 'block';

        // 生成選項
        missionCategorySelect.innerHTML = '';
        for (const [key, value] of Object.entries(MISSION_CATEGORIES)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = value;
            missionCategorySelect.appendChild(option);
        }
    } else {
        // 隱藏出任務類型選單
        missionCategoryField.style.display = 'none';
    }

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

    const description = document.getElementById('statusDescription').value.trim();

    // 如果是出任務，讀取出任務類型
    let missionCategory = null;
    if (statusType === 'mission') {
        missionCategory = document.getElementById('missionCategorySelect').value;
    }

    // 判斷當前模式
    const isHourlyMode = document.getElementById('hourlyModeFields').style.display !== 'none';

    let startDate, endDate, startHour, endHour;

    if (isHourlyMode) {
        // 按小時模式：同一天，不同時間
        const singleDate = document.getElementById('statusSingleDate').value;
        if (!singleDate) {
            alert('請選擇日期');
            return;
        }

        startDate = singleDate;
        endDate = singleDate;
        startHour = parseInt(document.getElementById('statusStartHour').value);
        endHour = parseInt(document.getElementById('statusEndHour').value);

        // 驗證時間
        if (isNaN(startHour) || startHour < 0 || startHour > 23) {
            alert('開始時間必須在 0-23 之間');
            return;
        }

        if (isNaN(endHour) || endHour < 1 || endHour > 24) {
            alert('結束時間必須在 1-24 之間');
            return;
        }

        if (endHour <= startHour) {
            alert('結束時間必須大於開始時間');
            return;
        }
    } else {
        // 按天數模式：全天
        startDate = document.getElementById('statusStartDate').value;
        endDate = document.getElementById('statusEndDate').value;

        if (!startDate || !endDate) {
            alert('請選擇開始和結束日期');
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            alert('結束日期不能早於開始日期');
            return;
        }

        // 按天數固定為全天
        startHour = 0;
        endHour = 24;
    }

    const statusNames = {
        'leave': '請假',
        'mission': '出任務',
        'lunch': '午休'
    };

    // 檢查是否與現有工作衝突
    const conflictingTasks = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    let currentDate = new Date(start);

    while (currentDate <= end) {
        const dateStr = formatDate(currentDate);
        const isFirst = dateStr === startDate;
        const isLast = dateStr === endDate;

        const dayStartHour = isFirst && isHourlyMode ? startHour : 0;
        const dayEndHour = isLast && isHourlyMode ? endHour : 24;

        // 找出該日期該人員的所有一般工作任務（非請假/出任務/午休）
        const workTasks = tasks.filter(t => {
            if (!t.assignees || !t.assignees.includes(personId)) return false;
            if (t.type === 'leave' || t.type === 'mission' || t.type === 'lunch') return false;
            const taskDate = t.date || formatDate(new Date());
            if (taskDate !== dateStr) return false;

            // 檢查時間是否重疊
            return !(t.endHour <= dayStartHour || t.startHour >= dayEndHour);
        });

        if (workTasks.length > 0) {
            conflictingTasks.push(...workTasks);
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    // 如果有衝突的工作，先詢問用戶
    if (conflictingTasks.length > 0) {
        const conflictList = conflictingTasks.map(t => {
            const timeStr = `${String(t.startHour).padStart(2, '0')}:00-${String(t.endHour).padStart(2, '0')}:00`;
            return `• ${t.date} ${timeStr} - ${t.name}`;
        }).join('\n');

        const timeDesc = isHourlyMode
            ? `${startDate} ${String(startHour).padStart(2, '0')}:00 - ${String(endHour).padStart(2, '0')}:00`
            : startDate === endDate
                ? `${startDate} 全天`
                : `${startDate} ~ ${endDate}`;

        const confirmMessage = `⚠️ ${statusNames[statusType]}時段衝突警告\n\n${person.name} 在 ${timeDesc} 已有以下工作排程：\n\n${conflictList}\n\n確定要${statusNames[statusType]}嗎？\n\n✓ 確定：將移除這些工作並重新分配\n✗ 取消：不設定${statusNames[statusType]}`;

        if (!confirm(confirmMessage)) {
            return;
        }

        // 用戶確認後，移除衝突的工作任務
        conflictingTasks.forEach(conflictTask => {
            const taskIndex = tasks.findIndex(t => t.id === conflictTask.id);
            if (taskIndex !== -1) {
                // 從任務中移除這個人員
                const assigneeIndex = conflictTask.assignees.indexOf(personId);
                if (assigneeIndex !== -1) {
                    conflictTask.assignees.splice(assigneeIndex, 1);
                }

                // 記錄歷史
                addHistory(`🔄 因${statusNames[statusType]}移除工作：${person.name} 的「${conflictTask.name}」`);
            }
        });
    }

    // 創建任務
    const taskName = `${statusNames[statusType]} - ${person.name}`;
    const createdTasks = [];

    // 重置日期
    currentDate = new Date(start);

    if (startDate === endDate) {
        // 單日
        const newTask = {
            id: Date.now(),
            name: taskName,
            type: statusType,
            date: startDate,
            startHour: startHour,
            endHour: endHour,
            assignees: [personId],
            requiredPeople: 1,
            description: description,
            workCategory: null,
            missionCategory: missionCategory // 出任務類型
        };
        tasks.push(newTask);
        createdTasks.push(newTask);
    } else {
        // 多日：創建每一天的任務
        let currentDate = new Date(start);
        let taskId = Date.now();

        while (currentDate <= end) {
            const dateStr = formatDate(currentDate);
            const isFirst = dateStr === startDate;
            const isLast = dateStr === endDate;

            const newTask = {
                id: taskId++,
                name: taskName,
                type: statusType,
                date: dateStr,
                startHour: isFirst && isHourlyMode ? startHour : 0,
                endHour: isLast && isHourlyMode ? endHour : 24,
                assignees: [personId],
                requiredPeople: 1,
                description: description,
                workCategory: null,
                missionCategory: missionCategory // 出任務類型
            };
            tasks.push(newTask);
            createdTasks.push(newTask);

            // 下一天
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    // 不再設定人員狀態 - 改為只依靠任務來判斷人員可用性
    // person.status = statusType;

    // 記錄歷史
    const timeDesc = isHourlyMode
        ? `${startDate} ${String(startHour).padStart(2, '0')}:00 - ${String(endHour).padStart(2, '0')}:00`
        : startDate === endDate
            ? `${startDate} 全天`
            : `${startDate} ~ ${endDate} (共 ${createdTasks.length} 天)`;

    addHistory(`${person.name} ${statusNames[statusType]}: ${timeDesc}`);

    // 儲存資料
    saveData();

    // 更新顯示
    updateDisplay();

    // 關閉對話框
    closeModal('statusTimeRangeModal');

    // 重新顯示人員詳細資訊
    showPersonDetail(personId);

    // 顯示成功提示
    alert(`✓ 已設定${statusNames[statusType]}：${timeDesc}`);
}

// ===== 補休管理功能 =====

// ===== 補休計算系統 =====
// 規則：
// 1. 晚上10點（22:00）後還在工作的，從工作完成時間開始計算補休
// 2. 中午12-下午1點（12:00-13:00）工作的，從下午1點開始計算補休
// 3. 補休會自動跳過以下時段：
//    - 午休時間：12:00-13:00
//    - 睡覺時間：00:00-06:00
// 4. 如果任務結束時間在上述時段內，補休會自動延後至時段結束後開始

// 計算補休開始時間（跳過午休和睡覺時間）
function calculateCompRestStartTime(taskEndHour, taskDate) {
    // 午休時間: 12:00-13:00
    // 睡覺時間: 00:00-06:00

    let restStartHour = taskEndHour;
    let restDate = taskDate;

    // 處理跨日情況
    if (restStartHour >= 24) {
        restStartHour = restStartHour - 24;
        const nextDay = new Date(restDate);
        nextDay.setDate(nextDay.getDate() + 1);
        restDate = formatDate(nextDay);
    }

    // 如果結束時間在睡覺時間內（00:00-06:00），補休從06:00開始
    if (restStartHour >= 0 && restStartHour < 6) {
        restStartHour = 6;
    }
    // 如果結束時間在午休時間內（12:00-13:00），補休從13:00開始
    else if (restStartHour >= 12 && restStartHour < 13) {
        restStartHour = 13;
    }

    return { startHour: restStartHour, date: restDate };
}

// 計算補休時段（考慮跳過午休和睡覺時間）
function calculateCompRestPeriod(startHour, hours, startDate) {
    // 午休時間: 12:00-13:00
    // 睡覺時間: 00:00-06:00

    let currentHour = startHour;
    let currentDate = startDate;
    let remainingHours = hours;

    // 如果補休會跨越午休或睡覺時間，需要調整
    let endHour = currentHour + remainingHours;

    // 檢查是否會經過午休時間（12:00-13:00）
    if (currentHour < 12 && endHour > 12) {
        // 跳過午休時間，補休時數延後1小時
        endHour += 1;
    }

    // 處理跨日和睡覺時間
    if (endHour > 24) {
        // 補休跨越午夜
        endHour = endHour - 24;
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        currentDate = formatDate(nextDay);

        // 如果跨日後會經過睡覺時間（00:00-06:00），延後6小時
        if (endHour <= 6) {
            endHour += 6;
        }
    }

    // 限制在24小時內
    if (endHour > 24) {
        endHour = 24;
    }

    return { endHour: endHour, date: currentDate };
}

function calculateCompensatoryLeaves() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 檢查所有任務
    tasks.forEach(task => {
        const assignees = task.assignees || [];

        assignees.forEach(personId => {
            const person = personnel.find(p => p.id === personId);
            if (!person) return;

            // 檢查1：晚上10點後工作（22:00之後）
            if (task.endHour >= 22 || (task.startHour >= 22 && task.endHour <= 24)) {
                // 計算在22:00之後的工作時數
                let compHours = 0;
                if (task.startHour >= 22) {
                    // 整個任務都在22點後
                    compHours = task.endHour - task.startHour;
                } else if (task.endHour >= 22) {
                    // 任務跨越22點
                    compHours = task.endHour - 22;
                }

                // 檢查是否已經有這筆補休記錄
                const existingComp = compensatoryLeaves.find(cl =>
                    cl.personId === personId &&
                    cl.taskId === task.id &&
                    cl.type === 'overtime'
                );

                if (!existingComp && compHours > 0) {
                    // 使用新函數計算補休開始時間（跳過午休和睡覺時間）
                    const taskDate = task.date || formatDate(today);
                    const restStart = calculateCompRestStartTime(task.endHour, taskDate);
                    const restEnd = calculateCompRestPeriod(restStart.startHour, compHours, restStart.date);

                    compensatoryLeaves.push({
                        id: Date.now() + Math.random(),
                        personId: personId,
                        personName: person.name,
                        taskId: task.id,
                        taskName: task.name,
                        date: task.date || formatDate(today),
                        type: 'overtime', // 加班類型
                        reason: `晚上10點後工作（${String(task.startHour).padStart(2, '0')}:00-${String(task.endHour).padStart(2, '0')}:00）`,
                        earnedHours: compHours, // 獲得的補休時數
                        usedHours: 0, // 已使用的補休時數
                        remainingHours: compHours, // 剩餘的補休時數
                        status: 'scheduled', // 自動排程
                        createdAt: new Date().toISOString(),
                        scheduledDate: restStart.date, // 補休日期
                        scheduledStartHour: restStart.startHour, // 跳過午休和睡覺時間後的開始時間
                        scheduledEndHour: restEnd.endHour // 補休結束時間
                    });
                }
            }

            // 檢查2：中午12-下午1點工作（12:00-13:00）
            if ((task.startHour <= 12 && task.endHour > 12) ||
                (task.startHour === 12 && task.endHour >= 13)) {

                // 計算在午休時間內工作的時數
                const lunchStart = 12;
                const lunchEnd = 13;
                const workStart = Math.max(task.startHour, lunchStart);
                const workEnd = Math.min(task.endHour, lunchEnd);
                const compHours = workEnd - workStart;

                // 檢查是否已經有這筆補休記錄
                const existingComp = compensatoryLeaves.find(cl =>
                    cl.personId === personId &&
                    cl.taskId === task.id &&
                    cl.type === 'lunch_work'
                );

                if (!existingComp && compHours > 0) {
                    // 午休時間工作的補休從13:00開始（午休時間結束後）
                    const taskDate = task.date || formatDate(today);
                    const restEnd = calculateCompRestPeriod(13, compHours, taskDate);

                    compensatoryLeaves.push({
                        id: Date.now() + Math.random(),
                        personId: personId,
                        personName: person.name,
                        taskId: task.id,
                        taskName: task.name,
                        date: task.date || formatDate(today),
                        type: 'lunch_work', // 午休時間工作
                        reason: `午休時間工作（${String(workStart).padStart(2, '0')}:00-${String(workEnd).padStart(2, '0')}:00）`,
                        earnedHours: compHours,
                        usedHours: 0,
                        remainingHours: compHours,
                        status: 'scheduled', // 自動排程
                        createdAt: new Date().toISOString(),
                        scheduledDate: taskDate, // 補休日期
                        scheduledStartHour: 13, // 從13:00開始（午休時間結束後）
                        scheduledEndHour: restEnd.endHour // 補休結束時間
                    });
                }
            }
        });
    });

    saveData();
    console.log('補休計算完成，共', compensatoryLeaves.length, '筆記錄');
}

// 取得人員的補休統計
function getPersonCompensatoryStats(personId) {
    const personComps = compensatoryLeaves.filter(cl => cl.personId === personId);

    const totalEarned = personComps.reduce((sum, cl) => sum + cl.earnedHours, 0);
    const totalUsed = personComps.reduce((sum, cl) => sum + cl.usedHours, 0);
    const totalRemaining = personComps.reduce((sum, cl) => sum + cl.remainingHours, 0);

    return {
        total: personComps.length,
        totalEarned,
        totalUsed,
        totalRemaining,
        pending: personComps.filter(cl => cl.status === 'pending').length,
        approved: personComps.filter(cl => cl.status === 'approved').length,
        used: personComps.filter(cl => cl.status === 'used').length
    };
}

// 顯示補休管理頁面
function showCompensatoryLeaveManager() {
    // 先計算最新的補休狀況
    calculateCompensatoryLeaves();

    // 顯示 Modal
    document.getElementById('compensatoryLeaveModal').classList.remove('hidden');

    // 渲染補休列表
    renderCompensatoryLeaveList();
}

// 渲染補休列表
function renderCompensatoryLeaveList() {
    const container = document.getElementById('compensatoryLeaveList');
    if (!container) return;

    container.innerHTML = '';

    // 更新統計資訊
    const totalLeaves = compensatoryLeaves.length;
    const scheduledLeaves = compensatoryLeaves.filter(cl => cl.status === 'scheduled').length;
    const totalHours = compensatoryLeaves.reduce((sum, cl) => sum + cl.remainingHours, 0);

    // 統計今天有補休的人數
    const today = formatDate(new Date());
    const todayCompLeaves = compensatoryLeaves.filter(cl => cl.scheduledDate === today).length;

    document.getElementById('totalCompLeaves').textContent = totalLeaves;
    document.getElementById('pendingCompLeaves').textContent = todayCompLeaves;
    document.getElementById('approvedCompLeaves').textContent = scheduledLeaves;
    document.getElementById('totalCompHours').textContent = totalHours + 'h';

    if (compensatoryLeaves.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--gaming-cyan);">目前沒有補休記錄</div>';
        return;
    }

    // 按日期和人員分組
    const sortedLeaves = [...compensatoryLeaves].sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return a.personName.localeCompare(b.personName);
    });

    sortedLeaves.forEach(cl => {
        const row = document.createElement('div');
        row.className = 'comp-leave-row';

        const statusText = {
            'pending': '⏳ 待審核',
            'approved': '✅ 已批准',
            'scheduled': '📅 已排程',
            'used': '✔️ 已使用'
        };

        const typeText = {
            'overtime': '🌙 晚間加班',
            'lunch_work': '🍱 午休工作'
        };

        // 排程資訊
        let scheduleInfo = '';
        if (cl.status === 'scheduled' && cl.scheduledDate) {
            const startTime = String(cl.scheduledStartHour).padStart(2, '0');
            const endTime = String(cl.scheduledEndHour).padStart(2, '0');
            scheduleInfo = `<div class="comp-leave-schedule">📅 ${cl.scheduledDate} ${startTime}:00-${endTime}:00</div>`;
        }

        row.innerHTML = `
            <div class="comp-leave-date">${cl.date}</div>
            <div class="comp-leave-person">${cl.personName}</div>
            <div class="comp-leave-type">${typeText[cl.type] || cl.type}</div>
            <div class="comp-leave-task">${cl.taskName}</div>
            <div class="comp-leave-reason">
                ${cl.reason}
                ${scheduleInfo}
            </div>
            <div class="comp-leave-hours">
                獲得: ${cl.earnedHours}h<br>
                剩餘: <strong>${cl.remainingHours}h</strong>
            </div>
            <div class="comp-leave-status status-${cl.status}">${statusText[cl.status]}</div>
            <div class="comp-leave-actions">
                ${cl.status === 'scheduled' ? `<button onclick="cancelCompLeaveSchedule(${cl.id})" class="btn-cancel">取消補休</button>` : ''}
                ${cl.status === 'scheduled' ? `<button onclick="editCompLeaveSchedule(${cl.id})" class="btn-edit">調整時間</button>` : ''}
                <button onclick="deleteCompensatoryLeave(${cl.id})" class="btn-delete">刪除</button>
            </div>
        `;

        container.appendChild(row);
    });
}

// 批准補休
function approveCompensatoryLeave(id) {
    const cl = compensatoryLeaves.find(c => c.id === id);
    if (!cl) return;

    cl.status = 'approved';
    saveData();
    renderCompensatoryLeaveList();
    addHistory(`批准補休：${cl.personName} - ${cl.reason}`);
}

// 使用補休 - 顯示排程對話框
function useCompensatoryLeave(id) {
    const cl = compensatoryLeaves.find(c => c.id === id);
    if (!cl) return;

    // 顯示排程對話框
    showScheduleCompLeaveModal(cl);
}

// 顯示補休排程對話框
function showScheduleCompLeaveModal(compLeave) {
    // 建立自訂對話框
    const modal = document.getElementById('scheduleCompLeaveModal');
    if (!modal) {
        // 如果 modal 不存在，建立一個簡單的對話框
        const useDate = prompt(`請輸入補休日期（格式：YYYY-MM-DD，例如：2025-01-20）：`);
        if (!useDate) return;

        const startHour = prompt(`請輸入開始時間（0-23）：`, '8');
        if (startHour === null) return;

        const useHours = prompt(`請輸入要使用的補休時數（剩餘 ${compLeave.remainingHours} 小時）：`, compLeave.remainingHours);
        if (useHours === null) return;

        const hours = parseFloat(useHours);
        const start = parseInt(startHour);

        if (isNaN(hours) || hours <= 0 || hours > compLeave.remainingHours) {
            alert('輸入的時數無效！');
            return;
        }

        if (isNaN(start) || start < 0 || start > 23) {
            alert('開始時間無效！');
            return;
        }

        const end = start + hours;
        if (end > 24) {
            alert('結束時間不能超過24點！');
            return;
        }

        // 更新補休記錄
        compLeave.scheduledDate = useDate;
        compLeave.scheduledStartHour = start;
        compLeave.scheduledEndHour = end;
        compLeave.status = 'scheduled';

        saveData();
        renderCompensatoryLeaveList();
        updateDisplay(); // 更新人員顯示
        addHistory(`排程補休：${compLeave.personName} 在 ${useDate} ${String(start).padStart(2, '0')}:00-${String(end).padStart(2, '0')}:00 補休`);

        alert(`補休已排程！\n${compLeave.personName} 將在 ${useDate} ${String(start).padStart(2, '0')}:00-${String(end).padStart(2, '0')}:00 補休`);
    }
}

// 編輯補休
function editCompensatoryLeave(id) {
    const cl = compensatoryLeaves.find(c => c.id === id);
    if (!cl) return;

    const newHours = prompt(`編輯補休時數（目前獲得 ${cl.earnedHours} 小時）:`, cl.earnedHours);
    if (newHours === null) return;

    const hours = parseFloat(newHours);
    if (isNaN(hours) || hours < 0) {
        alert('輸入的時數無效！');
        return;
    }

    const diff = hours - cl.earnedHours;
    cl.earnedHours = hours;
    cl.remainingHours += diff;

    if (cl.remainingHours < 0) cl.remainingHours = 0;

    saveData();
    renderCompensatoryLeaveList();
    addHistory(`編輯補休：${cl.personName} - ${cl.reason}，調整為 ${hours} 小時`);
}

// 調整補休時間
function editCompLeaveSchedule(id) {
    const cl = compensatoryLeaves.find(c => c.id === id);
    if (!cl) return;

    const currentSchedule = `目前補休時間：${cl.scheduledDate} ${String(cl.scheduledStartHour).padStart(2, '0')}:00-${String(cl.scheduledEndHour).padStart(2, '0')}:00`;

    const newDate = prompt(`請輸入新的補休日期（格式：YYYY-MM-DD）\n${currentSchedule}`, cl.scheduledDate);
    if (!newDate) return;

    const newStartHour = prompt(`請輸入新的開始時間（0-23）：`, cl.scheduledStartHour);
    if (newStartHour === null) return;

    const start = parseInt(newStartHour);
    if (isNaN(start) || start < 0 || start > 23) {
        alert('開始時間無效！');
        return;
    }

    const end = start + cl.earnedHours;
    if (end > 24) {
        alert('補休時間超過24點！請選擇較早的開始時間。');
        return;
    }

    cl.scheduledDate = newDate;
    cl.scheduledStartHour = start;
    cl.scheduledEndHour = end;

    saveData();
    renderCompensatoryLeaveList();
    updateDisplay();
    addHistory(`調整補休時間：${cl.personName} 改為 ${newDate} ${String(start).padStart(2, '0')}:00-${String(end).padStart(2, '0')}:00`);
    alert(`補休時間已調整！\n新時間：${newDate} ${String(start).padStart(2, '0')}:00-${String(end).padStart(2, '0')}:00`);
}

// 取消補休排程
function cancelCompLeaveSchedule(id) {
    const cl = compensatoryLeaves.find(c => c.id === id);
    if (!cl) return;

    if (!confirm(`確定要取消這筆補休嗎？\n${cl.personName} 在 ${cl.scheduledDate} ${String(cl.scheduledStartHour).padStart(2, '0')}:00-${String(cl.scheduledEndHour).padStart(2, '0')}:00 的補休將被刪除`)) {
        return;
    }

    // 直接刪除補休記錄
    const index = compensatoryLeaves.findIndex(c => c.id === id);
    if (index !== -1) {
        compensatoryLeaves.splice(index, 1);
        saveData();
        renderCompensatoryLeaveList();
        updateDisplay(); // 更新人員顯示
        addHistory(`取消補休：${cl.personName} - ${cl.reason}`);
    }
}

// 刪除補休
function deleteCompensatoryLeave(id) {
    const cl = compensatoryLeaves.find(c => c.id === id);
    if (!cl) return;

    if (!confirm(`確定要刪除這筆補休記錄嗎？\n${cl.personName} - ${cl.reason}`)) {
        return;
    }

    const index = compensatoryLeaves.findIndex(c => c.id === id);
    if (index !== -1) {
        compensatoryLeaves.splice(index, 1);
        saveData();
        renderCompensatoryLeaveList();
        addHistory(`刪除補休：${cl.personName} - ${cl.reason}`);
    }
}

// ===== 每日任務模板管理 =====

// 顯示任務模板管理 Modal
function showTaskTemplateModal() {
    currentTemplateType = 'daily';
    updateTaskTypeSelection();
    renderTaskTemplateList();
    updateTaskTemplateCounts();
    document.getElementById('taskTemplateModal').classList.remove('hidden');
}

// 選擇任務類型
function selectTaskType(type) {
    currentTemplateType = type;
    updateTaskTypeSelection();
    renderTaskTemplateList();
}

// 更新任務類型選擇的視覺狀態
function updateTaskTypeSelection() {
    const types = ['daily', 'important', 'urgent'];
    const colors = {
        daily: { bg: 'rgba(0, 255, 136, 0.2)', border: 'var(--status-free)' },
        important: { bg: 'rgba(255, 0, 128, 0.2)', border: 'var(--status-busy)' },
        urgent: { bg: 'rgba(255, 107, 0, 0.2)', border: 'var(--status-partial)' }
    };
    const titles = {
        daily: '📅 日常任務',
        important: '⭐ 重要任務',
        urgent: '⚡ 臨時任務'
    };

    types.forEach(type => {
        const el = document.getElementById(`taskType${type.charAt(0).toUpperCase() + type.slice(1)}`);
        if (type === currentTemplateType) {
            el.classList.add('selected');
            el.style.background = colors[type].bg;
            el.style.borderColor = colors[type].border;
        } else {
            el.classList.remove('selected');
            el.style.background = colors[type].bg.replace('0.2', '0.1');
            el.style.borderColor = colors[type].border.replace(')', ', 0.3)').replace('var(', 'rgba(');
            // 簡化為直接設定透明度較低的版本
            if (type === 'daily') {
                el.style.background = 'rgba(0, 255, 136, 0.1)';
                el.style.borderColor = 'rgba(0, 255, 136, 0.3)';
            } else if (type === 'important') {
                el.style.background = 'rgba(255, 0, 128, 0.1)';
                el.style.borderColor = 'rgba(255, 0, 128, 0.3)';
            } else {
                el.style.background = 'rgba(255, 107, 0, 0.1)';
                el.style.borderColor = 'rgba(255, 107, 0, 0.3)';
            }
        }
    });

    // 更新標題
    document.getElementById('taskListTitle').textContent = titles[currentTemplateType];
}

// 更新任務模板計數
function updateTaskTemplateCounts() {
    const counts = {
        daily: taskTemplates.filter(t => t.type === 'daily').length,
        important: taskTemplates.filter(t => t.type === 'important').length,
        urgent: taskTemplates.filter(t => t.type === 'urgent').length
    };

    document.getElementById('dailyTaskCount').textContent = counts.daily;
    document.getElementById('importantTaskCount').textContent = counts.important;
    document.getElementById('urgentTaskCount').textContent = counts.urgent;
}

// 渲染任務模板列表
function renderTaskTemplateList() {
    const container = document.getElementById('taskTemplateListContainer');
    const templates = taskTemplates.filter(t => t.type === currentTemplateType);

    if (templates.length === 0) {
        const typeNames = { daily: '日常', important: '重要', urgent: '臨時' };
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--gaming-white); opacity: 0.6;">
                <div style="font-size: 3rem; margin-bottom: 15px;">📭</div>
                <div>尚未設定${typeNames[currentTemplateType]}任務</div>
                <div style="font-size: 0.9rem; margin-top: 10px;">點擊「新增任務」來添加每日任務</div>
            </div>
        `;
        return;
    }

    const typeColors = {
        daily: 'var(--status-free)',
        important: 'var(--status-busy)',
        urgent: 'var(--status-partial)'
    };

    container.innerHTML = templates.map(template => {
        return `
            <div class="task-template-item" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(0, 255, 255, 0.2);
                border-radius: 8px;
                margin-bottom: 8px;
            ">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <span style="color: ${typeColors[currentTemplateType]}; font-weight: bold;">${template.name}</span>
                        <span style="background: rgba(0, 255, 255, 0.2); color: var(--gaming-cyan); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">
                            ${String(template.startHour).padStart(2, '0')}:00 - ${String(template.endHour).padStart(2, '0')}:00
                        </span>
                        <span style="background: rgba(255, 255, 255, 0.1); color: var(--gaming-white); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">
                            👥 ${template.requiredPeople}人
                        </span>
                    </div>
                    ${template.description ? `<div style="font-size: 0.85rem; color: var(--gaming-white); opacity: 0.7;">📝 ${template.description}</div>` : ''}
                </div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="editTaskTemplate(${template.id})" class="cyber-btn-small" style="padding: 6px 12px; font-size: 0.85rem;">✏️ 編輯</button>
                    <button onclick="deleteTaskTemplate(${template.id})" class="cyber-btn-small cyber-btn-danger" style="padding: 6px 12px; font-size: 0.85rem;">🗑️ 刪除</button>
                </div>
            </div>
        `;
    }).join('');
}

// 顯示新增任務模板 Modal
function showAddTaskTemplate() {
    document.getElementById('taskTemplateEditTitle').textContent = '➕ 新增每日任務';
    document.getElementById('templateTaskName').value = '';
    document.getElementById('templateStartHour').value = '8';
    document.getElementById('templateEndHour').value = '17';
    document.getElementById('templateRequiredPeople').value = '1';
    document.getElementById('templateDescription').value = '';
    document.getElementById('editingTemplateId').value = '';
    document.getElementById('editingTemplateType').value = currentTemplateType;

    document.getElementById('taskTemplateEditModal').classList.remove('hidden');
}

// 編輯任務模板
function editTaskTemplate(id) {
    const template = taskTemplates.find(t => t.id === id);
    if (!template) return;

    document.getElementById('taskTemplateEditTitle').textContent = '✏️ 編輯每日任務';
    document.getElementById('templateTaskName').value = template.name;
    document.getElementById('templateStartHour').value = template.startHour;
    document.getElementById('templateEndHour').value = template.endHour;
    document.getElementById('templateRequiredPeople').value = template.requiredPeople;
    document.getElementById('templateDescription').value = template.description || '';
    document.getElementById('editingTemplateId').value = id;
    document.getElementById('editingTemplateType').value = template.type;

    document.getElementById('taskTemplateEditModal').classList.remove('hidden');
}

// 取得模板類型對應的工作性質
function getTemplateTypeCategory(type) {
    const typeCategories = {
        'daily': 'template_daily',
        'important': 'template_important',
        'urgent': 'template_urgent'
    };
    return typeCategories[type] || 'template_daily';
}

// 取得模板類型的顯示名稱
function getTemplateTypeName(type) {
    const typeNames = {
        'daily': '日常任務',
        'important': '重要任務',
        'urgent': '臨時任務'
    };
    return typeNames[type] || '日常任務';
}

// 儲存任務模板
function saveTaskTemplate() {
    const name = document.getElementById('templateTaskName').value.trim();
    const startHour = parseInt(document.getElementById('templateStartHour').value);
    const endHour = parseInt(document.getElementById('templateEndHour').value);
    const requiredPeople = parseInt(document.getElementById('templateRequiredPeople').value) || 1;
    const description = document.getElementById('templateDescription').value.trim();
    const editingId = document.getElementById('editingTemplateId').value;
    const type = document.getElementById('editingTemplateType').value || currentTemplateType;

    // 驗證
    if (!name) {
        alert('請輸入任務名稱！');
        return;
    }
    if (isNaN(startHour) || startHour < 0 || startHour > 23) {
        alert('開始時間必須在 0-23 之間！');
        return;
    }
    if (isNaN(endHour) || endHour < 1 || endHour > 24) {
        alert('結束時間必須在 1-24 之間！');
        return;
    }
    if (endHour <= startHour) {
        alert('結束時間必須大於開始時間！');
        return;
    }

    // 根據模板類型自動設定工作性質
    const workCategory = getTemplateTypeCategory(type);

    if (editingId) {
        // 編輯現有模板
        const template = taskTemplates.find(t => t.id === parseInt(editingId));
        if (template) {
            template.name = name;
            template.startHour = startHour;
            template.endHour = endHour;
            template.requiredPeople = requiredPeople;
            template.description = description;
            addHistory(`編輯每日任務模板：${name}`);
        }
    } else {
        // 新增模板
        const newId = taskTemplates.length > 0 ? Math.max(...taskTemplates.map(t => t.id)) + 1 : 1;
        taskTemplates.push({
            id: newId,
            name,
            type,
            startHour,
            endHour,
            requiredPeople,
            description
        });
        addHistory(`新增每日任務模板：${name}（${getTemplateTypeName(type)}）`);

        // 新增模板後，立即為當前日期生成該任務
        const newTaskId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
        tasks.push({
            id: newTaskId,
            name,
            date: currentDateString,
            startHour,
            endHour,
            workCategory, // 使用自動設定的工作性質
            requiredPeople,
            description,
            assignees: [],
            type: type, // 任務分類（daily/important/urgent）
            priority: type === 'urgent' ? 'high' : (type === 'important' ? 'medium' : 'normal'),
            fromTemplate: true,
            templateId: newId
        });
    }

    saveData();
    closeModal('taskTemplateEditModal');
    renderTaskTemplateList();
    updateTaskTemplateCounts();
    updateDisplay(); // 更新主畫面顯示新任務
}

// 刪除任務模板
function deleteTaskTemplate(id) {
    const template = taskTemplates.find(t => t.id === id);
    if (!template) return;

    // 計算有多少個由此模板生成的任務（用 templateId 或名稱+時間匹配）
    const relatedTasks = tasks.filter(t =>
        (t.fromTemplate === true && t.templateId === id) ||
        (t.fromTemplate === true && t.name === template.name && t.startHour === template.startHour && t.endHour === template.endHour)
    );
    const relatedTaskCount = relatedTasks.length;

    let confirmMsg = `確定要刪除這個每日任務嗎？\n「${template.name}」將不再每天自動出現`;
    if (relatedTaskCount > 0) {
        confirmMsg += `\n\n⚠️ 同時會刪除已生成的 ${relatedTaskCount} 個相關任務`;
    }

    if (!confirm(confirmMsg)) {
        return;
    }

    // 刪除所有由此模板生成的任務（用 templateId 或名稱+時間匹配）
    tasks = tasks.filter(t => !(
        (t.fromTemplate === true && t.templateId === id) ||
        (t.fromTemplate === true && t.name === template.name && t.startHour === template.startHour && t.endHour === template.endHour)
    ));

    const index = taskTemplates.findIndex(t => t.id === id);
    if (index !== -1) {
        taskTemplates.splice(index, 1);
        saveData();
        renderTaskTemplateList();
        updateTaskTemplateCounts();
        updateDisplay(); // 更新主畫面
        updateScheduleOverview(); // 更新快速切換日期的任務數量
        addHistory(`刪除每日任務模板：${template.name}（含 ${relatedTaskCount} 個已生成任務）`);
    }
}

// 從模板生成指定日期的任務（應在每天初始化或切換日期時呼叫）
function generateTasksFromTemplates(dateString) {
    if (!dateString) {
        dateString = formatDate(new Date());
    }

    // 如果沒有模板，直接返回
    if (taskTemplates.length === 0) {
        return;
    }

    // 為每個模板建立任務（如果該日期還沒有對應的任務）
    let generatedCount = 0;
    taskTemplates.forEach(template => {
        // 檢查該模板是否已在該日期生成過任務（根據 templateId 判斷）
        const existsByTemplateId = tasks.some(t =>
            t.date === dateString &&
            t.fromTemplate === true &&
            t.templateId === template.id
        );

        // 也檢查是否有相同名稱和時間的任務（避免重複）
        const existsByContent = tasks.some(t =>
            t.date === dateString &&
            t.name === template.name &&
            t.startHour === template.startHour &&
            t.endHour === template.endHour
        );

        if (!existsByTemplateId && !existsByContent) {
            const newTaskId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
            tasks.push({
                id: newTaskId,
                name: template.name,
                date: dateString,
                startHour: template.startHour,
                endHour: template.endHour,
                workCategory: getTemplateTypeCategory(template.type), // 根據模板類型自動設定工作性質
                requiredPeople: template.requiredPeople,
                description: template.description || '',
                assignees: [],
                type: template.type, // 任務分類（daily/important/urgent）
                priority: template.type === 'urgent' ? 'high' : (template.type === 'important' ? 'medium' : 'normal'),
                fromTemplate: true, // 標記為來自模板
                templateId: template.id
            });
            generatedCount++;
        }
    });

    if (generatedCount > 0) {
        saveData();
    }
}
