# -*- coding: utf-8 -*-
"""
庫存查詢工具 - 本地 Flask 網頁應用
啟動後在瀏覽器開啟 http://localhost:5000
"""
import webbrowser, threading, decimal, datetime
from flask import Flask, request, jsonify, render_template_string
import pymysql

app = Flask(__name__)

DB_CONFIG = {
    'host': '192.168.0.103',
    'port': 307,
    'user': 'navicat_readonly',
    'password': '4321qazse4',
    'database': 'django',
    'charset': 'utf8mb4',
}


def get_conn():
    return pymysql.connect(**DB_CONFIG, cursorclass=pymysql.cursors.DictCursor)


def clean(row):
    """讓 dict 能 JSON 序列化"""
    out = {}
    for k, v in row.items():
        if isinstance(v, decimal.Decimal):
            out[k] = float(v) if v % 1 else int(v)
        elif isinstance(v, (datetime.datetime, datetime.date)):
            out[k] = str(v)[:19]
        else:
            out[k] = v
    return out


# ─── HTML ────────────────────────────────────────────────────
HTML_PAGE = r'''
<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>庫存查詢工具</title>
<style>
:root{--bg:#0f172a;--s1:#1e293b;--s2:#334155;--bd:#475569;--t1:#e2e8f0;--t2:#94a3b8;
--ac:#38bdf8;--ac2:#818cf8;--g:#4ade80;--r:#f87171;--o:#fb923c;--y:#fbbf24;
--cy:#22d3ee;--pk:#f472b6;--pp:#a78bfa;--lm:#a3e635;}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,'Segoe UI','Microsoft JhengHei',sans-serif;background:var(--bg);color:var(--t1);min-height:100vh}
.hdr{background:linear-gradient(135deg,#1e293b,#0f172a);border-bottom:1px solid var(--bd);padding:14px 0;position:sticky;top:0;z-index:100}
.hdr-in{max-width:1400px;margin:0 auto;padding:0 20px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.logo{font-size:19px;font-weight:700;background:linear-gradient(135deg,var(--ac),var(--ac2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;white-space:nowrap}
.sb{flex:1;min-width:240px;display:flex;gap:8px}
.sb input{flex:1;padding:8px 12px;background:var(--s2);border:1px solid var(--bd);border-radius:7px;color:var(--t1);font-size:14px;outline:none}
.sb input:focus{border-color:var(--ac)}
.sb input::placeholder{color:var(--t2)}
.btn{padding:8px 16px;border:none;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap}
.bp{background:linear-gradient(135deg,var(--ac),var(--ac2));color:#fff}.bp:hover{opacity:.85}
.bo{background:transparent;border:1px solid var(--bd);color:var(--t2)}.bo:hover{border-color:var(--ac);color:var(--ac)}
.bs{padding:5px 11px;font-size:12px}
.ctn{max-width:1400px;margin:0 auto;padding:18px 20px}

/* 搜尋結果 */
.rl{margin-top:10px}
.ri{background:var(--s1);border:1px solid var(--bd);border-radius:7px;padding:11px 14px;margin-bottom:7px;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.ri:hover{border-color:var(--ac);transform:translateX(3px)}
.ri .code{font-size:14px;font-weight:700;color:var(--ac);min-width:110px}
.ri .name{font-size:13px;flex:1;min-width:160px}
.ri .spec{font-size:11px;color:var(--t2);min-width:100px}
.ri .st{padding:2px 9px;border-radius:16px;font-size:10px;font-weight:600}
.st-ok{background:rgba(74,222,128,.15);color:var(--g)}
.st-stop{background:rgba(248,113,113,.15);color:var(--r)}
.st-skip{background:rgba(251,146,60,.15);color:var(--o)}
.st-def{background:rgba(148,163,184,.15);color:var(--t2)}
.ri .sb2{font-size:13px;font-weight:700;min-width:65px;text-align:right}
.s0{color:var(--r)}.sl{color:var(--o)}.sok{color:var(--g)}

/* 詳情 */
.dp{display:none}.dp.act{display:block}
.bk{display:inline-flex;align-items:center;gap:4px;color:var(--ac);cursor:pointer;font-size:12px;margin-bottom:10px;border:none;background:none}
.bk:hover{text-decoration:underline}

/* 驗算區塊 */
.verify{background:var(--s1);border:1px solid var(--bd);border-radius:10px;padding:18px;margin-bottom:14px}
.verify h3{font-size:16px;margin-bottom:12px}
.formula{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:15px;margin-bottom:14px;padding:12px;background:var(--s2);border-radius:8px}
.formula .num{font-weight:700;font-size:18px}
.formula .op{color:var(--t2);font-size:14px}
.formula .eq{font-size:20px;font-weight:700}
.diff-ok{color:var(--g)}.diff-bad{color:var(--r)}
.verify-detail{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:10px}
.vd-card{background:var(--s2);border-radius:7px;padding:12px}
.vd-card .lbl{font-size:11px;color:var(--t2);margin-bottom:3px}
.vd-card .val{font-size:20px;font-weight:700}

/* 退貨追蹤 */
.ret-flow{display:flex;align-items:center;gap:6px;font-size:12px;flex-wrap:wrap}
.ret-arrow{color:var(--t2)}
.ret-dest{padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600}
.rd-recv{background:rgba(74,222,128,.15);color:var(--g)}
.rd-scrap{background:rgba(244,114,182,.15);color:var(--pk)}
.rd-inspect{background:rgba(167,139,250,.15);color:var(--pp)}
.rd-other{background:rgba(148,163,184,.15);color:var(--t2)}

/* 區塊 */
.sec{background:var(--s1);border:1px solid var(--bd);border-radius:10px;padding:16px;margin-bottom:14px}
.sec h3{font-size:14px;margin-bottom:10px;padding-left:8px;border-left:3px solid var(--ac)}
.sec h4{font-size:13px;margin:10px 0 6px;color:var(--ac)}

/* 表格 */
.dt{width:100%;border-collapse:collapse;background:var(--s1);border-radius:7px;overflow:hidden;border:1px solid var(--bd)}
.dt th{background:var(--s2);padding:8px 10px;text-align:left;font-size:11px;color:var(--t2);font-weight:600;white-space:nowrap}
.dt td{padding:7px 10px;border-top:1px solid var(--bd);font-size:12px}
.dt tr:hover td{background:rgba(56,189,248,.04)}
.tag{padding:2px 7px;border-radius:4px;font-size:10px;font-weight:700;white-space:nowrap}
.tag-in{background:rgba(74,222,128,.15);color:var(--g)}
.tag-out{background:rgba(248,113,113,.15);color:var(--r)}
.tag-order{background:rgba(56,189,248,.15);color:var(--ac)}
.tag-ret{background:rgba(251,146,60,.15);color:var(--o)}
.tag-scrap{background:rgba(244,114,182,.15);color:var(--pk)}
.tag-audit{background:rgba(167,139,250,.15);color:var(--pp)}
.tag-recv{background:rgba(34,211,238,.15);color:var(--cy)}

/* 分類明細表 */
.bd-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px}
.bd-item{background:var(--s2);border-radius:6px;padding:10px;display:flex;justify-content:space-between;align-items:center}
.bd-item .reason{font-size:12px;color:var(--t2)}
.bd-item .qty{font-size:16px;font-weight:700}

/* 篩選 */
.fb{display:flex;gap:6px;margin-bottom:10px;align-items:center;flex-wrap:wrap}
.fb label{font-size:11px;color:var(--t2)}
.fb input[type="date"]{padding:5px 8px;background:var(--s2);border:1px solid var(--bd);border-radius:5px;color:var(--t1);font-size:11px}
.fc{padding:3px 9px;border-radius:16px;font-size:10px;font-weight:600;cursor:pointer;border:1px solid var(--bd);background:transparent;color:var(--t2);transition:all .15s}
.fc:hover,.fc.act{border-color:var(--ac);color:var(--ac);background:rgba(56,189,248,.08)}

.tw{max-height:500px;overflow-y:auto;border-radius:7px}
.loading,.empty{text-align:center;padding:40px 16px;color:var(--t2)}
.loading::after{content:'';display:block;width:24px;height:24px;margin:10px auto 0;border:3px solid var(--bd);border-top-color:var(--ac);border-radius:50%;animation:sp .7s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
.pg{display:flex;justify-content:center;align-items:center;gap:6px;margin-top:10px}
.pi{color:var(--t2);font-size:11px}

/* 倉位 */
.shelf{display:flex;gap:6px;flex-wrap:wrap}
.sh-item{background:var(--s2);border:1px solid var(--bd);border-radius:5px;padding:6px 12px;font-size:12px}
.sh-item .loc{font-weight:700;color:var(--ac)}
.sh-item .qty{margin-left:6px;font-weight:600}

@media(max-width:640px){.hdr-in{flex-direction:column;align-items:stretch}.sb{flex-direction:column}.ri{flex-direction:column;align-items:flex-start}}
</style>
</head>
<body>
<div class="hdr"><div class="hdr-in">
  <div class="logo">&#128230; 庫存查詢工具</div>
  <div class="sb">
    <input id="si" type="text" placeholder="輸入料號或品名搜尋..." autofocus autocomplete="off">
    <button class="btn bp" onclick="doSearch()">搜尋</button>
  </div>
</div></div>
<div class="ctn">
  <div id="sv"><div id="ra">
    <div class="empty"><div style="font-size:36px;opacity:.5;margin-bottom:8px">&#128269;</div>
    <div>輸入料號或品名開始搜尋</div></div>
  </div></div>
  <div id="dv" class="dp">
    <button class="bk" onclick="back()">&#8592; 返回搜尋結果</button>
    <div id="dc"></div>
  </div>
</div>

<script>
const A='';
document.getElementById('si').addEventListener('keydown',e=>{if(e.key==='Enter')doSearch()});

async function doSearch(p=1){
  const q=document.getElementById('si').value.trim();if(!q)return;
  const a=document.getElementById('ra');a.innerHTML='<div class="loading">搜尋中...</div>';show('s');
  try{const r=await(await fetch(`${A}/api/search?q=${encodeURIComponent(q)}&page=${p}`)).json();renderList(r)}
  catch(e){a.innerHTML=`<div class="empty">查詢失敗: ${e.message}</div>`}
}
function renderList(d){
  const a=document.getElementById('ra');
  if(!d.items||!d.items.length){a.innerHTML='<div class="empty">找不到符合的商品</div>';return}
  let h=`<div style="margin-bottom:8px;color:var(--t2);font-size:11px">找到 ${d.total} 筆（第 ${d.page}/${d.total_pages} 頁）</div><div class="rl">`;
  for(const i of d.items){
    const sc=i.採購狀態==='可追'?'st-ok':i.採購狀態==='停賣'?'st-stop':i.採購狀態==='不追'?'st-skip':'st-def';
    const v=i.總庫存||0;const vc=v===0?'s0':v<10?'sl':'sok';
    h+=`<div class="ri" onclick="detail(${i.id})"><span class="code">${E(i.料號)}</span><span class="name">${E(i.品名)}</span><span class="spec">${E(i.規格||'-')}</span><span class="st ${sc}">${E(i.採購狀態)}</span><span class="sb2 ${vc}">庫存 ${v}</span></div>`;
  }
  h+='</div>';
  if(d.total_pages>1){h+='<div class="pg">';if(d.page>1)h+=`<button class="btn bo bs" onclick="doSearch(${d.page-1})">上一頁</button>`;h+=`<span class="pi">第${d.page}/${d.total_pages}頁</span>`;if(d.page<d.total_pages)h+=`<button class="btn bo bs" onclick="doSearch(${d.page+1})">下一頁</button>`;h+='</div>'}
  a.innerHTML=h;
}

async function detail(id){
  show('d');const dc=document.getElementById('dc');
  dc.innerHTML='<div class="loading">載入完整庫存分析...</div>';
  try{const r=await(await fetch(`${A}/api/product/${id}/full`)).json();renderFull(r)}
  catch(e){dc.innerHTML=`<div class="empty">載入失敗: ${e.message}</div>`}
}

function renderFull(d){
  const dc=document.getElementById('dc');
  const p=d.product,v=d.verify,st=d.stock,cp=d.composite;
  const stTotal=st.reduce((s,x)=>s+x.數量,0);
  const sc=stTotal===0?'s0':stTotal<10?'sl':'sok';
  _ev=d.timeline||[];_ft='all';
  let h='';

  // ── 複合商品提示 ──
  if(cp){
    h+=`<div style="background:linear-gradient(135deg,rgba(56,189,248,.12),rgba(129,140,248,.12));border:1px solid var(--ac);border-radius:8px;padding:12px 16px;margin-bottom:14px;font-size:13px">
      <div style="font-weight:700;margin-bottom:4px">&#128230; 複合商品關聯</div>
      <div>${E(cp.組合品料號)} ${E(cp.組合品品名)} = <b>${E(cp.單品料號)} ${E(cp.單品品名)}</b> &times; ${cp.每組數量}</div>
      <div style="color:var(--t2);font-size:11px;margin-top:4px">以下所有庫存、採購、出入庫、時間軸資料皆為單品 <b>${E(cp.單品料號)}</b> 的數據，MOMO寄倉已換算為單品數量</div>
    </div>`;
  }

  // ── B→C 反向關聯提示 ──
  const pc=d.parent_composites;
  if(pc&&pc.length&&!cp){
    h+=`<div style="background:linear-gradient(135deg,rgba(251,191,36,.1),rgba(251,146,60,.1));border:1px solid var(--y);border-radius:8px;padding:12px 16px;margin-bottom:14px;font-size:13px">
      <div style="font-weight:700;margin-bottom:4px;color:var(--y)">&#128279; 被組合品使用</div>`;
    for(const c of pc){
      h+=`<div style="margin-bottom:2px"><a href="#" onclick="detail(${c.id});return false" style="color:var(--ac);text-decoration:underline;cursor:pointer">${E(c.料號)}</a> ${E(c.品名)}（每組含此單品 &times;${c.每組數量}）</div>`;
    }
    h+=`<div style="color:var(--t2);font-size:11px;margin-top:4px">點擊組合品料號可查看該組合品的完整庫存驗算</div></div>`;
  }

  // ── 驗算結果 ──
  const diff=v.差異;
  const diffCls=diff===0?'diff-ok':'diff-bad';
  const diffTxt=diff===0?'0（正常）':(diff>0?`+${diff}（出庫偏少）`:`${diff}（出庫偏多）`);
  const momoLabel=cp?`MOMO寄倉 (${v.MOMO寄倉組數}&times;${v.每組數量})`:'MOMO寄倉';

  h+=`<div class="verify"><h3>&#9989; 庫存驗算</h3>
    <div class="formula">
      <span><span style="color:var(--t2);font-size:12px">採購已上架</span><br><span class="num">${v.採購已上架}</span></span>
      <span class="op">+</span>
      <span><span style="color:var(--t2);font-size:12px">退貨已上架</span><br><span class="num" style="color:var(--o)">${v.退貨已上架}</span></span>
      <span class="eq">=</span>
      <span><span style="color:var(--t2);font-size:12px">${momoLabel}</span><br><span class="num">${v.MOMO寄倉}</span></span>
      <span class="op">+</span>
      <span><span style="color:var(--t2);font-size:12px">未結案寄倉</span><br><span class="num" style="color:var(--y)">${v.未結案寄倉}</span></span>
      <span class="op">+</span>
      <span><span style="color:var(--t2);font-size:12px">倉庫庫存</span><br><span class="num">${v.倉庫剩餘}</span></span>
      <span class="op">+</span>
      <span><span style="color:var(--t2);font-size:12px">非寄倉出庫</span><br><span class="num">${v.非寄倉出庫}</span></span>
      <span class="op">&rarr;</span>
      <span><span style="color:var(--t2);font-size:12px">差異</span><br><span class="num ${diffCls}">${diffTxt}</span></span>
    </div>
    ${v.MOMO寄倉===0?'<div style="color:var(--o);font-size:12px;margin-top:4px">&#9888; 此物品在 momo_單品 中無關聯，MOMO寄倉顯示為 0（寄倉相關出庫記錄: '+v.寄倉相關出庫+'）</div>':''}`;


  // 驗算明細卡
  h+=`<div class="verify-detail">
    <div class="vd-card"><div class="lbl">採購已上架量（有進貨單）</div><div class="val">${v.採購已上架}</div></div>
    <div class="vd-card"><div class="lbl">退貨已上架量（進貨單入庫）</div><div class="val" style="color:var(--o)">${v.退貨已上架}</div></div>
    <div class="vd-card"><div class="lbl">MOMO寄倉${cp?` (${v.MOMO寄倉組數}組&times;${v.每組數量})`:''}</div><div class="val">${v.MOMO寄倉}</div></div>
    <div class="vd-card"><div class="lbl">未結案—包貨完成（在途）</div><div class="val" style="color:var(--g)">${v.未結案_包貨完成}</div></div>
    <div class="vd-card"><div class="lbl">未結案—其他狀態（寄倉量/原始申請量）</div><div class="val" style="color:var(--y)"><span>${v.未結案_其他}</span>${v.未結案_其他!==v.未結案_其他_申請入庫?`<span style="font-size:13px;color:var(--o)"> / ${v.未結案_其他_申請入庫}</span>`:''}</div></div>
    <div class="vd-card"><div class="lbl">非寄倉出庫</div><div class="val" style="color:var(--r)">${v.非寄倉出庫}</div></div>
    <div class="vd-card"><div class="lbl">倉庫庫存（不含寄倉加工中倉）</div><div class="val ${sc}">${v.倉庫剩餘}</div></div>
    <div class="vd-card"><div class="lbl">主倉庫存</div><div class="val">${v.主倉庫存}</div></div>
  </div>`;

  // 未結案數量不一致明細
  if(v.未結案_異常&&v.未結案_異常.length){
    const isOk=diff===0;
    const bgC=isOk?'rgba(74,222,128,.08)':'rgba(251,191,36,.1)';
    const bdC=isOk?'var(--g)':'var(--y)';
    const icon=isOk?'&#9989;':'&#128269;';
    const note=isOk?' — 但總數對得上採購，正常':'';
    h+=`<div style="background:${bgC};border:1px solid ${bdC};border-radius:7px;padding:10px 14px;margin-top:10px">
      <div style="font-weight:700;font-size:13px;color:${bdC};margin-bottom:6px">${icon} 寄倉數量與申請入庫數量不一致（${v.未結案_異常.length} 筆）${note}</div>`;
    for(const m of v.未結案_異常){
      const d=m.申請入庫數量-m.寄倉數量;
      h+=`<div style="font-size:12px;color:var(--t2);margin-bottom:3px">寄倉單 #${m.id}：寄倉 <b style="color:var(--t1)">${m.寄倉數量}</b>｜原始申請 <b style="color:var(--t1)">${m.申請入庫數量}</b>（差 <span style="color:var(--o)">${d>0?'+':''}${d}</span>）｜${E(m.狀態||'未知')}</div>`;
    }
    h+=`</div>`;
  }
  h+=`</div>`;

  // ── 商品基本 ──
  h+=`<div class="sec"><h3>商品資訊</h3>
    <div style="display:flex;gap:14px;flex-wrap:wrap;font-size:13px;color:var(--t2)">
      <span><b>料號</b> ${E(p.料號)}</span><span><b>品名</b> ${E(p.品名)}</span>
      <span><b>規格</b> ${E(p.規格||'-')}</span><span><b>採購狀態</b> ${E(p.採購狀態)}</span>
      <span><b>庫存天數</b> ${p.庫存天數}天</span><span><b>採購送達</b> ${p.採購送達天數}天</span>
    </div></div>`;

  // ── 各倉庫存+倉位 ──
  const mainSt=st.find(s=>s.倉庫名==='主倉');
  const mainQty=mainSt?mainSt.數量:0;
  const shelfSum=(d.shelves.貨架||[]).reduce((s,r)=>s+(r.數量||0),0)+(d.shelves.備貨||[]).reduce((s,r)=>s+(r.數量||0),0);
  const shelfBad=mainQty===0&&shelfSum>0;
  const shelfMismatch=mainQty!==shelfSum&&shelfSum>0;
  h+='<div class="sec"><h3>庫存與倉位</h3><div class="bd-grid" style="margin-bottom:10px">';
  for(const s of st){
    const c=s.數量===0?'s0':s.數量<10?'sl':'sok';
    h+=`<div class="bd-item"><span class="reason">${E(s.倉庫名)}</span><span class="qty ${c}">${s.數量}</span></div>`;
  }
  h+=`<div class="bd-item"><span class="reason"><b>總計</b></span><span class="qty ${sc}">${stTotal}</span></div></div>`;
  if(d.shelves.貨架.length||d.shelves.備貨.length){
    if(d.shelves.貨架.length){h+='<h4>貨架</h4><div class="shelf">';for(const r of d.shelves.貨架)h+=`<div class="sh-item"><span class="loc">${E(r.倉位編號)}</span><span class="qty">${r.數量??'-'}</span></div>`;h+='</div>'}
    if(d.shelves.備貨.length){h+='<h4 style="color:var(--o)">備貨</h4><div class="shelf">';for(const r of d.shelves.備貨)h+=`<div class="sh-item"><span class="loc">${E(r.倉位編號)}</span><span class="qty">${r.數量??'-'}</span></div>`;h+='</div>'}
    if(shelfBad){
      h+=`<div style="background:rgba(248,113,113,.1);border:1px solid var(--r);border-radius:7px;padding:8px 12px;margin-top:8px;font-size:12px;color:var(--r);font-weight:700">&#9888; 異常：主倉庫存為 0，但倉位仍有數量（貨架+備貨 = ${shelfSum}），倉位數據可能未同步</div>`;
    }else if(shelfMismatch){
      h+=`<div style="background:rgba(251,191,36,.08);border:1px solid var(--y);border-radius:7px;padding:8px 12px;margin-top:8px;font-size:12px;color:var(--y)">&#9888; 主倉庫存 ${mainQty} ≠ 倉位合計 ${shelfSum}</div>`;
    }
  }
  h+='</div>';

  // ── 退貨追蹤 ──
  if(d.returns&&d.returns.length){
    h+='<div class="sec"><h3>退貨單追蹤（去向分析）</h3>';
    h+=`<table class="dt"><thead><tr><th>退貨單號</th><th>日期</th><th>數量</th><th>來源</th><th>貨物狀態</th><th>最終去向</th><th>是否入庫</th></tr></thead><tbody>`;
    for(const r of d.returns){
      const destCls=r.去向==='進貨上架'?'rd-recv':r.去向==='報廢'?'rd-scrap':r.去向==='檢測'?'rd-inspect':'rd-other';
      const stockIcon=r.已入庫?'<span style="color:var(--g);font-weight:700">&#10004; 是</span>':'<span style="color:var(--t2)">&#10008; 否</span>';
      h+=`<tr><td>${E(r.退貨單號)}</td><td>${E(r.日期)}</td><td style="font-weight:600">${r.數量}</td><td>${E(r.來源)}</td><td>${E(r.貨物狀態)}</td><td><span class="ret-dest ${destCls}">${E(r.去向)}</span></td><td>${stockIcon}</td></tr>`;
    }
    h+='</tbody></table></div>';
  }

  // ── 完整異動歷史 ──
  if(_ev.length){
    h+=`<div class="sec"><h3>完整異動歷史</h3>
      <div class="fb">
        <button class="fc act" onclick="tf('all')">全部</button>
        <button class="fc" onclick="tf('出庫')">出庫</button>
        <button class="fc" onclick="tf('退貨')">退貨</button>
        <button class="fc" onclick="tf('報廢')">報廢</button>
        <button class="fc" onclick="tf('盤點')">盤點</button>
        <button class="fc" onclick="tf('進貨')">進貨</button>
        <label style="margin-left:8px">從</label><input type="date" id="df" onchange="rt()">
        <label>到</label><input type="date" id="dt" onchange="rt()">
        <button class="fc" onclick="cf()" style="margin-left:4px">清除篩選</button>
      </div>
      <div id="tw" class="tw"></div>
      <div id="ts" style="margin-top:8px;font-size:12px;color:var(--t2)"></div>
    </div>`;
  }

  dc.innerHTML=h;
  if(_ev.length)rt();
}
let _ev=[],_af=new Set(),_ft='all';
function tf(t){
  _ft=t;
  document.querySelectorAll('.fb .fc').forEach(b=>{b.classList.toggle('act',b.textContent===({all:'全部'}[t]||t))});
  rt();
}
function cf(){
  _ft='all';document.getElementById('df').value='';document.getElementById('dt').value='';
  document.querySelectorAll('.fb .fc').forEach(b=>b.classList.toggle('act',b.textContent==='全部'));
  rt();
}
function rt(){
  const tw=document.getElementById('tw'),ts=document.getElementById('ts');
  if(!tw)return;
  const df=document.getElementById('df').value,dt=document.getElementById('dt').value;
  let ev=_ev;
  if(_ft!=='all')ev=ev.filter(e=>e.類型===_ft);
  if(df)ev=ev.filter(e=>(e.日期||'')>=df);
  if(dt)ev=ev.filter(e=>(e.日期||'').slice(0,10)<=dt);
  if(!ev.length){tw.innerHTML='<div class="empty">無符合的紀錄</div>';ts.innerHTML='';return}
  const tagMap={'出庫':'tag-out','退貨':'tag-ret','報廢':'tag-scrap','盤點':'tag-audit','進貨':'tag-recv'};
  let h='<table class="dt"><thead><tr><th>類型</th><th>日期</th><th>單號</th><th>原因</th><th>倉別</th><th>數量</th><th>影響</th><th>備註</th></tr></thead><tbody>';
  for(const e of ev){
    const tc=tagMap[e.類型]||'tag-out';
    const imp=e.影響===0?'<span style="color:var(--t2)">0</span>':(e.影響>0?`<span style="color:var(--g);font-weight:700">+${e.影響}</span>`:`<span style="color:var(--r);font-weight:700">${e.影響}</span>`);
    h+=`<tr><td><span class="tag ${tc}">${E(e.類型)}</span></td><td style="white-space:nowrap">${E((e.日期||'-').slice(0,10))}</td><td>${E(e.單號)}</td><td>${E(e.原因)}</td><td>${E(e.倉別)}</td><td style="font-weight:600">${e.數量??''}</td><td>${imp}</td><td style="color:var(--t2);font-size:11px">${E(e.備註)}</td></tr>`;
  }
  h+='</tbody></table>';
  tw.innerHTML=h;
  const sumImp=ev.reduce((s,e)=>s+(e.影響||0),0);
  const sumQty=ev.reduce((s,e)=>s+(e.數量||0),0);
  ts.innerHTML=`顯示 ${ev.length}/${_ev.length} 筆｜數量合計: ${sumQty}｜影響合計: <b style="color:${sumImp>=0?'var(--g)':'var(--r)'}">${sumImp>=0?'+':''}${sumImp}</b>`;
}
function show(v){document.getElementById('sv').style.display=v==='s'?'block':'none';const d=document.getElementById('dv');d.style.display=v==='d'?'block':'none';d.classList.toggle('act',v==='d')}
function back(){show('s')}
function E(s){if(s==null)return'';const d=document.createElement('div');d.textContent=String(s);return d.innerHTML}
</script>
</body></html>
'''


