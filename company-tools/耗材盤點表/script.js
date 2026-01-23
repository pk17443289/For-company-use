// Google Sheets API 設定（稍後填入）
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyrVsJRSAtuLWsjoTGakg7OSoeNgUnZOZDtGtFRdFuLTCs4_kUkvvfr2BqxJ4EAl6U/exec'; // 這裡填入你的 Google Apps Script 網址

// ===== 多語言設定 =====
let currentLang = localStorage.getItem('inventoryLang') || 'zh';

const i18n = {
    zh: {
        // 頁面標題
        pageTitle: '耗材盤點表',
        companyName: '杰特企業有限公司',

        // 基本資訊
        inventoryDate: '盤點日期',
        inventoryPerson: '盤點人員',
        pleaseSelect: '請選擇...',

        // 統計
        totalItems: '總項目數',
        filledItems: '已填寫',
        needOrder: '要叫貨',
        noNeedOrder: '不用叫貨',
        noNeed: '不用叫',
        replenishing: '補貨中',
        replenished: '已補貨',

        // 分類
        ajunArea: '阿駿負責區',
        officeArea: '辦公室區域',
        warehouseArea: '倉庫區',
        stickerArea: '倉庫貼紙盤點（負責人：美編）',
        oppArea: 'OPP袋子盤點（負責人：秀娟）',

        // 分類簡稱（手機版）
        office: '辦公室',
        warehouse: '倉庫區',
        sticker: '貼紙',
        opp: 'OPP袋',

        // 按鈕
        exportData: '📊 匯出資料',
        viewNeedOrder: '🛒 查看要叫貨的項目',
        submitInventory: '✅ 提交盤點表',
        prevItem: '上一項',
        nextItem: '下一項',
        firstItem: '⏮️ 第一項',
        lastItem: '⏭️ 最後一項',
        close: '關閉',
        copyList: '📋 複製清單',

        // 狀態
        noNeedOrderStatus: '不用叫貨',
        needOrderStatus: '要叫貨',
        replenishingStatus: '補貨中',
        replenishedStatus: '已補貨',
        lastTime: '上次',
        noRecord: '無記錄',

        // 提示訊息
        pleaseSelectPerson: '請先選擇盤點人員！',
        pleaseFillAll: '請填寫所有項目後才能提交盤點表！',
        confirmAllNoOrder: '📋 本次盤點結果：\n\n✅ 全部項目都不用叫貨\n\n確定要提交嗎？',
        confirmWithOrders: '📋 本次盤點結果：\n\n⚠️ 需要叫貨的項目（共 {count} 項）：\n• {items}\n\n確定要提交嗎？',
        confirmReplenishing: '\n\n🚚 補貨中的項目（共 {count} 項）：\n• {items}',
        confirmReplenished: '\n\n✅ 已補貨的項目（共 {count} 項）：\n• {items}',
        statusChangedWarning: '\n\n⚠️ 注意：以下項目狀態與上次盤點不同：\n{items}',
        submitting: '⏳ 提交中...',
        submitSuccess: '✅ 盤點表已完成！資料已上傳至 Google Sheets 並自動匯出，請記得通知採購人員！',
        submitSuccessTitle: '提交成功！',
        submitSuccessMessage: '盤點表已成功上傳到 Google Sheets\n並自動匯出 CSV 檔案',
        submitFailed: '❌ 提交到 Google Sheets 失敗，但 CSV 已匯出。錯誤：',
        dataSaved: '資料已儲存！',
        dataExported: '資料已匯出！',
        exportAfterFill: '請填寫所有項目後才能匯出資料！',
        listCopied: '✅ 叫貨清單已成功複製到剪貼簿！',
        copyFailed: '❌ 複製失敗，請手動複製',

        // 彈窗
        orderListTitle: '🛒 要叫貨項目清單',
        noOrderNeeded: '太棒了！目前沒有需要叫貨的項目！',
        followingNeedOrder: '以下項目需要叫貨：',
        needOrderLabel: '⚠️ 要叫貨：',

        // 手機版完成
        allComplete: '全部填寫完成！',
        itemsCompleted: '共 {count} 項目已完成盤點',
        pleaseClickSubmit: '請點擊下方「提交盤點表」按鈕',
        itemsRemaining: '還有 {count} 項未填寫',
        jumpToUnfilled: '📍 跳到未填「{name}」',
        backToLast: '⏭️ 回到最後一項',
        selectDestination: '請選擇要前往的位置',
        allCategoriesDone: '✅ 全部分類已填完',

        // 語言
        langZh: '中文',
        langId: 'Indonesia',

        // 項目名稱 - 辦公室區域
        item_蝸牛: '蝸牛',
        item_攝影機: '攝影機',
        item_小膠帶台: '小膠帶台',
        item_大膠帶台: '大膠帶台',
        item_新人制服: '新人制服',
        item_紅筆: '紅筆',
        item_藍筆: '藍筆',
        item_奇異筆: '奇異筆',
        item_美工刀: '美工刀',
        item_大刀片: '大刀片',
        item_小刀片: '小刀片',
        item_剪刀: '剪刀',
        item_大膠帶: '大膠帶',
        item_細膠帶: '細膠帶',
        item_紙膠帶: '紙膠帶',
        'item_PDA 6×4條碼貼紙': 'PDA 6×4條碼貼紙',
        item_A4紙: 'A4紙',
        item_碳粉: '碳粉',
        item_衛生紙: '衛生紙',
        item_桶裝水: '桶裝水',
        item_燈泡: '燈泡',
        item_電池: '電池',

        // 項目名稱 - 倉庫區
        'item_MO+店貼紙': 'MO+店貼紙',
        item_倉庫推車標示單: '倉庫推車標示單',
        item_棧板出貨標示單: '棧板出貨標示單',
        item_酒精: '酒精',
        item_大紙箱: '大紙箱',
        item_中紙箱: '中紙箱',
        'item_15×15×15紙盒': '15×15×15紙盒',
        'item_10×15×4小飛機盒': '10×15×4小飛機盒',
        'item_18×11×6中飛機盒': '18×11×6中飛機盒',
        'item_26.5×19×6.5大飛機盒': '26.5×19×6.5大飛機盒',
        item_防撞角: '防撞角',
        item_氣泡紙: '氣泡紙',

        // 項目名稱 - 倉庫貼紙盤點
        item_小防撕貼: '小防撕貼',
        item_中防撕貼: '中防撕貼',
        item_大防撕貼: '大防撕貼',
        item_寄倉貼紙: '寄倉貼紙',
        item_備貨貼紙: '備貨貼紙',
        item_地球貼: '地球貼',

        // 項目名稱 - OPP袋子盤點
        'item_破壞袋（40╳50）無光粉': '破壞袋（40╳50）無光粉',
        'item_破壞袋（32╳40）薄荷綠': '破壞袋（32╳40）薄荷綠',
        'item_破壞袋（35╳45）藍色': '破壞袋（35╳45）藍色',
        'item_破壞袋（20╳30）杏色': '破壞袋（20╳30）杏色',
        'item_破壞袋（25╳35）全新粉': '破壞袋（25╳35）全新粉',
        'item_破壞袋（15╳25）紫色': '破壞袋（15╳25）紫色',
        'item_破壞袋（15╳40）白色': '破壞袋（15╳40）白色',
        'item_破壞袋（60╳70）白色': '破壞袋（60╳70）白色',
        'item_１號 6×10 OPP袋': '１號 6×10 OPP袋',
        'item_２號 7×10 OPP袋': '２號 7×10 OPP袋',
        'item_３號 8×25 OPP袋': '３號 8×25 OPP袋',
        'item_４號 9×14 OPP袋': '４號 9×14 OPP袋',
        'item_５號 10×27 OPP袋': '５號 10×27 OPP袋',
        'item_６號 10×20 OPP袋': '６號 10×20 OPP袋',
        'item_７號 12×14 OPP袋': '７號 12×14 OPP袋',
        'item_８號 12×20 OPP袋': '８號 12×20 OPP袋',
        'item_９號 12×28 OPP袋': '９號 12×28 OPP袋',
        'item_１０號 13×23 OPP袋': '１０號 13×23 OPP袋',
        'item_１１號 13×29 OPP袋': '１１號 13×29 OPP袋',
        'item_１２號 15×22 OPP袋': '１２號 15×22 OPP袋',
        'item_１３號 15×39 OPP袋': '１３號 15×39 OPP袋',
        'item_１４號 16×19 OPP袋': '１４號 16×19 OPP袋',
        'item_１５號 6×25 OPP袋': '１５號 6×25 OPP袋',
        'item_１６號 17×22 OPP袋': '１６號 17×22 OPP袋',
        'item_１７號 18×49 OPP袋': '１７號 18×49 OPP袋',
        'item_１８號 20×30 OPP袋': '１８號 20×30 OPP袋',
        'item_１９號 20×39 OPP袋': '１９號 20×39 OPP袋',
        'item_２０號 24×65 OPP袋': '２０號 24×65 OPP袋',
        'item_２１號 27×30 OPP袋': '２１號 27×30 OPP袋',
        'item_２２號 28×49 OPP袋': '２２號 28×49 OPP袋',
        'item_２３號 28×54 OPP袋': '２３號 28×54 OPP袋',
        'item_２４號 30×65 OPP袋': '２４號 30×65 OPP袋',
        'item_２５號 35×45 OPP袋': '２５號 35×45 OPP袋',
        'item_２６號 35×74 OPP袋': '２６號 35×74 OPP袋',
        'item_２７號 35×85 OPP袋': '２７號 35×85 OPP袋',
        'item_２８號 40×44 OPP袋': '２８號 40×44 OPP袋',
        'item_２９號 40×74 OPP袋': '２９號 40×74 OPP袋',
        'item_３０號 45×54 OPP袋': '３０號 45×54 OPP袋',
        'item_３１號 50×74 OPP袋': '３１號 50×74 OPP袋',
        'item_３２號 55×69 OPP袋': '３２號 55×69 OPP袋',
        'item_３３號 74×55 OPP袋': '３３號 74×55 OPP袋'
    },
    id: {
        // 頁面標題
        pageTitle: 'Formulir Inventaris Bahan',
        companyName: 'PT. Jie Te',

        // 基本資訊
        inventoryDate: 'Tanggal Inventaris',
        inventoryPerson: 'Petugas Inventaris',
        pleaseSelect: 'Pilih...',

        // 統計
        totalItems: 'Total Item',
        filledItems: 'Terisi',
        needOrder: 'Perlu Pesan',
        noNeedOrder: 'Tidak Perlu',
        noNeed: 'Tidak',
        replenishing: 'Sedang Diisi',
        replenished: 'Sudah Diisi',

        // 分類
        ajunArea: 'Area Tanggung Jawab Ajun',
        officeArea: 'Area Kantor',
        warehouseArea: 'Area Gudang',
        stickerArea: 'Inventaris Stiker Gudang (PIC: Desainer)',
        oppArea: 'Inventaris Kantong OPP (PIC: Xiujuan)',

        // 分類簡稱（手機版）
        office: 'Kantor',
        warehouse: 'Gudang',
        sticker: 'Stiker',
        opp: 'OPP',

        // 按鈕
        exportData: '📊 Ekspor Data',
        viewNeedOrder: '🛒 Lihat Item Perlu Pesan',
        submitInventory: '✅ Kirim Inventaris',
        prevItem: 'Sebelumnya',
        nextItem: 'Berikutnya',
        firstItem: '⏮️ Pertama',
        lastItem: '⏭️ Terakhir',
        close: 'Tutup',
        copyList: '📋 Salin Daftar',

        // 狀態
        noNeedOrderStatus: 'Tidak Perlu Pesan',
        needOrderStatus: 'Perlu Pesan',
        replenishingStatus: 'Sedang Diisi Ulang',
        replenishedStatus: 'Sudah Diisi Ulang',
        lastTime: 'Terakhir',
        noRecord: 'Tidak ada catatan',

        // 提示訊息
        pleaseSelectPerson: 'Silakan pilih petugas inventaris terlebih dahulu!',
        pleaseFillAll: 'Silakan isi semua item sebelum mengirim!',
        confirmAllNoOrder: '📋 Hasil inventaris:\n\n✅ Semua item tidak perlu dipesan\n\nKonfirmasi kirim?',
        confirmWithOrders: '📋 Hasil inventaris:\n\n⚠️ Item yang perlu dipesan ({count} item):\n• {items}\n\nKonfirmasi kirim?',
        confirmReplenishing: '\n\n🚚 Item sedang diisi ulang ({count} item):\n• {items}',
        confirmReplenished: '\n\n✅ Item sudah diisi ulang ({count} item):\n• {items}',
        statusChangedWarning: '\n\n⚠️ Perhatian: Item berikut statusnya berbeda dari inventaris terakhir:\n{items}',
        submitting: '⏳ Mengirim...',
        submitSuccess: '✅ Inventaris selesai! Data telah diunggah ke Google Sheets dan diekspor, harap beritahu bagian pembelian!',
        submitSuccessTitle: 'Berhasil Dikirim!',
        submitSuccessMessage: 'Inventaris berhasil diunggah ke Google Sheets\ndan CSV diekspor otomatis',
        submitFailed: '❌ Gagal mengirim ke Google Sheets, tetapi CSV telah diekspor. Error:',
        dataSaved: 'Data tersimpan!',
        dataExported: 'Data diekspor!',
        exportAfterFill: 'Silakan isi semua item sebelum mengekspor!',
        listCopied: '✅ Daftar pesanan berhasil disalin!',
        copyFailed: '❌ Gagal menyalin, silakan salin manual',

        // 彈窗
        orderListTitle: '🛒 Daftar Item Perlu Pesan',
        noOrderNeeded: 'Bagus! Tidak ada item yang perlu dipesan!',
        followingNeedOrder: 'Item berikut perlu dipesan:',
        needOrderLabel: '⚠️ Perlu Pesan:',

        // 手機版完成
        allComplete: 'Semua Selesai!',
        itemsCompleted: 'Total {count} item telah diinventaris',
        pleaseClickSubmit: 'Silakan klik tombol "Kirim Inventaris" di bawah',
        itemsRemaining: 'Masih ada {count} item belum diisi',
        jumpToUnfilled: '📍 Ke "{name}" yang belum diisi',
        backToLast: '⏭️ Kembali ke item terakhir',
        selectDestination: 'Pilih tujuan',
        allCategoriesDone: '✅ Semua kategori selesai',

        // 語言
        langZh: '中文',
        langId: 'Indonesia',

        // 項目名稱 - 辦公室區域
        item_蝸牛: 'Snail (Dispenser)',
        item_攝影機: 'Kamera',
        item_小膠帶台: 'Dispenser Lakban Kecil',
        item_大膠帶台: 'Dispenser Lakban Besar',
        item_新人制服: 'Seragam Karyawan Baru',
        item_紅筆: 'Pulpen Merah',
        item_藍筆: 'Pulpen Biru',
        item_奇異筆: 'Spidol Permanen',
        item_美工刀: 'Cutter',
        item_大刀片: 'Isi Cutter Besar',
        item_小刀片: 'Isi Cutter Kecil',
        item_剪刀: 'Gunting',
        item_大膠帶: 'Lakban Besar',
        item_細膠帶: 'Lakban Tipis',
        item_紙膠帶: 'Lakban Kertas',
        'item_PDA 6×4條碼貼紙': 'Stiker Barcode PDA 6×4',
        item_A4紙: 'Kertas A4',
        item_碳粉: 'Toner',
        item_衛生紙: 'Tisu',
        item_桶裝水: 'Air Galon',
        item_燈泡: 'Lampu',
        item_電池: 'Baterai',

        // 項目名稱 - 倉庫區
        'item_MO+店貼紙': 'Stiker MO+',
        item_倉庫推車標示單: 'Label Troli Gudang',
        item_棧板出貨標示單: 'Label Pengiriman Palet',
        item_酒精: 'Alkohol',
        item_大紙箱: 'Kardus Besar',
        item_中紙箱: 'Kardus Sedang',
        'item_15×15×15紙盒': 'Kotak 15×15×15',
        'item_10×15×4小飛機盒': 'Kotak Pesawat Kecil 10×15×4',
        'item_18×11×6中飛機盒': 'Kotak Pesawat Sedang 18×11×6',
        'item_26.5×19×6.5大飛機盒': 'Kotak Pesawat Besar 26.5×19×6.5',
        item_防撞角: 'Pelindung Sudut',
        item_氣泡紙: 'Bubble Wrap',

        // 項目名稱 - 倉庫貼紙盤點
        item_小防撕貼: 'Stiker Anti-Sobek Kecil',
        item_中防撕貼: 'Stiker Anti-Sobek Sedang',
        item_大防撕貼: 'Stiker Anti-Sobek Besar',
        item_寄倉貼紙: 'Stiker Kirim Gudang',
        item_備貨貼紙: 'Stiker Persiapan Barang',
        item_地球貼: 'Stiker Bumi',

        // 項目名稱 - OPP袋子盤點
        'item_破壞袋（40╳50）無光粉': 'Kantong Pengaman (40╳50) Pink Matte',
        'item_破壞袋（32╳40）薄荷綠': 'Kantong Pengaman (32╳40) Hijau Mint',
        'item_破壞袋（35╳45）藍色': 'Kantong Pengaman (35╳45) Biru',
        'item_破壞袋（20╳30）杏色': 'Kantong Pengaman (20╳30) Aprikot',
        'item_破壞袋（25╳35）全新粉': 'Kantong Pengaman (25╳35) Pink Baru',
        'item_破壞袋（15╳25）紫色': 'Kantong Pengaman (15╳25) Ungu',
        'item_破壞袋（15╳40）白色': 'Kantong Pengaman (15╳40) Putih',
        'item_破壞袋（60╳70）白色': 'Kantong Pengaman (60╳70) Putih',
        'item_１號 6×10 OPP袋': 'Kantong OPP No.1 6×10',
        'item_２號 7×10 OPP袋': 'Kantong OPP No.2 7×10',
        'item_３號 8×25 OPP袋': 'Kantong OPP No.3 8×25',
        'item_４號 9×14 OPP袋': 'Kantong OPP No.4 9×14',
        'item_５號 10×27 OPP袋': 'Kantong OPP No.5 10×27',
        'item_６號 10×20 OPP袋': 'Kantong OPP No.6 10×20',
        'item_７號 12×14 OPP袋': 'Kantong OPP No.7 12×14',
        'item_８號 12×20 OPP袋': 'Kantong OPP No.8 12×20',
        'item_９號 12×28 OPP袋': 'Kantong OPP No.9 12×28',
        'item_１０號 13×23 OPP袋': 'Kantong OPP No.10 13×23',
        'item_１１號 13×29 OPP袋': 'Kantong OPP No.11 13×29',
        'item_１２號 15×22 OPP袋': 'Kantong OPP No.12 15×22',
        'item_１３號 15×39 OPP袋': 'Kantong OPP No.13 15×39',
        'item_１４號 16×19 OPP袋': 'Kantong OPP No.14 16×19',
        'item_１５號 6×25 OPP袋': 'Kantong OPP No.15 6×25',
        'item_１６號 17×22 OPP袋': 'Kantong OPP No.16 17×22',
        'item_１７號 18×49 OPP袋': 'Kantong OPP No.17 18×49',
        'item_１８號 20×30 OPP袋': 'Kantong OPP No.18 20×30',
        'item_１９號 20×39 OPP袋': 'Kantong OPP No.19 20×39',
        'item_２０號 24×65 OPP袋': 'Kantong OPP No.20 24×65',
        'item_２１號 27×30 OPP袋': 'Kantong OPP No.21 27×30',
        'item_２２號 28×49 OPP袋': 'Kantong OPP No.22 28×49',
        'item_２３號 28×54 OPP袋': 'Kantong OPP No.23 28×54',
        'item_２４號 30×65 OPP袋': 'Kantong OPP No.24 30×65',
        'item_２５號 35×45 OPP袋': 'Kantong OPP No.25 35×45',
        'item_２６號 35×74 OPP袋': 'Kantong OPP No.26 35×74',
        'item_２７號 35×85 OPP袋': 'Kantong OPP No.27 35×85',
        'item_２８號 40×44 OPP袋': 'Kantong OPP No.28 40×44',
        'item_２９號 40×74 OPP袋': 'Kantong OPP No.29 40×74',
        'item_３０號 45×54 OPP袋': 'Kantong OPP No.30 45×54',
        'item_３１號 50×74 OPP袋': 'Kantong OPP No.31 50×74',
        'item_３２號 55×69 OPP袋': 'Kantong OPP No.32 55×69',
        'item_３３號 74×55 OPP袋': 'Kantong OPP No.33 74×55'
    }
};

