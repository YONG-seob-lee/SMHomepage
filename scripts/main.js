/* ===== 상태 ===== */
const state = {
  file:    null,    // 선택된 File 객체
  format:  'bmp',   // 저장 형식 (기본 BMP)
  dotSize: 'auto',  // 도트 크기
  imgW:    null,
  imgH:    null,
};

/* ===== 요소 참조 ===== */
const uploadArea        = document.getElementById('uploadArea');
const fileInput         = document.getElementById('fileInput');
const uploadBtn         = document.getElementById('uploadBtn');
const changeBtn         = document.getElementById('changeBtn');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const uploadPreview     = document.getElementById('uploadPreview');
const previewImg        = document.getElementById('previewImg');
const dotSizeBtns       = document.querySelectorAll('[data-dotsize]');
const formatBtns        = document.querySelectorAll('[data-format]');
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
const resolutionInfo    = document.getElementById('resolutionInfo');
const resInfoText       = document.getElementById('resInfoText');

/* ===== 이미지 업로드 ===== */
uploadBtn.addEventListener('click', () => fileInput.click());
changeBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
  if (e.target.files[0]) setFile(e.target.files[0]);
});

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

    const img = new Image();
    img.onload = () => {
      state.imgW = img.naturalWidth;
      state.imgH = img.naturalHeight;
      updateResolutionInfo();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  updateGenerateBtn();
}

function updateResolutionInfo() {
  if (!state.imgW) { resolutionInfo.hidden = true; return; }
  const inputSize = Math.max(state.imgW, state.imgH);
  const autoTarget = Math.max(16, Math.round(inputSize / 16));
  const displayTarget = state.dotSize === 'auto' ? autoTarget : parseInt(state.dotSize);
  resInfoText.innerHTML = `업로드: <strong>${state.imgW}×${state.imgH}</strong> &nbsp;→&nbsp; 도트 출력: <strong>${displayTarget}×${displayTarget}</strong>`;
  resolutionInfo.hidden = false;
}

/* ===== 도트 크기 ===== */
dotSizeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    dotSizeBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.dotSize = btn.dataset.dotsize;
    updateResolutionInfo();
  });
});

/* ===== 저장 형식 ===== */
function setFormat(fmt) {
  state.format = fmt;
  formatBtns.forEach(b => b.classList.toggle('selected', b.dataset.format === fmt));
}
formatBtns.forEach(btn => btn.addEventListener('click', () => setFormat(btn.dataset.format)));

/* ===== 글자 수 카운트 ===== */
wishInput.addEventListener('input', () => {
  charCount.textContent = wishInput.value.length;
});

/* ===== 만들기 버튼 활성화 ===== */
function updateGenerateBtn() {
  if (!state.file) {
    generateBtn.disabled = true;
    generateHint.textContent = '1단계에서 사진을 먼저 올려주세요';
  } else {
    generateBtn.disabled = false;
    generateHint.textContent = '준비됐어요!';
  }
}

/* ===== 이미지 생성 ===== */
generateBtn.addEventListener('click', generate);
retryBtn.addEventListener('click', () => { resultCard.hidden = true; generate(); });
errorRetryBtn.addEventListener('click', () => { errorWrap.hidden = true; generate(); });

async function generate() {
  generateBtn.disabled = true;
  loadingWrap.hidden   = false;
  resultCard.hidden    = true;
  errorWrap.hidden     = true;

  const formData = new FormData();
  formData.append('image',   state.file);
  formData.append('style',   'dot');
  formData.append('wish',    wishInput.value.trim());
  formData.append('format',  state.format);
  if (state.dotSize !== 'auto') formData.append('dotSize', state.dotSize);

  try {
    const res = await fetch(`${API_BASE_URL}/api/generate`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '알 수 없는 오류');

    const imgUrl = `${API_BASE_URL}${data.imageUrl}`;
    resultImg.src        = imgUrl;
    downloadBtn.href     = imgUrl;
    downloadBtn.download = `pixel_art.${data.ext || 'bmp'}`;
    resultCard.hidden    = false;
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    errorText.textContent = err.message || '변환에 실패했습니다. 잠시 후 다시 시도해주세요.';
    errorWrap.hidden = false;
  } finally {
    loadingWrap.hidden   = true;
    generateBtn.disabled = !state.file;
  }
}
