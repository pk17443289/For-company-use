# PT 打卡系統

一個基於 Google Sheets 的 PT（兼職）員工打卡管理系統，支援 QR Code 打卡、即時通知、報表匯出等功能。

## ✨ 功能特色

- 📱 **QR Code 打卡** - 為每位員工生成專屬 QR Code，掃描即可打卡
- 👥 **員工管理** - 新增、編輯、刪除員工資料
- ⏰ **上下班打卡** - 支援上班和下班打卡記錄
- 📊 **管理後台** - 查看所有打卡記錄、統計分析
- 🔔 **即時通知** - 支援 LINE Notify、Telegram、自訂 Webhook
- 📥 **報表匯出** - 可匯出 Excel 和 CSV 格式的出勤報表
- 💾 **雲端儲存** - 使用 Google Sheets 儲存資料，無需自建資料庫

## 📁 檔案結構

```
pt-attendance/
├── index.html          # 員工管理頁面
├── attendance.html     # 打卡頁面
├── admin.html          # 管理後台
├── style.css           # 樣式檔案
├── script.js           # 主要功能
├── config.js           # 設定檔案（需自行設定）
└── README.md           # 說明文件
```

## 🚀 快速開始

### 步驟 1：建立 Google Sheets 試算表

1. 前往 [Google Sheets](https://sheets.google.com) 建立新試算表
2. 建立三個工作表，並設定標題列：

**工作表 1：員工資料**
| 員工編號 | 姓名 | 部門 | 電話 | 建立時間 |
|---------|------|------|------|----------|

**工作表 2：打卡記錄**
| 日期 | 時間 | 員工編號 | 員工姓名 | 部門 | 類型 | 時間戳記 |
|------|------|---------|---------|------|------|----------|

**工作表 3：通知設定**（可選）
| 設定項目 | 設定值 |
|---------|--------|

### 步驟 2：取得 Google Sheets API 金鑰

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 **Google Sheets API**：
   - 點選「啟用 API 和服務」
   - 搜尋「Google Sheets API」
   - 點選「啟用」

4. 建立 API 金鑰：
   - 前往「憑證」頁面
   - 點選「建立憑證」→「API 金鑰」
   - 複製產生的 API 金鑰

5. 設定 API 金鑰限制（建議）：
   - 編輯 API 金鑰
   - 應用程式限制：選擇「HTTP 參照網址」
   - 新增您的網站網址
   - API 限制：選擇「限制金鑰」，只選「Google Sheets API」

### 步驟 3：設定試算表權限

1. 開啟您的 Google Sheets 試算表
2. 點選右上角「共用」按鈕
3. 將權限設定為「知道連結的任何人」→「檢視者」
   - 或者設定為「編輯者」如果需要透過 API 寫入

### 步驟 4：設定 config.js

1. 開啟 `config.js` 檔案
2. 填入您的 API 金鑰和試算表 ID：

```javascript
const CONFIG = {
    API_KEY: '您的_API_金鑰',
    SPREADSHEET_ID: '您的_試算表_ID',
    // ... 其他設定
};
```

**如何取得試算表 ID：**
從試算表網址中複製：
```
https://docs.google.com/spreadsheets/d/{這裡就是試算表ID}/edit
```

### 步驟 5：設定即時通知（可選）

#### 使用 LINE Notify

1. 前往 [LINE Notify](https://notify-bot.line.me/)
2. 登入並發行權杖
3. 將權杖填入 `config.js`：

```javascript
NOTIFICATION: {
    TYPE: 'line',
    LINE_TOKEN: '您的_LINE_Token'
}
```

#### 使用 Telegram

1. 向 [@BotFather](https://t.me/botfather) 建立新 Bot
2. 取得 Bot Token
3. 向 [@userinfobot](https://t.me/userinfobot) 取得您的 Chat ID
4. 填入 `config.js`：

```javascript
NOTIFICATION: {
    TYPE: 'telegram',
    TELEGRAM_BOT_TOKEN: '您的_Bot_Token',
    TELEGRAM_CHAT_ID: '您的_Chat_ID'
}
```

### 步驟 6：部署網站

將所有檔案上傳到您的網頁伺服器，或使用以下免費服務：

- **GitHub Pages**（推薦）：免費、簡單、支援 HTTPS
- **Netlify**：免費、自動部署
- **Vercel**：免費、快速部署

## 📖 使用說明

### 員工管理（index.html）

1. 開啟員工管理頁面
2. 填寫員工資料（姓名、編號、部門、電話）
3. 點選「新增員工並生成 QR Code」
4. 系統會顯示該員工的 QR Code
5. 可以下載或列印 QR Code 提供給員工

### 員工打卡（attendance.html）

**方式一：掃描 QR Code**
1. 開啟打卡頁面
2. 點選「開始掃描」
3. 使用相機掃描員工的 QR Code
4. 系統會顯示員工資訊和今日打卡記錄
5. 點選「上班打卡」或「下班打卡」

**方式二：手動輸入**
1. 開啟打卡頁面
2. 在「手動輸入員工編號」欄位輸入員工編號
3. 點選「確認」
4. 點選「上班打卡」或「下班打卡」

### 管理後台（admin.html）

1. 查看即時統計資料：
   - 總員工數
   - 今日已上班人數
   - 今日已下班人數
   - 今日未打卡人數

2. 查詢打卡記錄：
   - 選擇日期、員工、類型進行篩選
   - 點選「查詢」顯示結果

3. 匯出報表：
   - 點選「匯出 Excel」或「匯出 CSV」
   - 下載包含所有篩選結果的報表

4. 查看員工統計：
   - 本月出勤天數
   - 遲到次數
   - 早退次數
   - 未打卡次數

## ⚙️ 進階設定

### 設定上下班時間

在 `config.js` 中修改：

```javascript
WORK_HOURS: {
    START_TIME: '09:00',  // 上班時間
    END_TIME: '18:00',    // 下班時間
    LATE_THRESHOLD: 15    // 遲到容忍分鐘數
}
```

### 自訂工作表名稱

如果您的 Google Sheets 使用不同的工作表名稱，可以在 `config.js` 中修改：

```javascript
SHEETS: {
    EMPLOYEES: '您的員工資料工作表名稱',
    ATTENDANCE: '您的打卡記錄工作表名稱',
    NOTIFICATIONS: '您的通知設定工作表名稱'
}
```

## 🔒 安全性建議

1. **保護 config.js**
   - 不要將包含真實 API 金鑰的 `config.js` 上傳到公開的版本控制系統
   - 建議建立 `config.example.js` 作為範本

2. **限制 API 金鑰**
   - 在 Google Cloud Console 中設定 API 金鑰的使用限制
   - 限制只能從特定網域使用

3. **設定試算表權限**
   - 不要將試算表設為「任何人都可以編輯」
   - 使用 Service Account 以獲得更好的安全性（進階）

## 🐛 常見問題

**Q: 為什麼無法載入員工資料？**
A: 請檢查：
- `config.js` 中的 API_KEY 和 SPREADSHEET_ID 是否正確
- Google Sheets 的共用權限是否已開啟
- 工作表名稱是否與設定一致

**Q: 打卡後沒有記錄？**
A: 請確認：
- Google Sheets API 是否已啟用
- 試算表權限是否設為「編輯者」
- 檢查瀏覽器 Console 是否有錯誤訊息

**Q: QR Code 掃描器無法啟動？**
A: 請檢查：
- 瀏覽器是否允許相機權限
- 網站是否使用 HTTPS（相機權限需要）
- 嘗試使用不同的瀏覽器

**Q: 通知沒有收到？**
A: 請確認：
- `config.js` 中的通知設定是否正確
- LINE Token 或 Telegram Token 是否有效
- 檢查瀏覽器 Console 的錯誤訊息

## 📱 瀏覽器支援

- Chrome / Edge（推薦）
- Firefox
- Safari
- 行動裝置瀏覽器

## 🎨 客製化

您可以輕鬆修改 `style.css` 來客製化系統外觀：

- 修改顏色主題（`:root` 中的 CSS 變數）
- 調整字體大小
- 更改按鈕樣式
- 自訂卡片陰影和圓角

## 📄 授權

本專案供個人和商業使用。

## 🤝 支援與回饋

如有問題或建議，歡迎聯繫開發者。

---

**提示**：首次使用建議先在測試環境中設定並測試所有功能，確認正常後再正式使用。
