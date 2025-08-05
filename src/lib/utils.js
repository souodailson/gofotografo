import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { get } from 'lodash';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export function getResponsiveBlockProps(block, viewMode) {
  const desktopProps = {
    position: block.position,
    size: block.size,
    styles: block.styles,
    visible: block.visible !== false,
  };

  if (viewMode === 'desktop') {
    return desktopProps;
  }
  
  const layout = block.layouts?.[viewMode] || {};
  
  return {
    position: layout.position || desktopProps.position,
    size: layout.size || desktopProps.size,
    styles: { ...desktopProps.styles, ...(layout.styles || {}) },
    visible: layout.visible !== undefined ? layout.visible : desktopProps.visible,
  };
}

export function sanitizeFilename(filename) {
  if (typeof filename !== 'string') {
    console.warn('sanitizeFilename expects a string argument');
    return `invalid_filename_${Date.now()}`;
  }
  const normalized = filename.normalize('NFD');
  const withoutAccents = normalized.replace(/[\u0300-\u036f]/g, '');
  const sanitized = withoutAccents
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.-]/g, '');
    
  return sanitized;
}

export function formatCurrency(value, showSymbol = true) {
  const numericValue = Number(value);
  if (isNaN(numericValue)) {
    return showSymbol ? 'R$ 0,00' : '0,00';
  }
  
  const options = {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  if (!showSymbol) {
    return numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  
  return numericValue.toLocaleString('pt-BR', options);
}

export function hexToRgba(hex, alpha = 1) {
  if (!hex) return '';
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function numberToWords(num) {
  if (num === null || num === undefined) return '';
  const numero = Number(num);
  if (isNaN(numero)) return '';

  const a = [
    '', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze',
    'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'
  ];
  const b = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const c = ['', 'cem', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  const n = parseFloat(numero.toFixed(2).replace('.', ',')).toString().split(',');
  let numPart = parseInt(n[0]);
  let decPart = n.length > 1 ? parseInt(n[1]) : 0;

  let res = '';
  let i;

  if (numPart === 0) {
    res = 'zero';
  } else {
    const tri = (s) => {
      let r = '';
      const t = s.length;
      const g = s.split('').reverse().join('');
      if (t === 1) {
        r = a[parseInt(g)];
      } else if (t === 2) {
        if (s[0] === '1') {
          r = a[parseInt(s)];
        } else {
          r = b[parseInt(g[1])] + (g[0] !== '0' ? ' e ' + a[parseInt(g[0])] : '');
        }
      } else if (t === 3) {
        const h = parseInt(g[2]);
        const d = parseInt(g.substring(0, 2).split('').reverse().join(''));
        if (h === 1 && d > 0) {
          r = 'cento';
        } else {
          r = c[h];
        }
        if (d > 0) {
          r += ' e ' + tri(d.toString());
        }
      }
      return r;
    };

    const z = numPart.toString().split('').reverse().join('');
    const chunks = z.match(/.{1,3}/g) || [];
    for (i = chunks.length - 1; i >= 0; i--) {
      const chunk = chunks[i].split('').reverse().join('');
      if (parseInt(chunk) > 0) {
        res += (res.length > 0 ? ' ' : '') + tri(chunk) +
          (i === 1 ? ' mil' : (i === 2 ? (parseInt(chunk) > 1 ? ' milhões' : ' milhão') : (i === 3 ? (parseInt(chunk) > 1 ? ' bilhões' : ' bilhão') : '')));
      }
    }
  }

  res += numPart === 1 ? ' real' : ' reais';

  if (decPart > 0) {
    res += ' e ';
    if (decPart < 20) {
      res += a[decPart];
    } else {
      res += b[Math.floor(decPart / 10)];
      if (decPart % 10 > 0) {
        res += ' e ' + a[decPart % 10];
      }
    }
    res += decPart === 1 ? ' centavo' : ' centavos';
  }

  return res.trim();
}