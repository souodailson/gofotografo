import React from 'react';
import { Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link, Unlink, Palette, Highlighter as Highlight, Table, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

const EditorToolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="p-2 bg-muted border-b border-border sticky top-[65px] z-10 flex flex-wrap items-center gap-1">
      <Button variant={editor.isActive('bold') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="w-4 h-4" /></Button>
      <Button variant={editor.isActive('italic') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="w-4 h-4" /></Button>
      <Button variant={editor.isActive('underline') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleUnderline().run()}><Underline className="w-4 h-4" /></Button>
      <Button variant={editor.isActive('strike') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="w-4 h-4" /></Button>
      
      <div className="w-px h-6 bg-border mx-1"></div>

      <Button variant={editor.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="w-4 h-4" /></Button>
      <Button variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="w-4 h-4" /></Button>
      <Button variant={editor.isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="w-4 h-4" /></Button>
      
      <div className="w-px h-6 bg-border mx-1"></div>

      <Button variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="w-4 h-4" /></Button>
      <Button variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="w-4 h-4" /></Button>
      
      <div className="w-px h-6 bg-border mx-1"></div>

      <Button variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft className="w-4 h-4" /></Button>
      <Button variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter className="w-4 h-4" /></Button>
      <Button variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight className="w-4 h-4" /></Button>
      
      <div className="w-px h-6 bg-border mx-1"></div>

      <Button variant={editor.isActive('link') ? 'secondary' : 'ghost'} size="icon" onClick={setLink}><Link className="w-4 h-4" /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')}><Unlink className="w-4 h-4" /></Button>

      <div className="w-px h-6 bg-border mx-1"></div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon"><Palette className="w-4 h-4" /></Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <Input type="color" onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} value={editor.getAttributes('textStyle').color || '#000000'} />
        </PopoverContent>
      </Popover>
      <Button variant={editor.isActive('highlight') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleHighlight().run()}><Highlight className="w-4 h-4" /></Button>

      <div className="w-px h-6 bg-border mx-1"></div>

      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table className="w-4 h-4" /></Button>
      {editor.can().deleteTable() && (
        <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().deleteTable().run()}><Trash2 className="w-4 h-4 text-destructive" /></Button>
      )}
    </div>
  );
};

export default EditorToolbar;