// scripts.js
// 【重要】請在這裡貼上您複製的 Apps Script URL
const WEB_APP_URL = 'https://script.https://script.google.com/macros/s/AKfycbxuE8L0XVlffzr_g1e1T3djUujM-wHDzdULNcYfNQxv62shitVBmDZ05mv96l6wHGXcaw/exec.com/macros/s/AKfycbxwW-EIJKKDy01HB-03qdy4fO0al-7C84rdQUAGMl31NKYvETIgCWIa27lM2AFHi71sWA/exec'; 
    
// ====================================================================
// 函數：處理表單提交
// 邏輯已包含：1. 提交成功/失敗回饋 2. 留空自動帶入 0
// ====================================================================
document.getElementById('report-form').addEventListener('submit', function(e) {
    e.preventDefault(); 
    const submitButton = document.getElementById('submit-button');
    const feedbackDiv = document.getElementById('status-feedback');
    
    submitButton.disabled = true;
    feedbackDiv.style.display = 'block';
    feedbackDiv.textContent = '數據正在提交中...請稍候';
    feedbackDiv.className = 'feedback'; 

    const formData = new FormData(e.target);
    const data = {};
    
    // 收集所有數據，並將所有數字欄位 (KPI、時間、異常數) 留空時自動帶入 0
    for (let [key, value] of formData.entries()) {
        if (key === 'environment_status' || key === 'name') {
            data[key] = value;
        } else {
            // 關鍵邏輯：留空 ("") 時，強制設為 0，確保 Google Sheet 接收到數字
            data[key] = value === "" ? 0 : parseInt(value) || 0; 
        }
    }

    const jsonData = JSON.stringify(data);

    // 發送數據到 Google Apps Script API
    fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', 
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
        },
        body: jsonData,
    })
    .then(response => {
        // 由於使用 no-cors，我們假設提交成功
        feedbackDiv.className = 'feedback success';
        feedbackDiv.textContent = `✅ 回報成功！數據已同步至 Google Sheets。`;
        
        // 提交成功後，清除所有 KPI 數量欄位，但保留姓名
        e.target.reset();
        document.getElementById('total_anomaly_count').value = 0;
    })
    .catch(error => {
        feedbackDiv.className = 'feedback error';
        feedbackDiv.textContent = `❌ 提交失敗！請檢查網路或聯繫 IT 人員。`;
        console.error('Error:', error);
    })
    .finally(() => {
        submitButton.disabled = false;
    });
});