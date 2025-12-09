// ===== 杰特企業耗材盤點表 - Google Apps Script =====
// 這個程式碼要貼到 Google Apps Script 中

// 設定你的試算表 ID（從試算表網址中取得）
// 例如：https://docs.google.com/spreadsheets/d/1ABC123XYZ/edit
// 試算表 ID 就是 1ABC123XYZ
const SPREADSHEET_ID = '你的試算表ID';

// 處理 GET 請求（讀取上次盤點資料）
function doGet(e) {
  const action = e.parameter.action;

  if (action === 'getLastInventory') {
    return getLastInventory();
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: '未知的操作'
  })).setMimeType(ContentService.MimeType.JSON);
}

// 處理 POST 請求（提交盤點資料）
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'submitInventory') {
      return submitInventory(data);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: '未知的操作'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 讀取上次盤點資料
function getLastInventory() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('最新庫存');

    if (!sheet) {
      // 如果工作表不存在，建立它
      createSheets();
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: {},
        message: '首次使用，已建立工作表'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const lastInventory = {};

    // 跳過標題行（第一行）
    for (let i = 1; i < data.length; i++) {
      const itemKey = data[i][0];  // A欄：項目鍵值
      const status = data[i][3];   // D欄：狀態

      if (itemKey && status !== '') {
        lastInventory[itemKey] = status;
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: lastInventory
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 提交盤點資料
function submitInventory(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // 確保工作表存在
    let historySheet = ss.getSheetByName('盤點記錄');
    let latestSheet = ss.getSheetByName('最新庫存');

    if (!historySheet || !latestSheet) {
      createSheets();
      historySheet = ss.getSheetByName('盤點記錄');
      latestSheet = ss.getSheetByName('最新庫存');
    }

    const timestamp = new Date();
    const date = data.date;
    const person = data.person;
    const items = data.items;

    // 1. 寫入盤點記錄
    items.forEach(item => {
      historySheet.appendRow([
        timestamp,
        date,
        person,
        item.category,
        item.itemName,
        item.status,
        item.itemKey
      ]);
    });

    // 2. 更新最新庫存
    // 先清空工作表（保留標題）
    if (latestSheet.getLastRow() > 1) {
      latestSheet.deleteRows(2, latestSheet.getLastRow() - 1);
    }

    // 寫入最新資料
    items.forEach(item => {
      latestSheet.appendRow([
        item.itemKey,
        item.category,
        item.itemName,
        item.status,
        date,
        person,
        timestamp
      ]);
    });

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: '盤點資料已成功儲存'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 建立工作表（首次使用時）
function createSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 建立「盤點記錄」工作表
  let historySheet = ss.getSheetByName('盤點記錄');
  if (!historySheet) {
    historySheet = ss.insertSheet('盤點記錄');
    historySheet.appendRow([
      '提交時間',
      '盤點日期',
      '盤點人員',
      '分類',
      '項目名稱',
      '狀態',
      '項目鍵值'
    ]);

    // 設定標題格式
    const headerRange = historySheet.getRange(1, 1, 1, 7);
    headerRange.setBackground('#1976D2');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');

    // 凍結標題行
    historySheet.setFrozenRows(1);

    // 自動調整欄寬
    historySheet.autoResizeColumns(1, 7);
  }

  // 建立「最新庫存」工作表
  let latestSheet = ss.getSheetByName('最新庫存');
  if (!latestSheet) {
    latestSheet = ss.insertSheet('最新庫存');
    latestSheet.appendRow([
      '項目鍵值',
      '分類',
      '項目名稱',
      '狀態',
      '盤點日期',
      '盤點人員',
      '更新時間'
    ]);

    // 設定標題格式
    const headerRange = latestSheet.getRange(1, 1, 1, 7);
    headerRange.setBackground('#1976D2');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');

    // 凍結標題行
    latestSheet.setFrozenRows(1);

    // 自動調整欄寬
    latestSheet.autoResizeColumns(1, 7);
  }
}