// 取得翻譯文字
function t(key, replacements = {}) {
    let text = i18n[currentLang][key] || i18n['zh'][key] || key;
    for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(`{${k}}`, v);
    }
    return text;
}

// 取得項目名稱翻譯（顯示用）
function getItemNameDisplay(name) {
    return t('item_' + name);
}

// 取得補貨條件（顯示用）
function getThresholdDisplay(threshold) {
    if (!threshold) return '';
    return threshold;
}

// 切換語言
function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('inventoryLang', lang);
    updatePageLanguage();

    // 重新生成項目和手機版
    document.querySelectorAll('.items-grid').forEach(grid => grid.innerHTML = '');
    generateItems();

    // 重新綁定事件
    document.querySelectorAll('.items-grid input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            updateItemStatus(this);
            updateStats();
            updateButtonStates();
            autoSave();
        });
    });

    if (isMobileView()) {
        initMobileSwipe();
    }

    updateStats();
}

// 更新頁面語言
function updatePageLanguage() {
    // 更新所有有 data-i18n 屬性的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });

    // 更新有 data-i18n-placeholder 的元素
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });

    // 更新語言按鈕狀態
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === currentLang) {
            btn.classList.add('active');
        }
    });

    // 更新頁面標題
    document.title = t('pageTitle') + ' - ' + t('companyName');
}

// 預設盤點項目資料（含預設盤點頻率：daily=每日, weekly=每週, monthly=每月）
// 如果 Google Sheets 有「項目清單」工作表，會從那裡讀取；否則使用此預設資料
const defaultInventoryData = {
    ajun: [
        { name: '蝸牛', threshold: '剩兩台就要叫', unit: '台', warningValue: 2, frequency: 'weekly' },
        { name: '攝影機', threshold: '', unit: '台', warningValue: null, frequency: 'monthly' },
        { name: '小膠帶台', threshold: '剩兩台就要叫', unit: '台', warningValue: 2, frequency: 'weekly' },
        { name: '大膠帶台', threshold: '剩兩台就要叫', unit: '台', warningValue: 2, frequency: 'weekly' },
        { name: '新人制服', threshold: '剩兩個就要叫', unit: '件', warningValue: 2, frequency: 'monthly' },
        { name: '紅筆', threshold: '剩十隻就要叫', unit: '隻', warningValue: 10, frequency: 'weekly' },
        { name: '藍筆', threshold: '剩十隻就要叫', unit: '隻', warningValue: 10, frequency: 'weekly' },
        { name: '奇異筆', threshold: '剩十隻就要叫', unit: '隻', warningValue: 10, frequency: 'weekly' },
        { name: '美工刀', threshold: '剩兩把就要叫', unit: '把', warningValue: 2, frequency: 'weekly' },
        { name: '大刀片', threshold: '剩一盒就要叫', unit: '盒', warningValue: 1, frequency: 'weekly' },
        { name: '小刀片', threshold: '剩一盒就要叫', unit: '盒', warningValue: 1, frequency: 'weekly' },
        { name: '剪刀', threshold: '剩兩把就要叫', unit: '把', warningValue: 2, frequency: 'weekly' },
        { name: '大膠帶', threshold: '剩五條就要買', unit: '條', warningValue: 5, frequency: 'daily' },
        { name: '細膠帶', threshold: '剩三條就要買', unit: '條', warningValue: 3, frequency: 'daily' },
        { name: '紙膠帶', threshold: '剩三條就要叫', unit: '條', warningValue: 3, frequency: 'weekly' },
        { name: '燈泡', threshold: '', unit: '個', warningValue: null, frequency: 'monthly' },
        { name: 'A4紙', threshold: '剩三箱就要叫', unit: '箱', warningValue: 3, frequency: 'weekly' },
        { name: '碳粉', threshold: '剩五條就要叫', unit: '條', warningValue: 5, frequency: 'weekly' },
        { name: '衛生紙', threshold: '剩五包就要叫', unit: '包', warningValue: 5, frequency: 'weekly' },
        { name: '桶裝水', threshold: '剩兩桶就要叫', unit: '桶', warningValue: 2, frequency: 'weekly' },
        { name: '電池', threshold: '剩五顆就要叫', unit: '顆', warningValue: 5, frequency: 'weekly' }
    ],
    warehouse: [
        { name: 'MO+店貼紙', threshold: '剩一綑就要叫', unit: '綑', warningValue: 1, frequency: 'weekly' },
        { name: '倉庫推車標示單', threshold: '剩一點1/3就要印', unit: '疊', warningValue: 0.33, frequency: 'weekly' },
        { name: '棧板出貨標示單', threshold: '剩一點1/3就要印', unit: '疊', warningValue: 0.33, frequency: 'weekly' },
        { name: '酒精', threshold: '剩一罐就要叫', unit: '罐', warningValue: 1, frequency: 'weekly' },
        { name: '大紙箱', threshold: '下面只剩七捆就要叫', unit: '捆', warningValue: 7, frequency: 'daily' },
        { name: '中紙箱', threshold: '下面只剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'daily' },
        { name: '15×15×15紙盒', threshold: '剩五綑就要叫', unit: '綑', warningValue: 5, frequency: 'weekly' },
        { name: '10×15×4小飛機盒', threshold: '剩三綑就要叫', unit: '綑', warningValue: 3, frequency: 'weekly' },
        { name: '18×11×6中飛機盒', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '26.5×19×6.5大飛機盒', threshold: '剩三綑就要叫', unit: '綑', warningValue: 3, frequency: 'weekly' },
        { name: '防撞角', threshold: '剩1/3就要叫', unit: '箱', warningValue: 0.33, frequency: 'weekly' },
        { name: '氣泡紙', threshold: '剩一捆就要叫', unit: '捆', warningValue: 1, frequency: 'daily' },
        { name: 'PDA 6×4條碼貼紙', threshold: '剩200個就要叫', unit: '個', warningValue: 200, frequency: 'weekly' }
    ],
    meiban: [
        { name: '小防撕貼', threshold: '剩一包就要叫', unit: '包', warningValue: 1, frequency: 'weekly' },
        { name: '中防撕貼', threshold: '剩一包就要叫', unit: '包', warningValue: 1, frequency: 'weekly' },
        { name: '大防撕貼', threshold: '剩一包就要叫', unit: '包', warningValue: 1, frequency: 'weekly' },
        { name: '寄倉貼紙', threshold: '剩一包就要叫', unit: '包', warningValue: 1, frequency: 'weekly' },
        { name: '備貨貼紙', threshold: '剩兩包就要叫', unit: '包', warningValue: 2, frequency: 'weekly' },
        { name: '地球貼', threshold: '', unit: '張', warningValue: null, frequency: 'monthly' }
    ],
    xiujuan: [
        { name: '破壞袋（40╳50）無光粉', threshold: '剩五綑就要叫', unit: '綑', warningValue: 5, frequency: 'weekly' },
        { name: '破壞袋（32╳40）薄荷綠', threshold: '剩五綑就要叫', unit: '綑', warningValue: 5, frequency: 'weekly' },
        { name: '破壞袋（35╳45）藍色', threshold: '剩五綑就要叫', unit: '綑', warningValue: 5, frequency: 'weekly' },
        { name: '破壞袋（20╳30）杏色', threshold: '剩五綑就要叫', unit: '綑', warningValue: 5, frequency: 'weekly' },
        { name: '破壞袋（25╳35）全新粉', threshold: '剩五綑就要叫', unit: '綑', warningValue: 5, frequency: 'weekly' },
        { name: '破壞袋（15╳25）紫色', threshold: '剩五綑就要叫', unit: '綑', warningValue: 5, frequency: 'weekly' },
        { name: '破壞袋（15╳40）白色', threshold: '剩五綑就要叫', unit: '綑', warningValue: 5, frequency: 'weekly' },
        { name: '破壞袋（60╳70）白色', threshold: '剩五綑就要叫', unit: '綑', warningValue: 5, frequency: 'weekly' },
        { name: '１號 6×10 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '２號 7×10 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '３號 8×25 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '４號 9×14 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '５號 10×27 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '６號 10×20 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '７號 12×14 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '８號 12×20 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '９號 12×28 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '１０號 13×23 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '１１號 13×29 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '１２號 15×22 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '１３號 15×39 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '１４號 16×19 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '１５號 6×25 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '１６號 17×22 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '１７號 18×49 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '１８號 20×30 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '１９號 20×39 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '２０號 24×65 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '２１號 27×30 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '２２號 28×49 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '２３號 28×54 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '２４號 30×65 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '２５號 35×45 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '２６號 35×74 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '２７號 35×85 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '２８號 40×44 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '２９號 40×74 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '３０號 45×54 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '３１號 50×74 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '３２號 55×69 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' },
        { name: '３３號 74×55 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5, frequency: 'weekly' }
    ]
};

// 實際使用的盤點項目資料（初始化時會從 Google Sheets 載入，若無則使用預設）
let inventoryData = defaultInventoryData;

// 取得項目的實際盤點頻率（有統計數據時使用建議頻率，否則用項目清單的設定）
function getItemFrequency(itemName) {
    // 先取得項目清單中的手動設定頻率
    let manualFrequency = 'weekly';
    for (const category in inventoryData) {
        const item = inventoryData[category].find(i => i.name === itemName);
        if (item) {
            manualFrequency = item.frequency || 'weekly';
            break;
        }
    }

    // 如果有統計數據且有足夠數據計算出建議頻率，才使用建議頻率
    if (statisticsData && statisticsData.items) {
        const stats = statisticsData.items.find(s => s.itemKey === itemName || s.itemName === itemName);
        // 只有當 suggestedFrequency 有值（表示有足夠數據）時才使用
        if (stats && stats.suggestedFrequency) {
            return stats.suggestedFrequency;
        }
    }

    // 沒有足夠統計數據，使用項目清單的手動設定
    return manualFrequency;
}

// 儲存上次盤點資料
let lastInventoryData = {};

// 儲存被停用（標記異常）的項目
let disabledItems = new Set();

// ===== 全域載入指示器 =====
function showLoading() {
    const el = document.getElementById('globalLoading');
    if (el) {
        el.classList.add('show');
        updateLoadingProgressDirect(0);
    }
}

function hideLoading() {
    const el = document.getElementById('globalLoading');
    if (el) el.classList.remove('show');
}

function updateLoadingText(text) {
    const textEl = document.getElementById('loadingText');
    if (textEl) textEl.textContent = text;
}

function updateLoadingProgressDirect(percent) {
    const fillEl = document.getElementById('loadingProgressFill');
    const stepEl = document.getElementById('loadingStep');

    if (fillEl) fillEl.style.width = percent + '%';
    if (stepEl) stepEl.textContent = percent + '%';

    if (percent >= 100) {
        setTimeout(hideLoading, 300);
    }
}

// 初始化頁面
document.addEventListener('DOMContentLoaded', function() {
    // 每次開啟頁面時清除之前的填寫資料，重新開始
    localStorage.removeItem('inventoryData');

    // 套用儲存的語言設定
    updatePageLanguage();

    // 設定今天的日期
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('inventoryDate').value = today;

    // 生成所有項目
    generateItems();

    // 從 Google Sheets 載入上次盤點資料（僅用於顯示「上次」狀態參考）
    loadLastInventory();

    // 更新統計
    updateStats();

    // 監聽單選按鈕變化
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            updateItemStatus(this);
            updateStats();
            updateButtonStates();
            autoSave();
        });
    });

    // 監聽基本資訊變化
    document.getElementById('inventoryDate').addEventListener('change', function() {
        updateButtonStates();
        autoSave();
    });
    document.getElementById('inventoryPerson').addEventListener('change', function() {
        updateButtonStates();
        autoSave();
    });

    // 初始化按鈕狀態
    updateButtonStates();

    // 更新今日盤點建議（顯示篩選按鈕，預設顯示全部項目）
    updateTodaySuggestion();
    applyFrequencyFilter();
});

// 今日建議盤點的頻率列表
let todaySuggestedFrequencies = [];

