"use client";

import React from "react";
import { Trash2, Copy, Save, FileText, File } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import styles from "./ScannedList.module.css";

const ScannedList = ({ items, onClearItem, onClearAll }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };

  const exportListAsText = () => {
    if (items.length === 0) {
      toast.error("No items to export");
      return;
    }

    const content = items.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `scanned-items-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("List exported successfully");
  };

  const exportListAsPDF = () => {
    if (items.length === 0) {
      toast.error("No items to export");
      return;
    }

    const doc = new jsPDF();
    doc.text("Scanned Items", 10, 10);
    items.forEach((item, index) => {
      doc.text(`${index + 1}. ${item}`, 10, 20 + index * 10);
    });
    doc.save(`scanned-items-${new Date().toISOString().split("T")[0]}.pdf`);

    toast.success("List exported as PDF successfully");
  };

  const exportListAsXLSX = () => {
    if (items.length === 0) {
      toast.error("No items to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      items.map((item, index) => ({ No: index + 1, Item: item }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Scanned Items");
    XLSX.writeFile(
      workbook,
      `scanned-items-${new Date().toISOString().split("T")[0]}.xlsx`
    );

    toast.success("List exported as XLSX successfully");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Scanned Items</h2>
        <div className={styles.buttonGroup}>
          <button
            onClick={exportListAsText}
            className={`${styles.button} ${styles.buttonPrimary}`}
            aria-label="Export list as text"
          >
            <Save size={18} />
          </button>
          <button
            onClick={exportListAsPDF}
            className={`${styles.button} ${styles.buttonPrimary}`}
            aria-label="Export list as PDF"
          >
            <FileText size={18} />
          </button>
          <button
            onClick={exportListAsXLSX}
            className={`${styles.button} ${styles.buttonPrimary}`}
            aria-label="Export list as XLSX"
          >
            <File size={18} />
          </button>
          <button
            onClick={onClearAll}
            className={`${styles.button} ${styles.buttonSecondary}`}
            aria-label="Clear all items"
            disabled={items.length === 0}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className={styles.card}>
          <p className={styles.cardText}>No items scanned yet</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {items.map((item, index) => (
            <li
              key={index}
              className={styles.listItem}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className={styles.listItemText}>{item}</span>
              <div className={styles.listItemButtonGroup}>
                <button
                  onClick={() => copyToClipboard(item)}
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  aria-label="Copy to clipboard"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => onClearItem(index)}
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ScannedList;
