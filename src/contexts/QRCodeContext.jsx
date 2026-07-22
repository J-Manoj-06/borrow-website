import React, { createContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { downloadQRCodePNG, printQRLabels } from '../services/qrCodeService';

export const QRCodeContext = createContext(null);

export const QRCodeProvider = ({ children }) => {
  const [selectedCopyForQr, setSelectedCopyForQr] = useState(null);
  const [targetBookTitle, setTargetBookTitle] = useState('Borrow Library');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [batchCopiesList, setBatchCopiesList] = useState([]);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [selectedCopyHistory, setSelectedCopyHistory] = useState(null);

  // Open Single QR Preview Modal
  const openQrPreview = useCallback((copy, bookTitle = 'Borrow Library') => {
    setSelectedCopyForQr(copy);
    setTargetBookTitle(bookTitle);
    setQrModalOpen(true);
  }, []);

  // Open Bulk Print Labels Modal
  const openPrintLabelsModal = useCallback((copiesList = [], bookTitle = 'Borrow Library') => {
    setBatchCopiesList(copiesList);
    setTargetBookTitle(bookTitle);
    setPrintModalOpen(true);
  }, []);

  // Open Copy History Drawer
  const openCopyHistory = useCallback((copy) => {
    setSelectedCopyHistory(copy);
    setHistoryDrawerOpen(true);
  }, []);

  // Trigger Download PNG Action
  const handleDownloadPng = useCallback((copy, title) => {
    const copyId = copy.copyId || copy.id;
    downloadQRCodePNG(copyId, title);
    toast.success(`Downloaded QR Code image for ${copyId}`);
  }, []);

  // Trigger Print Labels Action
  const handlePrintLabels = useCallback((copiesList, title) => {
    printQRLabels(copiesList, title);
    toast.success(`Sent ${copiesList.length} QR labels to print job`);
  }, []);

  const value = {
    selectedCopyForQr,
    targetBookTitle,
    qrModalOpen,
    setQrModalOpen,
    printModalOpen,
    setPrintModalOpen,
    batchCopiesList,
    historyDrawerOpen,
    setHistoryDrawerOpen,
    selectedCopyHistory,
    openQrPreview,
    openPrintLabelsModal,
    openCopyHistory,
    downloadSinglePng: handleDownloadPng,
    printLabels: handlePrintLabels,
  };

  return <QRCodeContext.Provider value={value}>{children}</QRCodeContext.Provider>;
};
