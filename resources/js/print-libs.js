// 導入打印相關的庫
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';

// 將庫暴露到全局
window.JsBarcode = JsBarcode;
window.jsPDF = jsPDF;
