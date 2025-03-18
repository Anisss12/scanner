"use client";

import React, { useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import styles from "./Scanner.module.css";

const Scanner = ({ onScanned }) => {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [detector, setDetector] = useState(null);

  useEffect(() => {
    const initBarcodeDetector = async () => {
      if ("BarcodeDetector" in window) {
        try {
          setDetector(
            new window.BarcodeDetector({
              formats: [
                "qr_code",
                "code_128",
                "ean_13",
                "code_39",
                "code_93",
                "upc_a",
                "upc_e",
                "ean_8",
                "ean_13",
                "itf",
                "pdf417",
                "aztec",
                "data_matrix",
              ],
            })
          );
        } catch (error) {
          console.error("Barcode detector initialization error:", error);
          toast.error("Failed to initialize barcode detector");
        }
      } else {
        toast.error("Barcode Detector API not supported");
      }
    };

    initBarcodeDetector();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (scanning && detector) {
      startScanner();
    }
  }, [scanning, detector]);

  useEffect(() => {
    setScanning(true);
    return () => setScanning(false);
  }, []);

  const startScanner = async () => {
    if (!videoRef.current || !detector) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      requestAnimationFrame(scanBarcode);
    } catch (error) {
      console.error("Camera access error:", error);
      if (error.name === "NotAllowedError") {
        toast.error(
          "Camera access denied. Please allow camera access in your browser settings."
        );
      } else if (error.name === "NotFoundError") {
        toast.error("No camera found on this device.");
      } else {
        toast.error("An error occurred while accessing the camera.");
      }
      setScanning(false);
    }
  };

  const scanBarcode = async () => {
    if (!scanning || !detector || !videoRef.current) return;

    try {
      const barcodes = await detector.detect(videoRef.current);

      if (barcodes.length > 0) {
        const result = barcodes[0].rawValue;
        stopScanner();

        onScanned(result);
        return;
      }

      requestAnimationFrame(scanBarcode);
    } catch (error) {
      console.error("Scanning error:", error);
      requestAnimationFrame(scanBarcode);
    }
  };

  const stopScanner = () => {
    setScanning(false);
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.videoWrapper}>
        <video ref={videoRef} className={styles.video} playsInline muted />
      </div>

      {/* Scanner corners */}
      <div className={`${styles.scannerCorner} ${styles.topLeft}`}></div>
      <div className={`${styles.scannerCorner} ${styles.topRight}`}></div>
      <div className={`${styles.scannerCorner} ${styles.bottomLeft}`}></div>
      <div className={`${styles.scannerCorner} ${styles.bottomRight}`}></div>

      {/* Scan line animation */}
      <div className={styles.scanLine}></div>
    </div>
  );
};

export default Scanner;
