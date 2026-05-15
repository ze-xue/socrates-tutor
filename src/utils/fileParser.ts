export async function parsePDF(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText.trim();
}

export async function parseDOCX(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export function parseTXT(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function handleFileUpload(file: File): Promise<{ content: string; fileData: string; type: 'image' | 'file' }> {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    throw new Error('文件大小不能超过 5MB');
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext || '')) {
    const base64 = await fileToBase64(file);
    return { content: '', fileData: base64, type: 'image' };
  }
  
  if (ext === 'pdf') {
    const text = await parsePDF(file);
    return { content: text, fileData: text, type: 'file' };
  }
  
  if (ext === 'docx') {
    const text = await parseDOCX(file);
    return { content: text, fileData: text, type: 'file' };
  }
  
  if (ext === 'txt') {
    const text = await parseTXT(file);
    return { content: text, fileData: text, type: 'file' };
  }
  
  throw new Error('不支持的文件格式，请上传图片(png/jpg)、PDF、Word 或 TXT 文件');
}
