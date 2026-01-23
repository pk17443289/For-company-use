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
 * 處理 GET 請求（取得上次盤點資料、待採購清單、統計數據等）
 */
function doGet(e) {
  try {
    const action = e.parameter ? e.parameter.action : null;

    if (action === 'getLastInventory') {
      return getLastInventory();
    }

    if (action === 'getPurchaseList') {
      return getPurchaseList();
    }

    if (action === 'getStatistics') {
      return getStatistics();
    }

    if (action === 'getReplenishHistory') {
      return getReplenishHistory(e.parameter.itemKey);
    }

    if (action === 'getDisabledItems') {
      return getDisabledItems();
    }

    if (action === 'getInventoryItems') {
      return getInventoryItems();
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
      availableActions: ['getLastInventory', 'getPurchaseList', 'getStatistics', 'getReplenishHistory'],
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

    if (action === 'updatePurchaseStatus') {
      return updatePurchaseStatus(data);
    }

    if (action === 'markAbnormal') {
      return markAbnormal(data);
    }

    if (action === 'removeItem') {
      return removeItem(data);
    }

    if (action === 'cancelPurchase') {
      return cancelPurchase(data);
    }

    if (action === 'initInventoryItems') {
      return initInventoryItems(data);
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

  // 取得有效項目清單（用於清理孤兒資料）
  const validItemKeys = data.validItemKeys || [];
  const validKeySet = new Set(validItemKeys);

  // 取得現有資料
  const existingData = statusSheet.getDataRange().getValues();
  const existingMap = {};
  const rowsToDelete = []; // 記錄要刪除的孤兒資料行號

  for (let i = 1; i < existingData.length; i++) {
    const itemKey = existingData[i][0];
    existingMap[itemKey] = i + 1; // 記錄行號

    // 如果這個項目不在有效清單中，標記為要刪除
    if (validItemKeys.length > 0 && itemKey && !validKeySet.has(itemKey)) {
      rowsToDelete.push(i + 1);
    }
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

  // 刪除孤兒資料（從後面開始刪，避免行號錯亂）
  if (rowsToDelete.length > 0) {
    rowsToDelete.sort((a, b) => b - a); // 降序排列
    rowsToDelete.forEach(rowNum => {
      statusSheet.deleteRow(rowNum);
    });
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

  // 4. 更新「待採購」工作表（追蹤採購狀態，包含完整時間追蹤）
  let purchaseSheet = ss.getSheetByName('待採購');
  const expectedHeaders = ['項目Key', '分類', '項目名稱', '狀態', '叫貨時間', '補貨中時間', '已補貨時間', '盤點人員', '補貨天數', '異常', '異常開始時間', '異常總天數'];

  if (!purchaseSheet) {
    // 建立新工作表
    purchaseSheet = ss.insertSheet('待採購');
    purchaseSheet.getRange('A1:L1').setValues([expectedHeaders]);
    purchaseSheet.getRange('A1:L1').setFontWeight('bold');
    purchaseSheet.setFrozenRows(1);
  } else {
    // 檢查標題列是否為新格式
    const currentHeaders = purchaseSheet.getRange('A1:I1').getValues()[0];
    const firstHeader = currentHeaders[0] ? currentHeaders[0].toString() : '';

    // 如果不是新格式，重建標題（舊資料會保留但欄位可能對不上）
    if (firstHeader !== '項目Key') {
      // 備份舊資料到「待採購_舊版備份」
      const oldLastRow = purchaseSheet.getLastRow();
      if (oldLastRow > 1) {
        let backupSheet = ss.getSheetByName('待採購_舊版備份');
        if (!backupSheet) {
          backupSheet = ss.insertSheet('待採購_舊版備份');
        }
        const oldData = purchaseSheet.getDataRange().getValues();
        backupSheet.getRange(1, 1, oldData.length, oldData[0].length).setValues(oldData);
      }
      // 清空並重建
      purchaseSheet.clear();
      purchaseSheet.getRange('A1:I1').setValues([expectedHeaders]);
      purchaseSheet.getRange('A1:I1').setFontWeight('bold');
      purchaseSheet.setFrozenRows(1);
    }
  }

  // 取得現有待採購資料（從第2行開始，跳過標題）
  const purchaseLastRow = purchaseSheet.getLastRow();
  const purchaseMap = {}; // itemKey -> { row: 行號, status: 狀態 }

  if (purchaseLastRow > 1) {
    const purchaseData = purchaseSheet.getRange(2, 1, purchaseLastRow - 1, 9).getValues();
    for (let i = 0; i < purchaseData.length; i++) {
      const itemKey = purchaseData[i][0];   // 項目Key 在第1欄
      const status = purchaseData[i][3];    // 狀態在第4欄

      // 只追蹤「待採購」和「補貨中」的項目（未完成的）
      if (itemKey && (status === '待採購' || status === '補貨中')) {
        purchaseMap[itemKey] = {
          row: i + 2,  // 行號（1-based，從第2行開始）
          status: status
        };
      }
    }
  }

  // 處理每個項目
  items.forEach(item => {
    const itemKey = item.itemKey || item.itemName;  // 使用 itemKey，若無則用 itemName
    const existing = purchaseMap[itemKey];

    if (item.status === '要叫貨') {
      // 新增要叫貨的項目
      // 無論之前是否有「已補貨」的記錄，都新增一筆新的（代表新的採購週期）
      if (!existing) {
        purchaseSheet.appendRow([
          itemKey,
          item.category,
          item.itemName,
          '待採購',
          timestamp,  // 叫貨時間
          '',         // 補貨中時間（尚未）
          '',         // 已補貨時間（尚未）
          person,
          ''          // 補貨天數（完成後計算）
        ]);
        // 更新 purchaseMap 以便後續處理
        purchaseMap[itemKey] = {
          row: purchaseSheet.getLastRow(),
          status: '待採購'
        };
      }
    } else if (item.status === '補貨中') {
      // 更新為補貨中，記錄補貨中時間
      if (existing && existing.status === '待採購') {
        purchaseSheet.getRange(existing.row, 4).setValue('補貨中');  // 狀態
        purchaseSheet.getRange(existing.row, 6).setValue(timestamp); // 補貨中時間
        existing.status = '補貨中';
      }
    } else if (item.status === '已補貨') {
      // 更新為已補貨，記錄已補貨時間並計算補貨天數
      if (existing && (existing.status === '待採購' || existing.status === '補貨中')) {
        const rowData = purchaseSheet.getRange(existing.row, 1, 1, 9).getValues()[0];
        const orderTime = rowData[4];  // 叫貨時間

        // 計算補貨天數
        let replenishDays = '';
        if (orderTime) {
          const orderDate = new Date(orderTime);
          const completedDate = new Date(timestamp);
          const diffTime = Math.abs(completedDate - orderDate);
          replenishDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        purchaseSheet.getRange(existing.row, 4).setValue('已補貨');   // 狀態
        purchaseSheet.getRange(existing.row, 7).setValue(timestamp);  // 已補貨時間
        purchaseSheet.getRange(existing.row, 9).setValue(replenishDays); // 補貨天數

        // 如果之前沒有記錄補貨中時間，補上
        if (!rowData[5]) {
          purchaseSheet.getRange(existing.row, 6).setValue(timestamp);
        }
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

  // 建立「待採購」工作表（新版：包含完整時間追蹤）
  let purchaseSheet = ss.getSheetByName('待採購');
  const purchaseHeaders = ['項目Key', '分類', '項目名稱', '狀態', '叫貨時間', '補貨中時間', '已補貨時間', '盤點人員', '補貨天數'];

  if (!purchaseSheet) {
    purchaseSheet = ss.insertSheet('待採購');
    purchaseSheet.getRange('A1:I1').setValues([purchaseHeaders]);
    purchaseSheet.getRange('A1:I1').setFontWeight('bold');
    purchaseSheet.setFrozenRows(1);
    purchaseSheet.setColumnWidth(1, 120);
    purchaseSheet.setColumnWidth(2, 100);
    purchaseSheet.setColumnWidth(3, 150);
    purchaseSheet.setColumnWidth(4, 80);
    purchaseSheet.setColumnWidth(5, 150);
    purchaseSheet.setColumnWidth(6, 150);
    purchaseSheet.setColumnWidth(7, 150);
    purchaseSheet.setColumnWidth(8, 80);
    purchaseSheet.setColumnWidth(9, 80);
  } else {
    // 檢查是否為舊版格式，如果是則提示升級
    const headers = purchaseSheet.getRange(1, 1, 1, 1).getValues()[0];
    if (headers[0] !== '項目Key') {
      SpreadsheetApp.getUi().alert('注意：待採購工作表使用舊格式。\n\n下次提交盤點資料時會自動升級（舊資料會備份到「待採購_舊版備份」）。');
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
    .addItem('🔧 修復：從歷史記錄補回待採購', 'repairPurchaseListFromHistory')
    .addToUi();
}

/**
 * 修復函數：指定日期，把那天所有「要叫貨」的項目補到待採購表
 */
function repairPurchaseListFromHistory() {
  const ui = SpreadsheetApp.getUi();

  // 讓用戶輸入要修復的日期
  const response = ui.prompt(
    '修復待採購清單',
    '請輸入要補回的盤點日期（格式：YYYY-MM-DD，例如 2025-01-21）：\n\n會把那天所有「要叫貨」的項目補到待採購清單。',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const targetDate = response.getResponseText().trim();
  if (!targetDate || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
    ui.alert('日期格式不正確，請使用 YYYY-MM-DD 格式（例如 2025-01-21）');
    return;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 取得盤點歷史
  const historySheet = ss.getSheetByName('盤點歷史');
  if (!historySheet) {
    ui.alert('找不到「盤點歷史」工作表');
    return;
  }

  // 取得或建立待採購表（新格式）
  let purchaseSheet = ss.getSheetByName('待採購');
  const expectedHeaders = ['項目Key', '分類', '項目名稱', '狀態', '叫貨時間', '補貨中時間', '已補貨時間', '盤點人員', '補貨天數'];

  if (!purchaseSheet) {
    purchaseSheet = ss.insertSheet('待採購');
    purchaseSheet.getRange('A1:I1').setValues([expectedHeaders]);
    purchaseSheet.getRange('A1:I1').setFontWeight('bold');
    purchaseSheet.setFrozenRows(1);
  } else {
    // 檢查是否為新格式，如果不是就先升級
    const firstHeader = purchaseSheet.getRange('A1').getValue();
    if (firstHeader !== '項目Key') {
      // 備份舊資料
      const oldLastRow = purchaseSheet.getLastRow();
      if (oldLastRow > 0) {
        let backupSheet = ss.getSheetByName('待採購_舊版備份');
        if (!backupSheet) {
          backupSheet = ss.insertSheet('待採購_舊版備份');
        }
        const oldData = purchaseSheet.getDataRange().getValues();
        backupSheet.getRange(1, 1, oldData.length, oldData[0].length).setValues(oldData);
      }
      // 清空並重建
      purchaseSheet.clear();
      purchaseSheet.getRange('A1:I1').setValues([expectedHeaders]);
      purchaseSheet.getRange('A1:I1').setFontWeight('bold');
      purchaseSheet.setFrozenRows(1);
    }
  }

  // 取得歷史資料
  const historyLastRow = historySheet.getLastRow();
  if (historyLastRow <= 1) {
    ui.alert('盤點歷史是空的');
    return;
  }

  const historyData = historySheet.getRange(2, 1, historyLastRow - 1, 6).getValues();
  // 格式：[時間戳記, 盤點日期, 盤點人員, 分類, 項目名稱, 狀態]

  // 先取得待採購表中已存在的「待採購」和「補貨中」項目
  const existingPendingItems = new Set();
  const purchaseLastRow = purchaseSheet.getLastRow();

  if (purchaseLastRow > 1) {
    const purchaseData = purchaseSheet.getRange(2, 1, purchaseLastRow - 1, 4).getValues();
    purchaseData.forEach(row => {
      const itemKey = row[0];
      const status = row[3];
      // 只記錄「待採購」和「補貨中」的項目
      if (itemKey && (status === '待採購' || status === '補貨中')) {
        existingPendingItems.add(itemKey);
      }
    });
  }

  // 找出指定日期所有「要叫貨」的項目
  const toAdd = [];
  const skipped = [];  // 跳過的項目（已存在）

  historyData.forEach(row => {
    const timestamp = row[0];
    const date = row[1];  // 盤點日期
    const person = row[2];
    const category = row[3];
    const itemName = row[4];
    const status = row[5];

    if (!itemName) return;

    // 檢查日期是否匹配
    let dateStr = '';
    if (date instanceof Date) {
      dateStr = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    } else if (typeof date === 'string') {
      dateStr = date;
    }

    // 如果是指定日期且狀態是「要叫貨」
    if (dateStr === targetDate && status === '要叫貨') {
      // 檢查是否已經在待採購表中（且狀態是待採購或補貨中）
      if (existingPendingItems.has(itemName)) {
        skipped.push(itemName);
      } else {
        toAdd.push({
          itemKey: itemName,
          category: category,
          itemName: itemName,
          status: '待採購',
          orderTime: timestamp,
          person: person
        });
        // 加入 Set 避免同一天重複
        existingPendingItems.add(itemName);
      }
    }
  });

  if (toAdd.length === 0 && skipped.length === 0) {
    ui.alert(`在 ${targetDate} 沒有找到「要叫貨」的項目。\n\n請確認日期是否正確。`);
    return;
  }

  if (toAdd.length === 0) {
    ui.alert(`在 ${targetDate} 找到 ${skipped.length} 個「要叫貨」項目，但都已在待採購清單中（待採購或補貨中狀態）。\n\n跳過的項目：\n${skipped.map(i => '• ' + i).join('\n')}`);
    return;
  }

  // 批次寫入
  const rows = toAdd.map(item => [
    item.itemKey,
    item.category,
    item.itemName,
    item.status,
    item.orderTime,  // 叫貨時間
    '',              // 補貨中時間
    '',              // 已補貨時間
    item.person,
    ''               // 補貨天數
  ]);

  purchaseSheet.getRange(purchaseSheet.getLastRow() + 1, 1, rows.length, 9).setValues(rows);

  let message = `✅ 修復完成！\n\n已將 ${targetDate} 的 ${toAdd.length} 個「要叫貨」項目補到待採購清單：\n\n${toAdd.map(i => '• ' + i.itemName).join('\n')}`;

  if (skipped.length > 0) {
    message += `\n\n⚠️ 以下 ${skipped.length} 個項目已在待採購清單中，已跳過：\n${skipped.map(i => '• ' + i).join('\n')}`;
  }

  ui.alert(message);
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

/**
 * 取得待採購清單（給前端採購追蹤頁面使用）
 */
function getPurchaseList() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const purchaseSheet = ss.getSheetByName('待採購');

    if (!purchaseSheet) {
      return createJsonResponse({ success: true, data: [] });
    }

    const lastRow = purchaseSheet.getLastRow();
    if (lastRow <= 1) {
      return createJsonResponse({ success: true, data: [] });
    }

    const data = purchaseSheet.getRange(2, 1, lastRow - 1, 13).getValues();
    const result = [];

    data.forEach((row, index) => {
      const itemKey = row[0];
      const status = row[3];
      const isAbnormal = row[9] === '異常' || row[9] === true;

      // 回傳未完成的項目（待採購、補貨中）和異常項目
      if (itemKey && (status === '待採購' || status === '補貨中' || isAbnormal)) {
        result.push({
          row: index + 2,
          itemKey: itemKey,
          category: row[1],
          itemName: row[2],
          status: status,
          orderTime: row[4] ? new Date(row[4]).toISOString() : null,
          replenishingTime: row[5] ? new Date(row[5]).toISOString() : null,
          completedTime: row[6] ? new Date(row[6]).toISOString() : null,
          person: row[7],
          replenishDays: row[8],
          isAbnormal: isAbnormal,
          abnormalStartTime: row[10] ? new Date(row[10]).toISOString() : null,
          abnormalTotalDays: row[11] || 0,
          abnormalReason: row[12] || ''
        });
      }
    });

    return createJsonResponse({ success: true, data: result });
  } catch (error) {
    return createJsonResponse({ success: false, error: 'getPurchaseList 錯誤: ' + error.toString() });
  }
}

/**
 * 更新採購狀態（給採購人員標記已到貨使用）
 */
function updatePurchaseStatus(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const purchaseSheet = ss.getSheetByName('待採購');

    if (!purchaseSheet) {
      return createJsonResponse({ success: false, error: '找不到待採購工作表' });
    }

    const itemKey = data.itemKey;
    const newStatus = data.status;  // '補貨中' 或 '已補貨'
    const person = data.person || '';
    const timestamp = new Date();

    // 找到該項目
    const lastRow = purchaseSheet.getLastRow();
    if (lastRow <= 1) {
      return createJsonResponse({ success: false, error: '待採購清單是空的' });
    }

    const purchaseData = purchaseSheet.getRange(2, 1, lastRow - 1, 9).getValues();
    let targetRow = -1;

    for (let i = 0; i < purchaseData.length; i++) {
      const rowItemKey = purchaseData[i][0];
      const rowStatus = purchaseData[i][3];

      // 找到對應的項目（且狀態是待採購或補貨中）
      if (rowItemKey === itemKey && (rowStatus === '待採購' || rowStatus === '補貨中')) {
        targetRow = i + 2;
        break;
      }
    }

    if (targetRow === -1) {
      return createJsonResponse({ success: false, error: '找不到該項目或項目已完成' });
    }

    // 更新狀態
    if (newStatus === '補貨中') {
      purchaseSheet.getRange(targetRow, 4).setValue('補貨中');
      purchaseSheet.getRange(targetRow, 6).setValue(timestamp);  // 補貨中時間
    } else if (newStatus === '已補貨' || newStatus === '已到貨') {
      const rowData = purchaseSheet.getRange(targetRow, 1, 1, 9).getValues()[0];
      const orderTime = rowData[4];

      // 計算補貨天數
      let replenishDays = '';
      if (orderTime) {
        const orderDate = new Date(orderTime);
        const diffTime = Math.abs(timestamp - orderDate);
        replenishDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      purchaseSheet.getRange(targetRow, 4).setValue('已補貨');
      purchaseSheet.getRange(targetRow, 7).setValue(timestamp);  // 已補貨時間
      purchaseSheet.getRange(targetRow, 9).setValue(replenishDays);

      // 如果沒有補貨中時間，補上
      if (!rowData[5]) {
        purchaseSheet.getRange(targetRow, 6).setValue(timestamp);
      }
    }

    // 同時更新「最新狀態」工作表
    let statusSheet = ss.getSheetByName('最新狀態');
    if (statusSheet) {
      const statusData = statusSheet.getDataRange().getValues();
      for (let i = 1; i < statusData.length; i++) {
        if (statusData[i][0] === itemKey) {
          const newStatusValue = (newStatus === '已補貨' || newStatus === '已到貨') ? '不用叫貨' : newStatus;
          statusSheet.getRange(i + 1, 2, 1, 2).setValues([[newStatusValue, timestamp]]);
          break;
        }
      }
    }

    return createJsonResponse({ success: true, message: '狀態已更新' });
  } catch (error) {
    return createJsonResponse({ success: false, error: 'updatePurchaseStatus 錯誤: ' + error.toString() });
  }
}

/**
 * 標記/取消標記項目為異常（需刪除考慮）
 */
function markAbnormal(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const purchaseSheet = ss.getSheetByName('待採購');

    if (!purchaseSheet) {
      return createJsonResponse({ success: false, error: '找不到待採購工作表' });
    }

    const itemKey = data.itemKey;
    const markAsAbnormal = data.markAsAbnormal;  // true = 標記異常, false = 取消異常
    const reason = data.reason || '';  // 異常原因
    const timestamp = new Date();

    // 找到該項目
    const lastRow = purchaseSheet.getLastRow();
    if (lastRow <= 1) {
      return createJsonResponse({ success: false, error: '待採購清單是空的' });
    }

    // 檢查是否有新欄位，如果沒有就新增
    const headers = purchaseSheet.getRange(1, 1, 1, 13).getValues()[0];
    if (headers[9] !== '異常') {
      purchaseSheet.getRange(1, 10).setValue('異常');
      purchaseSheet.getRange(1, 10).setFontWeight('bold');
    }
    if (headers[10] !== '異常開始時間') {
      purchaseSheet.getRange(1, 11).setValue('異常開始時間');
      purchaseSheet.getRange(1, 11).setFontWeight('bold');
    }
    if (headers[11] !== '異常總天數') {
      purchaseSheet.getRange(1, 12).setValue('異常總天數');
      purchaseSheet.getRange(1, 12).setFontWeight('bold');
    }
    if (headers[12] !== '異常原因') {
      purchaseSheet.getRange(1, 13).setValue('異常原因');
      purchaseSheet.getRange(1, 13).setFontWeight('bold');
    }

    const purchaseData = purchaseSheet.getRange(2, 1, lastRow - 1, 12).getValues();
    let targetRow = -1;
    let rowData = null;

    for (let i = 0; i < purchaseData.length; i++) {
      const rowItemKey = purchaseData[i][0];
      const rowStatus = purchaseData[i][3];
      const rowIsAbnormal = purchaseData[i][9] === '異常';

      // 找到對應的項目（待採購、補貨中，或已標記異常）
      if (rowItemKey === itemKey && (rowStatus === '待採購' || rowStatus === '補貨中' || rowIsAbnormal)) {
        targetRow = i + 2;
        rowData = purchaseData[i];
        break;
      }
    }

    if (targetRow === -1) {
      return createJsonResponse({ success: false, error: '找不到該項目' });
    }

    // 更新異常狀態
    if (markAsAbnormal) {
      // 標記異常：記錄異常開始時間和原因
      purchaseSheet.getRange(targetRow, 10).setValue('異常');
      purchaseSheet.getRange(targetRow, 11).setValue(timestamp);  // 異常開始時間
      purchaseSheet.getRange(targetRow, 13).setValue(reason);     // 異常原因
    } else {
      // 取消異常：計算這次異常的天數，累加到異常總天數
      const abnormalStartTime = rowData[10];  // 異常開始時間
      const previousAbnormalDays = rowData[11] || 0;  // 之前累計的異常天數

      let thisAbnormalDays = 0;
      if (abnormalStartTime) {
        const startDate = new Date(abnormalStartTime);
        const diffTime = Math.abs(timestamp - startDate);
        thisAbnormalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      const totalAbnormalDays = previousAbnormalDays + thisAbnormalDays;

      purchaseSheet.getRange(targetRow, 10).setValue('');  // 清除異常標記
      purchaseSheet.getRange(targetRow, 11).setValue('');  // 清除異常開始時間
      purchaseSheet.getRange(targetRow, 12).setValue(totalAbnormalDays);  // 更新異常總天數
      purchaseSheet.getRange(targetRow, 13).setValue('');  // 清除異常原因
    }

    // 記錄到「異常記錄」工作表
    let abnormalSheet = ss.getSheetByName('異常記錄');
    if (!abnormalSheet) {
      abnormalSheet = ss.insertSheet('異常記錄');
      abnormalSheet.getRange('A1:E1').setValues([['時間', '項目Key', '操作', '原因', '備註']]);
      abnormalSheet.getRange('A1:E1').setFontWeight('bold');
      abnormalSheet.setFrozenRows(1);
    }

    abnormalSheet.appendRow([
      timestamp,
      itemKey,
      markAsAbnormal ? '標記異常' : '取消異常',
      reason,
      ''
    ]);

    return createJsonResponse({
      success: true,
      message: markAsAbnormal ? '已標記為異常' : '已取消異常標記'
    });
  } catch (error) {
    return createJsonResponse({ success: false, error: 'markAbnormal 錯誤: ' + error.toString() });
  }
}

/**
 * 移除項目（確認不需要這個項目，從清單中永久移除）
 * 資料會保留在工作表中，狀態改為「已移除」，方便日後查詢歷史
 */
function removeItem(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const purchaseSheet = ss.getSheetByName('待採購');

    if (!purchaseSheet) {
      return createJsonResponse({ success: false, error: '找不到待採購工作表' });
    }

    const itemKey = data.itemKey;
    const reason = data.reason || '未填寫原因';
    const person = data.person || '未知';
    const timestamp = new Date();

    // 找到該項目
    const lastRow = purchaseSheet.getLastRow();
    if (lastRow <= 1) {
      return createJsonResponse({ success: false, error: '待採購清單是空的' });
    }

    // 檢查是否有「移除人員」和「移除原因」欄位，如果沒有就新增
    const headers = purchaseSheet.getRange(1, 1, 1, 16).getValues()[0];
    if (headers[13] !== '移除人員') {
      purchaseSheet.getRange(1, 14).setValue('移除人員');
      purchaseSheet.getRange(1, 14).setFontWeight('bold');
    }
    if (headers[14] !== '移除原因') {
      purchaseSheet.getRange(1, 15).setValue('移除原因');
      purchaseSheet.getRange(1, 15).setFontWeight('bold');
    }
    if (headers[15] !== '移除時間') {
      purchaseSheet.getRange(1, 16).setValue('移除時間');
      purchaseSheet.getRange(1, 16).setFontWeight('bold');
    }

    const purchaseData = purchaseSheet.getRange(2, 1, lastRow - 1, 12).getValues();
    let targetRow = -1;
    let rowData = null;

    for (let i = 0; i < purchaseData.length; i++) {
      const rowItemKey = purchaseData[i][0];
      const rowStatus = purchaseData[i][3];
      const rowIsAbnormal = purchaseData[i][9] === '異常';

      // 找到對應的項目（待採購、補貨中，或異常狀態）
      if (rowItemKey === itemKey && (rowStatus === '待採購' || rowStatus === '補貨中' || rowIsAbnormal)) {
        targetRow = i + 2;
        rowData = purchaseData[i];
        break;
      }
    }

    if (targetRow === -1) {
      return createJsonResponse({ success: false, error: '找不到該項目' });
    }

    // 將狀態改為「已移除」，並記錄移除資訊
    purchaseSheet.getRange(targetRow, 4).setValue('已移除');
    purchaseSheet.getRange(targetRow, 14).setValue(person);     // 移除人員
    purchaseSheet.getRange(targetRow, 15).setValue(reason);     // 移除原因
    purchaseSheet.getRange(targetRow, 16).setValue(timestamp);  // 移除時間
    // 清除異常標記
    purchaseSheet.getRange(targetRow, 10).setValue('');
    purchaseSheet.getRange(targetRow, 11).setValue('');
    purchaseSheet.getRange(targetRow, 13).setValue('');

    // 記錄到「異常記錄」工作表（保留完整操作歷史）
    let abnormalSheet = ss.getSheetByName('異常記錄');
    if (!abnormalSheet) {
      abnormalSheet = ss.insertSheet('異常記錄');
      abnormalSheet.getRange('A1:F1').setValues([['時間', '項目Key', '操作', '原因', '操作人員', '備註']]);
      abnormalSheet.getRange('A1:F1').setFontWeight('bold');
      abnormalSheet.setFrozenRows(1);
    } else {
      // 檢查是否有「操作人員」欄位
      const abnormalHeaders = abnormalSheet.getRange(1, 1, 1, 6).getValues()[0];
      if (abnormalHeaders[4] !== '操作人員') {
        abnormalSheet.getRange(1, 5).setValue('操作人員');
        abnormalSheet.getRange(1, 5).setFontWeight('bold');
      }
      if (abnormalHeaders[5] !== '備註') {
        abnormalSheet.getRange(1, 6).setValue('備註');
        abnormalSheet.getRange(1, 6).setFontWeight('bold');
      }
    }

    abnormalSheet.appendRow([
      timestamp,
      itemKey,
      '確認移除',
      reason,
      person,
      ''
    ]);

    // 同時更新「最新狀態」工作表
    let statusSheet = ss.getSheetByName('最新狀態');
    if (statusSheet) {
      const statusData = statusSheet.getDataRange().getValues();
      for (let i = 1; i < statusData.length; i++) {
        if (statusData[i][0] === itemKey) {
          statusSheet.getRange(i + 1, 2, 1, 2).setValues([['不用叫貨', timestamp]]);
          break;
        }
      }
    }

    // 同時從「項目清單」工作表刪除該項目
    const deleteResult = deleteInventoryItem(itemKey);
    const inventoryDeleted = deleteResult.success;

    return createJsonResponse({
      success: true,
      message: '項目已移除',
      inventoryDeleted: inventoryDeleted
    });
  } catch (error) {
    return createJsonResponse({ success: false, error: 'removeItem 錯誤: ' + error.toString() });
  }
}

/**
 * 取消本次採購（規則設定問題，不需要實際採購）
 * 資料會保留，狀態改為「已取消」，補貨天數不記錄
 */
function cancelPurchase(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const purchaseSheet = ss.getSheetByName('待採購');

    if (!purchaseSheet) {
      return createJsonResponse({ success: false, error: '找不到待採購工作表' });
    }

    const itemKey = data.itemKey;
    const reason = data.reason || '規則調整';
    const person = data.person || '未知';
    const timestamp = new Date();

    // 找到該項目
    const lastRow = purchaseSheet.getLastRow();
    if (lastRow <= 1) {
      return createJsonResponse({ success: false, error: '待採購清單是空的' });
    }

    // 檢查是否有「取消人員」和「取消原因」欄位，如果沒有就新增
    const headers = purchaseSheet.getRange(1, 1, 1, 19).getValues()[0];
    if (headers[16] !== '取消人員') {
      purchaseSheet.getRange(1, 17).setValue('取消人員');
      purchaseSheet.getRange(1, 17).setFontWeight('bold');
    }
    if (headers[17] !== '取消原因') {
      purchaseSheet.getRange(1, 18).setValue('取消原因');
      purchaseSheet.getRange(1, 18).setFontWeight('bold');
    }
    if (headers[18] !== '取消時間') {
      purchaseSheet.getRange(1, 19).setValue('取消時間');
      purchaseSheet.getRange(1, 19).setFontWeight('bold');
    }

    const purchaseData = purchaseSheet.getRange(2, 1, lastRow - 1, 12).getValues();
    let targetRow = -1;

    for (let i = 0; i < purchaseData.length; i++) {
      const rowItemKey = purchaseData[i][0];
      const rowStatus = purchaseData[i][3];

      // 找到對應的項目（待採購或補貨中）
      if (rowItemKey === itemKey && (rowStatus === '待採購' || rowStatus === '補貨中')) {
        targetRow = i + 2;
        break;
      }
    }

    if (targetRow === -1) {
      return createJsonResponse({ success: false, error: '找不到該項目' });
    }

    // 將狀態改為「已取消」，並記錄取消資訊
    purchaseSheet.getRange(targetRow, 4).setValue('已取消');
    purchaseSheet.getRange(targetRow, 17).setValue(person);     // 取消人員
    purchaseSheet.getRange(targetRow, 18).setValue(reason);     // 取消原因
    purchaseSheet.getRange(targetRow, 19).setValue(timestamp);  // 取消時間
    // 補貨天數不記錄（保持空白）

    // 記錄到「異常記錄」工作表（保留完整操作歷史）
    let abnormalSheet = ss.getSheetByName('異常記錄');
    if (!abnormalSheet) {
      abnormalSheet = ss.insertSheet('異常記錄');
      abnormalSheet.getRange('A1:F1').setValues([['時間', '項目Key', '操作', '原因', '操作人員', '備註']]);
      abnormalSheet.getRange('A1:F1').setFontWeight('bold');
      abnormalSheet.setFrozenRows(1);
    }

    abnormalSheet.appendRow([
      timestamp,
      itemKey,
      '取消採購',
      reason,
      person,
      '規則設定問題'
    ]);

    // 同時更新「最新狀態」工作表為「不用叫貨」
    let statusSheet = ss.getSheetByName('最新狀態');
    if (statusSheet) {
      const statusData = statusSheet.getDataRange().getValues();
      for (let i = 1; i < statusData.length; i++) {
        if (statusData[i][0] === itemKey) {
          statusSheet.getRange(i + 1, 2, 1, 2).setValues([['不用叫貨', timestamp]]);
          break;
        }
      }
    }

    return createJsonResponse({
      success: true,
      message: '已取消本次採購'
    });
  } catch (error) {
    return createJsonResponse({ success: false, error: 'cancelPurchase 錯誤: ' + error.toString() });
  }
}

/**
 * 取得統計數據（包含補貨週期計算和建議頻率）
 *
 * 建議頻率邏輯：
 * - 基於「叫貨間隔」（多久需要叫一次貨）來判斷消耗速度
 * - 叫貨間隔短（≤7天）= 消耗快 → 建議每日盤點
 * - 叫貨間隔中（8-30天）= 消耗中等 → 建議每週盤點
 * - 叫貨間隔長（>30天）= 消耗慢 → 建議每月盤點
 */
function getStatistics() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const purchaseSheet = ss.getSheetByName('待採購');

    if (!purchaseSheet) {
      return createJsonResponse({ success: true, data: { items: [], summary: {} } });
    }

    const lastRow = purchaseSheet.getLastRow();
    if (lastRow <= 1) {
      return createJsonResponse({ success: true, data: { items: [], summary: {} } });
    }

    const data = purchaseSheet.getRange(2, 1, lastRow - 1, 12).getValues();

    // 統計每個項目的補貨數據
    const itemStats = {};

    // 先找出所有已移除的項目
    const removedItems = new Set();
    data.forEach(row => {
      if (row[3] === '已移除') {
        removedItems.add(row[0]);
      }
    });

    data.forEach(row => {
      const itemKey = row[0];
      const status = row[3];
      const orderTime = row[4];  // 叫貨時間
      const replenishDays = row[8];
      const isAbnormal = row[9] === '異常' || row[9] === true;
      const abnormalTotalDays = row[11] || 0;

      // 跳過空項目和已移除的項目
      if (!itemKey) return;
      if (removedItems.has(itemKey)) return;

      if (!itemStats[itemKey]) {
        itemStats[itemKey] = {
          itemKey: itemKey,
          category: row[1],
          itemName: row[2],
          totalOrders: 0,
          completedOrders: 0,
          totalReplenishDays: 0,
          replenishDaysList: [],
          orderTimeList: [],  // 新增：記錄所有叫貨時間
          currentStatus: null,
          lastOrderTime: null,
          isAbnormal: false,
          abnormalTotalDays: 0
        };
      }

      itemStats[itemKey].totalOrders++;

      // 記錄叫貨時間（用於計算叫貨間隔）
      if (orderTime) {
        itemStats[itemKey].orderTimeList.push(new Date(orderTime));
      }

      if (status === '已補貨' && replenishDays) {
        itemStats[itemKey].completedOrders++;
        itemStats[itemKey].totalReplenishDays += replenishDays;
        itemStats[itemKey].replenishDaysList.push(replenishDays);
      }

      if (status === '待採購' || status === '補貨中') {
        itemStats[itemKey].currentStatus = status;
        itemStats[itemKey].lastOrderTime = orderTime ? new Date(orderTime).toISOString() : null;
      }

      // 更新異常狀態（取最新的記錄）
      if (isAbnormal) {
        itemStats[itemKey].isAbnormal = true;
        itemStats[itemKey].currentStatus = '異常';
      }
      if (abnormalTotalDays > itemStats[itemKey].abnormalTotalDays) {
        itemStats[itemKey].abnormalTotalDays = abnormalTotalDays;
      }
    });

    // 計算平均補貨天數、叫貨間隔和建議頻率
    const result = [];
    let totalItems = 0;
    let dailyCount = 0;
    let weeklyCount = 0;
    let monthlyCount = 0;
    let abnormalCount = 0;
    let totalAbnormalDays = 0;

    for (const itemKey in itemStats) {
      const stats = itemStats[itemKey];
      let avgReplenishDays = null;
      let avgOrderInterval = null;  // 新增：平均叫貨間隔
      let suggestedFrequency = null;  // 只有當有足夠數據時才設定，否則用項目清單的設定

      // 統計異常
      if (stats.isAbnormal) {
        abnormalCount++;
        totalAbnormalDays += stats.abnormalTotalDays || 0;
        // 異常項目不計入頻率統計，直接跳過
        totalItems++;
        result.push({
          ...stats,
          avgReplenishDays: null,
          avgOrderInterval: null,
          suggestedFrequency: null  // 異常項目使用項目清單的設定
        });
        continue;
      }
      totalAbnormalDays += stats.abnormalTotalDays || 0;

      // 計算平均補貨天數（從叫貨到收貨）
      if (stats.completedOrders > 0) {
        avgReplenishDays = Math.round(stats.totalReplenishDays / stats.completedOrders * 10) / 10;
      }

      // 計算平均叫貨間隔（每兩次叫貨之間的天數）
      if (stats.orderTimeList.length >= 2) {
        // 按時間排序
        stats.orderTimeList.sort((a, b) => a - b);

        let totalInterval = 0;
        let intervalCount = 0;

        for (let i = 1; i < stats.orderTimeList.length; i++) {
          const diffTime = stats.orderTimeList[i] - stats.orderTimeList[i - 1];
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          totalInterval += diffDays;
          intervalCount++;
        }

        if (intervalCount > 0) {
          avgOrderInterval = Math.round(totalInterval / intervalCount * 10) / 10;
        }
      }

      // 根據叫貨間隔建議盤點頻率
      // 條件：「平均補貨天數」和「平均叫貨間隔」都有值，且至少有 3 次完整補貨記錄
      // 否則使用項目清單中的手動設定
      if (avgOrderInterval !== null && avgReplenishDays !== null && stats.completedOrders >= 3) {
        // 有足夠的補貨週期數據（3次以上），根據叫貨間隔建議頻率
        if (avgOrderInterval <= 7) {
          // 每週或更短就要叫一次 → 消耗很快，每日盤點
          suggestedFrequency = 'daily';
          dailyCount++;
        } else if (avgOrderInterval <= 30) {
          // 1個月內會叫貨 → 每週盤點
          suggestedFrequency = 'weekly';
          weeklyCount++;
        } else {
          // 超過1個月才叫一次 → 每月盤點就夠
          suggestedFrequency = 'monthly';
          monthlyCount++;
        }
      }
      // 數據不足（少於3次完整補貨）時，suggestedFrequency 保持為 null，前端會使用項目清單的手動設定

      totalItems++;

      result.push({
        ...stats,
        avgReplenishDays: avgReplenishDays,
        avgOrderInterval: avgOrderInterval,  // 新增：平均叫貨間隔
        suggestedFrequency: suggestedFrequency
      });
    }

    return createJsonResponse({
      success: true,
      data: {
        items: result,
        summary: {
          totalItems: totalItems,
          dailyCount: dailyCount,
          weeklyCount: weeklyCount,
          monthlyCount: monthlyCount,
          abnormalCount: abnormalCount,
          totalAbnormalDays: totalAbnormalDays
        }
      }
    });
  } catch (error) {
    return createJsonResponse({ success: false, error: 'getStatistics 錯誤: ' + error.toString() });
  }
}

/**
 * 取得被停用（標記異常或已移除）的項目清單
 */
function getDisabledItems() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const purchaseSheet = ss.getSheetByName('待採購');

    if (!purchaseSheet) {
      return createJsonResponse({ success: true, data: [] });
    }

    const lastRow = purchaseSheet.getLastRow();
    if (lastRow <= 1) {
      return createJsonResponse({ success: true, data: [] });
    }

    const data = purchaseSheet.getRange(2, 1, lastRow - 1, 10).getValues();
    const disabledItems = [];
    const addedKeys = new Set();  // 避免重複

    data.forEach(row => {
      const itemKey = row[0];
      const status = row[3];
      const isAbnormal = row[9] === '異常' || row[9] === true;

      // 回傳被標記異常或已移除的項目
      if (itemKey && !addedKeys.has(itemKey) && (isAbnormal || status === '已移除')) {
        disabledItems.push({
          itemKey: itemKey,
          category: row[1],
          itemName: row[2],
          reason: status === '已移除' ? '已移除' : '異常'
        });
        addedKeys.add(itemKey);
      }
    });

    return createJsonResponse({ success: true, data: disabledItems });
  } catch (error) {
    return createJsonResponse({ success: false, error: 'getDisabledItems 錯誤: ' + error.toString() });
  }
}

/**
 * 取得特定項目的補貨歷史
 */
function getReplenishHistory(itemKey) {
  try {
    if (!itemKey) {
      return createJsonResponse({ success: false, error: '請指定 itemKey 參數' });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const purchaseSheet = ss.getSheetByName('待採購');

    if (!purchaseSheet) {
      return createJsonResponse({ success: true, data: [] });
    }

    const lastRow = purchaseSheet.getLastRow();
    if (lastRow <= 1) {
      return createJsonResponse({ success: true, data: [] });
    }

    const data = purchaseSheet.getRange(2, 1, lastRow - 1, 9).getValues();
    const result = [];

    data.forEach(row => {
      if (row[0] === itemKey) {
        result.push({
          itemKey: row[0],
          category: row[1],
          itemName: row[2],
          status: row[3],
          orderTime: row[4] ? new Date(row[4]).toISOString() : null,
          replenishingTime: row[5] ? new Date(row[5]).toISOString() : null,
          completedTime: row[6] ? new Date(row[6]).toISOString() : null,
          person: row[7],
          replenishDays: row[8]
        });
      }
    });

    return createJsonResponse({ success: true, data: result });
  } catch (error) {
    return createJsonResponse({ success: false, error: 'getReplenishHistory 錯誤: ' + error.toString() });
  }
}

/**
 * 取得盤點項目清單
 * 從「項目清單」工作表讀取所有盤點項目
 */
function getInventoryItems() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('項目清單');

    // 如果工作表不存在，回傳空資料（前端會使用預設項目）
    if (!sheet) {
      return createJsonResponse({
        success: true,
        data: null,
        message: '項目清單工作表不存在，請先初始化'
      });
    }

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return createJsonResponse({
        success: true,
        data: {},
        message: '項目清單是空的'
      });
    }

    // 讀取所有資料（跳過標題列）
    // 欄位：分類 | 名稱 | 閾值說明 | 單位 | 警告數量 | 盤點頻率
    const data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();

    // 轉換成前端需要的格式
    const inventoryData = {};

    data.forEach(row => {
      const category = row[0];
      const name = row[1];
      const threshold = row[2] || '';
      const unit = row[3] || '';
      const warningValue = row[4] === '' ? null : row[4];
      const frequency = row[5] || 'weekly';

      if (!category || !name) return;

      if (!inventoryData[category]) {
        inventoryData[category] = [];
      }

      inventoryData[category].push({
        name: name,
        threshold: threshold,
        unit: unit,
        warningValue: warningValue,
        frequency: frequency
      });
    });

    return createJsonResponse({ success: true, data: inventoryData });
  } catch (error) {
    return createJsonResponse({ success: false, error: 'getInventoryItems 錯誤: ' + error.toString() });
  }
}

/**
 * 初始化盤點項目清單
 * 將前端傳來的項目資料寫入「項目清單」工作表
 */
function initInventoryItems(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('項目清單');

    // 如果工作表已存在，詢問是否覆蓋
    if (sheet) {
      // 清空現有資料（保留標題）
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
    } else {
      // 創建新工作表
      sheet = ss.insertSheet('項目清單');
      // 設定標題列
      sheet.getRange('A1:F1').setValues([['分類', '名稱', '閾值說明', '單位', '警告數量', '盤點頻率']]);
      sheet.getRange('A1:F1').setFontWeight('bold');
      sheet.setFrozenRows(1);
      // 設定欄寬
      sheet.setColumnWidth(1, 120);
      sheet.setColumnWidth(2, 200);
      sheet.setColumnWidth(3, 200);
      sheet.setColumnWidth(4, 60);
      sheet.setColumnWidth(5, 80);
      sheet.setColumnWidth(6, 80);
    }

    // 寫入項目資料
    const items = data.items;
    const rows = [];

    for (const category in items) {
      items[category].forEach(item => {
        rows.push([
          category,
          item.name,
          item.threshold || '',
          item.unit || '',
          item.warningValue === null ? '' : item.warningValue,
          item.frequency || 'weekly'
        ]);
      });
    }

    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, 6).setValues(rows);
    }

    return createJsonResponse({
      success: true,
      message: '已初始化 ' + rows.length + ' 個項目'
    });
  } catch (error) {
    return createJsonResponse({ success: false, error: 'initInventoryItems 錯誤: ' + error.toString() });
  }
}

/**
 * 從項目清單中刪除指定項目
 */
function deleteInventoryItem(itemKey) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('項目清單');

    if (!sheet) {
      return { success: false, error: '項目清單工作表不存在' };
    }

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: false, error: '項目清單是空的' };
    }

    // 讀取所有資料找到要刪除的項目
    const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();

    for (let i = 0; i < data.length; i++) {
      const name = data[i][1];
      if (name === itemKey) {
        // 刪除該列
        sheet.deleteRow(i + 2);
        return { success: true, message: '已從項目清單刪除: ' + itemKey };
      }
    }

    return { success: false, error: '找不到項目: ' + itemKey };
  } catch (error) {
    return { success: false, error: 'deleteInventoryItem 錯誤: ' + error.toString() };
  }
}
