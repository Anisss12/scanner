"use client";

import React from "react";
import { FilePlus } from "lucide-react";
import styles from "./HomeScreen.module.css";

const HomeScreen = ({ onShowForm }) => {
  return (
    <div className={styles.container}>
      <div onClick={onShowForm} className={styles.card}>
        <FilePlus size={64} className={styles.icon} />
        <h2 className={styles.title}>Add Details</h2>
      </div>

      <div className={styles.textContainer}>
        <p className={styles.text}>
          Tap the button above to add customer details or use the tabs below to
          scan QR codes and barcodes.
        </p>
      </div>
    </div>
  );
};

export default HomeScreen;