// 目前篩選的頻率（all=全部, daily=每日, weekly=每週, monthly=每月）
let currentFrequencyFilter = 'all';

// 生成項目（按區域分類：辦公室/倉庫/貼紙/OPP袋，並在每個項目上顯示頻率標籤）
function generateItems() {
    // 區域對應容器
    const categoryContainers = {
        ajun: 'ajun-items',
        warehouse: 'warehouse-items',
        meiban: 'meiban-items',
        xiujuan: 'xiujuan-items'
    };

    // 清空所有容器
    Object.values(categoryContainers).forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = '';
    });

    // 統計各頻率的項目數量
    const frequencyCounts = { daily: 0, weekly: 0, monthly: 0 };

    // 為每個區域生成項目
    Object.keys(inventoryData).forEach(category => {
        const containerId = categoryContainers[category];
        const container = document.getElementById(containerId);
        if (!container) return;

        inventoryData[category].forEach((item, index) => {
            // 跳過被標記異常（停用）的項目
            if (disabledItems.has(item.name)) {
                return;
            }

            const itemKey = item.name;
            // 取得實際頻率（統計數據優先，否則用預設）
            const frequency = getItemFrequency(itemKey);
            frequencyCounts[frequency]++;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-row';
            itemDiv.id = `item-${item.name}`;
            itemDiv.setAttribute('data-frequency', frequency);

            const lastStatus = lastInventoryData[itemKey];
            const lastInfo = lastStatus ?
                `<div class="last-inventory">${t('lastTime')}：${getStatusTextTranslated(lastStatus)}</div>` :
                `<div class="last-inventory" style="color: #999;">${t('lastTime')}：${t('noRecord')}</div>`;

            // 取得平均補貨天數（從統計數據）
            const avgDaysInfo = getAvgReplenishDaysInfo(itemKey);

            // 取得翻譯的項目名稱和補貨條件（顯示用）
            const displayName = getItemNameDisplay(item.name);
            const displayThreshold = getThresholdDisplay(item.threshold);

            // 根據上次狀態決定顯示哪種選項
            const replenishMode = isReplenishMode(itemKey);

            // 頻率標籤
            const freqLabels = {
                daily: '🔴 每日',
                weekly: '🔵 每週',
                monthly: '🟢 每月'
            };
            const freqTag = `<span class="freq-tag ${frequency}">${freqLabels[frequency]}</span>`;

            let statusOptionsHtml;
            if (replenishMode) {
                statusOptionsHtml = `
                    <div class="status-options">
                        <label class="status-option replenishing">
                            <input type="radio" name="${itemKey}" value="補貨中"
                                   data-category="${category}" data-item-key="${itemKey}" data-item-name="${item.name}" checked>
                            <span class="status-icon">🚚</span>
                            <span class="status-text">${t('replenishingStatus')}</span>
                        </label>
                        <label class="status-option replenished">
                            <input type="radio" name="${itemKey}" value="已補貨"
                                   data-category="${category}" data-item-key="${itemKey}" data-item-name="${item.name}">
                            <span class="status-icon">✅</span>
                            <span class="status-text">${t('replenishedStatus')}</span>
                        </label>
                    </div>
                `;
            } else {
                statusOptionsHtml = `
                    <div class="status-options">
                        <label class="status-option no-need">
                            <input type="radio" name="${itemKey}" value="不用叫貨"
                                   data-category="${category}" data-item-key="${itemKey}" data-item-name="${item.name}" checked>
                            <span class="status-icon">✅</span>
                            <span class="status-text">${t('noNeedOrderStatus')}</span>
                        </label>
                        <label class="status-option need-order">
                            <input type="radio" name="${itemKey}" value="要叫貨"
                                   data-category="${category}" data-item-key="${itemKey}" data-item-name="${item.name}">
                            <span class="status-icon">⚠️</span>
                            <span class="status-text">${t('needOrderStatus')}</span>
                        </label>
                    </div>
                `;
            }

            itemDiv.innerHTML = `
                <div class="item-header">
                    <div class="item-name">${displayName} ${freqTag}</div>
                    ${item.threshold ? `<div class="item-threshold">⚠️ ${displayThreshold}</div>` : ''}
                    ${avgDaysInfo}
                    ${lastInfo}
                </div>
                ${statusOptionsHtml}
            `;

            container.appendChild(itemDiv);
        });
    });

    // 更新各頻率的項目數量
    const dailyCountEl = document.getElementById('freqDailyCount');
    const weeklyCountEl = document.getElementById('freqWeeklyCount');
    const monthlyCountEl = document.getElementById('freqMonthlyCount');
    if (dailyCountEl) dailyCountEl.textContent = frequencyCounts.daily;
    if (weeklyCountEl) weeklyCountEl.textContent = frequencyCounts.weekly;
    if (monthlyCountEl) monthlyCountEl.textContent = frequencyCounts.monthly;

    // 套用目前的篩選
    applyFrequencyFilter();
}

// 頻率篩選功能
function filterByFrequency(frequency) {
    currentFrequencyFilter = frequency;

    // 更新按鈕狀態（支援新的 freq-filter-btn 和舊的 freq-btn）
    document.querySelectorAll('.freq-btn, .freq-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.freq === frequency) {
            btn.classList.add('active');
        }
    });

    applyFrequencyFilter();

    // 更新今日建議區塊的顯示（更新數量和選中狀態）
    updateTodaySuggestion();

    // 如果是手機版，重新初始化（使用手動選擇的頻率）
    if (isMobileView()) {
        initMobileSwipeWithFilter(frequency);
    }
}

// 套用頻率篩選
function applyFrequencyFilter() {
    const allItems = document.querySelectorAll('.item-row[data-frequency]');

    // 確定要顯示的頻率列表
    let filterFreqs = [];
    if (currentFrequencyFilter === 'all') {
        filterFreqs = ['daily', 'weekly', 'monthly'];
    } else if (currentFrequencyFilter === 'today') {
        filterFreqs = todaySuggestedFrequencies;
    } else {
        filterFreqs = [currentFrequencyFilter];
    }

    allItems.forEach(item => {
        const itemFreq = item.getAttribute('data-frequency');
        if (filterFreqs.includes(itemFreq)) {
            item.classList.remove('freq-hidden');
        } else {
            item.classList.add('freq-hidden');
        }
    });

    // 更新區域顯示（如果該區域所有項目都被隱藏，則隱藏整個區域標題）
    updateCategorySectionsVisibility();
}

// 更新區域顯示狀態
function updateCategorySectionsVisibility() {
    const sections = document.querySelectorAll('.category-section');

    sections.forEach(section => {
        const visibleItems = section.querySelectorAll('.item-row:not(.freq-hidden)');
        if (visibleItems.length === 0 && currentFrequencyFilter !== 'all') {
            section.style.display = 'none';
        } else {
            section.style.display = '';
        }
    });
}

// ===== 今日盤點建議功能 =====

// 計算今天應該盤點哪些頻率
function getTodayFrequencies() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=週日, 1=週一, ...
    const dayOfMonth = today.getDate(); // 1-31

    const frequencies = [];

    // 每日項目每天都要盤
    frequencies.push('daily');

    // 每週項目在週一盤（可調整）
    if (dayOfWeek === 1) { // 週一
        frequencies.push('weekly');
    }

    // 每月項目在每月1號盤（可調整）
    if (dayOfMonth === 1) {
        frequencies.push('monthly');
    }

    return frequencies;
}

// 取得今天的描述文字
function getTodayDescription() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayOfMonth = today.getDate();
    const month = today.getMonth() + 1;

    const weekDays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

    return `${month}月${dayOfMonth}日（${weekDays[dayOfWeek]}）`;
}

// 更新今日盤點建議顯示
function updateTodaySuggestion() {
    const titleEl = document.getElementById('suggestionTitle');
    const contentEl = document.getElementById('suggestionContent');

    if (!contentEl) return;

    const todayDesc = getTodayDescription();
    todaySuggestedFrequencies = getTodayFrequencies();

    if (titleEl) {
        titleEl.textContent = `📅 ${todayDesc}`;
    }

    // 建立頻率說明
    const freqInfo = {
        daily: { icon: '🔴', name: '每日項目' },
        weekly: { icon: '🔵', name: '每週項目' },
        monthly: { icon: '🟢', name: '每月項目' }
    };

    // 統計各頻率的項目數
    const freqCounts = { daily: 0, weekly: 0, monthly: 0 };
    Object.keys(inventoryData).forEach(category => {
        inventoryData[category].forEach(item => {
            if (disabledItems.has(item.name)) return;
            const freq = getItemFrequency(item.name);
            freqCounts[freq]++;
        });
    });

    let html = '<div style="margin-bottom: 8px;">';

    if (todaySuggestedFrequencies.length === 1 && todaySuggestedFrequencies[0] === 'daily') {
        html += '今天是<strong>一般日</strong>，建議盤點：';
    } else if (todaySuggestedFrequencies.includes('weekly') && !todaySuggestedFrequencies.includes('monthly')) {
        html += '今天是<strong>週一</strong>，建議盤點：';
    } else if (todaySuggestedFrequencies.includes('monthly')) {
        html += '今天是<strong>月初</strong>，建議盤點：';
    }

    // 顯示今天需盤的頻率
    const activeFreqs = todaySuggestedFrequencies.map(f => `${freqInfo[f].icon} ${freqInfo[f].name}`).join(' + ');
    html += `<strong style="color: #1565c0;">${activeFreqs}</strong>`;
    html += '</div>';

    // 篩選按鈕區域
    html += `<div style="display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0;">
        <button class="freq-filter-btn ${currentFrequencyFilter === 'all' ? 'active' : ''}" onclick="filterByFrequency('all')" data-freq="all">
            📦 全部 <span class="freq-count">${freqCounts.daily + freqCounts.weekly + freqCounts.monthly}</span>
        </button>
        <button class="freq-filter-btn ${currentFrequencyFilter === 'today' ? 'active' : ''}" onclick="filterByFrequency('today')" data-freq="today">
            📅 今日建議
        </button>
        <button class="freq-filter-btn ${currentFrequencyFilter === 'daily' ? 'active' : ''}" onclick="filterByFrequency('daily')" data-freq="daily">
            🔴 每日 <span class="freq-count">${freqCounts.daily}</span>
        </button>
        <button class="freq-filter-btn ${currentFrequencyFilter === 'weekly' ? 'active' : ''}" onclick="filterByFrequency('weekly')" data-freq="weekly">
            🔵 每週 <span class="freq-count">${freqCounts.weekly}</span>
        </button>
        <button class="freq-filter-btn ${currentFrequencyFilter === 'monthly' ? 'active' : ''}" onclick="filterByFrequency('monthly')" data-freq="monthly">
            🟢 每月 <span class="freq-count">${freqCounts.monthly}</span>
        </button>
    </div>`;

    // 統計目前篩選顯示的項目數
    let visibleItemCount = 0;
    let filterFreqs = [];
    if (currentFrequencyFilter === 'all') {
        filterFreqs = ['daily', 'weekly', 'monthly'];
    } else if (currentFrequencyFilter === 'today') {
        filterFreqs = todaySuggestedFrequencies;
    } else {
        filterFreqs = [currentFrequencyFilter];
    }

    Object.keys(inventoryData).forEach(category => {
        inventoryData[category].forEach(item => {
            if (disabledItems.has(item.name)) return;
            const freq = getItemFrequency(item.name);
            if (filterFreqs.includes(freq)) {
                visibleItemCount++;
            }
        });
    });

    const filterDesc = currentFrequencyFilter === 'all' ? '全部項目' :
                       currentFrequencyFilter === 'today' ? '今日建議項目' :
                       freqInfo[currentFrequencyFilter].name;

    html += `<div style="font-size: 1.1em; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #90caf9;">
        目前顯示：<strong style="color: #1565c0;">${filterDesc}</strong>，
        共 <strong style="color: #1e88e5; font-size: 1.3em;">${visibleItemCount}</strong> 個項目
    </div>`;

    contentEl.innerHTML = html;
}

// 套用今日建議的篩選（系統自動執行）
function applyTodaySuggestion(silent = true) {
    // 設定為今日建議模式
    currentFrequencyFilter = 'today';

    // 套用篩選：只顯示今日建議的頻率
    const allItems = document.querySelectorAll('.item-row[data-frequency]');

    allItems.forEach(item => {
        const itemFreq = item.getAttribute('data-frequency');
        if (todaySuggestedFrequencies.includes(itemFreq)) {
            item.classList.remove('freq-hidden');
        } else {
            item.classList.add('freq-hidden');
        }
    });

    updateCategorySectionsVisibility();

    // 重新初始化手機版（如果在手機上）
    if (isMobileView()) {
        initMobileSwipe();
    }
}

// 取得分類標籤
function getCategoryLabel(category) {
    const labels = {
        ajun: '辦公室',
        warehouse: '倉庫',
        meiban: '貼紙',
        xiujuan: 'OPP袋'
    };
    return labels[category] || category;
}

// 取得狀態文字（原始中文，用於資料儲存）
function getStatusText(status) {
    const statusMap = {
        '不用叫貨': '✅ 不用叫貨',
        '要叫貨': '⚠️ 要叫貨',
        '補貨中': '🚚 補貨中',
        '已補貨': '✅ 已補貨'
    };
    return statusMap[status] || status;
}

// 取得狀態文字（翻譯版，用於顯示）
function getStatusTextTranslated(status) {
    if (status === '不用叫貨') {
        return '✅ ' + t('noNeedOrderStatus');
    } else if (status === '要叫貨') {
        return '⚠️ ' + t('needOrderStatus');
    } else if (status === '補貨中') {
        return '🚚 ' + t('replenishingStatus');
    } else if (status === '已補貨') {
        return '✅ ' + t('replenishedStatus');
    }
    return status;
}

// 取得平均補貨天數資訊（從統計數據）
function getAvgReplenishDaysInfo(itemKey) {
    if (!statisticsData || !statisticsData.items) {
        return '';
    }

    const itemStats = statisticsData.items.find(item => item.itemKey === itemKey || item.itemName === itemKey);
    if (!itemStats || itemStats.avgReplenishDays === null) {
        return '';
    }

    const avgDays = itemStats.avgReplenishDays;
    // 根據天數設定不同顏色
    let colorStyle = 'color: #666;';
    if (avgDays > 7) {
        colorStyle = 'color: #e53935;';  // 紅色：補貨慢，需要頻繁盤點
    } else if (avgDays <= 3) {
        colorStyle = 'color: #43a047;';  // 綠色：補貨快
    } else {
        colorStyle = 'color: #1e88e5;';  // 藍色：一般
    }

    return `<div class="item-threshold" style="background: #f5f5f5; border-left-color: #9e9e9e; ${colorStyle}">📦 平均叫貨約 ${avgDays} 天到貨</div>`;
}

// 判斷項目是否需要顯示補貨模式（上次狀態是「要叫貨」或「補貨中」）
function isReplenishMode(itemKey) {
    const lastStatus = lastInventoryData[itemKey];
    return lastStatus === '要叫貨' || lastStatus === '補貨中';
}

// 更新項目狀態
function updateItemStatus(input) {
    const row = input.closest('.item-row');
    const value = input.value;

    row.classList.remove('warning', 'status-changed');

    // 根據選擇的狀態更新樣式
    if (value === '要叫貨') {
        row.classList.add('warning');
    }

    // 檢查與上次盤點的差異
    const itemKey = input.dataset.itemKey;
    const lastStatus = lastInventoryData[itemKey];

    // 如果與上次狀態不同，標記為已變更
    if (lastStatus && lastStatus !== value) {
        row.classList.add('status-changed');
    }
}

// 更新統計（統計區域已移除，此函數保留供內部邏輯使用）
function updateStats() {
    // 統計區域已移除，不再需要更新 DOM
}

// 檢查是否所有項目都已填寫
function checkAllFilled() {
    const date = document.getElementById('inventoryDate').value;
    const person = document.getElementById('inventoryPerson').value;

    const allRadios = document.querySelectorAll('input[type="radio"]');
    const uniqueNames = new Set();
    allRadios.forEach(radio => uniqueNames.add(radio.name));

    let filled = 0;
    uniqueNames.forEach(name => {
        const selected = document.querySelector(`input[name="${name}"]:checked`);
        if (selected) {
            filled++;
        }
    });

    return date && person && filled === uniqueNames.size;
}

