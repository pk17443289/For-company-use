/**
 * 耗材盤點表 - Google Apps Script
 *
 * 使用方式：
 * 1. 建立一個新的 Google Sheets
 * 2. 點選「擴充功能」>「Apps Script」
 * 3. 將此程式碼貼上並儲存
 * 4. 點選「部署」>「新增部署作業」
 * 5. 選擇「網頁應用程式」
 * 6. 設定：
 *    - 執行身分：我
 *    - 誰可以存取：任何人
 * 7. 部署後複製網址，貼到 script.js 的 GOOGLE_SCRIPT_URL
 */

// ===== 設定區 =====
// 試算表會自動使用綁定的試算表，不需要手動設定 ID

// ===== 主要函數 =====

/**
 * 處理 GET 請求（取得上次盤點資料）
 */
function doGet(e) {
  try {
    const action = e.parameter ? e.parameter.action : null;

    if (action === 'getLastInventory') {
      return getLastInventory();
    }

    // 如果有 POST 資料透過 GET 傳來（備用方案）
    if (e.parameter && e.parameter.data) {
      const data = JSON.parse(e.parameter.data);
      if (data.action === 'submitInventory') {
        return submitInventory(data);
      }
    }

    // 沒有指定 action，回傳說明
    return createJsonResponse({
      success: false,
      error: '請指定 action 參數',
      availableActions: ['getLastInventory'],
      receivedParams: e.parameter ? Object.keys(e.parameter) : []
    });

  } catch (error) {
    return createJsonResponse({ success: false, error: 'doGet 錯誤: ' + error.toString() });
  }
}

/**
 * 處理 POST 請求（提交盤點資料）
 */
function doPost(e) {
  try {
    let data;

    // 嘗試從 postData.contents 解析（支援多種格式）
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseError) {
        // 如果直接解析失敗，嘗試 URL decode
        try {
          data = JSON.parse(decodeURIComponent(e.postData.contents));
        } catch (decodeError) {
          return createJsonResponse({ success: false, error: '無法解析 POST 資料: ' + parseError.toString() });
        }
      }
    }
    // 嘗試從 parameter 解析
    else if (e.parameter && e.parameter.data) {
      data = JSON.parse(e.parameter.data);
    }
    else {
      // 記錄收到的原始資料以便除錯
      const debugInfo = {
        hasPostData: !!e.postData,
        postDataType: e.postData ? e.postData.type : 'none',
        hasParameter: !!e.parameter,
        parameterKeys: e.parameter ? Object.keys(e.parameter) : []
      };
      return createJsonResponse({ success: false, error: '無法解析請求資料', debug: debugInfo });
    }

    const action = data.action;

    if (action === 'submitInventory') {
      return submitInventory(data);
    }

    return createJsonResponse({ success: false, error: '未知的操作: ' + action });

  } catch (error) {
    return createJsonResponse({ success: false, error: '處理請求時發生錯誤: ' + error.toString() });
  }
}

/**
 * 建立 JSON 回應（統一處理 CORS）
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 取得上次盤點資料
 */
function getLastInventory() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (!ss) {
      return createJsonResponse({ success: false, error: '無法取得試算表，請確認 Apps Script 已綁定到試算表' });
    }

    let sheet = ss.getSheetByName('最新狀態');

    // 如果工作表不存在，建立它
    if (!sheet) {
      sheet = ss.insertSheet('最新狀態');
      sheet.getRange('A1:C1').setValues([['項目Key', '狀態', '更新時間']]);
      sheet.getRange('A1:C1').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const data = sheet.getDataRange().getValues();
    const result = {};

    // 跳過標題列
    for (let i = 1; i < data.length; i++) {
      const itemKey = data[i][0];
      const status = data[i][1];
      if (itemKey && status) {
        result[itemKey] = status;
      }
    }

    return createJsonResponse({ success: true, data: result, itemCount: Object.keys(result).length });
  } catch (error) {
    return createJsonResponse({ success: false, error: 'getLastInventory 錯誤: ' + error.toString() });
  }
}

/**
 * 提交盤點資料
 */
