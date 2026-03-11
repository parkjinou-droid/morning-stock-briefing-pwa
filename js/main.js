// ==============================================
// 아침 주식 브리핑 PWA - main.js
// Backend API: Vercel Serverless
// ==============================================

const API_BASE_URL = 'https://morning-stock-briefing-backend.vercel.app';

// 브리핑 가져오기
async function getBriefing() {
  const resultEl = document.getElementById('result');
  resultEl.textContent = '🔄 데이터를 불러오는 중...';
  try {
    const res = await fetch(`${API_BASE_URL}/api/briefing`);
    if (!res.ok) throw new Error(`HTTP 오류: ${res.status}`);
    const data = await res.json();
    if (data.briefing) {
      resultEl.textContent = data.briefing;
    } else if (data.summary) {
      resultEl.textContent = data.summary;
    } else {
      resultEl.textContent = JSON.stringify(data, null, 2);
    }
  } catch (err) {
    resultEl.textContent = `❌ 오류 발생: ${err.message}\n\nAPI 주소: ${API_BASE_URL}/api/briefing`;
    console.error(err);
  }
}

// 주요 지수 조회
async function getStocks() {
  const listEl = document.getElementById('stock-list');
  listEl.innerHTML = '<li>🔄 지수 데이터 불러오는 중...</li>';
  try {
    const res = await fetch(`${API_BASE_URL}/api/stocks`);
    if (!res.ok) throw new Error(`HTTP 오류: ${res.status}`);
    const data = await res.json();
    listEl.innerHTML = '';
    const stocks = Array.isArray(data) ? data : (data.stocks || data.indices || []);
    if (stocks.length === 0) {
      listEl.innerHTML = '<li>데이터가 없습니다.</li>';
      return;
    }
    stocks.forEach(s => {
      const li = document.createElement('li');
      const name = s.name || s.symbol || s.index || 'N/A';
      const price = s.price || s.close || s.value || '-';
      const change = s.change || s.changePercent || s.rate || 0;
      const changeNum = parseFloat(change);
      const cls = changeNum > 0 ? 'up' : changeNum < 0 ? 'down' : 'flat';
      const arrow = changeNum > 0 ? '▲' : changeNum < 0 ? '▼' : '―';
      li.innerHTML = `<span>${name}</span><span class="${cls}">${price} ${arrow} ${Math.abs(changeNum).toFixed(2)}%</span>`;
      listEl.appendChild(li);
    });
  } catch (err) {
    listEl.innerHTML = `<li>❌ 오류: ${err.message}</li>`;
    console.error(err);
  }
}