// 更新按鈕狀態
function updateButtonStates() {
    // 按鈕保持可點擊，點擊時再檢查並提示
    // 這樣用戶可以隨時點擊，會收到明確的提示訊息
}

// 自動儲存
let autoSaveTimer;
function autoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        saveData(true);
    }, 1000);
}

// 儲存資料
function saveData(silent = false) {
    const data = {
        date: document.getElementById('inventoryDate').value,
        person: document.getElementById('inventoryPerson').value,
        items: {}
    };

    document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
        const itemKey = radio.dataset.itemKey;
        const value = radio.value;

        if (itemKey) {
            data.items[itemKey] = value;
        }
    });

    localStorage.setItem('inventoryData', JSON.stringify(data));

    if (!silent) {
        showAlert('資料已儲存！', 'success');
    }
}

// 載入資料
function loadData() {
    const saved = localStorage.getItem('inventoryData');
    if (!saved) return;

    try {
        const data = JSON.parse(saved);

        if (data.date) {
            document.getElementById('inventoryDate').value = data.date;
        }

        if (data.person) {
            document.getElementById('inventoryPerson').value = data.person;
        }

        if (data.items) {
            // 新格式：items 直接是 { itemName: status } 的對應
            Object.keys(data.items).forEach(itemKey => {
                const value = data.items[itemKey];
                const radio = document.querySelector(`input[name="${itemKey}"][value="${value}"]`);
                if (radio) {
                    radio.checked = true;
                    updateItemStatus(radio);
                }
            });
        }

        updateStats();
    } catch (e) {
        console.error('載入資料失敗', e);
    }
}

