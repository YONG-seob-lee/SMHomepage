/* ===== 상태 ===== */
const state = {
  file:    null,   // 선택된 File 객체
  style:   null,   // 선택된 풍 키
  quality: 'fast', // 화질
};

/* ===== 요소 참조 ===== */
const uploadArea        = document.getElementById('uploadArea');
const fileInput         = document.getElementById('fileInput');
const uploadBtn         = document.getElementById('uploadBtn');
const changeBtn         = document.getElementById('changeBtn');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const uploadPreview     = document.getElementById('uploadPreview');
const previewImg        = document.getElementById('previewImg');
const styleBtns         = document.querySelectorAll('.style-btn');
const qualityBtns       = document.querySelectorAll('.quality-btn');
const wishInput         = document.getElementById('wishInput');
const charCount         = document.getElementById('charCount');
const generateBtn       = document.getElementById('generateBtn');
const generateHint      = document.getElementById('generateHint');
const loadingWrap       = document.getElementById('loadingWrap');
const resultCard        = document.getElementById('resultCard');
const resultImg         = document.getElementById('resultImg');
const downloadBtn       = document.getElementById('downloadBtn');
const retryBtn          = document.getElementById('retryBtn');
const errorWrap         = document.getElementById('errorWrap');
const errorText         = document.getElementById('errorText');
const errorRetryBtn     = document.getElementById('errorRetryBtn');

/* ===== 이미지 업로드 ===== */
uploadBtn.addEventListener('click', () => fileInput.click());
changeBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
  if (e.target.files[0]) setFile(e.target.files[0]);
});

// 드래그 앤 드롭
uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
uploadArea.addEventListener('dragleave', ()  => uploadArea.classList.remove('drag-over'));
uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f && f.type.startsWith('image/')) setFile(f);
});

function setFile(file) {
  state.file = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    uploadPlaceholder.hidden = true;
    uploadPreview.hidden = false;
  };
  reader.readAsDataURL(file);
  updateGenerateBtn();
}

/* ===== 풍 선택 ===== */
styleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    styleBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.style = btn.dataset.style;
    updateGenerateBtn();
  });
});

/* ===== 화질 선택 ===== */
qualityBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    qualityBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.quality = btn.dataset.quality;
  });
});

/* ===== 글자 수 카운트 ===== */
wishInput.addEventListener('input', () => {
  charCount.textContent = wishInput.value.length;
});

/* ===== 만들기 버튼 활성화 조건 ===== */
function updateGenerateBtn() {
  if (!state.file) {
    generateBtn.disabled = true;
    generateHint.textContent = '1단계에서 사진을 먼저 올려주세요';
  } else if (!state.style) {
    generateBtn.disabled = true;
    generateHint.textContent = '2단계에서 느낌을 골라주세요';
  } else {
    generateBtn.disabled = false;
    generateHint.textContent = '준비됐어요!';
  }
}

/* ===== 이미지 생성 ===== */
generateBtn.addEventListener('click', generate);
retryBtn.addEventListener('click', () => {
  resultCard.hidden = true;
  generate();
});
errorRetryBtn.addEventListener('click', () => {
  errorWrap.hidden = true;
  generate();
});

async function generate() {
  // UI 상태 전환
  generateBtn.disabled = true;
  loadingWrap.hidden   = false;
  resultCard.hidden    = true;
  errorWrap.hidden     = true;

  const formData = new FormData();
  formData.append('image',   state.file);
  formData.append('style',   state.style);
  formData.append('quality', state.quality);
  formData.append('wish',    wishInput.value.trim());

  try {
    const res = await fetch(`${API_BASE_URL}/api/generate`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || '알 수 없는 오류');

    // 결과 표시
    const imgUrl = `${API_BASE_URL}${data.imageUrl}`;
    resultImg.src     = imgUrl;
    downloadBtn.href  = imgUrl;
    resultCard.hidden = false;
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    errorText.textContent = err.message || '이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요.';
    errorWrap.hidden = false;
  } finally {
    loadingWrap.hidden  = true;
    generateBtn.disabled = !state.file || !state.style;
  }
}
