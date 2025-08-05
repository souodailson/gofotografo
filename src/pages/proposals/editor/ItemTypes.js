export const ItemTypes = {
  BLOCK: 'block',
  IMAGE_UPLOAD: 'image_upload',
  POSITIONED_BLOCK: 'positioned_block',
};

export const createDragItem = (url) => ({
  type: ItemTypes.IMAGE_UPLOAD,
  url,
  data: JSON.stringify({ type: 'image', content: { src: url }, styles: {}, size: { width: '30%', height: 'auto' } }),
});