// 匯出資料
function exportData() {
    if (!checkAllFilled()) {
        showAlert('請填寫所有項目後才能匯出資料！', 'warning');
        return;
    }

    const date = document.getElementById('inventoryDate').value;
    const person = document.getElementById('inventoryPerson').value;

    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += '盤點日期,盤點人員,分類,項目名稱,補貨條件,狀態\n';

    const categoryNames = {
        ajun: '辦公室區域',
        warehouse: '倉庫區',
        meiban: '倉庫貼紙盤點',
        xiujuan: 'OPP袋子盤點'
    };

    Object.keys(inventoryData).forEach(category => {
        inventoryData[category].forEach((item, index) => {
            const itemKey = item.name;
            const selected = document.querySelector(`input[name="${itemKey}"]:checked`);
            const status = selected ? selected.value : '未填寫';

            csvContent += `${date},${person},${categoryNames[category]},${item.name},${item.threshold},${status}\n`;
        });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `盤點表_${person}_${date}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showAlert(t('dataExported'), 'success');
}


// 顯示待處理項目（要叫貨 + 補貨中）
function showPendingItems() {
    const needToOrder = [];
    const replenishing = [];

    Object.keys(inventoryData).forEach(category => {
        inventoryData[category].forEach((item, index) => {
            const itemKey = item.name;

            // 優先從手機版的 mobileSelections 讀取（如果在手機版）
            let status = null;
            if (isMobileView() && mobileSelections[itemKey]) {
                status = mobileSelections[itemKey];
            } else {
                // 從桌面版 radio 讀取
                const selected = document.querySelector(`input[name="${itemKey}"]:checked`);
                if (selected) {
                    status = selected.value;
                }
            }

            if (status === '要叫貨') {
                needToOrder.push({
                    name: item.name,
                    threshold: item.threshold
                });
            } else if (status === '補貨中') {
                replenishing.push({
                    name: item.name,
                    threshold: item.threshold
                });
            }
        });
    });

    const orderList = document.getElementById('orderList');

    if (needToOrder.length === 0 && replenishing.length === 0) {
        orderList.innerHTML = `<p style="color: #28a745; font-weight: bold;">✅ 目前沒有待處理項目</p>`;
    } else {
        let html = '<div id="copyableList">';

        // 要叫貨區塊
        if (needToOrder.length > 0) {
            html += '<div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">';
            html += `<strong style="color: #856404;">⚠️ 要叫貨（${needToOrder.length} 項）- 需要採購</strong><br><br>`;
            needToOrder.forEach(item => {
                html += `• ${item.name}`;
                if (item.threshold) {
                    html += ` <span style="color: #999; font-size: 0.9em;">(${item.threshold})</span>`;
                }
                html += '<br>';
            });
            html += '</div>';
        }

        // 補貨中區塊
        if (replenishing.length > 0) {
            html += '<div style="background: #e3f2fd; padding: 15px; border-radius: 8px;">';
            html += `<strong style="color: #1565c0;">🚚 補貨中（${replenishing.length} 項）- 已在處理</strong><br><br>`;
            replenishing.forEach(item => {
                html += `• ${item.name}`;
                if (item.threshold) {
                    html += ` <span style="color: #999; font-size: 0.9em;">(${item.threshold})</span>`;
                }
                html += '<br>';
            });
            html += '</div>';
        }

        html += '</div>';

        // 摘要
        html = `<div style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 6px;">
            <span style="color: #f57c00; font-weight: bold;">⚠️ 要叫貨: ${needToOrder.length}</span>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            <span style="color: #1565c0; font-weight: bold;">🚚 補貨中: ${replenishing.length}</span>
        </div>` + html;

        orderList.innerHTML = html;
    }

    document.getElementById('orderModal').classList.add('show');
}

// 舊函數保留相容性
function showNeedToOrder() {
    showPendingItems();
}

// 複製叫貨清單
function copyOrderList() {
    const listDiv = document.getElementById('copyableList');
    const text = listDiv.innerText;

    navigator.clipboard.writeText(text).then(() => {
        showAlert(t('listCopied'), 'success');
        // 關閉彈窗
        setTimeout(() => {
            closeModal();
        }, 1500);
    }).catch(() => {
        showAlert(t('copyFailed'), 'danger');
    });
}

// 關閉彈窗
function closeModal() {
    document.getElementById('orderModal').classList.remove('show');
}

// 顯示成功彈窗
function showSuccessModal(title, message) {
    const modal = document.getElementById('successModal');
    const titleEl = document.getElementById('successTitle');
    const messageEl = document.getElementById('successMessage');

    titleEl.textContent = title || t('submitSuccessTitle');
    messageEl.textContent = message || t('submitSuccessMessage');

    modal.classList.add('show');

    // 震動反饋（手機）
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

// 關閉成功彈窗
function closeSuccessModal() {
    // 直接重新整理頁面，確保所有狀態都更新
    location.reload();
}

// 提交資料
async function submitData() {
    const person = document.getElementById('inventoryPerson').value;
    if (!person) {
        showAlert(t('pleaseSelectPerson'), 'warning');
        document.getElementById('inventoryPerson').focus();
        return;
    }

    if (!checkAllFilled()) {
        showAlert(t('pleaseFillAll'), 'warning');
        return;
    }

    // 統計各狀態的項目
    const needToOrderItems = [];
    const replenishingItems = [];
    const replenishedItems = [];

    document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
        if (radio.value === '要叫貨') {
            needToOrderItems.push(radio.dataset.itemName);
        } else if (radio.value === '補貨中') {
            replenishingItems.push(radio.dataset.itemName);
        } else if (radio.value === '已補貨') {
            replenishedItems.push(radio.dataset.itemName);
        }
    });

    // 確認提示訊息
    let confirmMessage = '📋 本次盤點結果：\n';

    // 要叫貨項目
    if (needToOrderItems.length > 0) {
        confirmMessage += t('confirmWithOrders', {
            count: needToOrderItems.length,
            items: needToOrderItems.join('\n• ')
        }).replace('📋 本次盤點結果：\n\n', '\n');
    }

    // 補貨中項目
    if (replenishingItems.length > 0) {
        confirmMessage += t('confirmReplenishing', {
            count: replenishingItems.length,
            items: replenishingItems.join('\n• ')
        });
    }

    // 已補貨項目
    if (replenishedItems.length > 0) {
        confirmMessage += t('confirmReplenished', {
            count: replenishedItems.length,
            items: replenishedItems.join('\n• ')
        });
    }

    // 如果都沒有特殊狀態
    if (needToOrderItems.length === 0 && replenishingItems.length === 0 && replenishedItems.length === 0) {
        confirmMessage = t('confirmAllNoOrder');
    } else {
        confirmMessage += '\n\n確定要提交嗎？';
    }

    // 檢查是否有狀態變更的項目
    const changedItems = document.querySelectorAll('.item-row.status-changed');
    if (changedItems.length > 0) {
        const itemNames = Array.from(changedItems).map(row => {
            return row.querySelector('.item-name').textContent;
        }).join('、');

        confirmMessage += t('statusChangedWarning', { items: itemNames });
    }

    if (confirm(confirmMessage)) {
        // 顯示載入中
        const submitBtn = document.querySelector('button[onclick="submitData()"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = t('submitting');

        try {
            // 提交到 Google Sheets
            await submitToGoogleSheets();

            // 儲存到本地
            saveData();

            // 自動匯出 CSV 檔案
            exportData();

            // 顯示成功彈窗（明顯的提示）
            showSuccessModal(t('submitSuccessTitle'), t('submitSuccessMessage'));

        } catch (error) {
            console.error('提交失敗：', error);
            showAlert(t('submitFailed') + error.message, 'danger');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            updateButtonStates();
        }
    }
}

// 顯示提示
function showAlert(message, type = 'success') {
    const container = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    container.appendChild(alert);

    setTimeout(() => {
        alert.style.transition = 'opacity 0.3s';
        alert.style.opacity = '0';
        setTimeout(() => {
            container.removeChild(alert);
        }, 300);
    }, 3000);
}

// 切換分類顯示
function toggleCategory(category) {
    const content = document.getElementById(`${category}-content`);
    const header = content.previousElementSibling;

    content.classList.toggle('collapsed');
    header.classList.toggle('collapsed');
}

// 點擊彈窗外部關閉
document.addEventListener('click', function(event) {
    const modal = document.getElementById('orderModal');
    if (event.target === modal) {
        closeModal();
    }
});

// ===== 手機版滑動模式功能 =====

// 所有項目的扁平列表（用於手機版滑動）
let allItemsFlat = [];
let currentItemIndex = 0;

// 手機版選擇狀態儲存（獨立於 DOM）
let mobileSelections = {};

// 頻率分類對應
function getFrequencyInfo() {
    return {
        daily: { name: '每日盤', icon: '🔴', color: '#e53935' },
        weekly: { name: '每週盤', icon: '🔵', color: '#1e88e5' },
        monthly: { name: '每月盤', icon: '🟢', color: '#43a047' }
    };
}

// 原分類對應（保留用於顯示）
function getCategoryInfo() {
    return {
        ajun: { name: t('office'), icon: '🖊️', color: '#1e88e5' },
        warehouse: { name: t('warehouse'), icon: '📦', color: '#43a047' },
        meiban: { name: t('sticker'), icon: '🎨', color: '#8e24aa' },
        xiujuan: { name: t('opp'), icon: '📮', color: '#f57c00' }
    };
}

// 初始化手機版滑動模式（按區域分類：辦公室→倉庫→貼紙→OPP袋，自動套用今日建議）
function initMobileSwipe() {
    // 取得今日應盤點的頻率
    const todayFreqs = getTodayFrequencies();

    // 更新手機版今日建議顯示
    updateMobileTodaySuggestion(todayFreqs);

    // 建立所有項目的扁平列表（按區域分類排序，只包含今日該盤的項目）
    allItemsFlat = [];

    // 依區域順序加入項目
    const categoryOrder = ['ajun', 'warehouse', 'meiban', 'xiujuan'];

    categoryOrder.forEach(category => {
        if (!inventoryData[category]) return;

        inventoryData[category].forEach((item, index) => {
            // 跳過被標記異常（停用）的項目
            if (disabledItems.has(item.name)) {
                return;
            }

            const itemKey = item.name;
            const frequency = getItemFrequency(itemKey);

            // 只加入今日該盤的項目
            if (!todayFreqs.includes(frequency)) {
                return;
            }

            allItemsFlat.push({
                ...item,
                category: category,
                frequency: frequency,
                index: index,
                itemKey: itemKey
            });

            // 根據補貨模式設定預設值（如果尚未設定）
            if (!mobileSelections[itemKey]) {
                if (isReplenishMode(itemKey)) {
                    mobileSelections[itemKey] = '補貨中';
                } else {
                    mobileSelections[itemKey] = '不用叫貨';
                }
            }
        });
    });

    // 從桌面版同步選擇狀態到 mobileSelections
    syncFromDesktop();

    // 生成分類標籤
    generateCategoryTabs();

    // 顯示第一個項目
    currentItemIndex = 0;
    showCurrentItem();

    // 更新導航按鈕狀態
    updateNavButtons();

    // 綁定觸控滑動事件
    bindSwipeEvents();
}

// 更新手機版今日盤點建議顯示
function updateMobileTodaySuggestion(todayFreqs) {
    const textEl = document.getElementById('mobileSuggestionText');
    if (!textEl) return;

    const todayDesc = getTodayDescription();
    const freqNames = {
        daily: '🔴每日',
        weekly: '🔵每週',
        monthly: '🟢每月'
    };

    const freqList = todayFreqs.map(f => freqNames[f]).join(' + ');

    // 計算今日需盤點的項目數
    let itemCount = 0;
    Object.keys(inventoryData).forEach(category => {
        inventoryData[category].forEach(item => {
            if (disabledItems.has(item.name)) return;
            const freq = getItemFrequency(item.name);
            if (todayFreqs.includes(freq)) {
                itemCount++;
            }
        });
    });

    textEl.innerHTML = `📅 ${todayDesc}<br><strong>${freqList}</strong> 共 <strong>${itemCount}</strong> 項`;
}

// 根據指定頻率初始化手機版（用於手動篩選）
function initMobileSwipeWithFilter(frequency) {
    // 根據篩選條件決定要顯示的頻率
    let filterFreqs;
    if (frequency === 'all') {
        filterFreqs = ['daily', 'weekly', 'monthly'];
    } else if (frequency === 'today') {
        filterFreqs = getTodayFrequencies();
    } else {
        filterFreqs = [frequency];
    }

    // 更新手機版建議顯示
    const textEl = document.getElementById('mobileSuggestionText');
    if (textEl) {
        const freqNames = {
            daily: '🔴每日',
            weekly: '🔵每週',
            monthly: '🟢每月'
        };
        const freqList = filterFreqs.map(f => freqNames[f]).join(' + ');

        // 計算篩選後的項目數
        let itemCount = 0;
        Object.keys(inventoryData).forEach(category => {
            inventoryData[category].forEach(item => {
                if (disabledItems.has(item.name)) return;
                const freq = getItemFrequency(item.name);
                if (filterFreqs.includes(freq)) {
                    itemCount++;
                }
            });
        });

        if (frequency === 'all') {
            textEl.innerHTML = `📋 顯示全部項目<br>共 <strong>${itemCount}</strong> 項`;
        } else if (frequency === 'today') {
            const todayDesc = getTodayDescription();
            textEl.innerHTML = `📅 ${todayDesc}<br><strong>${freqList}</strong> 共 <strong>${itemCount}</strong> 項`;
        } else {
            textEl.innerHTML = `🔍 篩選：<strong>${freqList}</strong><br>共 <strong>${itemCount}</strong> 項`;
        }
    }

    // 建立篩選後的項目列表
    allItemsFlat = [];
    const categoryOrder = ['ajun', 'warehouse', 'meiban', 'xiujuan'];

    categoryOrder.forEach(category => {
        if (!inventoryData[category]) return;

        inventoryData[category].forEach((item, index) => {
            if (disabledItems.has(item.name)) return;

            const itemKey = item.name;
            const itemFreq = getItemFrequency(itemKey);

            // 只加入符合篩選條件的項目
            if (!filterFreqs.includes(itemFreq)) return;

            allItemsFlat.push({
                ...item,
                category: category,
                frequency: itemFreq,
                index: index,
                itemKey: itemKey
            });

            if (!mobileSelections[itemKey]) {
                if (isReplenishMode(itemKey)) {
                    mobileSelections[itemKey] = '補貨中';
                } else {
                    mobileSelections[itemKey] = '不用叫貨';
                }
            }
        });
    });

    syncFromDesktop();
    generateCategoryTabs();
    currentItemIndex = 0;
    showCurrentItem();
    updateNavButtons();
}

// 生成分類標籤
function generateCategoryTabs() {
    const tabsContainer = document.getElementById('categoryTabs');
    if (!tabsContainer) return;

    updateCategoryTabs();
}

// 更新分類標籤（按區域分類，顯示要叫貨數量）
function updateCategoryTabs() {
    const tabsContainer = document.getElementById('categoryTabs');
    if (!tabsContainer) return;

    let html = '';
    let startIndex = 0;

    const categoryOrder = ['ajun', 'warehouse', 'meiban', 'xiujuan'];

    categoryOrder.forEach(category => {
        const info = getCategoryInfo()[category];
        if (!info) return;

        // 計算該區域的項目
        const categoryItems = allItemsFlat.filter(item => item.category === category);

        // 計算「要叫貨」的數量
        let needOrderCount = 0;
        categoryItems.forEach(item => {
            if (mobileSelections[item.itemKey] === '要叫貨') {
                needOrderCount++;
            }
        });

        const countBadge = needOrderCount > 0
            ? `<span class="tab-count" style="background: #ff5722; color: white;">${needOrderCount}</span>`
            : `<span class="tab-count">${categoryItems.length}</span>`;

        html += `<button class="category-tab" data-category="${category}" data-start="${startIndex}" onclick="jumpToItem(${startIndex})" style="border-color: ${info.color};">
            ${info.icon} ${info.name} ${countBadge}
        </button>`;

        startIndex += categoryItems.length;
    });

    tabsContainer.innerHTML = html;
    updateCategoryTabActive();
}

// 跳轉到指定分類
function jumpToCategory(category, startIndex) {
    currentItemIndex = startIndex;
    showCurrentItem();
    updateNavButtons();
    updateCategoryTabActive();
}

// 更新分類標籤的 active 狀態
function updateCategoryTabActive() {
    const currentItem = allItemsFlat[currentItemIndex];
    if (!currentItem) return;

    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.category === currentItem.category) {
            tab.classList.add('active');
        }
    });
}

// 顯示目前項目
function showCurrentItem() {
    const container = document.getElementById('swipeCardContainer');
    if (!container || allItemsFlat.length === 0) return;

    const item = allItemsFlat[currentItemIndex];
    const itemKey = item.itemKey;
    const lastStatus = lastInventoryData[itemKey];
    const info = getCategoryInfo()[item.category];

    // 從獨立狀態儲存中取得已選擇的值
    const currentValue = mobileSelections[itemKey] || null;

    // 取得翻譯的項目名稱和補貨條件（顯示用）
    const displayName = getItemNameDisplay(item.name);
    const displayThreshold = getThresholdDisplay(item.threshold);

    // 根據上次狀態決定顯示哪種選項
    const replenishMode = isReplenishMode(itemKey);

    const lastInfo = lastStatus ?
        `<div class="last-inventory">${t('lastTime')}：${getStatusTextTranslated(lastStatus)}</div>` :
        `<div class="last-inventory" style="color: #999;">${t('lastTime')}：${t('noRecord')}</div>`;

    // 取得平均補貨天數資訊
    const avgDaysInfo = getAvgReplenishDaysInfo(itemKey);

    let statusOptionsHtml;
    if (replenishMode) {
        // 補貨模式：顯示「補貨中」和「已補貨」選項
        statusOptionsHtml = `
            <div class="status-options">
                <label class="status-option replenishing">
                    <input type="radio" name="mobile-${itemKey}" value="補貨中"
                           data-category="${item.category}" data-index="${item.index}" data-item-name="${item.name}" data-item-key="${itemKey}"
                           ${currentValue === '補貨中' ? 'checked' : ''}>
                    <span class="status-icon">🚚</span>
                    <span class="status-text">${t('replenishingStatus')}</span>
                </label>
                <label class="status-option replenished">
                    <input type="radio" name="mobile-${itemKey}" value="已補貨"
                           data-category="${item.category}" data-index="${item.index}" data-item-name="${item.name}" data-item-key="${itemKey}"
                           ${currentValue === '已補貨' ? 'checked' : ''}>
                    <span class="status-icon">✅</span>
                    <span class="status-text">${t('replenishedStatus')}</span>
                </label>
            </div>
        `;
    } else {
        // 正常模式：顯示「不用叫貨」和「要叫貨」選項
        statusOptionsHtml = `
            <div class="status-options">
                <label class="status-option no-need">
                    <input type="radio" name="mobile-${itemKey}" value="不用叫貨"
                           data-category="${item.category}" data-index="${item.index}" data-item-name="${item.name}" data-item-key="${itemKey}"
                           ${currentValue === '不用叫貨' ? 'checked' : ''}>
                    <span class="status-icon">✅</span>
                    <span class="status-text">${t('noNeedOrderStatus')}</span>
                </label>
                <label class="status-option need-order">
                    <input type="radio" name="mobile-${itemKey}" value="要叫貨"
                           data-category="${item.category}" data-index="${item.index}" data-item-name="${item.name}" data-item-key="${itemKey}"
                           ${currentValue === '要叫貨' ? 'checked' : ''}>
                    <span class="status-icon">⚠️</span>
                    <span class="status-text">${t('needOrderStatus')}</span>
                </label>
            </div>
        `;
    }

    // 頻率標籤
    const freqLabels = {
        daily: '🔴 每日',
        weekly: '🔵 每週',
        monthly: '🟢 每月'
    };
    const freqTag = `<span class="freq-tag ${item.frequency}" style="margin-left: 8px;">${freqLabels[item.frequency]}</span>`;

    container.innerHTML = `
        <div class="swipe-card" data-item-key="${itemKey}">
            <div class="item-name">${displayName} ${freqTag}</div>
            ${item.threshold ? `<div class="item-threshold">⚠️ ${displayThreshold}</div>` : ''}
            ${avgDaysInfo}
            ${lastInfo}
            ${statusOptionsHtml}
        </div>
    `;

    // 綁定事件到新生成的 radio
    container.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const key = this.dataset.itemKey;
            const value = this.value;

            // 檢查是否為第一次選擇（用於決定是否自動跳下一項）
            const isFirstSelection = !mobileSelections[key];

            // 儲存到獨立狀態
            mobileSelections[key] = value;

            // 同步更新桌面版的 radio
            const desktopRadio = document.querySelector(`.items-grid input[name="${key}"][value="${value}"]`);
            if (desktopRadio) {
                desktopRadio.checked = true;
                updateItemStatus(desktopRadio);
            }

            updateStats();
            updateMobileStats();
            updateCategoryTabs();
            updateButtonStates();
            autoSave();

            // 改選時不自動跳（讓用戶可以確認）
        });
    });

    // 更新進度顯示
    updateMobileProgress();
    updateMobileStats();

    // 更新分類名稱（顯示區域 + 頻率標籤）
    const categoryNameEl = document.getElementById('mobileCategoryName');
    if (categoryNameEl) {
        const freqLabels = {
            daily: '🔴 每日',
            weekly: '🔵 每週',
            monthly: '🟢 每月'
        };
        categoryNameEl.textContent = `${info.icon} ${info.name} (${freqLabels[item.frequency]})`;
    }
}

// 更新手機版進度
function updateMobileProgress() {
    const progressText = document.getElementById('mobileProgressText');
    const progressBar = document.getElementById('mobileProgressBar');

    if (progressText) {
        progressText.textContent = `${currentItemIndex + 1} / ${allItemsFlat.length}`;
    }

    if (progressBar) {
        const percentage = ((currentItemIndex + 1) / allItemsFlat.length) * 100;
        progressBar.style.width = `${percentage}%`;
    }
}

// 更新手機版統計（只顯示關鍵數據：要叫貨、補貨中）
function updateMobileStats() {
    let needOrder = 0;
    let replenishing = 0;

    allItemsFlat.forEach(item => {
        const value = mobileSelections[item.itemKey];
        if (value === '要叫貨') {
            needOrder++;
        } else if (value === '補貨中') {
            replenishing++;
        }
    });

    const orderEl = document.getElementById('mobileOrderCount');
    const replenishingEl = document.getElementById('mobileReplenishingCount');

    if (orderEl) orderEl.textContent = needOrder;
    if (replenishingEl) replenishingEl.textContent = replenishing;
}

// 導航到上一項/下一項
function navigateItem(direction) {
    const newIndex = currentItemIndex + direction;

    if (newIndex >= 0 && newIndex < allItemsFlat.length) {
        currentItemIndex = newIndex;
        showCurrentItem();
        updateNavButtons();
        updateCategoryTabActive();
    }
}

// 更新導航按鈕狀態
function updateNavButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) {
        prevBtn.disabled = currentItemIndex === 0;
    }

    if (nextBtn) {
        nextBtn.disabled = currentItemIndex === allItemsFlat.length - 1;
    }
}

// 綁定觸控滑動事件
function bindSwipeEvents() {
    const container = document.getElementById('swipeCardContainer');
    if (!container) return;

    let startX = 0;
    let startY = 0;
    let distX = 0;
    let distY = 0;

    container.addEventListener('touchstart', function(e) {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
    }, { passive: true });

    container.addEventListener('touchmove', function(e) {
        if (!startX || !startY) return;

        const touch = e.touches[0];
        distX = touch.clientX - startX;
        distY = touch.clientY - startY;
    }, { passive: true });

    container.addEventListener('touchend', function(e) {
        // 水平滑動距離大於 50px 且大於垂直滑動距離
        if (Math.abs(distX) > 50 && Math.abs(distX) > Math.abs(distY)) {
            if (distX > 0) {
                // 向右滑 = 上一項
                navigateItem(-1);
            } else {
                // 向左滑 = 下一項
                navigateItem(1);
            }
        }

        startX = 0;
        startY = 0;
        distX = 0;
        distY = 0;
    }, { passive: true });
}

// 檢查是否為手機版
function isMobileView() {
    return window.innerWidth <= 768;
}

// 從桌面版同步選擇狀態
function syncFromDesktop() {
    allItemsFlat.forEach(item => {
        // 如果 mobileSelections 已有值，保留
        if (mobileSelections[item.itemKey]) return;

        // 從桌面版 radio 讀取
        const desktopRadio = document.querySelector(`.items-grid input[name="${item.itemKey}"]:checked`);
        if (desktopRadio) {
            mobileSelections[item.itemKey] = desktopRadio.value;
        }
    });
}

// 檢查並顯示完成提示
function checkAndShowCompletion() {
    // 檢查是否所有項目都已填寫（使用獨立狀態）
    let allFilled = true;
    let unfilledItems = [];

    allItemsFlat.forEach((item, index) => {
        const value = mobileSelections[item.itemKey];
        if (!value) {
            allFilled = false;
            unfilledItems.push({ item, index });
        }
    });

    const container = document.getElementById('swipeCardContainer');

    if (allFilled) {
        // 全部填完，顯示完成卡片
        container.innerHTML = `
            <div class="swipe-card" style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 4em; margin-bottom: 20px;">🎉</div>
                <div style="font-size: 1.5em; font-weight: 700; color: #43a047; margin-bottom: 15px;">
                    ${t('allComplete')}
                </div>
                <div style="color: #666;">
                    ${t('itemsCompleted', { count: allItemsFlat.length })}<br>${t('pleaseClickSubmit')}
                </div>
            </div>
        `;

        // 更新進度顯示為完成
        const progressText = document.getElementById('mobileProgressText');
        if (progressText) {
            progressText.textContent = '✅ 完成';
        }

        // 隱藏導航按鈕
        document.querySelector('.swipe-nav-buttons').style.display = 'none';

        // 滾動到提交按鈕
        setTimeout(() => {
            const buttonGroup = document.querySelector('.button-group');
            if (buttonGroup) {
                buttonGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 500);
    } else {
        // 還有未填項目，顯示提示
        const firstUnfilled = unfilledItems[0];
        const lastIndex = allItemsFlat.length - 1;
        const unfilledItemDisplayName = getItemNameDisplay(firstUnfilled.item.name);
        container.innerHTML = `
            <div class="swipe-card" style="text-align: center; padding: 30px 20px;">
                <div style="font-size: 3em; margin-bottom: 15px;">📋</div>
                <div style="font-size: 1.3em; font-weight: 600; color: #f57c00; margin-bottom: 10px;">
                    ${t('itemsRemaining', { count: unfilledItems.length })}
                </div>
                <div style="color: #666; margin-bottom: 20px; font-size: 0.95em;">
                    ${t('selectDestination')}
                </div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button class="btn btn-warning" onclick="jumpToItem(${firstUnfilled.index})" style="width: 100%; padding: 15px; font-size: 1em;">
                        ${t('jumpToUnfilled', { name: unfilledItemDisplayName })}
                    </button>
                    <button class="btn btn-secondary" onclick="jumpToItem(${lastIndex})" style="width: 100%; padding: 15px; font-size: 1em;">
                        ${t('backToLast')}
                    </button>
                </div>
            </div>
        `;
    }
}

// 跳到指定項目
function jumpToItem(index) {
    currentItemIndex = index;
    showCurrentItem();
    updateNavButtons();
    updateCategoryTabActive();

    // 恢復導航按鈕顯示
    const navButtons = document.querySelector('.swipe-nav-buttons');
    if (navButtons) navButtons.style.display = 'flex';
}

// 跳到最後一項
function jumpToLastItem() {
    jumpToItem(allItemsFlat.length - 1);
}

// 滾動到提交按鈕
function scrollToSubmit() {
    const buttonGroup = document.querySelector('.button-group');
    if (buttonGroup) {
        buttonGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// 在頁面載入時初始化手機版
document.addEventListener('DOMContentLoaded', function() {
    // 延遲初始化，等待其他項目生成完成
    setTimeout(() => {
        if (isMobileView()) {
            initMobileSwipe();
        }
    }, 100);
});

// 視窗大小改變時重新初始化
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (isMobileView()) {
            // 保留目前的索引位置
            const savedIndex = currentItemIndex;
            initMobileSwipe();
            // 恢復索引位置
            if (savedIndex >= 0 && savedIndex < allItemsFlat.length) {
                currentItemIndex = savedIndex;
                showCurrentItem();
                updateNavButtons();
                updateCategoryTabActive();
            }
        }
    }, 200);
});

// ===== Google Sheets 整合功能 =====

// 測試 Google Sheets 連接
async function testGoogleSheetsConnection() {
    if (!GOOGLE_SCRIPT_URL) {
        alert('❌ 未設定 Google Sheets URL！\n\n請在 script.js 第 2 行設定 GOOGLE_SCRIPT_URL');
        return;
    }

    const testBtn = document.getElementById('testConnectionBtn');
    if (testBtn) {
        testBtn.disabled = true;
        testBtn.textContent = '測試中...';
    }

    try {
        // 測試 GET 請求
        console.log('測試 GET 請求...');
        const getResponse = await fetch(GOOGLE_SCRIPT_URL + '?action=getLastInventory');
        const getData = await getResponse.json();
        console.log('GET 回應：', getData);

        if (getData.success) {
            const itemCount = Object.keys(getData.data || {}).length;
            alert(`✅ Google Sheets 連接成功！\n\n已載入 ${itemCount} 筆上次盤點資料`);
        } else {
            alert(`⚠️ GET 請求成功但回傳錯誤：\n${getData.error || '未知錯誤'}`);
        }
    } catch (error) {
        console.error('測試失敗：', error);
        alert(`❌ 連接測試失敗！\n\n錯誤訊息：${error.message}\n\n請確認：\n1. Apps Script 已部署為網頁應用程式\n2. 設定「誰可以存取」為「任何人」\n3. URL 是否正確`);
    } finally {
        if (testBtn) {
            testBtn.disabled = false;
            testBtn.textContent = '🔗 測試連接';
        }
    }
}

// 從 Google Sheets 載入所有資料（並行載入加速）
async function loadLastInventory() {
    if (!GOOGLE_SCRIPT_URL) {
        console.log('未設定 Google Sheets URL，跳過載入');
        hideLoading();
        return;
    }

    showLoading();
    updateLoadingText('正在連接伺服器...');

    try {
        // 並行載入所有資料（速度快很多）
        const [lastInvResponse, disabledResponse, purchaseResponse, statsResponse, itemsResponse] = await Promise.all([
            fetch(GOOGLE_SCRIPT_URL + '?action=getLastInventory'),
            fetch(GOOGLE_SCRIPT_URL + '?action=getDisabledItems'),
            fetch(GOOGLE_SCRIPT_URL + '?action=getPurchaseList'),
            fetch(GOOGLE_SCRIPT_URL + '?action=getStatistics'),
            fetch(GOOGLE_SCRIPT_URL + '?action=getInventoryItems')
        ]);

        updateLoadingText('處理資料中...');
        updateLoadingProgressDirect(50);

        // 解析所有回應
        const [lastInvData, disabledData, purchaseResult, statsData, itemsData] = await Promise.all([
            lastInvResponse.json(),
            disabledResponse.json(),
            purchaseResponse.json(),
            statsResponse.json(),
            itemsResponse.json()
        ]);

        updateLoadingProgressDirect(80);

        // 處理盤點項目清單（優先處理，因為其他功能依賴它）
        if (itemsData.success && itemsData.data && Object.keys(itemsData.data).length > 0) {
            inventoryData = itemsData.data;
            console.log('成功載入項目清單（來自 Google Sheets）', inventoryData);
        } else {
            // 使用預設項目清單
            inventoryData = defaultInventoryData;
            console.log('使用預設項目清單', inventoryData);
            // 如果 Google Sheets 沒有項目清單，自動初始化
            if (itemsData.success && itemsData.data === null) {
                console.log('項目清單工作表不存在，自動初始化...');
                initInventoryItemsToSheet();
            }
        }

        // 處理上次盤點資料
        if (lastInvData.success && lastInvData.data) {
            lastInventoryData = lastInvData.data;
            console.log('成功載入上次盤點資料', lastInventoryData);
        }

        // 處理停用項目清單
        if (disabledData.success && disabledData.data) {
            disabledItems = new Set(disabledData.data.map(item => item.itemKey));
            console.log('成功載入停用項目清單', disabledItems);
        }

        // 處理採購追蹤清單
        if (purchaseResult.success) {
            purchaseListData = purchaseResult.data || [];
            renderPurchaseList(purchaseListData);
            updatePurchaseBadge();
            console.log('成功載入採購追蹤清單', purchaseListData);
        }

        // 處理統計數據
        if (statsData.success && statsData.data) {
            statisticsData = statsData.data;
            renderStatistics(statisticsData);
            console.log('成功載入統計數據', statisticsData);
        }

        updateLoadingText('載入完成！');
        updateLoadingProgressDirect(100);

        // 重新生成項目以顯示上次盤點數量（會過濾掉停用項目）
        document.querySelectorAll('.items-grid').forEach(grid => grid.innerHTML = '');
        generateItems();

        // 重新綁定事件監聽器
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', function() {
                updateItemStatus(this);
                updateStats();
                updateButtonStates();
                autoSave();
            });
        });

        // 重新載入本地儲存的資料
        loadData();

        // 重新更新今日盤點建議（因為統計數據載入後頻率可能有變動，但保持用戶選擇的篩選）
        updateTodaySuggestion();
        applyFrequencyFilter();

        // 如果是手機版，確保重新初始化
        if (isMobileView()) {
            initMobileSwipe();
        }

        // 檢查待處理提醒（延遲一點顯示，避免和載入動畫衝突）
        setTimeout(() => {
            checkPendingAlerts();
        }, 500);
    } catch (error) {
        console.error('載入資料失敗：', error);
        hideLoading();
        // 不顯示錯誤訊息，因為可能是第一次使用
    }
}

// 初始化項目清單到 Google Sheets（第一次使用時自動執行）
async function initInventoryItemsToSheet() {
    if (!GOOGLE_SCRIPT_URL) return;

    try {
        const payload = {
            action: 'initInventoryItems',
            items: defaultInventoryData
        };

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload),
            redirect: 'follow'
        });

        const result = await response.json();
        if (result.success) {
            console.log('項目清單已初始化到 Google Sheets：', result.message);
        } else {
            console.error('初始化項目清單失敗：', result.error);
        }
    } catch (error) {
        console.error('初始化項目清單失敗：', error);
        // 嘗試 no-cors 模式
        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify({ action: 'initInventoryItems', items: defaultInventoryData })
            });
            console.log('項目清單已初始化（no-cors 模式）');
        } catch (e) {
            console.error('初始化項目清單失敗（no-cors）：', e);
        }
    }
}

// 從本地項目資料中移除指定項目
function removeItemFromLocalData(itemKey) {
    for (const category in inventoryData) {
        const index = inventoryData[category].findIndex(item => item.name === itemKey);
        if (index !== -1) {
            inventoryData[category].splice(index, 1);
            console.log(`已從本地項目資料移除：${itemKey}`);
            return true;
        }
    }
    return false;
}

// 提交資料到 Google Sheets
async function submitToGoogleSheets() {
    if (!GOOGLE_SCRIPT_URL) {
        throw new Error('未設定 Google Sheets URL');
    }

    const date = document.getElementById('inventoryDate').value;
    const person = document.getElementById('inventoryPerson').value;

    // 收集所有項目資料
    const items = [];
    const latestInventory = {};
    const validItemKeys = []; // 收集所有有效的項目名稱，用於清理孤兒資料

    const categoryNames = {
        ajun: '辦公室區域',
        warehouse: '倉庫區',
        meiban: '倉庫貼紙盤點',
        xiujuan: 'OPP袋子盤點'
    };

    document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
        const category = radio.dataset.category;
        const itemName = radio.dataset.itemName;
        const itemKey = radio.dataset.itemKey; // 使用項目名稱作為 key
        const status = radio.value;

        items.push({
            category: categoryNames[category],
            itemName: itemName,
            status: status,
            itemKey: itemKey
        });

        latestInventory[itemKey] = status;
        validItemKeys.push(itemKey);
    });

    const payload = {
        action: 'submitInventory',
        date: date,
        person: person,
        items: items,
        latestInventory: latestInventory,
        validItemKeys: validItemKeys // 傳送有效項目清單，讓後端清理孤兒資料
    };

    // 使用 Google Apps Script 的標準方式提交
    // 透過建立隱藏的 form 或使用 fetch with redirect
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload),
            redirect: 'follow'
        });

        // 嘗試解析回應
        const result = await response.json();
        console.log('Google Sheets 回應：', result);

        if (result.success) {
            // 更新本地的上次盤點資料
            lastInventoryData = latestInventory;
            return true;
        } else {
            throw new Error(result.error || '提交失敗');
        }
    } catch (error) {
        // 如果是 CORS 問題，改用 no-cors 模式（無法確認結果）
        console.log('嘗試使用 no-cors 模式...');

        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload)
        });

        console.log('已提交資料到 Google Sheets（無法確認結果）');

        // 更新本地的上次盤點資料
        lastInventoryData = latestInventory;

        return true;
    }
}

// ===== Tab 切換功能 =====

let currentTab = 'inventory';
let purchaseListData = [];
let statisticsData = null;
let currentPurchaseFilter = 'all';

// 切換主要 Tab
function switchMainTab(tabName) {
    currentTab = tabName;

    // 更新 Tab 按鈕狀態
    document.querySelectorAll('.main-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });

    // 更新 Tab 面板顯示
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(tabName + 'Panel').classList.add('active');

    // 如果數據尚未載入，則載入（通常已在頁面初始化時載入）
    if (tabName === 'purchase' && purchaseListData.length === 0) {
        loadPurchaseList();
    } else if (tabName === 'dashboard' && !statisticsData) {
        loadStatistics();
    }
}

// ===== 採購追蹤功能 =====

// 載入待採購清單
async function loadPurchaseList() {
    if (!GOOGLE_SCRIPT_URL) {
        renderPurchaseList([]);
        return;
    }

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL + '?action=getPurchaseList');
        const result = await response.json();

        if (result.success) {
            purchaseListData = result.data || [];
            renderPurchaseList(purchaseListData);
            updatePurchaseBadge();
        } else {
            console.error('載入待採購清單失敗：', result.error);
            renderPurchaseList([]);
        }
    } catch (error) {
        console.error('載入待採購清單失敗：', error);
        renderPurchaseList([]);
    }
}

// 超時設定
let overdueSettings = {
    warningDays: 2,
    dangerDays: 3
};

// 載入超時設定
function loadOverdueSettings() {
    const saved = localStorage.getItem('overdueSettings');
    if (saved) {
        try {
            overdueSettings = JSON.parse(saved);
            document.getElementById('warningDays').value = overdueSettings.warningDays;
            document.getElementById('dangerDays').value = overdueSettings.dangerDays;
        } catch (e) {}
    }
}

// 儲存超時設定
function saveOverdueSettings() {
    overdueSettings.warningDays = parseInt(document.getElementById('warningDays').value) || 3;
    overdueSettings.dangerDays = parseInt(document.getElementById('dangerDays').value) || 7;
    localStorage.setItem('overdueSettings', JSON.stringify(overdueSettings));
}

// 渲染待採購清單
function renderPurchaseList(data) {
    const container = document.getElementById('purchaseList');

    // 計算每個項目的等待天數（扣除異常天數）
    data.forEach(item => {
        if (item.orderTime) {
            const orderDate = new Date(item.orderTime);
            const now = new Date();
            const diffTime = Math.abs(now - orderDate);
            const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const abnormalDays = item.abnormalTotalDays || 0;
            item.waitDays = Math.max(0, totalDays - abnormalDays);
        } else {
            item.waitDays = 0;
        }
    });

    // 統計各類別數量
    const counts = {
        all: data.filter(item => !item.isAbnormal).length,
        pending: data.filter(item => item.status === '待採購' && !item.isAbnormal).length,
        replenishing: data.filter(item => item.status === '補貨中' && !item.isAbnormal).length,
        overdue: data.filter(item => item.waitDays >= overdueSettings.warningDays && !item.isAbnormal).length,
        abnormal: data.filter(item => item.isAbnormal).length
    };

    // 更新計數顯示
    const countAllEl = document.getElementById('purchaseCountAll');
    const countPendingEl = document.getElementById('purchaseCountPending');
    const countReplenishingEl = document.getElementById('purchaseCountReplenishing');
    const countOverdueEl = document.getElementById('purchaseCountOverdue');
    const countAbnormalEl = document.getElementById('purchaseCountAbnormal');

    if (countAllEl) countAllEl.textContent = counts.all;
    if (countPendingEl) countPendingEl.textContent = counts.pending;
    if (countReplenishingEl) countReplenishingEl.textContent = counts.replenishing;
    if (countOverdueEl) countOverdueEl.textContent = counts.overdue;
    if (countAbnormalEl) countAbnormalEl.textContent = counts.abnormal;

    // 重新計算等待天數（避免重複計算）
    data.forEach(item => {
        if (item.orderTime) {
            const orderDate = new Date(item.orderTime);
            const now = new Date();
            const diffTime = Math.abs(now - orderDate);
            const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // 扣除異常總天數
            const abnormalDays = item.abnormalTotalDays || 0;
            item.waitDays = Math.max(0, totalDays - abnormalDays);
            item.totalDays = totalDays;  // 保留總天數供參考
            item.abnormalDays = abnormalDays;
        } else {
            item.waitDays = 0;
            item.totalDays = 0;
            item.abnormalDays = 0;
        }
    });

    // 根據篩選條件過濾
    let filteredData = data;
    if (currentPurchaseFilter === 'pending') {
        filteredData = data.filter(item => item.status === '待採購' && !item.isAbnormal);
    } else if (currentPurchaseFilter === 'replenishing') {
        filteredData = data.filter(item => item.status === '補貨中' && !item.isAbnormal);
    } else if (currentPurchaseFilter === 'overdue') {
        filteredData = data.filter(item => item.waitDays >= overdueSettings.warningDays && !item.isAbnormal);
    } else if (currentPurchaseFilter === 'abnormal') {
        filteredData = data.filter(item => item.isAbnormal);
    } else {
        // all - 不顯示異常項目（除非專門篩選）
        filteredData = data.filter(item => !item.isAbnormal);
    }

    if (filteredData.length === 0) {
        const emptyMessage = currentPurchaseFilter === 'abnormal'
            ? '目前沒有標記為異常的項目'
            : currentPurchaseFilter === 'overdue'
            ? '太好了！沒有超時的項目'
            : '目前沒有待處理的採購項目';

        container.innerHTML = `
            <div class="purchase-empty">
                <div class="purchase-empty-icon">✅</div>
                <div class="purchase-empty-text">${emptyMessage}</div>
            </div>
        `;
        return;
    }

    // 按等待天數排序（最久的在前面）
    filteredData.sort((a, b) => (b.waitDays || 0) - (a.waitDays || 0));

    let html = '';
    filteredData.forEach(item => {
        let statusClass = item.status === '待採購' ? 'status-pending' : 'status-replenishing';
        const orderTime = item.orderTime ? formatDateTime(item.orderTime) : '-';
        const replenishingTime = item.replenishingTime ? formatDateTime(item.replenishingTime) : '-';
        const waitDays = item.waitDays || 0;

        // 超時警告樣式
        let overdueClass = '';
        let overdueBadge = '';
        if (!item.isAbnormal) {
            if (waitDays >= overdueSettings.dangerDays) {
                overdueClass = 'overdue-danger';
                overdueBadge = `<span class="overdue-badge danger">🔴 超過 ${waitDays} 天</span>`;
            } else if (waitDays >= overdueSettings.warningDays) {
                overdueClass = 'overdue-warning';
                overdueBadge = `<span class="overdue-badge warning">⚠️ 已 ${waitDays} 天</span>`;
            }
        }

        // 異常樣式
        let abnormalBadge = '';
        let abnormalReasonText = '';
        if (item.isAbnormal) {
            statusClass = 'marked-abnormal';
            overdueClass = '';
            abnormalBadge = `<span class="abnormal-badge">🚫 異常</span>`;
            if (item.abnormalReason) {
                abnormalReasonText = `<div style="color: #9c27b0; font-size: 0.85em; margin-top: 4px;">📝 原因：${item.abnormalReason}</div>`;
            }
        }

        html += `
            <div class="purchase-item ${statusClass} ${overdueClass}">
                <div class="purchase-item-info">
                    <div class="purchase-item-name">
                        ${item.itemName}
                        ${overdueBadge}
                        ${abnormalBadge}
                    </div>
                    <div class="purchase-item-category">${item.category}</div>
                    ${abnormalReasonText}
                    <div class="purchase-item-time">
                        <span>📅 叫貨時間：${orderTime}</span>
                        ${item.status === '補貨中' ? `<span>🚚 開始補貨：${replenishingTime}</span>` : ''}
                        <span>⏱️ 採購等待 ${waitDays} 天</span>
                        ${item.abnormalDays > 0 ? `<span style="color: #9c27b0;">🚫 異常 ${item.abnormalDays} 天</span>` : ''}
                    </div>
                </div>
                <div class="purchase-item-actions">
                    ${!item.isAbnormal ? `
                        ${item.status === '待採購' ? `
                            <button class="purchase-action-btn replenishing" onclick="updatePurchaseStatus('${item.itemKey}', '補貨中')">
                                🚚 開始補貨
                            </button>
                        ` : ''}
                        <button class="purchase-action-btn completed" onclick="updatePurchaseStatus('${item.itemKey}', '已補貨')">
                            ✅ 已到貨
                        </button>
                        <button class="purchase-action-btn cancel-purchase" onclick="cancelPurchase('${item.itemKey}')">
                            ❌ 取消採購
                        </button>
                        <button class="purchase-action-btn abnormal" onclick="markItemAbnormal('${item.itemKey}', true)">
                            🚫 標記異常
                        </button>
                    ` : `
                        <button class="purchase-action-btn cancel-abnormal" onclick="markItemAbnormal('${item.itemKey}', false)">
                            ↩️ 取消異常
                        </button>
                        <button class="purchase-action-btn completed" onclick="updatePurchaseStatus('${item.itemKey}', '已補貨')">
                            ✅ 已補貨
                        </button>
                        <button class="purchase-action-btn remove" onclick="confirmRemoveItem('${item.itemKey}')">
                            🗑️ 確認移除
                        </button>
                    `}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// 格式化日期時間
function formatDateTime(isoString) {
    const date = new Date(isoString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
}

// 篩選待採購清單
function filterPurchase(filter) {
    currentPurchaseFilter = filter;

    // 更新篩選按鈕狀態
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });

    renderPurchaseList(purchaseListData);
}

// 更新採購狀態
async function updatePurchaseStatus(itemKey, newStatus) {
    if (!GOOGLE_SCRIPT_URL) {
        showAlert('未設定 Google Sheets URL', 'warning');
        return;
    }

    const confirmMsg = newStatus === '補貨中'
        ? `確定要將「${itemKey}」標記為「補貨中」嗎？`
        : `確定要將「${itemKey}」標記為「已到貨」嗎？`;

    if (!confirm(confirmMsg)) return;

    try {
        const payload = {
            action: 'updatePurchaseStatus',
            itemKey: itemKey,
            status: newStatus,
            person: document.getElementById('inventoryPerson')?.value || ''
        };

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload),
            redirect: 'follow'
        });

        const result = await response.json();

        if (result.success) {
            showAlert(`✅ ${itemKey} 已更新為「${newStatus}」`, 'success');
            loadPurchaseList();  // 重新載入清單
            loadLastInventory(); // 重新載入最新狀態
        } else {
            throw new Error(result.error || '更新失敗');
        }
    } catch (error) {
        console.error('更新採購狀態失敗：', error);

        // 嘗試 no-cors 模式
        try {
            const payload = {
                action: 'updatePurchaseStatus',
                itemKey: itemKey,
                status: newStatus
            };

            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(payload)
            });

            showAlert(`✅ ${itemKey} 已更新（請重新載入確認）`, 'success');
            setTimeout(() => loadPurchaseList(), 1500);
        } catch (e) {
            showAlert('❌ 更新失敗：' + error.message, 'danger');
        }
    }
}