# ─── API ─────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template_string(HTML_PAGE)


@app.route('/api/search')
def api_search():
    q = request.args.get('q', '').strip()
    page = int(request.args.get('page', 1))
    per_page = 20
    if not q:
        return jsonify({'items': [], 'total': 0, 'page': 1, 'total_pages': 0})
    conn = get_conn()
    try:
        cur = conn.cursor()
        like = f'%{q}%'
        cur.execute("SELECT COUNT(*) as cnt FROM `物品_全部物品` WHERE `料號` LIKE %s OR `品名` LIKE %s", (like, like))
        total = cur.fetchone()['cnt']
        total_pages = max(1, (total + per_page - 1) // per_page)
        offset = (page - 1) * per_page
        cur.execute("""
            SELECT p.id, p.`料號`, p.`品名`, p.`規格`, p.`採購狀態`,
                   COALESCE(SUM(k.`數量`), 0) as `總庫存`
            FROM `物品_全部物品` p
            LEFT JOIN `物品_全部物品_庫存_數量` k ON k.`物品_id` = p.id
            WHERE p.`料號` LIKE %s OR p.`品名` LIKE %s
            GROUP BY p.id
            ORDER BY CASE WHEN p.`料號`=%s THEN 0 WHEN p.`料號` LIKE %s THEN 1 ELSE 2 END, p.`料號`
            LIMIT %s OFFSET %s
        """, (like, like, q, f'{q}%', per_page, offset))
        return jsonify({'items': [clean(r) for r in cur.fetchall()], 'total': total, 'page': page, 'total_pages': total_pages})
    finally:
        conn.close()


@app.route('/api/product/<int:pid>/full')
def api_product_full(pid):
    conn = get_conn()
    try:
        cur = conn.cursor()

        # ── 基本資料 ──
        cur.execute("""
            SELECT id,`料號`,`品名`,`規格`,`採購狀態`,`庫存天數`,`採購送達天數`,`銷售成本`,`近30天貢獻金額`
            FROM `物品_全部物品` WHERE id=%s
        """, (pid,))
        product = cur.fetchone()
        if not product:
            return jsonify({'error': '找不到商品'}), 404
        product = clean(product)

        # ── 偵測複合商品（C→B 關聯）──
        composite = None
        data_pid = pid  # 實際查資料用的物品 id
        cur.execute("""
            SELECT c.`數量` as `每組數量`, c.`內容物品_id`,
                   item.`料號`, item.`品名`
            FROM `物品_複合商品_內容` c
            JOIN `物品_全部物品` item ON item.id=c.`內容物品_id`
            WHERE c.`複合商品_id`=%s
        """, (pid,))
        components = [clean(r) for r in cur.fetchall()]
        if components:
            comp = components[0]
            data_pid = comp['內容物品_id']
            composite = {
                '組合品料號': product['料號'],
                '組合品品名': product['品名'],
                '單品料號': comp['料號'],
                '單品品名': comp['品名'],
                '單品id': data_pid,
                '每組數量': comp['每組數量'],
                '組成': components,
            }

        # ── 反向查詢：此 B 單品被哪些 C 組合品使用 ──
        parent_composites = []
        cur.execute("""
            SELECT c.`數量` as `每組數量`, c.`複合商品_id`,
                   item.`料號`, item.`品名`
            FROM `物品_複合商品_內容` c
            JOIN `物品_全部物品` item ON item.id=c.`複合商品_id`
            WHERE c.`內容物品_id`=%s
        """, (pid,))
        for r in cur.fetchall():
            r = clean(r)
            parent_composites.append({
                'id': r['複合商品_id'],
                '料號': r['料號'],
                '品名': r['品名'],
                '每組數量': r['每組數量'],
            })

        # ── 各倉庫存（用 data_pid）──
        cur.execute("""
            SELECT w.`名稱` as `倉庫名`, k.`數量`
            FROM `物品_全部物品_庫存_數量` k JOIN `倉庫_倉庫` w ON w.id=k.`倉庫_id`
            WHERE k.`物品_id`=%s ORDER BY w.id
        """, (data_pid,))
        stock_raw = [clean(r) for r in cur.fetchall()]
        # 排除寄倉加工中倉（累計值不會因 MOMO 出貨扣減，數據無意義）
        stock = [s for s in stock_raw if s['倉庫名'] != '寄倉加工中倉']

        # 各倉庫存
        main_stock = 0
        total_stock = 0
        for s in stock:
            total_stock += s['數量']
            if s['倉庫名'] == '主倉':
                main_stock = s['數量']

        # ── 倉位（用 data_pid）──
        cur.execute("""
            SELECT c.`編號` as `倉位編號`,w.`名稱` as `倉庫`,s.`數量`
            FROM `物品_全部物品_倉位_貨架` s
            JOIN `倉庫_倉位` c ON c.id=s.`倉位_id` JOIN `倉庫_倉庫` w ON w.id=c.`倉庫_id`
            WHERE s.`全部物品_id`=%s
        """, (data_pid,))
        shelf = [clean(r) for r in cur.fetchall()]
        cur.execute("""
            SELECT c.`編號` as `倉位編號`,w.`名稱` as `倉庫`,s.`數量`
            FROM `物品_全部物品_倉位_備貨` s
            JOIN `倉庫_倉位` c ON c.id=s.`倉位_id` JOIN `倉庫_倉庫` w ON w.id=c.`倉庫_id`
            WHERE s.`全部物品_id`=%s
        """, (data_pid,))
        prep = [clean(r) for r in cur.fetchall()]

        # ══════════════════════════════════════════
        #  驗算邏輯
        # ══════════════════════════════════════════

        # 1. 採購已上架量（有進貨單的採購單）— 用 data_pid
        cur.execute("""
            SELECT COALESCE(SUM(`數量`+`額外數量`),0) as v
            FROM `採購_採購單`
            WHERE `物品_id`=%s AND `進貨單_id` IS NOT NULL
        """, (data_pid,))
        purchase_stocked = cur.fetchone()['v'] or 0

        # 2. 出庫按原因分類 — 用 data_pid
        cur.execute("""
            SELECT r.`原因`, r.id as rid, SUM(d.`數量`) as 總量
            FROM `倉庫_出庫單_商品數量` d
            JOIN `倉庫_出庫單` o ON o.`出庫單號`=d.`出庫單號_id`
            JOIN `倉庫_出庫原因` r ON r.id=o.`原因_id`
            WHERE d.`物品_id`=%s GROUP BY r.id ORDER BY 總量 DESC
        """, (data_pid,))
        out_by_reason = [clean(r) for r in cur.fetchall()]
        # 寄倉相關出庫原因 id: 2=寄倉, 9=寄倉加工, 10=寄倉加工完成, 12=寄倉用調倉
        CONSIGN_OUT_IDS = {2, 9, 10, 12}
        out_consign_wh = sum(r['總量'] for r in out_by_reason if r['rid'] in CONSIGN_OUT_IDS)
        out_non_consign = sum(r['總量'] for r in out_by_reason if r['rid'] not in CONSIGN_OUT_IDS)
        out_total = sum(r['總量'] for r in out_by_reason)

        # 3. 入庫按原因分類 — 用 data_pid
        cur.execute("""
            SELECT r.`原因`, r.id as rid, SUM(d.`數量`) as 總量
            FROM `倉庫_入庫單_商品數量` d
            JOIN `倉庫_入庫單` i ON i.`入庫單號`=d.`入庫單號_id`
            JOIN `倉庫_入庫原因` r ON r.id=i.`原因_id`
            WHERE d.`物品_id`=%s GROUP BY r.id ORDER BY 總量 DESC
        """, (data_pid,))
        in_by_reason = [clean(r) for r in cur.fetchall()]
        in_total = sum(r['總量'] for r in in_by_reason)

        # 4. 退貨追蹤 — 用 data_pid
        cur.execute("""
            SELECT `退貨單號`,`建立時間` as 日期,`來源`,`數量`,
                   `判斷貨物狀態`,`結案`,`流程狀態`
            FROM `倉庫_退貨單` WHERE `物品_id`=%s
            ORDER BY `建立時間` DESC LIMIT 200
        """, (data_pid,))
        raw_returns = [clean(r) for r in cur.fetchall()]

        returns_result = []
        ret_stocked = 0
        for ret in raw_returns:
            ret_no = ret['退貨單號']
            qty = ret.get('數量') or 1
            dest = '未追蹤'
            stocked = False

            # 檢查是否有進貨單來自這張退貨單
            cur.execute("""
                SELECT `進貨單號`,`已完成入庫`,`結案` FROM `倉庫_進貨單`
                WHERE `退貨單_id`=%s LIMIT 1
            """, (ret_no,))
            recv = cur.fetchone()
            if recv:
                if recv['已完成入庫']:
                    dest = '進貨上架'
                    stocked = True
                    ret_stocked += qty
                else:
                    dest = f"進貨單({recv['進貨單號']})未完成入庫"
            else:
                # 檢查報廢
                cur.execute("SELECT `報廢單號` FROM `倉庫_報廢單` WHERE `退貨單_id`=%s LIMIT 1", (ret_no,))
                scrap = cur.fetchone()
                if scrap:
                    dest = '報廢'
                else:
                    # 檢查檢測
                    cur.execute("SELECT `檢測單號` FROM `倉庫_檢測單` WHERE `退貨單_id`=%s LIMIT 1", (ret_no,))
                    inspect = cur.fetchone()
                    if inspect:
                        dest = '檢測'
                    else:
                        dest = '其他/未連結'

            returns_result.append({
                '退貨單號': ret_no, '日期': ret.get('日期', ''),
                '數量': qty, '來源': ret.get('來源', ''),
                '貨物狀態': ret.get('判斷貨物狀態', ''),
                '去向': dest, '已入庫': stocked,
            })

        # 5. 其他入庫（排除 採購相關 和 退貨相關）
        # 入庫原因 id=2 例行採購, id=5 進貨, id=3 退貨
        other_in = sum(r['總量'] for r in in_by_reason if r['rid'] not in (2, 3, 5))

        # 6. MOMO 寄倉數量（實際寄出）— 用原始 pid（C 組合品）
        cur.execute("""
            SELECT COALESCE(SUM(s.`寄倉數量`),0) as v
            FROM `momo_寄倉單` s
            JOIN `momo_單品` dp ON dp.id = s.`單品_id`
            WHERE dp.`物品_id`=%s AND s.`結案`=1 AND s.`已刪單`=0
        """, (pid,))
        momo_consign_raw = int(cur.fetchone()['v'] or 0)
        # 如果是複合商品，乘以每組數量換算成 B 單品數量
        unit_qty = composite['每組數量'] if composite else 1
        momo_consign = momo_consign_raw * unit_qty

        # 6b. 未結案寄倉（尚未完成的寄倉單）— 拆分包貨完成 vs 其他
        cur.execute("""
            SELECT s.id, s.`寄倉數量`, s.`包貨流程狀態`,
                   COALESCE(ad.`申請入庫數量`, 0) as `申請入庫數量`
            FROM `momo_寄倉單` s
            JOIN `momo_單品` dp ON dp.id = s.`單品_id`
            LEFT JOIN `momo_入庫申請單詳情` ad ON ad.`寄倉單_id` = s.id
            WHERE dp.`物品_id`=%s AND s.`結案`=0 AND s.`已刪單`=0
        """, (pid,))
        pending_rows = [clean(r) for r in cur.fetchall()]
        pending_packed_raw = sum(r['寄倉數量'] for r in pending_rows if r['包貨流程狀態'] == '包貨完成')
        pending_other_rows = [r for r in pending_rows if r['包貨流程狀態'] != '包貨完成']
        pending_other_raw = sum(r['寄倉數量'] for r in pending_other_rows)
        pending_other_apply = sum(r['申請入庫數量'] for r in pending_other_rows)
        pending_mismatch = [r for r in pending_other_rows if r['寄倉數量'] != r['申請入庫數量']]

        momo_pending_raw = pending_packed_raw + pending_other_raw
        momo_pending = momo_pending_raw * unit_qty

        # 7. 差異計算
        # 已排除寄倉加工中倉，所有倉庫存不再與 MOMO寄倉 重疊
        # 公式：(採購已上架 + 退貨已上架) = MOMO寄倉 + 未結案寄倉 + 倉庫庫存 + 非寄倉出庫
        stock_remain = total_stock
        diff = (int(purchase_stocked) + ret_stocked) - (momo_consign + momo_pending + stock_remain + out_non_consign)

        verify = {
            '採購已上架': int(purchase_stocked),
            '退貨已上架': ret_stocked,
            '其他入庫': other_in,
            '總入庫': in_total,
            'MOMO寄倉': momo_consign,
            'MOMO寄倉組數': momo_consign_raw,
            '未結案寄倉': momo_pending,
            '未結案寄倉組數': momo_pending_raw,
            '未結案_包貨完成': pending_packed_raw * unit_qty,
            '未結案_其他': pending_other_raw * unit_qty,
            '未結案_其他_申請入庫': pending_other_apply * unit_qty,
            '未結案_異常': [{'id': r['id'], '寄倉數量': r['寄倉數量'] * unit_qty, '申請入庫數量': r['申請入庫數量'] * unit_qty, '狀態': r['包貨流程狀態']} for r in pending_mismatch],
            '每組數量': unit_qty,
            '倉庫剩餘': stock_remain,
            '寄倉相關出庫': out_consign_wh,
            '非寄倉出庫': out_non_consign,
            '總出庫': out_total,
            '主倉庫存': main_stock,
            '差異': diff,
            '出庫明細': out_by_reason,
            '入庫明細': in_by_reason,
        }

        # ══════════════════════════════════════════
        #  盤點紀錄
        # ══════════════════════════════════════════
        cur.execute("""
            SELECT a.`紀錄時間` as d,c.`編號` as loc,a.`操作`,a.`原始數量`,a.`盤點數量`,u.`username` as u
            FROM `倉庫_倉庫盤點紀錄` a
            LEFT JOIN `倉庫_倉位` c ON c.id=a.`倉位_id`
            LEFT JOIN `auth_user` u ON u.id=a.`記錄人_id`
            WHERE a.`全部物品_id`=%s ORDER BY a.`紀錄時間` DESC LIMIT 200
        """, (data_pid,))
        audits = []
        for r in cur.fetchall():
            r = clean(r)
            orig = int(r.get('原始數量') or 0)
            aud = int(r.get('盤點數量') or 0)
            audits.append({'日期': r['d'], '倉位': r.get('loc') or '-', '操作': r.get('操作') or '盤點', '原始數量': orig, '盤點數量': aud, '差異': aud - orig, '記錄人': r.get('u') or ''})

        # ══════════════════════════════════════════
        #  報廢紀錄
        # ══════════════════════════════════════════
        cur.execute("""
            SELECT `報廢單號` as n,`建立時間` as d,`數量`,`報廢原因` as b,`是否扣庫存`,`處理方式`
            FROM `倉庫_報廢單` WHERE `物品_id`=%s ORDER BY `建立時間` DESC LIMIT 200
        """, (data_pid,))
        scraps = []
        for r in cur.fetchall():
            r = clean(r)
            scraps.append({'報廢單號': str(r['n']), '日期': r['d'], '數量': r.get('數量') or 0, '報廢原因': r.get('b') or '', '處理方式': r.get('處理方式') or '', '扣庫存': bool(r.get('是否扣庫存'))})

        # ══════════════════════════════════════════
        #  完整異動歷史
        # ══════════════════════════════════════════
        timeline = []

        # 出庫 — 用 data_pid
        cur.execute("""
            SELECT o.`出庫單號` as n,o.`建立日期` as d,r.`原因`,w.`名稱` as wn,x.`數量`,o.`備註`
            FROM `倉庫_出庫單_商品數量` x
            JOIN `倉庫_出庫單` o ON o.`出庫單號`=x.`出庫單號_id`
            JOIN `倉庫_出庫原因` r ON r.id=o.`原因_id`
            JOIN `倉庫_倉庫` w ON w.id=o.`倉別_id`
            WHERE x.`物品_id`=%s ORDER BY o.`建立日期` DESC LIMIT 200
        """, (data_pid,))
        for r in cur.fetchall():
            r = clean(r)
            timeline.append({'類型': '出庫', '日期': r['d'], '單號': str(r['n']), '原因': r['原因'], '倉別': r['wn'], '數量': r['數量'], '影響': -r['數量'], '備註': r['備註'] or ''})

        # 退貨
        for ret in raw_returns:
            qty = ret.get('數量') or 1
            timeline.append({'類型': '退貨', '日期': ret.get('日期', ''), '單號': ret['退貨單號'], '原因': ret.get('來源', ''), '倉別': '-', '數量': qty, '影響': 0, '備註': ret.get('判斷貨物狀態', '')})

        # 報廢
        for s in scraps:
            imp = -s['數量'] if s['扣庫存'] else 0
            timeline.append({'類型': '報廢', '日期': s['日期'], '單號': s['報廢單號'], '原因': s['處理方式'], '倉別': '-', '數量': s['數量'], '影響': imp, '備註': s['報廢原因'] + ('' if s['扣庫存'] else '（未扣庫存）')})

        # 盤點
        for a in audits:
            who = f"｜{a['記錄人']}" if a['記錄人'] else ''
            timeline.append({'類型': '盤點', '日期': a['日期'], '單號': '-', '原因': a['操作'], '倉別': a['倉位'], '數量': a['盤點數量'], '影響': a['差異'], '備註': f"原始:{a['原始數量']}→盤點:{a['盤點數量']}{who}"})

        # 進貨
        cur.execute("""
            SELECT f.`進貨單號` as n,f.`建立日期` as d,x.`數量`,f.`流程狀態`,f.`結案`,
                   u.`username` as signer
            FROM `倉庫_進貨明細` x JOIN `倉庫_進貨單` f ON f.`進貨單號`=x.`進貨單_id`
            LEFT JOIN `auth_user` u ON u.id=f.`進貨部簽收人_id`
            WHERE x.`物品_id`=%s ORDER BY f.`建立日期` DESC LIMIT 200
        """, (data_pid,))
        for r in cur.fetchall():
            r = clean(r)
            note = f"結案:{'是' if r.get('結案') else '否'}"
            if r.get('signer'):
                note += f"｜簽收:{r['signer']}"
            timeline.append({'類型': '進貨', '日期': r['d'], '單號': str(r['n']), '原因': r.get('流程狀態', ''), '倉別': '-', '數量': r.get('數量'), '影響': 0, '備註': note})

        timeline.sort(key=lambda e: e.get('日期') or '', reverse=True)

        return jsonify({
            'product': product, 'stock': stock,
            'shelves': {'貨架': shelf, '備貨': prep},
            'verify': verify, 'returns': returns_result,
            'timeline': timeline, 'composite': composite,
            'parent_composites': parent_composites,
            'audits': audits, 'scraps': scraps,
        })
    finally:
        conn.close()


if __name__ == '__main__':
    threading.Timer(1.5, lambda: webbrowser.open('http://localhost:5000')).start()
    print('=' * 50)
    print('  庫存查詢工具已啟動')
    print('  請在瀏覽器開啟 http://localhost:5000')
    print('  按 Ctrl+C 停止')
    print('=' * 50)
    app.run(host='0.0.0.0', port=5000, debug=False)
