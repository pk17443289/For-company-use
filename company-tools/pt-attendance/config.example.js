// Google Sheets API 設定範本
// 請複製此檔案為 config.js 並填入您的實際設定

const CONFIG = {
    // Google Sheets API 金鑰
    // 取得方式：
    // 1. 前往 https://console.cloud.google.com/
    // 2. 建立新專案或選擇現有專案
    // 3. 啟用 Google Sheets API
    // 4. 建立憑證 → API 金鑰
    API_KEY: 'YOUR_API_KEY_HERE',

    // Google Sheets 試算表 ID
    // 從試算表網址中取得：
    // https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
    SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',

    // 工作表名稱（必須與您的 Google Sheets 中的工作表名稱完全一致）
    SHEETS: {
        EMPLOYEES: '員工資料',      // 員工資料工作表名稱
        ATTENDANCE: '打卡記錄',     // 打卡記錄工作表名稱
        NOTIFICATIONS: '通知設定'   // 通知設定工作表名稱（可選）
    },

    // 即時通知設定（可選功能）
    NOTIFICATION: {
        // 通知類型：'line', 'telegram', 'webhook', 'none'
        // 選擇 'none' 表示不使用通知功能
        TYPE: 'none',

        // ===== LINE Notify 設定 =====
        // 取得方式：
        // 1. 前往 https://notify-bot.line.me/
        // 2. 登入您的 LINE 帳號
        // 3. 點選「發行權杖」
        // 4. 選擇要接收通知的聊天室
        // 5. 複製產生的權杖
        LINE_TOKEN: '',

        // ===== Telegram Bot 設定 =====
        // 取得方式：
        // Bot Token:
        //   1. 在 Telegram 中搜尋 @BotFather
        //   2. 輸入 /newbot 建立新 Bot
        //   3. 按照指示完成設定
        //   4. 複製取得的 Bot Token
        // Chat ID:
        //   1. 在 Telegram 中搜尋 @userinfobot
        //   2. 向它發送任何訊息
        //   3. 複製回傳的 Chat ID
        TELEGRAM_BOT_TOKEN: '',
        TELEGRAM_CHAT_ID: '',

        // ===== 自訂 Webhook 設定 =====
        // 您可以設定自己的 Webhook 接收打卡通知
        // 系統會以 POST 方式傳送 JSON 資料到此網址
        // JSON 格式：
        // {
        //   "employeeId": "員工編號",
        //   "employeeName": "員工姓名",
        //   "department": "部門",
        //   "type": "check_in 或 check_out",
        //   "date": "日期",
        //   "time": "時間",
        //   "timestamp": "ISO 時間戳記"
        // }
        WEBHOOK_URL: ''
    },

    // 上下班時間設定
    WORK_HOURS: {
        // 標準上班時間（24小時制，格式：HH:MM）
        START_TIME: '09:00',

        // 標準下班時間（24小時制，格式：HH:MM）
        END_TIME: '18:00',

        // 遲到容忍時間（分鐘）
        // 例如：設定為 15 表示 09:15 之前打卡都不算遲到
        LATE_THRESHOLD: 15
    }
};

// ===== 設定說明 =====
//
// 1. 複製此檔案：
//    將 config.example.js 複製為 config.js
//
// 2. 填入必要設定：
//    - API_KEY：必填
//    - SPREADSHEET_ID：必填
//    - SHEETS：確認工作表名稱是否正確
//
// 3. 選擇性設定：
//    - NOTIFICATION：如不需要通知功能，TYPE 保持 'none' 即可
//    - WORK_HOURS：可依照實際需求調整
//
// 4. 安全提醒：
//    - 請勿將包含真實資料的 config.js 上傳到公開的版本控制系統
//    - 建議將 config.js 加入 .gitignore
//    - 如需部署到伺服器，請直接在伺服器上建立 config.js
//
// 5. 測試設定：
//    設定完成後，開啟 index.html 測試是否能正常載入員工資料
//
// ===== 疑難排解 =====
//
// 如果遇到問題，請檢查：
// 1. API_KEY 是否正確（沒有多餘的空格）
// 2. SPREADSHEET_ID 是否正確
// 3. Google Sheets 的共用權限是否已開啟
// 4. Google Sheets API 是否已在 Google Cloud Console 中啟用
// 5. 工作表名稱是否與設定完全一致（包括大小寫）
//
// 詳細說明請參考 README.md 和 SHEETS_SETUP.md