function submitInventory(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const date = data.date;
  const person = data.person;
  const items = data.items;
  const latestInventory = data.latestInventory;
  const timestamp = new Date();

  // 1. 記錄到「盤點歷史」工作表
  let historySheet = ss.getSheetByName('盤點歷史');
  if (!historySheet) {
    historySheet = ss.insertSheet('盤點歷史');
    historySheet.getRange('A1:F1').setValues([['時間戳記', '盤點日期', '盤點人員', '分類', '項目名稱', '狀態']]);
    historySheet.getRange('A1:F1').setFontWeight('bold');
    historySheet.setFrozenRows(1);
  }

  // 準備歷史資料
  const historyRows = items.map(item => [
    timestamp,
    date,
    person,
    item.category,
    item.itemName,
    item.status
  ]);

  // 批次寫入歷史資料
  if (historyRows.length > 0) {
    const lastRow = historySheet.getLastRow();
    historySheet.getRange(lastRow + 1, 1, historyRows.length, 6).setValues(historyRows);
  }

  // 2. 更新「最新狀態」工作表
  let statusSheet = ss.getSheetByName('最新狀態');
  if (!statusSheet) {
    statusSheet = ss.insertSheet('最新狀態');
    statusSheet.getRange('A1:C1').setValues([['項目Key', '狀態', '更新時間']]);
    statusSheet.getRange('A1:C1').setFontWeight('bold');
    statusSheet.setFrozenRows(1);
  }

  // 取得現有資料
  const existingData = statusSheet.getDataRange().getValues();
  const existingMap = {};
  for (let i = 1; i < existingData.length; i++) {
    existingMap[existingData[i][0]] = i + 1; // 記錄行號
  }

  // 更新或新增狀態
  for (const itemKey in latestInventory) {
    const status = latestInventory[itemKey];

    if (existingMap[itemKey]) {
      // 更新現有行
      const rowNum = existingMap[itemKey];
      statusSheet.getRange(rowNum, 2, 1, 2).setValues([[status, timestamp]]);
    } else {
      // 新增行
      statusSheet.appendRow([itemKey, status, timestamp]);
    }
  }

  // 3. 記錄到「盤點摘要」工作表（每次盤點一筆摘要）
  let summarySheet = ss.getSheetByName('盤點摘要');
  if (!summarySheet) {
    summarySheet = ss.insertSheet('盤點摘要');
    summarySheet.getRange('A1:H1').setValues([['時間戳記', '盤點日期', '盤點人員', '總項目', '要叫貨', '不用叫貨', '補貨中', '已補貨']]);
    summarySheet.getRange('A1:H1').setFontWeight('bold');
    summarySheet.setFrozenRows(1);
  }

  // 統計各狀態數量
  let needOrder = 0, noNeed = 0, replenishing = 0, replenished = 0;
  items.forEach(item => {
    switch (item.status) {
      case '要叫貨': needOrder++; break;
      case '不用叫貨': noNeed++; break;
      case '補貨中': replenishing++; break;
      case '已補貨': replenished++; break;
    }
  });

  summarySheet.appendRow([
    timestamp,
    date,
    person,
    items.length,
    needOrder,
    noNeed,
    replenishing,
    replenished
  ]);

  // 4. 更新「待採購」工作表（追蹤採購狀態）
  let purchaseSheet = ss.getSheetByName('待採購');
  const expectedHeaders = ['加入時間', '盤點日期', '盤點人員', '分類', '項目名稱', '狀態', '更新時間'];

  if (!purchaseSheet) {
    // 建立新工作表
    purchaseSheet = ss.insertSheet('待採購');
    purchaseSheet.getRange('A1:G1').setValues([expectedHeaders]);
    purchaseSheet.getRange('A1:G1').setFontWeight('bold');
    purchaseSheet.setFrozenRows(1);
  } else {
    // 檢查並修復標題列
    const currentHeaders = purchaseSheet.getRange('A1:G1').getValues()[0];
    const firstHeader = currentHeaders[0] ? currentHeaders[0].toString() : '';

    // 如果第一格不是「加入時間」，表示標題列有問題，重新設定
    if (firstHeader !== '加入時間') {
      purchaseSheet.getRange('A1:G1').setValues([expectedHeaders]);
      purchaseSheet.getRange('A1:G1').setFontWeight('bold');
      purchaseSheet.setFrozenRows(1);
    }
    // 如果舊版只有5欄，補上新欄位
    else if (!currentHeaders[5] || currentHeaders[5] !== '狀態') {
      purchaseSheet.getRange('F1:G1').setValues([['狀態', '更新時間']]);
      purchaseSheet.getRange('F1:G1').setFontWeight('bold');
    }
  }

  // 取得現有待採購資料（從第2行開始，跳過標題）
  const lastRow = purchaseSheet.getLastRow();
  const purchaseMap = {}; // key -> 行號

  if (lastRow > 1) {
    const purchaseData = purchaseSheet.getRange(2, 1, lastRow - 1, 7).getValues();
    for (let i = 0; i < purchaseData.length; i++) {
      const category = purchaseData[i][3]; // 分類在第4欄
      const itemName = purchaseData[i][4]; // 項目名稱在第5欄
      const status = purchaseData[i][5];   // 狀態在第6欄

      // 只追蹤尚未完成的項目
      if (category && itemName && status !== '已補貨') {
        const key = category + '-' + itemName;
        purchaseMap[key] = i + 2; // 行號（1-based，從第2行開始）
      }
    }
  }

  // 處理每個項目
  items.forEach(item => {
    const key = item.category + '-' + item.itemName;
    const existingRow = purchaseMap[key];

    if (item.status === '要叫貨') {
      // 新增要叫貨的項目（如果不存在）
      if (!existingRow) {
        purchaseSheet.appendRow([
          timestamp,
          date,
          person,
          item.category,
          item.itemName,
          '待採購',
          timestamp
        ]);
      }
    } else if (item.status === '補貨中') {
      // 更新為補貨中
      if (existingRow) {
        purchaseSheet.getRange(existingRow, 6, 1, 2).setValues([['補貨中', timestamp]]);
      }
    } else if (item.status === '已補貨') {
      // 更新為已補貨
      if (existingRow) {
        purchaseSheet.getRange(existingRow, 6, 1, 2).setValues([['已補貨', timestamp]]);
      }
    }
  });

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: '盤點資料已儲存' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 初始化試算表（手動執行一次即可）
 */
function initializeSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 建立「最新狀態」工作表
  let statusSheet = ss.getSheetByName('最新狀態');
  if (!statusSheet) {
    statusSheet = ss.insertSheet('最新狀態');
    statusSheet.getRange('A1:C1').setValues([['項目Key', '狀態', '更新時間']]);
    statusSheet.getRange('A1:C1').setFontWeight('bold');
    statusSheet.setFrozenRows(1);
    statusSheet.setColumnWidth(1, 150);
    statusSheet.setColumnWidth(2, 100);
    statusSheet.setColumnWidth(3, 180);
  }

  // 建立「盤點歷史」工作表
  let historySheet = ss.getSheetByName('盤點歷史');
  if (!historySheet) {
    historySheet = ss.insertSheet('盤點歷史');
    historySheet.getRange('A1:F1').setValues([['時間戳記', '盤點日期', '盤點人員', '分類', '項目名稱', '狀態']]);
    historySheet.getRange('A1:F1').setFontWeight('bold');
    historySheet.setFrozenRows(1);
  }

  // 建立「盤點摘要」工作表
  let summarySheet = ss.getSheetByName('盤點摘要');
  if (!summarySheet) {
    summarySheet = ss.insertSheet('盤點摘要');
    summarySheet.getRange('A1:H1').setValues([['時間戳記', '盤點日期', '盤點人員', '總項目', '要叫貨', '不用叫貨', '補貨中', '已補貨']]);
    summarySheet.getRange('A1:H1').setFontWeight('bold');
    summarySheet.setFrozenRows(1);
  }

  // 建立「待採購」工作表
  let purchaseSheet = ss.getSheetByName('待採購');
  if (!purchaseSheet) {
    purchaseSheet = ss.insertSheet('待採購');
    purchaseSheet.getRange('A1:G1').setValues([['加入時間', '盤點日期', '盤點人員', '分類', '項目名稱', '狀態', '更新時間']]);
    purchaseSheet.getRange('A1:G1').setFontWeight('bold');
    purchaseSheet.setFrozenRows(1);
    purchaseSheet.setColumnWidth(6, 80);
    purchaseSheet.setColumnWidth(7, 150);
  } else {
    // 舊版升級：確保有狀態和更新時間欄位
    const headers = purchaseSheet.getRange(1, 1, 1, 7).getValues()[0];
    if (!headers[5] || headers[5] !== '狀態') {
      purchaseSheet.getRange('F1').setValue('狀態');
      purchaseSheet.getRange('G1').setValue('更新時間');
      purchaseSheet.getRange('F1:G1').setFontWeight('bold');
    }
  }

  // 刪除預設的 Sheet1（如果存在且是空的）
  const sheet1 = ss.getSheetByName('工作表1');
  if (sheet1 && sheet1.getLastRow() === 0) {
    ss.deleteSheet(sheet1);
  }

  SpreadsheetApp.getUi().alert('初始化完成！已建立所有需要的工作表。');
}

/**
 * 建立選單（試算表開啟時自動執行）
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('耗材盤點')
    .addItem('初始化工作表', 'initializeSpreadsheet')
    .addItem('清空待採購清單', 'clearPurchaseList')
    .addToUi();
}

/**
 * 清空待採購清單（採購完成後使用）
 */
function clearPurchaseList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const purchaseSheet = ss.getSheetByName('待採購');

  if (!purchaseSheet) {
    SpreadsheetApp.getUi().alert('找不到「待採購」工作表');
    return;
  }

  const lastRow = purchaseSheet.getLastRow();
  if (lastRow > 1) {
    purchaseSheet.deleteRows(2, lastRow - 1);
    SpreadsheetApp.getUi().alert('待採購清單已清空！');
  } else {
    SpreadsheetApp.getUi().alert('待採購清單是空的');
  }
}
