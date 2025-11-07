// ====================================================================
// 任務追蹤儀表板 - JavaScript
// ====================================================================

// 任務數據結構
const TASK_DATA = {
    daily: {
        '早晨例行': [
            '檢查郵件',
            '查看今日待辦事項',
            '晨會準備'
        ],
        '工作進行': [
            '處理優先任務',
            '回覆重要訊息',
            '更新進度報告'
        ],
        '下午事項': [
            '檢視下午行程',
            '準備明日計畫',
            '整理工作環境'
        ]
    },
    monthly: [
        '月度報告準備',
        '團隊會議',
        '專案進度檢討',
        '技能學習目標'
    ]
};

// ====================================================================
// LocalStorage 鍵值
// ====================================================================
const STORAGE_KEY = 'dailyWorkTracker';

// ====================================================================
// 初始化：讀取或建立任務狀態
// ====================================================================
function loadTaskState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        return JSON.parse(saved);
    }

    // 初始化所有任務為未完成狀態
    const state = {
        daily: {},
        monthly: {},
        lastReset: new Date().toDateString()
    };

    // 初始化每日任務
    for (let section in TASK_DATA.daily) {
        state.daily[section] = {};
        TASK_DATA.daily[section].forEach(task => {
            state.daily[section][task] = false;
        });
    }

    // 初始化每月任務
    TASK_DATA.monthly.forEach(task => {
        state.monthly[task] = false;
    });

    return state;
}

// ====================================================================
// 儲存任務狀態
// ====================================================================
function saveTaskState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ====================================================================
// 渲染每日任務區塊
// ====================================================================
function renderDailyTasks(state) {
    const container = document.getElementById('daily-task-sections');
    container.innerHTML = '';

    for (let section in TASK_DATA.daily) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'task-section';

        const sectionTitle = document.createElement('h3');
        sectionTitle.textContent = section;
        sectionDiv.appendChild(sectionTitle);

        const taskList = document.createElement('ul');
        taskList.className = 'task-list';

        TASK_DATA.daily[section].forEach(task => {
            const isCompleted = state.daily[section][task];
            if (!isCompleted) {
                const li = createTaskItem(task, 'daily', section);
                taskList.appendChild(li);
            }
        });

        sectionDiv.appendChild(taskList);
        container.appendChild(sectionDiv);
    }
}

// ====================================================================
// 渲染每月任務
// ====================================================================
function renderMonthlyTasks(state) {
    const container = document.getElementById('monthly-tasks');
    container.innerHTML = '';

    TASK_DATA.monthly.forEach(task => {
        const isCompleted = state.monthly[task];
        if (!isCompleted) {
            const li = createTaskItem(task, 'monthly');
            container.appendChild(li);
        }
    });
}

// ====================================================================
// 渲染已完成任務
// ====================================================================
function renderCompletedTasks(state) {
    const container = document.getElementById('done-tasks');
    container.innerHTML = '';

    // 每日任務已完成
    for (let section in state.daily) {
        for (let task in state.daily[section]) {
            if (state.daily[section][task]) {
                const li = createTaskItem(task, 'daily', section, true);
                container.appendChild(li);
            }
        }
    }

    // 每月任務已完成
    for (let task in state.monthly) {
        if (state.monthly[task]) {
            const li = createTaskItem(task, 'monthly', null, true);
            container.appendChild(li);
        }
    }
}

// ====================================================================
// 建立任務項目元素
// ====================================================================
function createTaskItem(taskName, type, section = null, isCompleted = false) {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (isCompleted) li.classList.add('completed');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isCompleted;
    checkbox.addEventListener('change', () => {
        toggleTaskCompletion(taskName, type, section, checkbox.checked);
    });

    const label = document.createElement('label');
    label.textContent = taskName;

    li.appendChild(checkbox);
    li.appendChild(label);

    return li;
}

// ====================================================================
// 切換任務完成狀態
// ====================================================================
function toggleTaskCompletion(taskName, type, section, isChecked) {
    const state = loadTaskState();

    if (type === 'daily') {
        state.daily[section][taskName] = isChecked;
    } else if (type === 'monthly') {
        state.monthly[taskName] = isChecked;
    }

    saveTaskState(state);
    renderAllTasks();
}

// ====================================================================
// 重置每日任務（保留每月任務）
// ====================================================================
function resetDailyTasks() {
    if (!confirm('確定要重置所有每日任務？此操作無法復原。')) {
        return;
    }

    const state = loadTaskState();

    // 重置每日任務
    for (let section in TASK_DATA.daily) {
        state.daily[section] = {};
        TASK_DATA.daily[section].forEach(task => {
            state.daily[section][task] = false;
        });
    }

    state.lastReset = new Date().toDateString();
    saveTaskState(state);
    renderAllTasks();

    alert('✅ 每日任務已重置！');
}

// ====================================================================
// 渲染所有任務
// ====================================================================
function renderAllTasks() {
    const state = loadTaskState();
    renderDailyTasks(state);
    renderMonthlyTasks(state);
    renderCompletedTasks(state);
}

// ====================================================================
// 頁面載入時初始化
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
    renderAllTasks();
});