// 更新採購 Tab 的 Badge
function updatePurchaseBadge() {
    const badge = document.getElementById('purchaseBadge');
    if (badge) {
        const pendingCount = purchaseListData.filter(item =>
            (item.status === '待採購' || item.status === '補貨中') && !item.isAbnormal
        ).length;
        badge.textContent = pendingCount;
        badge.classList.toggle('zero', pendingCount === 0);
    }
}

// 標記項目為異常
async function markItemAbnormal(itemKey, markAsAbnormal) {
    if (!GOOGLE_SCRIPT_URL) {
        showAlert('未設定 Google Sheets URL', 'warning');
        return;
    }

    let reason = '';
    if (markAsAbnormal) {
        // 顯示異常原因選擇對話框
        reason = await showReasonDialog({
            title: '標記異常',
            icon: '🚫',
            itemKey: itemKey,
            reasons: [
                '長期缺貨',
                '供應商問題',
                '品質異常',
                '價格異常',
                '暫停使用',
                '待確認規格'
            ],
            confirmText: '確認標記',
            confirmColor: '#9c27b0'
        });
        if (reason === null) return;  // 用戶取消
    } else {
        if (!confirm(`確定要取消「${itemKey}」的異常標記嗎？`)) return;
    }

    // 顯示處理中狀態
    showAlert(`⏳ 正在${markAsAbnormal ? '標記' : '取消'}異常...`, 'warning');

    // 立即在本地更新 UI（樂觀更新）
    updateLocalAbnormalStatus(itemKey, markAsAbnormal);

    try {
        const payload = {
            action: 'markAbnormal',
            itemKey: itemKey,
            markAsAbnormal: markAsAbnormal,
            reason: reason
        };

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload),
            redirect: 'follow'
        });

        const result = await response.json();

        if (result.success) {
            showAlert(`✅ ${itemKey} ${markAsAbnormal ? '已標記為異常' : '已取消異常標記'}`, 'success');

            // 更新停用項目清單
            if (markAsAbnormal) {
                disabledItems.add(itemKey);
            } else {
                disabledItems.delete(itemKey);
            }

            // 重新生成盤點項目
            refreshInventoryItems();

            // 重新載入儀表板數據
            loadStatistics();
        } else {
            // 如果失敗，恢復原狀
            updateLocalAbnormalStatus(itemKey, !markAsAbnormal);
            throw new Error(result.error || '操作失敗');
        }
    } catch (error) {
        console.error('標記異常失敗：', error);

        // 嘗試 no-cors 模式
        try {
            const payload = {
                action: 'markAbnormal',
                itemKey: itemKey,
                markAsAbnormal: markAsAbnormal,
                reason: reason
            };

            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(payload)
            });

            showAlert(`✅ ${itemKey} ${markAsAbnormal ? '已標記為異常' : '已取消異常標記'}`, 'success');

            // 更新停用項目清單
            if (markAsAbnormal) {
                disabledItems.add(itemKey);
            } else {
                disabledItems.delete(itemKey);
            }

            // 重新生成盤點項目
            refreshInventoryItems();

            // 重新載入儀表板數據
            loadStatistics();
        } catch (e) {
            // 恢復原狀
            updateLocalAbnormalStatus(itemKey, !markAsAbnormal);
            showAlert('❌ 操作失敗：' + error.message, 'danger');
        }
    }
}

