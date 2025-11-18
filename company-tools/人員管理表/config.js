// 配置文件
// 如需使用 Google Sheets 同步功能，請參考 config.example.js 和 SHEETS_SETUP.md

const CONFIG = {
    // 本地模式（預設）
    USE_LOCAL_STORAGE: true,

    // 如果要使用 Google Sheets，請填寫以下資訊
    API_KEY: '',
    SPREADSHEET_ID: '',

    SHEETS: {
        PERSONNEL: '人員資料',
        TASKS: '任務列表',
        HISTORY: '歷史記錄'
    }
};
