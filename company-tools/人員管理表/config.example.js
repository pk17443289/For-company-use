// Google Sheets API 配置範例
// 複製此檔案為 config.js 並填入你的 API 金鑰和試算表 ID

const CONFIG = {
    // Google Sheets API 金鑰（從 Google Cloud Console 取得）
    API_KEY: 'YOUR_API_KEY_HERE',

    // Google 試算表 ID（從試算表網址取得）
    SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',

    // 工作表名稱
    SHEETS: {
        PERSONNEL: '人員資料',
        TASKS: '任務列表',
        HISTORY: '歷史記錄'
    }
};

// Google Sheets API 同步功能（進階）
async function syncWithGoogleSheets() {
    if (!CONFIG.API_KEY || CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
        console.warn('尚未設定 Google Sheets API 金鑰');
        return;
    }

    try {
        // 載入 Google Sheets API
        await loadGoogleSheetsAPI();

        // 同步人員資料
        await syncPersonnel();

        // 同步任務資料
        await syncTasks();

        // 同步歷史記錄
        await syncHistory();

        alert('同步成功！');
    } catch (error) {
        console.error('同步失敗:', error);
        alert('同步失敗：' + error.message);
    }
}

async function loadGoogleSheetsAPI() {
    return new Promise((resolve, reject) => {
        if (typeof gapi !== 'undefined' && gapi.client) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
            gapi.load('client', async () => {
                await gapi.client.init({
                    apiKey: CONFIG.API_KEY,
                    discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
                });
                resolve();
            });
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function syncPersonnel() {
    // 讀取試算表資料
    const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        range: `${CONFIG.SHEETS.PERSONNEL}!A2:D`
    });

    const rows = response.result.values || [];
    if (rows.length === 0) {
        // 如果試算表是空的，將本地資料寫入
        await writePersonnelToSheets();
        return;
    }

    // 更新本地資料
    personnel = rows.map((row, index) => ({
        id: parseInt(row[0]) || index + 1,
        name: row[1] || '',
        rank: parseInt(row[2]) || 1,
        contact: row[3] || ''
    }));

    saveData();
    renderPersonnelList();
}

async function writePersonnelToSheets() {
    const values = personnel.map(p => [p.id, p.name, p.rank, p.contact]);

    await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        range: `${CONFIG.SHEETS.PERSONNEL}!A2`,
        valueInputOption: 'RAW',
        resource: { values }
    });
}

async function syncTasks() {
    const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        range: `${CONFIG.SHEETS.TASKS}!A2:G`
    });

    const rows = response.result.values || [];
    if (rows.length === 0) {
        await writeTasksToSheets();
        return;
    }

    tasks = rows.map((row, index) => ({
        id: parseInt(row[0]) || index + 1,
        name: row[1] || '',
        type: row[2] || 'daily',
        startHour: parseInt(row[3]) || 0,
        endHour: parseInt(row[4]) || 0,
        assignee: row[5] ? parseInt(row[5]) : null,
        description: row[6] || ''
    }));

    saveData();
    renderTaskList();
    renderScheduleGrid();
}

async function writeTasksToSheets() {
    const values = tasks.map(t => [
        t.id,
        t.name,
        t.type,
        t.startHour,
        t.endHour,
        t.assignee || '',
        t.description || ''
    ]);

    await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        range: `${CONFIG.SHEETS.TASKS}!A2`,
        valueInputOption: 'RAW',
        resource: { values }
    });
}

async function syncHistory() {
    // 只寫入歷史記錄，不讀取
    const values = history.slice(0, 50).map(h => [
        new Date(h.timestamp).toLocaleString('zh-TW'),
        h.action
    ]);

    await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        range: `${CONFIG.SHEETS.HISTORY}!A2`,
        valueInputOption: 'RAW',
        resource: { values }
    });
}
