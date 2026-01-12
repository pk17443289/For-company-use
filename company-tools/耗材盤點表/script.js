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

// 盤點項目資料
const inventoryData = {
    ajun: [
        { name: '蝸牛', threshold: '剩兩台就要叫', unit: '台', warningValue: 2 },
        { name: '攝影機', threshold: '', unit: '台', warningValue: null },
        { name: '小膠帶台', threshold: '剩兩台就要叫', unit: '台', warningValue: 2 },
        { name: '大膠帶台', threshold: '剩兩台就要叫', unit: '台', warningValue: 2 },
        { name: '新人制服', threshold: '剩兩個就要叫', unit: '件', warningValue: 2 },
        { name: '紅筆', threshold: '剩十隻就要叫', unit: '隻', warningValue: 10 },
        { name: '藍筆', threshold: '剩十隻就要叫', unit: '隻', warningValue: 10 },
        { name: '奇異筆', threshold: '剩十隻就要叫', unit: '隻', warningValue: 10 },
        { name: '美工刀', threshold: '剩兩把就要叫', unit: '把', warningValue: 2 },
        { name: '大刀片', threshold: '剩一盒就要叫', unit: '盒', warningValue: 1 },
        { name: '小刀片', threshold: '剩一盒就要叫', unit: '盒', warningValue: 1 },
        { name: '剪刀', threshold: '剩兩把就要叫', unit: '把', warningValue: 2 },
        { name: '大膠帶', threshold: '剩五條就要買', unit: '條', warningValue: 5 },
        { name: '細膠帶', threshold: '剩三條就要買', unit: '條', warningValue: 3 },
        { name: '紙膠帶', threshold: '剩三條就要叫', unit: '條', warningValue: 3 },
        { name: '燈泡', threshold: '', unit: '個', warningValue: null },
        { name: 'A4紙', threshold: '剩三箱就要叫', unit: '箱', warningValue: 3 },
        { name: '碳粉', threshold: '剩五條就要叫', unit: '條', warningValue: 5 },
        { name: '衛生紙', threshold: '剩五包就要叫', unit: '包', warningValue: 5 },
        { name: '桶裝水', threshold: '剩兩桶就要叫', unit: '桶', warningValue: 2 }
    ],
    warehouse: [
        { name: 'MO+店貼紙', threshold: '剩一綑就要叫', unit: '綑', warningValue: 1 },
        { name: '倉庫推車標示單', threshold: '剩一點1/3就要印', unit: '疊', warningValue: 0.33 },
        { name: '棧板出貨標示單', threshold: '剩一點1/3就要印', unit: '疊', warningValue: 0.33 },
        { name: '酒精', threshold: '剩一罐就要叫', unit: '罐', warningValue: 1 },
        { name: '大紙箱', threshold: '下面只剩兩捆就要叫', unit: '捆', warningValue: 2 },
        { name: '中紙箱', threshold: '下面只剩兩捆就要叫', unit: '捆', warningValue: 2 },
        { name: '15×15×15紙盒', threshold: '剩五綑就要叫', unit: '綑', warningValue: 5 },
        { name: '10×15×4小飛機盒', threshold: '剩三綑就要叫', unit: '綑', warningValue: 3 },
        { name: '18×11×6中飛機盒', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '26.5×19×6.5大飛機盒', threshold: '剩三綑就要叫', unit: '綑', warningValue: 3 },
        { name: '防撞角', threshold: '剩1/3就要叫', unit: '箱', warningValue: 0.33 },
        { name: '氣泡紙', threshold: '剩一捆就要叫', unit: '捆', warningValue: 1 },
        { name: 'PDA 6×4條碼貼紙', threshold: '剩200個就要叫', unit: '個', warningValue: 200 }
    ],
    meiban: [
        { name: '小防撕貼', threshold: '剩一包就要叫', unit: '包', warningValue: 1 },
        { name: '中防撕貼', threshold: '剩一包就要叫', unit: '包', warningValue: 1 },
        { name: '大防撕貼', threshold: '剩一包就要叫', unit: '包', warningValue: 1 },
        { name: '寄倉貼紙', threshold: '剩一包就要叫', unit: '包', warningValue: 1 },
        { name: '備貨貼紙', threshold: '剩兩包就要叫', unit: '包', warningValue: 2 },
        { name: '地球貼', threshold: '', unit: '張', warningValue: null }
    ],
    xiujuan: [
        { name: '破壞袋（40╳50）無光粉', threshold: '剩五綑就要叫', unit: '綑', warningValue: 5 },
        { name: '破壞袋（32╳40）薄荷綠', threshold: '剩五綑就要叫', unit: '綑', warningValue: 5 },
        { name: '破壞袋（35╳45）藍色', threshold: '剩五綑就要叫', unit: '綑', warningValue: 5 },
        { name: '破壞袋（20╳30）杏色', threshold: '剩五綑就要叫', unit: '綑', warningValue: 5 },
        { name: '破壞袋（25╳35）全新粉', threshold: '剩五綑就要叫', unit: '綑', warningValue: 5 },
        { name: '破壞袋（15╳25）紫色', threshold: '剩五綑就要叫', unit: '綑', warningValue: 5 },
        { name: '破壞袋（15╳40）白色', threshold: '剩五綑就要叫', unit: '綑', warningValue: 5 },
        { name: '破壞袋（60╳70）白色', threshold: '剩五綑就要叫', unit: '綑', warningValue: 5 },
        { name: '１號 6×10 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '２號 7×10 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '３號 8×25 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '４號 9×14 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '５號 10×27 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '６號 10×20 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '７號 12×14 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '８號 12×20 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '９號 12×28 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '１０號 13×23 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '１１號 13×29 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '１２號 15×22 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '１３號 15×39 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '１４號 16×19 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '１５號 6×25 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '１６號 17×22 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '１７號 18×49 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '１８號 20×30 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '１９號 20×39 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '２０號 24×65 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '２１號 27×30 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '２２號 28×49 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '２３號 28×54 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '２４號 30×65 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '２５號 35×45 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '２６號 35×74 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '２７號 35×85 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '２８號 40×44 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '２９號 40×74 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '３０號 45×54 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '３１號 50×74 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '３２號 55×69 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 },
        { name: '３３號 74×55 OPP袋', threshold: '剩五捆就要叫', unit: '捆', warningValue: 5 }
    ]
};

