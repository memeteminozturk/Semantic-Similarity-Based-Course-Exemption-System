// src/utils/pdfParser.js
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// Yardımcı regex sabitleri
// Ders kodu: herhangi bir harf veya rakam kombinasyonu, 5–9 karakter uzunluğunda
const COURSE_CODE_RE = /^[A-ZÇĞİÖŞÜ0-9]{5,9}$/;
const STATUS_RE = /^[ZS]$/;              // Z = Zorunlu, S = Seçmeli

// "3,5" → 3.5  "-"/"" → null
const toNumber = (str) => {
  if (!str || str === '-') return null;
  return Number(str.replace(',', '.'));
};

/**
 * PDF içeriğinden dersleri ayrıştırır.
 * @param {File | Blob} file – kullanıcıdan seçilen PDF dosyası
 * @returns {Promise<Array<Object>>}
 */
export async function parsePdf(file) {
  const loadingTask = pdfjsLib.getDocument({ url: URL.createObjectURL(file) });
  const pdf = await loadingTask.promise;

  const courses = [];

  for (let pageIdx = 1; pageIdx <= pdf.numPages; pageIdx++) {
    const page = await pdf.getPage(pageIdx);
    const textContent = await page.getTextContent();
    const rawText = textContent.items.map((i) => i.str).join(' ');

    // 1) Ön‑temizlik: parantezli İngilizce açıklamaları kaldır, fazla boşlukları sadeleştir
    let cleaned = rawText
      .replace(/\([^)]*\)/g, ' ')  // (…)
      .replace(/\s+/g, ' ');        // tüm fazla boşlukları tek boşluğa indir

    // 2) Satır kes: herhangi bir ders kodu görüldüğünde yeni satır aç
    cleaned = cleaned.replace(
      / (?=[A-ZÇĞİÖŞÜ0-9]{5,9}\s)/g,
      '\n'
    );

    const lines = cleaned.split('\n');
    for (const line of lines) {
      const courseObj = parseRow(line);
      if (courseObj) courses.push(courseObj);
    }
  }

  return courses;
}

// ──────────────────────────────────────────────────────────────
// Tek bir satırı ders objesine dönüştürür
function parseRow(line) {
  const tokens = line.trim().split(/\s+/);
  if (!tokens.length) return null;

  const codeToken = tokens.shift();
  if (!COURSE_CODE_RE.test(codeToken)) return null; // Ders kodu değilse atla

  // 1) Ders adı: Z veya S görünene kadar topla
  const nameParts = [];
  while (tokens.length && !STATUS_RE.test(tokens[0])) {
    nameParts.push(tokens.shift());
  }
  if (!tokens.length) return null;

  // 2) Sütunları sırayla çek
  const status = tokens.shift();      // Z | S
  const language = tokens.shift();      // Tr | En | …
  const theory = toNumber(tokens.shift());
  const practice = toNumber(tokens.shift());
  const uk = toNumber(tokens.shift());
  const ects = toNumber(tokens.shift());

  const pointsTok = tokens.shift();
  const points = toNumber(pointsTok);

  const gradeTok = tokens.shift();
  const grade = gradeTok === '--' ? null : gradeTok;

  const comments = tokens; // kalan yorumlar

  return {
    code: codeToken,
    name: nameParts.join(' '),
    status,
    language,
    theory,
    practice,
    nationalCredit: uk,
    ects,
    points,
    grade,
    comments,
  };
}
