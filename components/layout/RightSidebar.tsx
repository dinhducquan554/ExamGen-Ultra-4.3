

import React, { useState } from "react";
import {
  FileText,
  Copy,
  FileSpreadsheet,
  FileType,
  Printer,
  ChevronLeft,
  ChevronRight,
  Download,
} from "../icons";
import { Button } from "../ui/Button";
import { useTheme } from "../../hooks/useTheme";
import { useToast } from "../../hooks/useToast";
import { useSettings } from "../../hooks/useSettings";
import { useI18n } from "../../hooks/useI18n";

export default function RightSidebar() {
  const [open, setOpen] = useState(true);
  const { theme } = useTheme();
  const { addToast } = useToast();
  const { settings } = useSettings();
  const { t } = useI18n();

  const sanitize = (str: string) => {
    if (!str) return '';
    return str
      .replace(/\s+/g, '_') // replace spaces with underscores
      .replace(/[\\/:"*?<>|]/g, '-'); // replace invalid filename characters
  };

  const generateFilename = (descriptor: string) => {
    const { subject, grade, examType } = settings;

    const parts = [
        sanitize(subject || 'MonHoc'),
        sanitize(grade ? `Lop${grade}` : 'Lop'),
        sanitize(examType || 'BaiKiemTra'),
        sanitize(descriptor)
    ].filter(Boolean);

    return parts.join('_');
  };

  const getActiveContentElement = (): HTMLElement | null => {
    return document.getElementById('printable-content');
  };

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const isTextBased = mimeType.startsWith('text/') || mimeType.includes('csv');
    const contentWithBOM = isTextBased ? '\uFEFF' + content : content;
    const blob = new Blob([contentWithBOM], { type: `${mimeType};charset=utf-8;` });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const htmlTableToCsv = (tableEl: HTMLTableElement): string | null => {
    if (!tableEl) return null;
    const rows = Array.from(tableEl.querySelectorAll('tr'));
    return rows.map(row => {
      const cells = Array.from(row.querySelectorAll<HTMLElement>('th, td'));
      return cells.map(cell => {
        let text = cell.innerText.replace(/"/g, '""').replace(/\n/g, " ");
        if (text.includes(',')) {
          text = `"${text}"`;
        }
        return text;
      }).join(',');
    }).join('\n');
  };
  
  const handleNotImplemented = () => {
    addToast(t('rightSidebar.notImplemented', "Tính năng này đang được phát triển."));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const contentEl = getActiveContentElement();
    const previewEl = contentEl?.querySelector('[data-doc-type]');
    const exportContentEl = previewEl || contentEl;

    if (exportContentEl) {
      // FIX: Cast exportContentEl to HTMLElement to access the 'innerText' property.
      navigator.clipboard.writeText((exportContentEl as HTMLElement).innerText).then(() => {
        addToast(t('toasts.copiedToClipboard', "Đã sao chép nội dung vào clipboard."));
      }).catch(err => {
        addToast(t('toasts.copyError', "Lỗi: Không thể sao chép nội dung."));
        console.error('Could not copy text: ', err);
      });
    } else {
      addToast(t('toasts.noContentToCopy', "Không tìm thấy nội dung để sao chép."));
    }
  };

  const handleExportDocx = () => {
    const contentEl = getActiveContentElement();
    if (contentEl) {
        const previewEl = contentEl.querySelector('[data-doc-type]');
        const descriptor = previewEl?.getAttribute('data-doc-type') || 'TaiLieu';
        
        // Basic CSS for better Word rendering.
        const styles = `
            body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
            th, td { border: 1px solid black; padding: 5px; text-align: left; vertical-align: top; }
            th { font-weight: bold; text-align: center; }
            p, li, div { margin: 0; padding: 0; line-height: 1.5; }
            h1, h2, h3, h4, h5, h6 { margin: 12pt 0 3pt 0; font-weight: bold; page-break-after: avoid; }
            strong { font-weight: bold; }
            em, i { font-style: italic; }
        `;

        const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>Export HTML to Word</title>
                <style>${styles}</style>
            </head>
            <body>`;

        const footer = "</body></html>";
        const sourceHTML = header + (previewEl?.innerHTML || contentEl.innerHTML) + footer;
        const filename = generateFilename(descriptor);
        
        // CRITICAL FIX: Save as .doc, not .docx, to match the MIME type and improve compatibility.
        // Word is much better at interpreting HTML content when the file is a .doc.
        downloadFile(`${filename}.doc`, sourceHTML, 'application/msword');
        addToast(t('toasts.exportingFile', 'Đang xuất file {fileType}...', { fileType: '.DOC' }));
    } else {
        addToast(t('toasts.exportError', "Không tìm thấy nội dung để xuất file."));
    }
  };

  const handleExportXlsx = () => {
    const contentEl = getActiveContentElement();
    const previewEl = contentEl?.querySelector('[data-doc-type*="MaTrận"], [data-doc-type*="BaoCao"]');
    const tableEl = previewEl?.querySelector('table') || contentEl?.querySelector('table');
    
    if (tableEl) {
        const csvContent = htmlTableToCsv(tableEl);
        if (csvContent) {
            let descriptor = 'BangDuLieu';
            if (previewEl) {
                descriptor = previewEl.getAttribute('data-doc-type') || descriptor;
            }
            const filename = generateFilename(descriptor);
            // Save as CSV, which Excel can open perfectly. This is more robust than pretending it's an XLS file.
            downloadFile(`${filename}.csv`, csvContent, 'text/csv');
            addToast(t('toasts.exportingFile', 'Đang xuất file {fileType}...', { fileType: '.CSV' }));
        } else {
            addToast(t('toasts.exportTableToCsvError', "Không thể chuyển đổi bảng thành CSV."));
        }
    } else {
        addToast(t('toasts.exportNoTableError', "Không tìm thấy ma trận/bảng để xuất file."));
    }
  };
  
  const handleExport = (format: 'md' | 'txt' | 'rtf' | 'csv') => {
      const contentEl = getActiveContentElement();
      if (!contentEl) {
          addToast(t('toasts.exportError', "Không tìm thấy nội dung để xuất file."));
          return;
      }
      
      const previewEl = contentEl.querySelector('[data-doc-type]');
      const exportContentEl = previewEl || contentEl;
      const descriptor = previewEl?.getAttribute('data-doc-type') || 'NoiDung';
      
      // FIX: Cast exportContentEl to HTMLElement to access the 'innerText' property.
      let content = (exportContentEl as HTMLElement).innerText;
      let mimeType = 'text/plain';
      let fileDescriptor = descriptor;

      switch (format) {
          case 'md':
              mimeType = 'text/markdown';
              break;
          case 'txt':
              break;
          case 'rtf':
              // FIX: Cast exportContentEl to HTMLElement to access the 'innerText' property.
              content = `{\\rtf1\\ansi\\deff0 {\\fonttbl{\\f0 Times New Roman;}} \\fs24 ${(exportContentEl as HTMLElement).innerText.replace(/\n/g, '\\par ')}}`;
              mimeType = 'application/rtf';
              break;
          case 'csv':
              const tableEl = exportContentEl.querySelector('table');
              if (tableEl) {
                  const csvContent = htmlTableToCsv(tableEl);
                  if (csvContent) {
                      content = csvContent;
                      mimeType = 'text/csv';
                      fileDescriptor = `Bang_${descriptor}`;
                  } else {
                      addToast(t('toasts.exportTableToCsvError', "Không thể chuyển đổi bảng thành CSV."));
                      return;
                  }
              } else {
                  addToast(t('toasts.exportNoTableError', "Không tìm thấy bảng để xuất CSV."));
                  return;
              }
              break;
      }
      const filenameBase = generateFilename(fileDescriptor);
      downloadFile(`${filenameBase}.${format}`, content, mimeType);
      addToast(t('toasts.exportingFile', 'Đang xuất file {fileType}...', { fileType: `.${format.toUpperCase()}` }));
  };

  const handleOneClickExport = async () => {
    addToast(t('toasts.oneClickExportStarted', "Bắt đầu quá trình xuất đa định dạng..."));

    const contentEl = getActiveContentElement();
    if (!contentEl) {
        addToast(t('toasts.exportError', "Không tìm thấy nội dung để xuất file."));
        return;
    }

    // A small delay to allow the first toast to show
    await new Promise(resolve => setTimeout(resolve, 300));

    // 1. Export as DOC
    handleExportDocx();
    await new Promise(resolve => setTimeout(resolve, 800)); // Delay between downloads

    // 2. Export as TXT
    handleExport('txt');
    await new Promise(resolve => setTimeout(resolve, 800));

    // 3. Export as CSV (if applicable)
    const previewEl = contentEl.querySelector('[data-doc-type]');
    const tableEl = previewEl?.querySelector('table') || contentEl?.querySelector('table');
    if (tableEl) {
        handleExportXlsx();
        await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // 4. Trigger Print to PDF
    addToast(t('toasts.oneClickExportPdf', "Mở hộp thoại In để lưu dưới dạng PDF."));
    await new Promise(resolve => setTimeout(resolve, 500));
    handlePrint();
  };


  return (
      <aside
        className={`relative shadow-lg z-30 flex flex-col justify-between transition-all duration-300 ease-in-out no-print
          ${open ? "w-72" : "w-12"} 
          ${theme === "dark" ? "bg-slate-900 text-slate-100 border-l border-slate-800" : "bg-white text-slate-800 border-l border-slate-200"}`}
      >
        <button
          onClick={() => setOpen(!open)}
          className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white p-1 rounded-full shadow hover:bg-indigo-700 transition"
          title={open ? "Thu gọn" : "Mở rộng"}
        >
          {open ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <div className={`p-4 space-y-5 overflow-y-auto transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}>
          {open && (
            <>
              <h2 className="text-lg font-semibold mb-2 border-b border-slate-300 dark:border-slate-700 pb-2">
                🧾 {t('rightSidebar.title', 'Thanh thông tin & Tác vụ')}
              </h2>
              
               <Button onClick={handleOneClickExport} className="w-full flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg transform hover:scale-105 transition-transform">
                  <Download size={18} /> {t('rightSidebar.oneClickExport', 'One-click Export')}
                </Button>

              <div className="space-y-3">
                <div className="border rounded-xl p-3 bg-slate-50 dark:bg-slate-800/50">
                  <p className="font-medium mb-2 text-sm">🖨️ {t('rightSidebar.print', 'In & Xuất PDF')}</p>
                  <Button onClick={handlePrint} className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Printer size={18} /> {t('rightSidebar.printButton', 'In đề thi & đáp án')}
                  </Button>
                </div>

                <div className="border rounded-xl p-3 bg-slate-50 dark:bg-slate-800/50">
                  <p className="font-medium mb-2 text-sm">📄 {t('rightSidebar.wordExport', 'Xuất file Word')}</p>
                  <Button onClick={handleExportDocx} className="w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <FileText size={18} /> {t('rightSidebar.wordExportButton', 'Xuất .DOC')}
                  </Button>
                </div>

                <div className="border rounded-xl p-3 bg-slate-50 dark:bg-slate-800/50">
                  <p className="font-medium mb-2 text-sm">📊 {t('rightSidebar.matrixExport', 'Xuất ma trận')}</p>
                  <Button onClick={handleExportXlsx} className="w-full flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
                    <FileSpreadsheet size={18} /> {t('rightSidebar.matrixExportButton', 'Xuất .CSV (Excel)')}
                  </Button>
                </div>
                
                 <div className="border rounded-xl p-3 bg-slate-50 dark:bg-slate-800/50">
                  <p className="font-medium mb-2 text-sm">📤 {t('rightSidebar.lmsExport', 'Xuất sang LMS')}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleNotImplemented} size="sm" variant="outline" className="flex-1">Moodle</Button>
                    <Button onClick={handleNotImplemented} size="sm" variant="outline" className="flex-1">G-Classroom</Button>
                    <Button onClick={handleNotImplemented} size="sm" variant="outline" className="flex-1">MS Teams</Button>
                  </div>
                </div>

                <div className="border rounded-xl p-3 bg-slate-50 dark:bg-slate-800/50">
                  <p className="font-medium mb-2 text-sm">📋 {t('rightSidebar.copy', 'Sao chép nội dung')}</p>
                  <Button onClick={handleCopy} className="w-full flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white">
                    <Copy size={18} /> {t('rightSidebar.copyButton', 'Sao chép toàn bộ')}
                  </Button>
                </div>

                <div className="border rounded-xl p-3 bg-slate-50 dark:bg-slate-800/50">
                  <p className="font-medium mb-2 text-sm">🧩 {t('rightSidebar.otherFormats', 'Định dạng khác')}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => handleExport('md')} size="sm" variant="outline" className="flex items-center gap-2"> <FileType size={16} /> .MD </Button>
                    <Button onClick={() => handleExport('txt')} size="sm" variant="outline" className="flex items-center gap-2"> <FileType size={16} /> .TXT </Button>
                    <Button onClick={() => handleExport('rtf')} size="sm" variant="outline" className="flex items-center gap-2"> <FileType size={16} /> .RTF </Button>
                    <Button onClick={() => handleExport('csv')} size="sm" variant="outline" className="flex items-center gap-2"> <FileType size={16} /> .CSV </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {open && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-700 text-center text-xs opacity-70">
            © 2025 ExamGen Ultra 4.3
          </div>
        )}
      </aside>
  );
}