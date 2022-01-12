export function readFileAsBlob(file: File): Promise<Blob> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.addEventListener('load', (e: any) => {
      const blob = new Blob([new Uint8Array(e.target.result)], {
        type: file.type,
      });
      resolve(blob);
    });
    reader.readAsArrayBuffer(file);
  });
}

export function base64toBlob(base64Data, contentType?) {
  if (base64Data.indexOf(',') >= 0) {
    base64Data = base64Data.substring(base64Data.indexOf(',') + 1);
  }

  contentType = contentType || '';
  const sliceSize = 1024;
  const byteCharacters = atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}

export function blobToBase64(blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}
