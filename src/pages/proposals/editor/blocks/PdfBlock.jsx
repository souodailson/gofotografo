import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Loader2, AlertTriangle, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getResponsiveBlockProps } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

const PdfBlock = ({ block, viewMode = 'desktop', onHeightChange, isSelected }) => {
    const { content } = block;
    const { styles } = getResponsiveBlockProps(block, viewMode);
    
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);

    const { src } = content;
    const [numPages, setNumPages] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { toast } = useToast();
    const pdfContainerRef = useRef(null);
    
    const debouncedContainerWidth = useDebounce(containerWidth, 300);

    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }
        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0]) {
                setContainerWidth(entries[0].contentRect.width);
            }
        });
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        return () => resizeObserver.disconnect();
    }, []);

    const calculateAndPropagateHeight = useCallback(() => {
        if (pdfContainerRef.current && onHeightChange) {
            setTimeout(() => {
                if (pdfContainerRef.current) {
                    const height = pdfContainerRef.current.scrollHeight;
                    onHeightChange(height);
                }
            }, 150);
        }
    }, [onHeightChange]);

    useEffect(() => {
        if (src) {
            setLoading(true);
            setError(null);
            setNumPages(null);
        }
    }, [src]);
    
    useEffect(() => {
        if (numPages > 0) {
            calculateAndPropagateHeight();
        }
    }, [debouncedContainerWidth, numPages, calculateAndPropagateHeight]);


    const onDocumentLoadSuccess = useCallback(({ numPages: nextNumPages }) => {
        setNumPages(nextNumPages);
        setLoading(false);
        setError(null);
        calculateAndPropagateHeight();
    }, [calculateAndPropagateHeight]);

    const onDocumentLoadError = useCallback((loadError) => {
        console.error("Erro ao carregar PDF:", loadError);
        setError("Falha ao carregar o arquivo PDF. Verifique o link ou tente fazer o upload novamente.");
        setLoading(false);
        toast({
            title: "Erro de PDF",
            description: "Não foi possível carregar o arquivo PDF. Verifique se o link é público e permite acesso CORS.",
            variant: "destructive",
        });
    }, [toast]);

    const memoizedPdfFile = useMemo(() => {
        if (!src) return null;
        return { url: src };
    }, [src]);

    const blockStyles = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
        border: 'none',
        zIndex: styles?.zIndex || 1,
        objectFit: 'cover',
        overflow: 'hidden',
        outline: isSelected ? '2px solid #3B82F6' : 'none',
        outlineOffset: '2px',
    };

    if (!src) {
        return (
            <div style={blockStyles} className="bg-gray-100 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                <FileText size={48} />
                <p className="mt-2 text-sm font-semibold">Fundo de PDF</p>
                <p className="text-xs mt-1">Clique com o botão direito para fazer o upload.</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} style={blockStyles}>
            {loading && (
                <div className="flex flex-col items-center justify-center w-full h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 mt-2">Carregando PDF...</p>
                </div>
            )}
            {error && !loading && (
                 <div className="flex flex-col items-center justify-center w-full h-full text-red-600 p-4">
                    <AlertTriangle className="h-8 w-8 mb-2" />
                    <p className="text-center text-sm">{error}</p>
                </div>
            )}
            <div ref={pdfContainerRef} className="w-full h-full">
                <Document
                    file={memoizedPdfFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading="" 
                    error="" 
                    className="flex flex-col items-center w-full h-full"
                >
                    {numPages && Array.from(new Array(numPages), (el, index) => (
                        <Page
                            key={`page_${index + 1}`}
                            pageNumber={index + 1}
                            width={containerWidth} 
                            renderAnnotationLayer={false}
                            renderTextLayer={false}
                            className="mb-0"
                        />
                    ))}
                </Document>
            </div>
        </div>
    );
};

export default PdfBlock;