// 通用輸入對話框
function showInputDialog(options) {
    const {
        title = '請輸入',
        icon = '✏️',
        label = '',
        placeholder = '請輸入...',
        confirmText = '確認',
        confirmColor = '#1976d2',
        defaultValue = ''
    } = options;

    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000;';

        const dialog = document.createElement('div');
        dialog.style.cssText = 'background:white;border-radius:12px;padding:24px;max-width:360px;width:90%;box-shadow:0 4px 20px rgba(0,0,0,0.3);';

        dialog.innerHTML = `
            <h3 style="margin:0 0 16px 0;color:#333;">${icon} ${title}</h3>
            ${label ? `<p style="margin:0 0 12px 0;color:#666;font-size:14px;">${label}</p>` : ''}
            <input type="text" id="dialogInput" value="${defaultValue}" placeholder="${placeholder}" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:16px;box-sizing:border-box;margin-bottom:16px;">
            <div style="display:flex;gap:12px;justify-content:flex-end;">
                <button id="cancelInputBtn" style="padding:10px 20px;border:1px solid #ddd;border-radius:8px;background:#f5f5f5;cursor:pointer;font-size:14px;">取消</button>
                <button id="confirmInputBtn" style="padding:10px 20px;border:none;border-radius:8px;background:${confirmColor};color:white;cursor:pointer;font-size:14px;font-weight:bold;">${confirmText}</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const input = document.getElementById('dialogInput');
        input.focus();
        input.select();

        // Enter 鍵確認
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const value = input.value.trim();
                if (value) {
                    document.body.removeChild(overlay);
                    resolve(value);
                }
            }
        });

        document.getElementById('cancelInputBtn').addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(null);
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                resolve(null);
            }
        });

        document.getElementById('confirmInputBtn').addEventListener('click', () => {
            const value = input.value.trim();
            if (!value) {
                showAlert('❌ 請輸入內容', 'danger');
                return;
            }
            document.body.removeChild(overlay);
            resolve(value);
        });
    });
}

// 通用原因選擇對話框
function showReasonDialog(options) {
    const {
        title = '請選擇原因',
        icon = '📋',
        itemKey = '',
        reasons = [],
        confirmText = '確認',
        confirmColor = '#1976d2',
        placeholder = '輸入其他原因...'
    } = options;

    return new Promise((resolve) => {
        // 創建對話框
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000;';

        const dialog = document.createElement('div');
        dialog.style.cssText = 'background:white;border-radius:12px;padding:24px;max-width:400px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 4px 20px rgba(0,0,0,0.3);';

        dialog.innerHTML = `
            <h3 style="margin:0 0 16px 0;color:#333;">${icon} ${title}${itemKey ? `「${itemKey}」` : ''}</h3>
            <p style="margin:0 0 12px 0;color:#666;font-size:14px;">請選擇原因：</p>
            <div id="reasonButtons" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
                ${reasons.map(r => `
                    <button class="reason-option-btn" data-reason="${r}" style="padding:12px 16px;border:1px solid #ddd;border-radius:8px;background:#f9f9f9;cursor:pointer;text-align:left;font-size:14px;transition:all 0.2s;">
                        ${r}
                    </button>
                `).join('')}
            </div>
            <div style="margin-bottom:16px;">
                <label style="display:block;margin-bottom:6px;color:#666;font-size:14px;">或輸入自訂原因：</label>
                <input type="text" id="customReasonInput" placeholder="${placeholder}" style="width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
            </div>
            <div style="display:flex;gap:12px;justify-content:flex-end;">
                <button id="cancelDialogBtn" style="padding:10px 20px;border:1px solid #ddd;border-radius:8px;background:#f5f5f5;cursor:pointer;font-size:14px;">取消</button>
                <button id="confirmDialogBtn" style="padding:10px 20px;border:none;border-radius:8px;background:${confirmColor};color:white;cursor:pointer;font-size:14px;font-weight:bold;">${confirmText}</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        let selectedReason = '';

        // 綁定選項按鈕事件
        dialog.querySelectorAll('.reason-option-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                dialog.querySelectorAll('.reason-option-btn').forEach(b => {
                    b.style.background = '#f9f9f9';
                    b.style.borderColor = '#ddd';
                    b.style.color = '#333';
                });
                this.style.background = '#e3f2fd';
                this.style.borderColor = '#1976d2';
                this.style.color = '#1976d2';
                selectedReason = this.dataset.reason;
                document.getElementById('customReasonInput').value = '';
            });

            btn.addEventListener('mouseenter', function() {
                if (this.style.borderColor !== 'rgb(25, 118, 210)') {
                    this.style.background = '#f0f0f0';
                }
            });
            btn.addEventListener('mouseleave', function() {
                if (this.style.borderColor !== 'rgb(25, 118, 210)') {
                    this.style.background = '#f9f9f9';
                }
            });
        });

        document.getElementById('customReasonInput').addEventListener('input', function() {
            if (this.value.trim()) {
                dialog.querySelectorAll('.reason-option-btn').forEach(b => {
                    b.style.background = '#f9f9f9';
                    b.style.borderColor = '#ddd';
                    b.style.color = '#333';
                });
                selectedReason = '';
            }
        });

        document.getElementById('cancelDialogBtn').addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(null);
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                resolve(null);
            }
        });

        document.getElementById('confirmDialogBtn').addEventListener('click', () => {
            const customReason = document.getElementById('customReasonInput').value.trim();
            const finalReason = customReason || selectedReason;

            if (!finalReason) {
                showAlert('❌ 請選擇或輸入原因', 'danger');
                return;
            }

            document.body.removeChild(overlay);
            resolve(finalReason);
        });
    });
}

// 確認移除項目（不需要了）
async function confirmRemoveItem(itemKey) {
    // 詢問操作人員
    const personInput = document.getElementById('personName');
    let person = personInput ? personInput.value.trim() : '';

    if (!person) {
        person = await showInputDialog({
            title: '請輸入姓名',
            icon: '👤',
            placeholder: '您的姓名',
            confirmText: '下一步',
            defaultValue: localStorage.getItem('lastOperatorName') || ''
        });
        if (!person) {
            return;
        }
        // 記住姓名供下次使用
        localStorage.setItem('lastOperatorName', person);
    }

    // 顯示移除原因選擇對話框
    const reason = await showReasonDialog({
        title: '移除',
        icon: '🗑️',
        itemKey: itemKey,
        reasons: [
            '已停用',
            '不再需要',
            '重複項目',
            '規則調整',
            '項目合併',
            '庫存清空不再進貨'
        ],
        confirmText: '確認移除',
        confirmColor: '#e53935'
    });

    if (reason === null) {
        // 用戶按取消
        return;
    }

    showAlert(`⏳ 正在移除...`, 'warning');

    try {
        const payload = {
            action: 'removeItem',
            itemKey: itemKey,
            reason: reason.trim(),
            person: person
        };

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload),
            redirect: 'follow'
        });

        const result = await response.json();

        if (result.success) {
            showAlert(`✅ ${itemKey} 已永久移除（操作人員：${person}）`, 'success');

            // 從本地項目資料中移除（真正刪除）
            removeItemFromLocalData(itemKey);

            // 加入停用清單（盤點時會跳過）
            disabledItems.add(itemKey);

            // 從本地採購清單移除
            if (purchaseListData) {
                purchaseListData = purchaseListData.filter(i => i.itemKey !== itemKey);
                renderPurchaseList(purchaseListData);
            }

            // 重新生成盤點項目（會跳過已停用的項目）
            refreshInventoryItems();

            // 重新載入儀表板數據
            loadStatistics();
        } else {
            throw new Error(result.error || '操作失敗');
        }
    } catch (error) {
        console.error('移除項目失敗：', error);

        // 嘗試 no-cors 模式
        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify({ action: 'removeItem', itemKey: itemKey, reason: reason.trim(), person: person })
            });

            showAlert(`✅ ${itemKey} 已永久移除（操作人員：${person}）`, 'success');

            // 從本地項目資料中移除（真正刪除）
            removeItemFromLocalData(itemKey);

            // 加入停用清單（盤點時會跳過）
            disabledItems.add(itemKey);

            // 從本地採購清單移除
            if (purchaseListData) {
                purchaseListData = purchaseListData.filter(i => i.itemKey !== itemKey);
                renderPurchaseList(purchaseListData);
            }

            // 重新生成盤點項目（會跳過已停用的項目）
            refreshInventoryItems();

            // 重新載入儀表板數據
            loadStatistics();
        } catch (e) {
            showAlert('❌ 移除失敗：' + error.message, 'danger');
        }
    }
}

// 取消本次採購（規則設定問題，不需要實際採購）
async function cancelPurchase(itemKey) {
    // 詢問操作人員
    const personInput = document.getElementById('personName');
    let person = personInput ? personInput.value.trim() : '';

    if (!person) {
        person = await showInputDialog({
            title: '請輸入姓名',
            icon: '👤',
            placeholder: '您的姓名',
            confirmText: '下一步',
            defaultValue: localStorage.getItem('lastOperatorName') || ''
        });
        if (!person) {
            return;
        }
        // 記住姓名供下次使用
        localStorage.setItem('lastOperatorName', person);
    }

    // 顯示取消原因選擇對話框
    const reason = await showReasonDialog({
        title: '取消採購',
        icon: '❌',
        itemKey: itemKey,
        reasons: [
            '規則調整',
            '庫存充足',
            '安全庫存設太高',
            '重複叫貨',
            '暫時不需要',
            '供應商缺貨改其他'
        ],
        confirmText: '確認取消',
        confirmColor: '#ff9800'
    });

    if (reason === null) {
        return;
    }

    showAlert(`⏳ 正在取消採購...`, 'warning');

    try {
        const payload = {
            action: 'cancelPurchase',
            itemKey: itemKey,
            reason: reason.trim(),
            person: person
        };

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload),
            redirect: 'follow'
        });

        const result = await response.json();

        if (result.success) {
            showAlert(`✅ ${itemKey} 已取消採購（操作人員：${person}）`, 'success');

            // 從本地清單移除
            if (purchaseListData) {
                purchaseListData = purchaseListData.filter(i => i.itemKey !== itemKey);
                renderPurchaseList(purchaseListData);
            }

            // 重新載入儀表板數據
            loadStatistics();
        } else {
            throw new Error(result.error || '操作失敗');
        }
    } catch (error) {
        console.error('取消採購失敗：', error);

        // 嘗試 no-cors 模式
        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify({ action: 'cancelPurchase', itemKey: itemKey, reason: reason.trim(), person: person })
            });

            showAlert(`✅ ${itemKey} 已取消採購（操作人員：${person}）`, 'success');

            // 從本地清單移除
            if (purchaseListData) {
                purchaseListData = purchaseListData.filter(i => i.itemKey !== itemKey);
                renderPurchaseList(purchaseListData);
            }

            // 重新載入儀表板數據
            loadStatistics();
        } catch (e) {
            showAlert('❌ 取消採購失敗：' + error.message, 'danger');
        }
    }
}

// 立即更新本地異常狀態（樂觀更新，讓 UI 立即響應）
function updateLocalAbnormalStatus(itemKey, isAbnormal) {
    // 更新 purchaseListData
    if (purchaseListData) {
        const item = purchaseListData.find(i => i.itemKey === itemKey);
        if (item) {
            item.isAbnormal = isAbnormal;
        }
    }
    // 立即重新渲染採購列表
    renderPurchaseList(purchaseListData || []);
}