// 儲存上次盤點資料
let lastInventoryData = {};

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
});

// 生成項目
function generateItems() {
    Object.keys(inventoryData).forEach(category => {
        const container = document.getElementById(`${category}-items`);
        inventoryData[category].forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-row';
            itemDiv.id = `item-${item.name}`;

            // 使用項目名稱作為 key，這樣即使順序變動也能正確對應
            const itemKey = item.name;
            const lastStatus = lastInventoryData[itemKey];
            const lastInfo = lastStatus ?
                `<div class="last-inventory">${t('lastTime')}：${getStatusTextTranslated(lastStatus)}</div>` :
                `<div class="last-inventory" style="color: #999;">${t('lastTime')}：${t('noRecord')}</div>`;

            // 取得翻譯的項目名稱和補貨條件（顯示用）
            const displayName = getItemNameDisplay(item.name);
            const displayThreshold = getThresholdDisplay(item.threshold);

            // 根據上次狀態決定顯示哪種選項
            // 如果上次是「要叫貨」或「補貨中」，則顯示補貨模式選項
            const replenishMode = isReplenishMode(itemKey);

            let statusOptionsHtml;
            if (replenishMode) {
                // 補貨模式：顯示「補貨中」和「已補貨」選項
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
                // 正常模式：顯示「不用叫貨」和「要叫貨」選項
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

            // 注意：data-item-name 保持原始中文名稱，用於提交到 Google Sheets
            itemDiv.innerHTML = `
                <div class="item-header">
                    <div class="item-name">${displayName}</div>
                    ${item.threshold ? `<div class="item-threshold">⚠️ ${displayThreshold}</div>` : ''}
                    ${lastInfo}
                </div>
                ${statusOptionsHtml}
            `;

            container.appendChild(itemDiv);
        });
    });
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

// 更新統計
function updateStats() {
    const allRadios = document.querySelectorAll('input[type="radio"]');
    const uniqueNames = new Set();
    allRadios.forEach(radio => uniqueNames.add(radio.name));

    let total = uniqueNames.size;
    let filled = 0;
    let needOrder = 0;
    let noNeed = 0;
    let replenishing = 0;
    let replenished = 0;

    uniqueNames.forEach(name => {
        const selected = document.querySelector(`input[name="${name}"]:checked`);
        if (selected) {
            filled++;
            const value = selected.value;
            if (value === '要叫貨') {
                needOrder++;
            } else if (value === '不用叫貨') {
                noNeed++;
            } else if (value === '補貨中') {
                replenishing++;
            } else if (value === '已補貨') {
                replenished++;
            }
        }
    });

    document.getElementById('totalItems').textContent = total;
    document.getElementById('filledItems').textContent = filled;
    document.getElementById('urgentItems').textContent = needOrder;
    document.getElementById('warningItems').textContent = noNeed;
    document.getElementById('replenishingItems').textContent = replenishing;
    document.getElementById('replenishedItems').textContent = replenished;

    // 顯示統計區域
    if (filled > 0) {
        document.getElementById('statsSection').style.display = 'block';
    }
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

// 顯示需補貨項目
function showNeedToOrder() {
    const needToOrder = [];

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
                    status: status,
                    threshold: item.threshold
                });
            }
        });
    });

    const orderList = document.getElementById('orderList');

    if (needToOrder.length === 0) {
        orderList.innerHTML = `<p style="color: #28a745; font-weight: bold;">${t('noOrderNeeded')}</p>`;
    } else {
        let html = '<div style="margin-bottom: 15px;">';
        html += `<strong>${t('followingNeedOrder')}</strong>`;
        html += '</div>';
        html += '<div id="copyableList">';

        html += '<div style="background: #fff3cd; padding: 15px; border-radius: 8px;">';
        html += `<strong style="color: #856404;">${t('needOrderLabel')}</strong><br><br>`;
        needToOrder.forEach(item => {
            html += `• ${item.name}`;
            if (item.threshold) {
                html += ` - ${item.threshold}`;
            }
            html += '<br>';
        });
        html += '</div>';

        html += '</div>';
        orderList.innerHTML = html;
    }

    document.getElementById('orderModal').classList.add('show');
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

