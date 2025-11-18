// Google Sheets API 全域變數
let gapiInited = false;
let sheetsAPI = null;

// 初始化 Google Sheets API
async function initGoogleSheets() {
    return new Promise((resolve, reject) => {
        gapi.load('client', async () => {
            try {
                await gapi.client.init({
                    apiKey: CONFIG.API_KEY,
                    discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                });
                gapiInited = true;
                console.log('Google Sheets API 初始化成功');
                resolve();
            } catch (error) {
                console.error('Google Sheets API 初始化失敗：', error);
                alert('Google Sheets API 初始化失敗，請檢查 config.js 設定');
                reject(error);
            }
        });
    });
}

// ========== 員工管理功能 ==========

// 取得所有員工
async function getAllEmployees() {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: `${CONFIG.SHEETS.EMPLOYEES}!A2:E`,
        });

        const rows = response.result.values || [];
        return rows.map(row => ({
            id: row[0] || '',
            name: row[1] || '',
            department: row[2] || '',
            phone: row[3] || '',
            createdAt: row[4] || ''
        }));
    } catch (error) {
        console.error('取得員工列表失敗：', error);
        throw error;
    }
}

// 根據員工編號取得員工資料
async function getEmployeeById(employeeId) {
    const employees = await getAllEmployees();
    return employees.find(emp => emp.id === employeeId);
}

// 新增員工
async function addEmployee() {
    const name = document.getElementById('employeeName').value.trim();
    const id = document.getElementById('employeeId').value.trim();
    const department = document.getElementById('department').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!name || !id) {
        alert('請填寫員工姓名和編號');
        return;
    }

    try {
        // 檢查員工編號是否已存在
        const existingEmployee = await getEmployeeById(id);
        if (existingEmployee) {
            alert('此員工編號已存在');
            return;
        }

        // 新增到 Google Sheets
        const values = [[id, name, department, phone, new Date().toISOString()]];
        await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: `${CONFIG.SHEETS.EMPLOYEES}!A:E`,
            valueInputOption: 'USER_ENTERED',
            resource: { values }
        });

        alert('員工新增成功！');

        // 清空表單
        document.getElementById('addEmployeeForm').reset();

        // 重新載入員工列表
        await loadEmployees();

        // 顯示 QR Code
        showQRCode(id, name);
    } catch (error) {
        console.error('新增員工失敗：', error);
        alert('新增員工失敗：' + error.message);
    }
}

// 載入員工列表
async function loadEmployees() {
    const listContainer = document.getElementById('employeeList');
    listContainer.innerHTML = '<div class="loading">載入中...</div>';

    try {
        const employees = await getAllEmployees();

        if (employees.length === 0) {
            listContainer.innerHTML = '<div class="no-data">尚無員工資料</div>';
            return;
        }

        listContainer.innerHTML = employees.map(emp => `
            <div class="employee-card">
                <h3>${emp.name}</h3>
                <p><strong>員工編號：</strong>${emp.id}</p>
                <p><strong>部門：</strong>${emp.department || '未設定'}</p>
                <p><strong>電話：</strong>${emp.phone || '未設定'}</p>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="showQRCode('${emp.id}', '${emp.name}')">
                        📱 顯示 QR Code
                    </button>
                    <button class="btn btn-secondary" onclick="deleteEmployee('${emp.id}', '${emp.name}')">
                        🗑️ 刪除
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('載入員工列表失敗：', error);
        listContainer.innerHTML = '<div class="error">載入失敗：' + error.message + '</div>';
    }
}

// 刪除員工
async function deleteEmployee(employeeId, employeeName) {
    if (!confirm(`確定要刪除員工 ${employeeName} (${employeeId}) 嗎？`)) {
        return;
    }

    try {
        // 取得所有員工
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: `${CONFIG.SHEETS.EMPLOYEES}!A:E`,
        });

        const rows = response.result.values || [];
        const rowIndex = rows.findIndex(row => row[0] === employeeId);

        if (rowIndex === -1) {
            alert('找不到此員工');
            return;
        }

        // 刪除該列（使用清空方式）
        await gapi.client.sheets.spreadsheets.values.clear({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: `${CONFIG.SHEETS.EMPLOYEES}!A${rowIndex + 1}:E${rowIndex + 1}`,
        });

        alert('員工刪除成功');
        await loadEmployees();
    } catch (error) {
        console.error('刪除員工失敗：', error);
        alert('刪除員工失敗：' + error.message);
    }
}

// 顯示 QR Code
function showQRCode(employeeId, employeeName) {
    const modal = document.getElementById('qrcodeModal');
    const container = document.getElementById('qrcodeContainer');

    // 清空舊的 QR Code
    container.innerHTML = '';

    // 生成打卡頁面網址
    const attendanceUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}attendance.html?id=${employeeId}`;

    // 生成 QR Code
    new QRCode(container, {
        text: employeeId,
        width: 256,
        height: 256,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });

    document.getElementById('modalEmployeeName').textContent = `${employeeName} (${employeeId})`;
    modal.style.display = 'block';
}

// 下載 QR Code
function downloadQRCode() {
    const canvas = document.querySelector('#qrcodeContainer canvas');
    if (canvas) {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `QRCode_${document.getElementById('modalEmployeeName').textContent}.png`;
        link.href = url;
        link.click();
    }
}

// ========== 打卡記錄功能 ==========

// 儲存打卡記錄
async function saveAttendanceRecord(record) {
    try {
        const values = [[
            record.date,
            record.time,
            record.employeeId,
            record.employeeName,
            record.department,
            record.type,
            record.timestamp
        ]];

        await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: `${CONFIG.SHEETS.ATTENDANCE}!A:G`,
            valueInputOption: 'USER_ENTERED',
            resource: { values }
        });

        console.log('打卡記錄儲存成功');
    } catch (error) {
        console.error('儲存打卡記錄失敗：', error);
        throw error;
    }
}

