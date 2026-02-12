/**
 * 員工行為／績效異常回報表 - Google Apps Script
 *
 * 設定步驟：
 * 1. 建立一個新的 Google Sheets
 * 2. 在第一列加入以下標題（A1 到 N1）：
 *    提交時間 | 紀錄人姓名 | 異常員工姓名 | 觀察日期 | 觀察時間 | 事件地點 |
 *    具體行為事實 | 證據類型 | 照片連結 | 主要影響類別 | 具體影響 | 補充說明 |
 *    違反規章條文 | 已採取行動
 *
 * 3. 點選「擴充功能」>「Apps Script」
 * 4. 將此程式碼貼上並儲存
 * 5. 點選「部署」>「新增部署作業」
 * 6. 選擇類型為「網頁應用程式」
 * 7. 設定：
 *    - 說明：員工異常回報表
 *    - 執行身分：我
 *    - 誰可以存取：所有人
 * 8. 點選「部署」，複製產生的網址
 * 9. 將網址貼到 HTML 檔案中的 YOUR_GOOGLE_APPS_SCRIPT_URL
 */

// 處理 POST 請求
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // 取得試算表
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('回報紀錄') || ss.getActiveSheet();

    // 處理照片 - 儲存到 Google Drivecl
    var photoLinks = [];
    if (data.photos && data.photos.length > 0) {
      var folder = getOrCreateFolder('員工異常回報照片');

      for (var i = 0; i < data.photos.length; i++) {
        var photo = data.photos[i];
        var base64Data = photo.data.split(',')[1]; // 移除 data:image/xxx;base64, 前綴
        var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/jpeg', photo.name);

        // 以時間戳記命名
        var timestamp = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyyMMdd_HHmmss');
        var fileName = timestamp + '_' + data.employee_name + '_' + (i + 1) + '.jpg';
        blob.setName(fileName);

        var file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        photoLinks.push(file.getUrl());
      }
    }

    // 新增一列資料
    var timestamp = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy/MM/dd HH:mm:ss');
    var rowData = [
      timestamp,                    // 提交時間
      data.reporter,                // 紀錄人姓名
      data.employee_name,           // 異常員工姓名
      data.date_observed,           // 觀察日期
      data.time_observed,           // 觀察時間
      data.location,                // 事件地點
      data.behavior_fact,           // 具體行為事實
      data.evidence_type,           // 證據類型
      photoLinks.join('\n'),        // 照片連結
      data.impact_type,             // 主要影響類別
      data.impact_detail,           // 具體影響
      data.impact_other,            // 補充說明
      data.rule_violated,           // 違反規章條文
      data.action_taken             // 已採取行動
    ];

    sheet.appendRow(rowData);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: '提交成功'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 處理 GET 請求（測試用）
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: '員工異常回報表 API 運作中'
  })).setMimeType(ContentService.MimeType.JSON);
}

// 取得或建立資料夾
function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder(folderName);
  }
}

// 初始化試算表標題（手動執行一次）
function initSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  sheet.setName('回報紀錄');

  var headers = [
    '提交時間',
    '紀錄人姓名',
    '異常員工姓名',
    '觀察日期',
    '觀察時間',
    '事件地點',
    '具體行為事實',
    '證據類型',
    '照片連結',
    '主要影響類別',
    '具體影響',
    '補充說明',
    '違反規章條文',
    '已採取行動'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#4a86e8');
  sheet.getRange(1, 1, 1, headers.length).setFontColor('#ffffff');
  sheet.setFrozenRows(1);

  // 設定欄寬
  sheet.setColumnWidth(1, 150);  // 提交時間
  sheet.setColumnWidth(2, 100);  // 紀錄人姓名
  sheet.setColumnWidth(3, 100);  // 異常員工姓名
  sheet.setColumnWidth(4, 100);  // 觀察日期
  sheet.setColumnWidth(5, 80);   // 觀察時間
  sheet.setColumnWidth(6, 80);   // 事件地點
  sheet.setColumnWidth(7, 300);  // 具體行為事實
  sheet.setColumnWidth(8, 120);  // 證據類型
  sheet.setColumnWidth(9, 200);  // 照片連結
  sheet.setColumnWidth(10, 120); // 主要影響類別
  sheet.setColumnWidth(11, 200); // 具體影響
  sheet.setColumnWidth(12, 150); // 補充說明
  sheet.setColumnWidth(13, 200); // 違反規章條文
  sheet.setColumnWidth(14, 150); // 已採取行動
}
