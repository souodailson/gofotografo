import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TextFormattingToolbar from './TextFormattingToolbar';
import ImageFormattingToolbar from './ImageFormattingToolbar';

const EditorToolbars = ({ selectedBlock, updateBlock, toolbarPosition, onReplaceImage }) => {
  return (
    <AnimatePresence>
      {selectedBlock && !selectedBlock.locked && (
        <motion.div
          initial={{ y: -10, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -10, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute z-40"
          style={{
            top: toolbarPosition.top,
            left: toolbarPosition.left,
            transform: 'translateX(-50%)',
          }}
        >
          {selectedBlock.type === 'text' && <TextFormattingToolbar selectedBlock={selectedBlock} updateBlock={updateBlock} />}
          {selectedBlock.type === 'image' && <ImageFormattingToolbar selectedBlock={selectedBlock} updateBlock={updateBlock} onUploadComplete={onReplaceImage} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditorToolbars;