// This is needed to find the global `pdfjsLib` object.
declare const pdfjsLib: any;

// Set the worker source for pdf.js. This is crucial for it to work from a CDN.
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onload = async (event) => {
      if (!event.target?.result) {
        return reject(new Error('Не удалось прочитать файл.'));
      }

      try {
        const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        
        resolve(fullText);
      } catch (error) {
        console.error('Error processing PDF:', error);
        reject(new Error('Не удалось разобрать PDF-файл. Возможно, он поврежден или имеет неподдерживаемый формат.'));
      }
    };

    fileReader.onerror = (error) => {
      reject(new Error('Ошибка чтения файла: ' + error));
    };

    fileReader.readAsArrayBuffer(file);
  });
}