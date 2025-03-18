"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Copy, Save, FileText, File, Search } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import styles from "./ScannedList.module.css";

const ScannedList = ({ items, onClearItem, onClearAll }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterBarcode, setFilterBarcode] = useState("");
  const [filterDesign, setFilterDesign] = useState("");
  const [filterSizes, setFilterSizes] = useState("");
  const [filterColors, setFilterColors] = useState("");

  const [uniqueNames, setUniqueNames] = useState([]);
  const [uniqueBarcodes, setUniqueBarcodes] = useState([]);
  const [uniqueDesigns, setUniqueDesigns] = useState([]);
  const [uniqueSizes, setUniqueSizes] = useState([]);
  const [uniqueColors, setUniqueColors] = useState([]);

  const [selectedItems, setSelectedItems] = useState(new Set());

  useEffect(() => {
    const names = [...new Set(items.map((item) => item.name))];
    const barcodes = [...new Set(items.map((item) => item.barcode))];
    const designs = [...new Set(items.map((item) => item.design))];
    const sizes = [...new Set(items.map((item) => item.sizes))];
    const colors = [...new Set(items.map((item) => item.colors))];

    setUniqueNames(names);
    setUniqueBarcodes(barcodes);
    setUniqueDesigns(designs);
    setUniqueSizes(sizes);
    setUniqueColors(colors);
  }, [items]);

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };

  const filteredItems = items.filter(
    (item) =>
      (filterName === "" || item.name === filterName) &&
      (filterBarcode === "" || item.barcode === filterBarcode) &&
      (filterDesign === "" || item.design === filterDesign) &&
      (filterSizes === "" || item.sizes === filterSizes) &&
      (filterColors === "" || item.colors === filterColors) &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.design.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sizes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.colors.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalItems = filteredItems.length;
  const totalUnit = filteredItems.reduce(
    (acc, item) => acc + Number(item.unit),
    0
  );
  const totalPrice = filteredItems.reduce((acc, item) => acc + item.total, 0);

  const handleSelectItem = (index) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(index)) {
      newSelectedItems.delete(index);
    } else {
      newSelectedItems.add(index);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleBulkDelete = () => {
    const sortedIndices = Array.from(selectedItems).sort((a, b) => b - a);
    sortedIndices.forEach((index) => onClearItem(index));
    setSelectedItems(new Set());
    toast.success("Selected items deleted successfully");
  };

  const exportListAsText = () => {
    const exportItems = filteredItems;

    if (exportItems.length === 0) {
      toast.error("No items to export");
      return;
    }

    const content = exportItems.map((item) => JSON.stringify(item)).join("\n");
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
    const exportItems = filteredItems;

    if (exportItems.length === 0) {
      toast.error("No items to export");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Sales Report", 10, 10);

    const tableColumn = [
      "Name",
      "Mobile",
      "Barcode",
      "Design",
      "Sizes",
      "Colors",
      "Price",
      "Unit",
      "Total",
    ];
    const tableRows = [];

    exportItems.forEach((item) => {
      const itemData = [
        item.name,
        item.mobile,
        item.barcode,
        item.design,
        item.sizes,
        item.colors,
        item.price,
        item.unit,
        item.total,
      ];
      tableRows.push(itemData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    autoTable(doc, {
      body: [
        ["", "", "", "", "", "", "Total Items", totalItems],
        ["", "", "", "", "", "", "Total Unit", totalUnit],
        ["", "", "", "", "", "", "Total Price", totalPrice],
      ],
      startY: doc.lastAutoTable.finalY + 10,
    });

    doc.save(`scanned-items-${new Date().toISOString().split("T")[0]}.pdf`);

    toast.success("List exported as PDF successfully");
  };

  const exportListAsXLSX = () => {
    const exportItems = filteredItems;

    if (exportItems.length === 0) {
      toast.error("No items to export");
      return;
    }

    const worksheetData = [
      [
        "Name",
        "Mobile",
        "Barcode",
        "Design",
        "Sizes",
        "Colors",
        "Price",
        "Unit",
        "Total",
      ],
      ...exportItems.map((item) => [
        item.name,
        item.mobile,
        item.barcode,
        item.design,
        item.sizes,
        item.colors,
        item.price,
        item.unit,
        item.total,
      ]),
      ["", "", "", "", "", "", "Total Items", totalItems],
      ["", "", "", "", "", "", "Total Unit", totalUnit],
      ["", "", "", "", "", "", "Total Price", totalPrice],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
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
          <button
            onClick={handleBulkDelete}
            className={`${styles.button} ${styles.buttonSecondary}`}
            aria-label="Delete selected items"
            disabled={selectedItems.size === 0}
          >
            <Trash2 size={18} /> Delete Selected
          </button>
        </div>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <Search size={18} className={styles.searchIcon} />
        </div>
        <div className={styles.filterContainer}>
          <select
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Filter by Name</option>
            {uniqueNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={filterBarcode}
            onChange={(e) => setFilterBarcode(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Filter by Barcode</option>
            {uniqueBarcodes.map((barcode) => (
              <option key={barcode} value={barcode}>
                {barcode}
              </option>
            ))}
          </select>
          <select
            value={filterDesign}
            onChange={(e) => setFilterDesign(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Filter by Design</option>
            {uniqueDesigns.map((design) => (
              <option key={design} value={design}>
                {design}
              </option>
            ))}
          </select>
          <select
            value={filterSizes}
            onChange={(e) => setFilterSizes(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Filter by Sizes</option>
            {uniqueSizes.map((sizes) => (
              <option key={sizes} value={sizes}>
                {sizes}
              </option>
            ))}
          </select>
          <select
            value={filterColors}
            onChange={(e) => setFilterColors(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Filter by Colors</option>
            {uniqueColors.map((colors) => (
              <option key={colors} value={colors}>
                {colors}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.totals}>
        <p>
          <strong>Total Items:</strong> {totalItems}
        </p>
        <p>
          <strong>Total Unit:</strong> {totalUnit}
        </p>
        <p>
          <strong>Total Price:</strong> {totalPrice}
        </p>
      </div>

      {filteredItems.length === 0 ? (
        <div className={styles.card}>
          <p className={styles.cardText}>No items found</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {filteredItems.map((item, index) => (
            <li
              key={index}
              className={styles.listItem}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <input
                type="checkbox"
                checked={selectedItems.has(index)}
                onChange={() => handleSelectItem(index)}
                className={styles.checkbox}
              />
              <span className={styles.listItemText}>
                <strong>Name:</strong> {item.name} <br />
                <strong>Mobile:</strong> {item.mobile} <br />
                <strong>Barcode:</strong> {item.barcode} <br />
                <strong>Design:</strong> {item.design} <br />
                <strong>Sizes:</strong> {item.sizes} <br />
                <strong>Colors:</strong> {item.colors} <br />
                <strong>Price:</strong> {item.price} <br />
                <strong>Unit:</strong> {item.unit}
                <br />
                <strong>Total:</strong> {item.total} <br />
              </span>

              <div className={styles.listItemButtonGroup}>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(item))}
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
