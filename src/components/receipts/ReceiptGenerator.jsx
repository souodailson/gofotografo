import React from 'react';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const generateReceiptPDF = async (transactionData, userSettings) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Cores do sistema GO.FOTÓGRAFO
  const primaryColor = '#242c2b'; // Cor principal do sistema
  const lightGray = '#F5F5F5';
  const darkGray = '#333333';
  const mediumGray = '#666666';
  
  // Helper para converter cor hex para RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  const primaryRGB = hexToRgb(primaryColor);
  
  // Header com fundo colorido
  doc.setFillColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Logo da empresa (se disponível)
  let logoHeight = 0;
  if (userSettings?.logo) {
    try {
      // Aqui você pode adicionar lógica para carregar e inserir o logo
      // Por enquanto, vamos deixar espaço para o logo
      logoHeight = 15;
    } catch (error) {
      console.warn('Não foi possível carregar o logo:', error);
    }
  }
  
  // Título do comprovante
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPROVANTE', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(transactionData.type === 'entrada' ? 'DE RECEBIMENTO' : 'DE PAGAMENTO', pageWidth / 2, 35, { align: 'center' });
  
  // Resetar cor do texto
  doc.setTextColor(darkGray);
  
  let yPosition = 70;
  
  // Informações da empresa
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray);
  doc.text(userSettings?.business_name || userSettings?.user_name || 'Empresa', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mediumGray);
  
  // Primeira coluna
  if (userSettings?.cnpj) {
    doc.text(`CNPJ: ${userSettings.cnpj}`, 20, yPosition);
    yPosition += 6;
  }
  
  if (userSettings?.contact_email) {
    doc.text(`Email: ${userSettings.contact_email}`, 20, yPosition);
    yPosition += 6;
  }
  
  if (userSettings?.contact_phone) {
    doc.text(`Telefone: ${userSettings.contact_phone}`, 20, yPosition);
    yPosition += 6;
  }
  
  if (userSettings?.address) {
    doc.text(`Endereço: ${userSettings.address}`, 20, yPosition);
    yPosition += 6;
  }
  
  // Segunda coluna (informações adicionais do comprovante)
  let rightColumnY = 70;
  doc.setFontSize(9);
  doc.setTextColor(mediumGray);
  
  // Data/hora de emissão
  const currentDate = format(new Date(), "dd/MM/yyyy 'às' HH:mm");
  doc.text(`Emitido em: ${currentDate}`, pageWidth - 20, rightColumnY, { align: 'right' });
  rightColumnY += 8;
  
  // Número do comprovante (baseado no ID da transação)
  doc.text(`Nº: ${String(transactionData.id).padStart(6, '0')}`, pageWidth - 20, rightColumnY, { align: 'right' });
  rightColumnY += 8;
  
  // Tipo de operação
  doc.text(`Operação: ${transactionData.type === 'entrada' ? 'Recebimento' : 'Pagamento'}`, pageWidth - 20, rightColumnY, { align: 'right' });
  
  // Linha separadora
  yPosition += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 20;
  
  // Card principal com as informações da transação
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(20, yPosition, pageWidth - 40, 100, 5, 5, 'F');
  
  // Tipo da transação
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray);
  const transactionTitle = transactionData.type === 'entrada' ? 'Recebimento' : 'Pagamento';
  doc.text(transactionTitle, 30, yPosition + 15);
  
  // Valor
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(transactionData.type === 'entrada' ? '#00AA00' : '#FF6B6B');
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(transactionData.valor);
  doc.text(formattedValue, 30, yPosition + 35);
  
  // Status
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mediumGray);
  doc.text('Status: Processado', 30, yPosition + 45);
  
  // Data
  const formattedDate = format(new Date(transactionData.data), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  doc.text(formattedDate, 30, yPosition + 55);
  
  // Informações de cliente/fornecedor
  doc.setFontSize(9);
  doc.setTextColor(mediumGray);
  if (transactionData.type === 'entrada' && transactionData.client) {
    doc.text(`Cliente: ${transactionData.client.name}`, 30, yPosition + 70);
  } else if (transactionData.type === 'saida' && transactionData.supplier) {
    doc.text(`Fornecedor: ${transactionData.supplier.name}`, 30, yPosition + 70);
  }
  
  // Aviso sobre valor fiscal
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor('#FF6B6B');
  doc.text('* Este comprovante não possui valor fiscal', 30, yPosition + 85);
  
  // ID da transação no canto direito
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mediumGray);
  doc.text(`ID: ${transactionData.id}`, pageWidth - 30, yPosition + 15, { align: 'right' });
  
  yPosition += 120;
  
  // Detalhes da transação
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, yPosition, pageWidth - 40, 80, 5, 5, 'F');
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(20, yPosition, pageWidth - 40, 80, 5, 5, 'S');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray);
  doc.text('Detalhes da Transação', 30, yPosition + 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mediumGray);
  
  let detailY = yPosition + 25;
  
  if (transactionData.descricao) {
    doc.text(`Descrição: ${transactionData.descricao}`, 30, detailY);
    detailY += 10;
  }
  
  if (transactionData.category) {
    doc.text(`Categoria: ${transactionData.category}`, 30, detailY);
    detailY += 10;
  }
  
  if (transactionData.metodo_pagamento) {
    doc.text(`Método de Pagamento: ${transactionData.metodo_pagamento}`, 30, detailY);
    detailY += 10;
  }
  
  if (transactionData.status) {
    doc.text(`Status: ${transactionData.status}`, 30, detailY);
    detailY += 10;
  }
  
  if (transactionData.wallet && transactionData.wallet.name) {
    doc.text(`Carteira: ${transactionData.wallet.name}`, 30, detailY);
    detailY += 10;
  }
  
  yPosition += 90;
  
  // Footer com branding GO.FOTÓGRAFO
  yPosition = pageHeight - 60;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  
  yPosition += 10;
  
  // Logo GO.FOTÓGRAFO (texto estilizado)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
  doc.text('GO.FOTÓGRAFO', pageWidth / 2, yPosition, { align: 'center' });
  
  // Slogan/descrição
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mediumGray);
  doc.text('Plataforma completa para fotógrafos profissionais', pageWidth / 2, yPosition + 8, { align: 'center' });
  
  yPosition += 20;
  doc.setFontSize(8);
  doc.text('Este comprovante foi gerado automaticamente pela plataforma GO.FOTÓGRAFO', pageWidth / 2, yPosition, { align: 'center' });
  doc.text(`Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`, pageWidth / 2, yPosition + 8, { align: 'center' });
  
  // Código de verificação (hash simples baseado nos dados)
  const verificationCode = btoa(`${transactionData.id}-${transactionData.valor}-${transactionData.data}`).substring(0, 8).toUpperCase();
  doc.text(`Código de verificação: ${verificationCode}`, pageWidth / 2, yPosition + 16, { align: 'center' });
  
  return doc;
};

const ReceiptGenerator = {
  generate: generateReceiptPDF,
  
  downloadPDF: async (transactionData, userSettings) => {
    const doc = await generateReceiptPDF(transactionData, userSettings);
    const filename = `comprovante_${transactionData.id}_${format(new Date(), 'ddMMyyyy_HHmm')}.pdf`;
    doc.save(filename);
  },
  
  openPDF: async (transactionData, userSettings) => {
    const doc = await generateReceiptPDF(transactionData, userSettings);
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
  },
  
  printPDF: async (transactionData, userSettings) => {
    const doc = await generateReceiptPDF(transactionData, userSettings);
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    
    const printWindow = window.open(url, '_blank');
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};

export default ReceiptGenerator;