// 取得所有打卡記錄
async function getAllAttendanceRecords() {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: `${CONFIG.SHEETS.ATTENDANCE}!A2:G`,
        });

        const rows = response.result.values || [];
        return rows.map(row => ({
            date: row[0] || '',
            time: row[1] || '',
            employeeId: row[2] || '',
            employeeName: row[3] || '',
            department: row[4] || '',
            type: row[5] || '',
            timestamp: row[6] || ''
        }));
    } catch (error) {
        console.error('取得打卡記錄失敗：', error);
        throw error;
    }
}

// 取得今日打卡記錄
async function getTodayAttendance(employeeId) {
    try {
        const today = new Date().toLocaleDateString('zh-TW');
        const allRecords = await getAllAttendanceRecords();
        return allRecords.filter(record =>
            record.employeeId === employeeId && record.date === today
        );
    } catch (error) {
        console.error('取得今日打卡記錄失敗：', error);
        return [];
    }
}

// 根據日期取得打卡記錄
async function getAttendanceByDate(date) {
    try {
        const allRecords = await getAllAttendanceRecords();
        return allRecords.filter(record => record.date === date);
    } catch (error) {
        console.error('取得打卡記錄失敗：', error);
        return [];
    }
}

// ========== 通知功能 ==========

// 發送通知
async function sendNotification(record) {
    if (CONFIG.NOTIFICATION.TYPE === 'none') {
        return;
    }

    const typeText = record.type === 'check_in' ? '上班' : '下班';
    const message = `【打卡通知】\n員工：${record.employeeName} (${record.employeeId})\n部門：${record.department}\n類型：${typeText}\n時間：${record.date} ${record.time}`;

    try {
        if (CONFIG.NOTIFICATION.TYPE === 'line') {
            await sendLineNotify(message);
        } else if (CONFIG.NOTIFICATION.TYPE === 'telegram') {
            await sendTelegramNotification(message);
        } else if (CONFIG.NOTIFICATION.TYPE === 'webhook') {
            await sendWebhookNotification(record);
        }
    } catch (error) {
        console.error('發送通知失敗：', error);
    }
}

// LINE Notify
async function sendLineNotify(message) {
    if (!CONFIG.NOTIFICATION.LINE_TOKEN) {
        return;
    }

    const formData = new FormData();
    formData.append('message', message);

    await fetch('https://notify-api.line.me/api/notify', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${CONFIG.NOTIFICATION.LINE_TOKEN}`
        },
        body: formData
    });
}

// Telegram 通知
async function sendTelegramNotification(message) {
    if (!CONFIG.NOTIFICATION.TELEGRAM_BOT_TOKEN || !CONFIG.NOTIFICATION.TELEGRAM_CHAT_ID) {
        return;
    }

    const url = `https://api.telegram.org/bot${CONFIG.NOTIFICATION.TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: CONFIG.NOTIFICATION.TELEGRAM_CHAT_ID,
            text: message
        })
    });
}

// 自訂 Webhook
async function sendWebhookNotification(record) {
    if (!CONFIG.NOTIFICATION.WEBHOOK_URL) {
        return;
    }

    await fetch(CONFIG.NOTIFICATION.WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(record)
    });
}

// ========== 工具函數 ==========

// 判斷是否遲到
function isLate(checkInTime) {
    const startTime = new Date(`2000-01-01 ${CONFIG.WORK_HOURS.START_TIME}`);
    const actualTime = new Date(`2000-01-01 ${checkInTime}`);
    const diffMinutes = (actualTime - startTime) / (1000 * 60);
    return diffMinutes > CONFIG.WORK_HOURS.LATE_THRESHOLD;
}

// 判斷是否早退
function isEarlyLeave(checkOutTime) {
    const endTime = new Date(`2000-01-01 ${CONFIG.WORK_HOURS.END_TIME}`);
    const actualTime = new Date(`2000-01-01 ${checkOutTime}`);
    return actualTime < endTime;
}

// 計算工時
function calculateWorkHours(checkInTime, checkOutTime) {
    const start = new Date(`2000-01-01 ${checkInTime}`);
    const end = new Date(`2000-01-01 ${checkOutTime}`);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.max(0, diffHours).toFixed(2);
}
