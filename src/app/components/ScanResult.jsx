"use client";

import React from "react";
import { Copy, Plus, Scan } from "lucide-react";
import { toast } from "sonner";
import styles from "./ScanResult.module.css";

const ScanResult = ({ result, onAddToList, onScanAgain }) => {
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(result)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy to clipboard"));
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Result</h2>

        <div className={styles.resultBox}>
          <p className={styles.resultText}>{result}</p>
        </div>

        <div className={styles.buttonGroup}>
          <button onClick={copyToClipboard} className={styles.buttonSecondary}>
            <Copy size={18} />
            <span>Copy</span>
          </button>

          <button onClick={onAddToList} className={styles.buttonSecondary}>
            <Plus size={18} />
            <span>Add to List</span>
          </button>
        </div>

        <button onClick={onScanAgain} className={styles.buttonPrimary}>
          <Scan size={18} />
          <span>Scan Again</span>
        </button>
      </div>
    </div>
  );
};

export default ScanResult;