// 重新生成盤點項目
function refreshInventoryItems() {
    document.querySelectorAll('.items-grid').forEach(grid => grid.innerHTML = '');
    generateItems();
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            updateItemStatus(this);
            updateStats();
            updateButtonStates();
            autoSave();
        });
    });
    updateStats();

    // 更新篩選按鈕的數字（排除異常項目後重新計算）
    updateTodaySuggestion();
    applyFrequencyFilter();

    // 如果在手機版，也要更新
    if (isMobileView()) {
        initMobileSwipe();
    }
}

// ===== 數據儀表板功能 =====

// 載入統計數據
async function loadStatistics() {
    if (!GOOGLE_SCRIPT_URL) {
        renderStatistics(null);
        return;
    }

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL + '?action=getStatistics');
        const result = await response.json();

        if (result.success) {
            statisticsData = result.data;
            renderStatistics(statisticsData);
        } else {
            console.error('載入統計數據失敗：', result.error);
            renderStatistics(null);
        }
    } catch (error) {
        console.error('載入統計數據失敗：', error);
        renderStatistics(null);
    }
}

// 渲染統計數據
function renderStatistics(data) {
    // 更新摘要卡片
    const summary = data?.summary || {};
    document.getElementById('summaryTotal').textContent = summary.totalItems || 0;
    document.getElementById('summaryDaily').textContent = summary.dailyCount || 0;
    document.getElementById('summaryWeekly').textContent = summary.weeklyCount || 0;
    document.getElementById('summaryMonthly').textContent = summary.monthlyCount || 0;
    document.getElementById('summaryAbnormal').textContent = summary.abnormalCount || 0;

    // 渲染表格
    const tbody = document.getElementById('dashboardTableBody');
    const items = data?.items || [];

    if (items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #999;">
                    目前沒有補貨數據，請先進行幾次盤點後再查看分析
                </td>
            </tr>
        `;
        return;
    }

    // 按建議頻率排序（每日 > 每週 > 每月），異常的排最後
    const frequencyOrder = { daily: 0, weekly: 1, monthly: 2 };
    items.sort((a, b) => {
        // 異常項目排最後
        if (a.isAbnormal && !b.isAbnormal) return 1;
        if (!a.isAbnormal && b.isAbnormal) return -1;
        return (frequencyOrder[a.suggestedFrequency] || 1) - (frequencyOrder[b.suggestedFrequency] || 1);
    });

    let html = '';
    items.forEach(item => {
        const frequencyText = {
            daily: '每日盤點',
            weekly: '每週盤點',
            monthly: '每月盤點'
        };

        // 處理狀態顯示
        let statusText;
        if (item.isAbnormal || item.currentStatus === '異常') {
            statusText = '<span style="color: #9c27b0; font-weight: bold;">🚫 異常</span>';
        } else if (item.currentStatus === '待採購') {
            statusText = '<span style="color: #f57c00">待採購</span>';
        } else if (item.currentStatus === '補貨中') {
            statusText = '<span style="color: #42a5f5">補貨中</span>';
        } else {
            statusText = '<span style="color: #66bb6a">正常</span>';
        }

        // 異常天數顯示
        const abnormalDaysText = item.abnormalTotalDays > 0
            ? `<span style="color: #9c27b0; font-weight: bold;">${item.abnormalTotalDays} 天</span>`
            : '<span style="color: #999">-</span>';

        // 異常項目的行樣式
        const rowStyle = item.isAbnormal ? 'background: #f3e5f5;' : '';

        html += `
            <tr style="${rowStyle}">
                <td><strong>${item.itemName}</strong></td>
                <td>${item.category || '-'}</td>
                <td>${item.totalOrders || 0}</td>
                <td>
                    ${item.avgReplenishDays !== null
                        ? `<span class="days-badge">${item.avgReplenishDays} 天</span>`
                        : '<span style="color: #999">尚無數據</span>'
                    }
                </td>
                <td>${abnormalDaysText}</td>
                <td>
                    <span class="frequency-badge ${item.suggestedFrequency}">
                        ${frequencyText[item.suggestedFrequency] || '每週盤點'}
                    </span>
                </td>
                <td>${statusText}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// ===== 待處理提醒功能 =====

// 檢查並顯示待處理提醒
async function checkPendingAlerts() {
    if (!GOOGLE_SCRIPT_URL) return;

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL + '?action=getPendingAlerts');
        const result = await response.json();

        if (result.success && result.data) {
            const { alerts, settings } = result.data;

            // 檢查是否啟用頁面提醒
            if (!settings.pageAlertEnabled) {
                console.log('頁面提醒已停用');
                return;
            }

            // 如果有超時項目，顯示提醒
            if (alerts && alerts.length > 0) {
                showPendingAlertsDialog(alerts, settings.overdueDays);
            }
        }
    } catch (error) {
        console.error('檢查待處理提醒失敗：', error);
    }
}

// 顯示待處理提醒彈窗
function showPendingAlertsDialog(alerts, overdueDays) {
    // 如果今天已經顯示過，不再重複顯示（每天只提醒一次）
    const today = new Date().toDateString();
    const lastAlertDate = localStorage.getItem('lastPendingAlertDate');
    if (lastAlertDate === today) {
        console.log('今天已經顯示過提醒');
        return;
    }

    const categoryNames = {
        ajun: '辦公室區域',
        warehouse: '倉庫區',
        meiban: '倉庫貼紙',
        xiujuan: 'OPP袋子'
    };

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:10000;';

    const dialog = document.createElement('div');
    dialog.style.cssText = 'background:white;border-radius:12px;padding:24px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 4px 20px rgba(0,0,0,0.3);';

    let html = `
        <h3 style="margin:0 0 8px 0;color:#f44336;">⚠️ 待處理採購提醒</h3>
        <p style="margin:0 0 16px 0;color:#666;font-size:14px;">
            以下 <strong>${alerts.length}</strong> 個項目已超過 <strong>${overdueDays}</strong> 天未處理，請盡快處理！
        </p>
        <div style="max-height:300px;overflow-y:auto;margin-bottom:16px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr style="background:#f5f5f5;">
                    <th style="padding:10px;text-align:left;border-bottom:2px solid #ddd;">項目</th>
                    <th style="padding:10px;text-align:left;border-bottom:2px solid #ddd;">分類</th>
                    <th style="padding:10px;text-align:center;border-bottom:2px solid #ddd;">狀態</th>
                    <th style="padding:10px;text-align:center;border-bottom:2px solid #ddd;">等待</th>
                </tr>
    `;

    alerts.forEach(alert => {
        const categoryName = categoryNames[alert.category] || alert.category;
        const statusColor = alert.status === '待採購' ? '#ff9800' : '#2196f3';
        const daysColor = alert.waitingDays >= 3 ? '#f44336' : '#ff9800';

        html += `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px;">${alert.itemKey}</td>
                <td style="padding:10px;color:#666;">${categoryName}</td>
                <td style="padding:10px;text-align:center;"><span style="color:${statusColor};font-weight:bold;">${alert.status}</span></td>
                <td style="padding:10px;text-align:center;"><span style="color:${daysColor};font-weight:bold;">${alert.waitingDays} 天</span></td>
            </tr>
        `;
    });

    html += `
            </table>
        </div>
        <div style="display:flex;gap:12px;justify-content:flex-end;">
            <button id="alertLaterBtn" style="padding:10px 20px;border:1px solid #ddd;border-radius:8px;background:#f5f5f5;cursor:pointer;font-size:14px;">稍後提醒</button>
            <button id="alertGotItBtn" style="padding:10px 20px;border:none;border-radius:8px;background:#4CAF50;color:white;cursor:pointer;font-size:14px;font-weight:bold;">我知道了</button>
        </div>
    `;

    dialog.innerHTML = html;
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // 稍後提醒（關閉但不記錄，下次刷新還會顯示）
    document.getElementById('alertLaterBtn').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    // 我知道了（記錄今天已提醒，今天不再顯示）
    document.getElementById('alertGotItBtn').addEventListener('click', () => {
        localStorage.setItem('lastPendingAlertDate', today);
        document.body.removeChild(overlay);
    });
}

// 頁面載入時初始化 Tab 功能
document.addEventListener('DOMContentLoaded', function() {
    // 載入超時設定
    loadOverdueSettings();
    // 數據已在 loadLastInventory 中統一載入，無需重複載入

    // 檢查是否為首次使用，顯示歡迎教學
    setTimeout(() => {
        checkFirstTimeUser();
    }, 1500); // 延遲顯示，等頁面載入完成
});

// ===== 互動式教學系統 =====

// 教學步驟定義
const tutorialSteps = [
    {
        target: '.header',
        title: '歡迎使用耗材盤點系統',
        content: '這是杰特企業的耗材盤點系統，幫助您輕鬆管理日常耗材的庫存狀況。',
        position: 'bottom'
    },
    {
        target: '.info-section',
        title: '填寫基本資訊',
        content: '開始盤點前，請先選擇<strong>盤點日期</strong>和<strong>盤點人員</strong>。這些資訊會被記錄在報表中。',
        position: 'bottom'
    },
    {
        target: '.today-suggestion',
        title: '今日盤點建議',
        content: '系統會根據歷史數據，自動建議您今天應該盤點哪些項目。每日、每週、每月的盤點頻率會自動計算。',
        position: 'bottom'
    },
    {
        target: '.category-section',
        title: '盤點項目分類',
        content: '項目按負責區域分類，點擊分類標題可以<strong>展開/收起</strong>該區域的項目。',
        position: 'bottom',
        beforeShow: function() {
            // 確保第一個分類是展開的
            const firstContent = document.querySelector('.category-content');
            const firstHeader = document.querySelector('.category-header');
            if (firstContent && firstContent.classList.contains('collapsed')) {
                firstContent.classList.remove('collapsed');
                if (firstHeader) firstHeader.classList.remove('collapsed');
            }
        }
    },
    {
        target: '.item-row',
        title: '填寫盤點狀態',
        content: '對每個項目選擇狀態：<br>✅ <strong>不用叫</strong>：庫存充足<br>⚠️ <strong>要叫貨</strong>：需要採購<br>🚚 <strong>補貨中</strong>：已訂購等待到貨<br>📦 <strong>已補貨</strong>：貨已到，盤點完成',
        position: 'bottom',
        beforeShow: function() {
            // 確保分類是展開的，讓 item-row 可見
            const firstContent = document.querySelector('.category-content');
            const firstHeader = document.querySelector('.category-header');
            if (firstContent && firstContent.classList.contains('collapsed')) {
                firstContent.classList.remove('collapsed');
                if (firstHeader) firstHeader.classList.remove('collapsed');
            }
        }
    },
    {
        target: '.main-tabs',
        title: '功能分頁',
        content: '系統有三個主要功能：<br>📋 <strong>盤點</strong>：日常盤點作業<br>🛒 <strong>採購追蹤</strong>：追蹤待採購和補貨中的項目<br>📊 <strong>數據儀表板</strong>：查看統計數據和分析',
        position: 'bottom'
    },
    {
        target: '.button-group',
        title: '提交盤點表',
        content: '填寫完成後，點擊<strong>「✅ 提交盤點表」</strong>即可上傳資料。系統會自動儲存您的盤點記錄。',
        position: 'top'
    },
    {
        target: '.help-btn',
        title: '需要幫助？',
        content: '隨時點擊左上角的<strong>「❓ 說明」</strong>按鈕，即可重新觀看這個教學！',
        position: 'bottom'
    }
];

let currentTutorialStep = 0;
let tutorialActive = false;

// 檢查是否為首次使用
function checkFirstTimeUser() {
    const hasSeenTutorial = localStorage.getItem('hasSeenInventoryTutorial');
    if (!hasSeenTutorial) {
        showWelcomeModal();
    }
}

// 顯示歡迎彈窗
function showWelcomeModal() {
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.classList.add('show');
    }
}

// 跳過歡迎教學
function skipWelcome() {
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.classList.remove('show');
    }
    localStorage.setItem('hasSeenInventoryTutorial', 'true');
}

// 從歡迎彈窗開始教學
function startTutorialFromWelcome() {
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.classList.remove('show');
    }
    localStorage.setItem('hasSeenInventoryTutorial', 'true');
    setTimeout(() => {
        startTutorial();
    }, 300);
}

// 開始教學
function startTutorial() {
    currentTutorialStep = 0;
    tutorialActive = true;
    showTutorialStep();
}

// 顯示教學步驟
function showTutorialStep() {
    const overlay = document.getElementById('tutorialOverlay');
    const highlight = document.getElementById('tutorialHighlight');
    const tooltip = document.getElementById('tutorialTooltip');

    if (!overlay || !highlight || !tooltip) return;

    const step = tutorialSteps[currentTutorialStep];

    // 執行 beforeShow 函數（如果有定義）
    if (step.beforeShow && typeof step.beforeShow === 'function') {
        step.beforeShow();
    }

    // 延遲一點讓 DOM 更新（例如展開分類後）
    setTimeout(() => {
        let targetElement = document.querySelector(step.target);

        // 如果找不到目標元素，嘗試找備用元素
        if (!targetElement || !isElementVisible(targetElement)) {
            console.log('找不到目標元素或元素不可見：', step.target);
            // 跳過找不到的步驟
            nextTutorialStep();
            return;
        }

        // 顯示遮罩層
        overlay.classList.add('show');

        // 滾動到目標元素
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // 延遲計算位置（等滾動完成）
        setTimeout(() => {
            // 重新取得位置（滾動後位置可能改變）
            const rect = targetElement.getBoundingClientRect();
            const padding = 10;

            // 設定高亮區域
            highlight.style.top = (rect.top + window.scrollY - padding) + 'px';
            highlight.style.left = (rect.left - padding) + 'px';
            highlight.style.width = (rect.width + padding * 2) + 'px';
            highlight.style.height = (rect.height + padding * 2) + 'px';

            // 更新提示框內容
            document.getElementById('tutorialStepNumber').textContent = currentTutorialStep + 1;
            document.getElementById('tutorialStepTotal').textContent = `共 ${tutorialSteps.length} 步`;
            document.getElementById('tutorialTitle').textContent = step.title;
            document.getElementById('tutorialContent').innerHTML = step.content;

            // 更新按鈕
            const nextBtn = document.getElementById('tutorialNextBtn');
            if (currentTutorialStep === tutorialSteps.length - 1) {
                nextBtn.textContent = '完成教學 ✓';
                nextBtn.className = 'tutorial-btn tutorial-btn-finish';
            } else {
                nextBtn.textContent = '下一步 ➜';
                nextBtn.className = 'tutorial-btn tutorial-btn-next';
            }

            // 計算提示框位置
            positionTooltip(rect, step.position);

        }, 400);
    }, 100);
}

// 檢查元素是否可見
function isElementVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 &&
           rect.height > 0 &&
           style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0';
}

// 計算提示框位置
function positionTooltip(targetRect, preferredPosition) {
    const tooltip = document.getElementById('tutorialTooltip');
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const scrollY = window.scrollY;

    let top, left;
    let arrowClass = 'arrow-top';

    const gap = 20; // 與目標元素的間距

    // 根據偏好位置計算
    if (preferredPosition === 'bottom') {
        top = targetRect.bottom + scrollY + gap;
        left = targetRect.left + (targetRect.width / 2) - (380 / 2);
        arrowClass = 'arrow-top';

        // 檢查是否超出下方邊界
        if (top + 200 > scrollY + viewportHeight) {
            top = targetRect.top + scrollY - 200 - gap;
            arrowClass = 'arrow-bottom';
        }
    } else {
        // top position
        top = targetRect.top + scrollY - 200 - gap;
        left = targetRect.left + (targetRect.width / 2) - (380 / 2);
        arrowClass = 'arrow-bottom';

        // 檢查是否超出上方邊界
        if (top < scrollY + 20) {
            top = targetRect.bottom + scrollY + gap;
            arrowClass = 'arrow-top';
        }
    }

    // 確保不超出左右邊界
    if (left < 20) left = 20;
    if (left + 380 > viewportWidth - 20) left = viewportWidth - 400;

    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
    tooltip.className = 'tutorial-tooltip ' + arrowClass;
}

// 下一步
function nextTutorialStep() {
    currentTutorialStep++;

    if (currentTutorialStep >= tutorialSteps.length) {
        endTutorial();
        return;
    }

    showTutorialStep();
}

// 結束教學
function endTutorial() {
    tutorialActive = false;
    const overlay = document.getElementById('tutorialOverlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
    localStorage.setItem('hasSeenInventoryTutorial', 'true');
}