// 分類對應（使用函數取得翻譯名稱）
function getCategoryInfo() {
    return {
        ajun: { name: t('office'), icon: '🖊️', color: '#1e88e5' },
        warehouse: { name: t('warehouse'), icon: '📦', color: '#43a047' },
        meiban: { name: t('sticker'), icon: '🎨', color: '#8e24aa' },
        xiujuan: { name: t('opp'), icon: '📮', color: '#f57c00' }
    };
}

// 初始化手機版滑動模式
function initMobileSwipe() {
    // 建立所有項目的扁平列表
    allItemsFlat = [];

    Object.keys(inventoryData).forEach(category => {
        inventoryData[category].forEach((item, index) => {
            // 使用項目名稱作為 key
            const itemKey = item.name;
            allItemsFlat.push({
                ...item,
                category: category,
                index: index,
                itemKey: itemKey
            });

            // 根據補貨模式設定預設值（如果尚未設定）
            if (!mobileSelections[itemKey]) {
                if (isReplenishMode(itemKey)) {
                    // 補貨模式預設為「補貨中」
                    mobileSelections[itemKey] = '補貨中';
                } else {
                    // 正常模式預設為「不用叫貨」
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
    showCurrentItem();

    // 更新導航按鈕狀態
    updateNavButtons();

    // 綁定觸控滑動事件
    bindSwipeEvents();
}

// 生成分類標籤
function generateCategoryTabs() {
    const tabsContainer = document.getElementById('categoryTabs');
    if (!tabsContainer) return;

    updateCategoryTabs();
}

// 更新分類標籤（顯示要叫貨數量）
function updateCategoryTabs() {
    const tabsContainer = document.getElementById('categoryTabs');
    if (!tabsContainer) return;

    let html = '';
    let startIndex = 0;

    Object.keys(inventoryData).forEach(category => {
        const info = getCategoryInfo()[category];
        const items = inventoryData[category];

        // 計算該分類「要叫貨」的數量
        let needOrderCount = 0;
        items.forEach((item, index) => {
            const itemKey = item.name;
            if (mobileSelections[itemKey] === '要叫貨') {
                needOrderCount++;
            }
        });

        // 顯示所有分類，點擊跳到該分類第一項
        const countBadge = needOrderCount > 0
            ? `<span class="tab-count" style="background: #ff5722; color: white;">${needOrderCount}</span>`
            : `<span class="tab-count">0</span>`;

        html += `<button class="category-tab" data-category="${category}" data-start="${startIndex}" onclick="jumpToItem(${startIndex})">
            ${info.icon} ${info.name} ${countBadge}
        </button>`;

        startIndex += items.length;
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

    container.innerHTML = `
        <div class="swipe-card" data-item-key="${itemKey}">
            <div class="item-name">${displayName}</div>
            ${item.threshold ? `<div class="item-threshold">⚠️ ${displayThreshold}</div>` : ''}
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

    // 更新分類名稱
    const categoryNameEl = document.getElementById('mobileCategoryName');
    if (categoryNameEl) {
        categoryNameEl.textContent = `${info.icon} ${info.name}`;
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

// 更新手機版統計
function updateMobileStats() {
    let needOrder = 0;
    let replenishing = 0;
    let replenished = 0;

    allItemsFlat.forEach(item => {
        const value = mobileSelections[item.itemKey];
        if (value) {
            if (value === '要叫貨') {
                needOrder++;
            } else if (value === '補貨中') {
                replenishing++;
            } else if (value === '已補貨') {
                replenished++;
            }
        }
    });

    const orderEl = document.getElementById('mobileOrderCount');
    const replenishingEl = document.getElementById('mobileReplenishingCount');
    const replenishedEl = document.getElementById('mobileReplenishedCount');

    if (orderEl) orderEl.textContent = needOrder;
    if (replenishingEl) replenishingEl.textContent = replenishing;
    if (replenishedEl) replenishedEl.textContent = replenished;
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

// 從 Google Sheets 載入上次盤點資料
async function loadLastInventory() {
    if (!GOOGLE_SCRIPT_URL) {
        console.log('未設定 Google Sheets URL，跳過載入上次盤點資料');
        return;
    }

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL + '?action=getLastInventory');
        const data = await response.json();

        if (data.success && data.data) {
            lastInventoryData = data.data;
            console.log('成功載入上次盤點資料', lastInventoryData);

            // 重新生成項目以顯示上次盤點數量
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
        }
    } catch (error) {
        console.error('載入上次盤點資料失敗：', error);
        // 不顯示錯誤訊息，因為可能是第一次使用
    }
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