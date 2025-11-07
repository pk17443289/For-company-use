// ===== Google Apps Script - 倉庫工時回報系統 v3.0 =====
// 請將此程式碼複製到 Google Sheets 的 Apps Script 編輯器中
//
// 資料結構更新：每個工作項目包含 quantity（數量）和 time（時間）兩個欄位
// 例如：{ morning: {quantity: 5, time: 30} }

// 【重要】請將下面的試算表 ID 替換成你自己的
// 試算表 ID 可以從網址中取得：https://docs.google.com/spreadsheets/d/【這裡就是 ID】/edit
const SPREADSHEET_ID = '1FaDcmTD04n4QI3_l8GmAxlxh5Cf6f0nsCaj7HrLepEA'; // 請替換成你的試算表 ID

// 主要處理函數
function doPost(e) {
  try {
    // 取得指定的試算表（更可靠的方式）
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();

    // 解析接收到的 JSON 資料
    const data = JSON.parse(e.postData.contents);

    // 準備要寫入的資料列
    const row = [
      // === 基本資訊 (A-C) ===
      data.timestamp,           // A: 提交時間
      data.employeeName,        // B: 員工姓名
      data.reportDate,          // C: 回報日期

      // === 簡單區域 (D-I) ===
      data.morning?.quantity || 0,        // D: 晨會-數量(個)
      data.morning?.time || 0,            // E: 晨會-時間(分)
      data.packaging_machine?.quantity || 0,  // F: 進包裝機-數量(個)
      data.packaging_machine?.time || 0,      // G: 進包裝機-時間(分)
      data.cleaning?.quantity || 0,       // H: 整理環境區-數量(個)
      data.cleaning?.time || 0,           // I: 整理環境區-時間(分)

      // === 進貨區 (J-AA) ===
      data.receiving?.items?.snake?.quantity || 0,      // J: 進貨-拆蛇皮-數量(個)
      data.receiving?.items?.snake?.time || 0,          // K: 進貨-拆蛇皮-時間(分)
      data.receiving?.items?.count?.quantity || 0,      // L: 進貨-數數-數量(個)
      data.receiving?.items?.count?.time || 0,          // M: 進貨-數數-時間(分)
      data.receiving?.items?.sign?.quantity || 0,       // N: 進貨-簽收-數量(個)
      data.receiving?.items?.sign?.time || 0,           // O: 進貨-簽收-時間(分)
      data.receiving?.items?.classify?.quantity || 0,   // P: 進貨-分類樣品與大貨-數量(個)
      data.receiving?.items?.classify?.time || 0,       // Q: 進貨-分類樣品與大貨-時間(分)
      data.receiving?.items?.abnormal?.quantity || 0,   // R: 進貨-異常-數量(個)
      data.receiving?.items?.abnormal?.time || 0,       // S: 進貨-異常-時間(分)
      data.receiving?.items?.shelve?.quantity || 0,     // T: 進貨-大貨上架-數量(個)
      data.receiving?.items?.shelve?.time || 0,         // U: 進貨-大貨上架-時間(分)
      data.receiving?.items?.organize?.quantity || 0,   // V: 進貨-整理環境-數量(個)
      data.receiving?.items?.organize?.time || 0,       // W: 進貨-整理環境-時間(分)
      data.receiving?.items?.clean?.quantity || 0,      // X: 進貨-打掃進貨區環境-數量(個)
      data.receiving?.items?.clean?.time || 0,          // Y: 進貨-打掃進貨區環境-時間(分)
      data.receiving?.subtotal || 0,                    // Z: 進貨區-總計時間(分)
      data.receiving?.average || 0,                     // AA: 進貨區-平均時間(分)

      // === 檢貨區 (AB-AM) ===
      data.picking?.items?.fetch?.quantity || 0,        // AB: 檢貨-去各個地方取貨-數量(個)
      data.picking?.items?.fetch?.time || 0,            // AC: 檢貨-去各個地方取貨-時間(分)
      data.picking?.items?.unbox_damaged?.quantity || 0, // AD: 檢貨-拆破損箱子-數量(個)
      data.picking?.items?.unbox_damaged?.time || 0,     // AE: 檢貨-拆破損箱子-時間(分)
      data.picking?.items?.stick_c?.quantity || 0,      // AF: 檢貨-把C料號黏在一起-數量(個)
      data.picking?.items?.stick_c?.time || 0,          // AG: 檢貨-把C料號黏在一起-時間(分)
      data.picking?.items?.separate?.quantity || 0,     // AH: 檢貨-分手包與包裝機包-數量(個)
      data.picking?.items?.separate?.time || 0,         // AI: 檢貨-分手包與包裝機包-時間(分)
      data.picking?.items?.machine?.quantity || 0,      // AJ: 檢貨-過包裝機-數量(個)
      data.picking?.items?.machine?.time || 0,          // AK: 檢貨-過包裝機-時間(分)
      data.picking?.subtotal || 0,                      // AL: 檢貨區-總計時間(分)
      data.picking?.average || 0,                       // AM: 檢貨區-平均時間(分)

      // === 包貨區 (AN-AV) ===
      data.packing?.items?.hand_pack?.quantity || 0,    // AN: 包貨-手包-數量(個)
      data.packing?.items?.hand_pack?.time || 0,        // AO: 包貨-手包-時間(分)
      data.packing?.items?.machine_sticker?.quantity || 0, // AP: 包貨-包裝機-數量(個)
      data.packing?.items?.machine_sticker?.time || 0,     // AQ: 包貨-包裝機-時間(分)
      data.packing?.items?.box?.quantity || 0,          // AR: 包貨-拿箱子裝貨-數量(個)
      data.packing?.items?.box?.time || 0,              // AS: 包貨-拿箱子裝貨-時間(分)
      data.packing?.items?.clean_area?.quantity || 0,   // AT: 包貨-整理環境-數量(個)
      data.packing?.items?.clean_area?.time || 0,       // AU: 包貨-整理環境-時間(分)
      data.packing?.subtotal || 0,                      // AV: 包貨區-總計時間(分)
      data.packing?.average || 0,                       // AW: 包貨區-平均時間(分)

      // === 退貨區 (AX-BK) ===
      data.returns?.items?.return_3day?.quantity || 0,  // AX: 退貨-退貨3天內-數量(個)
      data.returns?.items?.return_3day?.time || 0,      // AY: 退貨-退貨3天內-時間(分)
      data.returns?.items?.return_clear?.quantity || 0, // AZ: 退貨-退清-數量(個)
      data.returns?.items?.return_clear?.time || 0,     // BA: 退貨-退清-時間(分)
      data.returns?.items?.inspect?.quantity || 0,      // BB: 退貨-檢測-數量(個)
      data.returns?.items?.inspect?.time || 0,          // BC: 退貨-檢測-時間(分)
      data.returns?.items?.sign?.quantity || 0,         // BD: 退貨-簽收-數量(個)
      data.returns?.items?.sign?.time || 0,             // BE: 退貨-簽收-時間(分)
      data.returns?.items?.shelve?.quantity || 0,       // BF: 退貨-上架-數量(個)
      data.returns?.items?.shelve?.time || 0,           // BG: 退貨-上架-時間(分)
      data.returns?.items?.abnormal?.quantity || 0,     // BH: 退貨-異常退貨-數量(個)
      data.returns?.items?.abnormal?.time || 0,         // BI: 退貨-異常退貨-時間(分)
      data.returns?.subtotal || 0,                      // BJ: 退貨區-總計時間(分)
      data.returns?.average || 0,                       // BK: 退貨區-平均時間(分)

      // === MO+店區 (BL-BW) ===
      data.mo_shop?.items?.print?.quantity || 0,        // BL: MO店-印單-數量(個)
      data.mo_shop?.items?.print?.time || 0,            // BM: MO店-印單-時間(分)
      data.mo_shop?.items?.fetch_b?.quantity || 0,      // BN: MO店-去B棟拿商品-數量(個)
      data.mo_shop?.items?.fetch_b?.time || 0,          // BO: MO店-去B棟拿商品-時間(分)
      data.mo_shop?.items?.pick?.quantity || 0,         // BP: MO店-撿貨-數量(個)
      data.mo_shop?.items?.pick?.time || 0,             // BQ: MO店-撿貨-時間(分)
      data.mo_shop?.items?.ship?.quantity || 0,         // BR: MO店-出貨-數量(個)
      data.mo_shop?.items?.ship?.time || 0,             // BS: MO店-出貨-時間(分)
      data.mo_shop?.subtotal || 0,                      // BT: MO店區-總計時間(分)
      data.mo_shop?.average || 0,                       // BU: MO店區-平均時間(分)

      // === 酷澎區 (BV-CH) ===
      data.kupon?.items?.check?.quantity || 0,          // BV: 酷澎-檢貨-數量(個)
      data.kupon?.items?.check?.time || 0,              // BW: 酷澎-檢貨-時間(分)
      data.kupon?.items?.unbox?.quantity || 0,          // BX: 酷澎-拆盒-數量(個)
      data.kupon?.items?.unbox?.time || 0,              // BY: 酷澎-拆盒-時間(分)
      data.kupon?.items?.pack?.quantity || 0,           // BZ: 酷澎-包貨-數量(個)
      data.kupon?.items?.pack?.time || 0,               // CA: 酷澎-包貨-時間(分)
      data.kupon?.items?.arrange?.quantity || 0,        // CB: 酷澎-擺貨-數量(個)
      data.kupon?.items?.arrange?.time || 0,            // CC: 酷澎-擺貨-時間(分)
      data.kupon?.items?.inventory?.quantity || 0,      // CD: 酷澎-盤點-數量(個)
      data.kupon?.items?.inventory?.time || 0,          // CE: 酷澎-盤點-時間(分)
      data.kupon?.subtotal || 0,                        // CF: 酷澎區-總計時間(分)
      data.kupon?.average || 0,                         // CG: 酷澎區-平均時間(分)

      // === 盤點區 (CH-CM) ===
      data.inventory?.items?.duty?.quantity || 0,       // CH: 盤點-值日生-數量(個)
      data.inventory?.items?.duty?.time || 0,           // CI: 盤點-值日生-時間(分)
      data.inventory?.items?.count_goods?.quantity || 0, // CJ: 盤點-盤點商品-數量(個)
      data.inventory?.items?.count_goods?.time || 0,     // CK: 盤點-盤點商品-時間(分)
      data.inventory?.subtotal || 0,                     // CL: 盤點區-總計時間(分)
      data.inventory?.average || 0,                      // CM: 盤點區-平均時間(分)

      // === 其他 (CN-CP) ===
      formatCustomItems(data.others?.items), // CN: 其他（合併自訂項目）
      data.others?.subtotal || 0,            // CO: 其他區-總計時間(分)
      data.others?.average || 0,             // CP: 其他區-平均時間(分)

      // === 統計 (CQ-CS) ===
      data.totalTime || 0,            // CQ: 總時間(分)
      data.remainingTime || 0,        // CR: 剩餘時間(分)
      data.averageTime || 0           // CS: 平均時間(分/區)
    ];

    // 將資料新增到試算表
    sheet.appendRow(row);

    // 返回成功訊息
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'success',
        'message': '資料已成功儲存'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // 錯誤處理
    Logger.log('錯誤: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'error',
        'message': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 格式化自訂項目
function formatCustomItems(customItems) {
  if (!customItems || customItems.length === 0) {
    return '';
  }

  // 將自訂項目格式化成字串："項目名稱(時間分鐘), 項目名稱(時間分鐘)"
  const formatted = customItems.map(item => {
    return `${item.name}(${item.value}分)`;
  }).join(', ');

  return formatted;
}

// 初始化試算表標題（首次使用時執行一次）
function setupSheet() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();

  // 設定標題列
  const headers = [
    // 基本資訊 (A-C)
    '提交時間', '員工姓名', '回報日期',

    // 簡單區域 (D-I)
    '晨會-數量(個)', '晨會-時間(分)',
    '進包裝機-數量(個)', '進包裝機-時間(分)',
    '整理環境區-數量(個)', '整理環境區-時間(分)',

    // 進貨區 (J-AA)
    '進貨-拆蛇皮-數量(個)', '進貨-拆蛇皮-時間(分)',
    '進貨-數數-數量(個)', '進貨-數數-時間(分)',
    '進貨-簽收-數量(個)', '進貨-簽收-時間(分)',
    '進貨-分類樣品與大貨-數量(個)', '進貨-分類樣品與大貨-時間(分)',
    '進貨-異常-數量(個)', '進貨-異常-時間(分)',
    '進貨-大貨上架-數量(個)', '進貨-大貨上架-時間(分)',
    '進貨-整理環境-數量(個)', '進貨-整理環境-時間(分)',
    '進貨-打掃進貨區環境-數量(個)', '進貨-打掃進貨區環境-時間(分)',
    '進貨區-總計時間(分)', '進貨區-平均時間(分)',

    // 檢貨區 (AB-AM)
    '檢貨-去各個地方取貨-數量(個)', '檢貨-去各個地方取貨-時間(分)',
    '檢貨-拆破損箱子-數量(個)', '檢貨-拆破損箱子-時間(分)',
    '檢貨-把C料號黏在一起-數量(個)', '檢貨-把C料號黏在一起-時間(分)',
    '檢貨-分手包與包裝機包-數量(個)', '檢貨-分手包與包裝機包-時間(分)',
    '檢貨-過包裝機-數量(個)', '檢貨-過包裝機-時間(分)',
    '檢貨區-總計時間(分)', '檢貨區-平均時間(分)',

    // 包貨區 (AN-AW)
    '包貨-手包-數量(個)', '包貨-手包-時間(分)',
    '包貨-包裝機-數量(個)', '包貨-包裝機-時間(分)',
    '包貨-拿箱子裝貨-數量(個)', '包貨-拿箱子裝貨-時間(分)',
    '包貨-整理環境-數量(個)', '包貨-整理環境-時間(分)',
    '包貨區-總計時間(分)', '包貨區-平均時間(分)',

    // 退貨區 (AX-BK)
    '退貨-退貨3天內-數量(個)', '退貨-退貨3天內-時間(分)',
    '退貨-退清-數量(個)', '退貨-退清-時間(分)',
    '退貨-檢測-數量(個)', '退貨-檢測-時間(分)',
    '退貨-簽收-數量(個)', '退貨-簽收-時間(分)',
    '退貨-上架-數量(個)', '退貨-上架-時間(分)',
    '退貨-異常退貨-數量(個)', '退貨-異常退貨-時間(分)',
    '退貨區-總計時間(分)', '退貨區-平均時間(分)',

    // MO+店區 (BL-BU)
    'MO店-印單-數量(個)', 'MO店-印單-時間(分)',
    'MO店-去B棟拿商品-數量(個)', 'MO店-去B棟拿商品-時間(分)',
    'MO店-撿貨-數量(個)', 'MO店-撿貨-時間(分)',
    'MO店-出貨-數量(個)', 'MO店-出貨-時間(分)',
    'MO店區-總計時間(分)', 'MO店區-平均時間(分)',

    // 酷澎區 (BV-CG)
    '酷澎-檢貨-數量(個)', '酷澎-檢貨-時間(分)',
    '酷澎-拆盒-數量(個)', '酷澎-拆盒-時間(分)',
    '酷澎-包貨-數量(個)', '酷澎-包貨-時間(分)',
    '酷澎-擺貨-數量(個)', '酷澎-擺貨-時間(分)',
    '酷澎-盤點-數量(個)', '酷澎-盤點-時間(分)',
    '酷澎區-總計時間(分)', '酷澎區-平均時間(分)',

    // 盤點區 (CH-CM)
    '盤點-值日生-數量(個)', '盤點-值日生-時間(分)',
    '盤點-盤點商品-數量(個)', '盤點-盤點商品-時間(分)',
    '盤點區-總計時間(分)', '盤點區-平均時間(分)',

    // 其他 (CN-CP)
    '其他', '其他區-總計時間(分)', '其他區-平均時間(分)',

    // 統計 (CQ-CS)
    '總時間(分)', '剩餘時間(分)', '平均時間(分/區)'
  ];

  // 寫入標題
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // 格式化標題列
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#FFD700');
  headerRange.setFontColor('#000000');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  headerRange.setWrap(true);

  // 凍結標題列
  sheet.setFrozenRows(1);

  // 設定欄寬
  sheet.setColumnWidth(1, 150);  // 提交時間
  sheet.setColumnWidth(2, 100);  // 員工姓名
  sheet.setColumnWidth(3, 100);  // 回報日期

  // 其他欄位自動調整寬度
  for (let i = 4; i <= headers.length; i++) {
    sheet.setColumnWidth(i, 100);
  }

  // 其他欄位寬一點
  sheet.setColumnWidth(headers.length - 3, 200);  // 其他欄位

  Logger.log('試算表標題設定完成！共 ' + headers.length + ' 欄');
}

// 測試函數（可選）
function testDoPost() {
  const testData = {
    timestamp: new Date().toLocaleString('zh-TW'),
    employeeName: '測試員工',
    reportDate: '2025-01-06',

    // 簡單區域
    morning: { quantity: 5, time: 30 },
    packaging_machine: { quantity: 10, time: 50 },
    cleaning: { quantity: 3, time: 20 },

    // 進貨區
    receiving: {
      snake: { quantity: 15, time: 60 },
      count: { quantity: 200, time: 90 },
      sign: { quantity: 5, time: 10 },
      classify: { quantity: 50, time: 25 },
      abnormal: { quantity: 2, time: 5 },
      shelve: { quantity: 100, time: 40 },
      organize: { quantity: 1, time: 15 },
      clean: { quantity: 1, time: 10 }
    },

    // 檢貨區
    picking: {
      fetch: { quantity: 30, time: 20 },
      unbox_damaged: { quantity: 10, time: 15 },
      stick_c: { quantity: 20, time: 25 },
      separate: { quantity: 50, time: 30 },
      machine: { quantity: 40, time: 20 }
    },

    // 包貨區
    packing: {
      hand_pack: { quantity: 60, time: 40 },
      machine_sticker: { quantity: 80, time: 30 },
      box: { quantity: 25, time: 20 },
      clean_area: { quantity: 1, time: 15 }
    },

    // 退貨區
    returns: {
      return_3day: { quantity: 15, time: 20 },
      return_clear: { quantity: 10, time: 15 },
      inspect: { quantity: 20, time: 10 },
      sign: { quantity: 3, time: 5 },
      shelve: { quantity: 25, time: 15 },
      abnormal: { quantity: 5, time: 10 }
    },

    // MO+店區
    mo_shop: {
      print: { quantity: 50, time: 10 },
      fetch_b: { quantity: 30, time: 20 },
      pick: { quantity: 40, time: 25 },
      ship: { quantity: 35, time: 15 }
    },

    // 酷澎區
    kupon: {
      check: { quantity: 25, time: 15 },
      unbox: { quantity: 20, time: 10 },
      pack: { quantity: 30, time: 20 },
      arrange: { quantity: 40, time: 15 },
      inventory: { quantity: 100, time: 10 }
    },

    // 盤點區
    inventory: {
      duty: { quantity: 1, time: 15 },
      count_goods: { quantity: 50, time: 25 }
    },

    // 其他
    others: [
      { name: '會議', value: 30 },
      { name: '訓練', value: 20 }
    ],

    // 統計
    totalTime: 480,
    remainingTime: 0,
    averageTime: 44
  };

  const e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  const result = doPost(e);
  Logger.log(result.getContent());
}

// 建立統計工作表
function createStatsSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 創建或取得統計工作表
  let statsSheet = ss.getSheetByName('員工統計');
  if (!statsSheet) {
    statsSheet = ss.insertSheet('員工統計');
  } else {
    statsSheet.clear();
  }

  // 取得資料工作表
  const dataSheet = ss.getSheets()[0];
  const lastRow = dataSheet.getLastRow();

  if (lastRow <= 1) {
    statsSheet.getRange('A1').setValue('尚無資料');
    return;
  }

  // 設定統計表標題
  const statsHeaders = [
    '員工姓名',
    '回報次數',
    '平均總時間(分)',
    '最常使用區域',
    '最後回報日期'
  ];

  statsSheet.getRange(1, 1, 1, statsHeaders.length).setValues([statsHeaders]);

  // 格式化標題
  const headerRange = statsSheet.getRange(1, 1, 1, statsHeaders.length);
  headerRange.setBackground('#FF6B00');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  // 凍結標題列
  statsSheet.setFrozenRows(1);

  // 這裡可以加入更複雜的統計邏輯
  // 例如使用 QUERY 函數或 Apps Script 來計算統計資料

  Logger.log('統計工作表已創建！');
}

// 資料驗證函數
function validateData(data) {
  // 檢查必填欄位
  if (!data.employeeName || data.employeeName.trim() === '') {
    throw new Error('員工姓名為必填欄位');
  }

  if (!data.reportDate) {
    throw new Error('回報日期為必填欄位');
  }

  // 檢查姓名不為純數字
  if (/^\d+$/.test(data.employeeName)) {
    throw new Error('員工姓名不能為純數字');
  }

  return true;
}

// 自動發送通知（可選,需要設定 Email）
function sendNotification(data) {
  const recipient = 'your-email@example.com'; // 請修改成你的 Email

  const subject = `倉庫工時回報 - ${data.employeeName} - ${data.reportDate}`;

  let body = `
員工姓名：${data.employeeName}
回報日期：${data.reportDate}
提交時間：${data.timestamp}

=== 工作時間統計 ===
總時間：${data.totalTime} 分鐘 (${(data.totalTime/60).toFixed(1)} 小時)
剩餘時間：${data.remainingTime} 分鐘
平均時間：${data.averageTime} 分鐘/區

=== 詳細資料 ===
`;

  // 簡單區域
  if (data.morning?.time > 0) {
    body += `晨會：數量 ${data.morning.quantity} 個, 時間 ${data.morning.time} 分鐘\n`;
  }
  if (data.packaging_machine?.time > 0) {
    body += `進包裝機：數量 ${data.packaging_machine.quantity} 個, 時間 ${data.packaging_machine.time} 分鐘\n`;
  }
  if (data.cleaning?.time > 0) {
    body += `整理環境區：數量 ${data.cleaning.quantity} 個, 時間 ${data.cleaning.time} 分鐘\n`;
  }

  // 可以繼續添加其他區域的詳細資料...

  MailApp.sendEmail(recipient, subject, body);
}
