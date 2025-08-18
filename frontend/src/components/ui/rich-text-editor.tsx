"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  content?: string
  onChange?: (html: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Enter description...",
  className,
  readOnly = false
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: true, // Keep existing attributes
          HTMLAttributes: {
            class: 'list-disc pl-6'
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true, // Keep existing attributes
          HTMLAttributes: {
            class: 'list-decimal pl-6'
          },
        },
        listItem: {
          keepMarks: true,
          keepAttributes: true, // Keep existing attributes
          HTMLAttributes: {
            class: 'list-item'
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: 'mb-2'
          },
        },
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
          HTMLAttributes: {
            class: 'font-bold mb-2'
          },
        },
      }),
    ],
    content: content || '',
    editable: !readOnly,
    parseOptions: {
      preserveWhitespace: 'full',
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML())
      }
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base max-w-none focus:outline-none',
          '[&_ul]:list-disc [&_ol]:list-decimal [&_li]:list-item',
          '[&_ul]:pl-6 [&_ol]:pl-6 [&_li]:ml-0',
          '[&_p]:my-2 [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg',
          '[&_strong]:font-bold [&_em]:italic',
          'min-h-[120px] px-3 py-2',
          className
        ),
      },
    },
  })

  if (!editor) {
    return null
  }

  if (readOnly) {
    return (
      <div className={cn("border rounded-md", className)}>
        <EditorContent editor={editor} />
      </div>
    )
  }

  return (
    <div className="border rounded-md">
      {/* Toolbar */}
      <div className="flex sticky top-0 items-center gap-1 p-2 border-b bg-background-surface z-10">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "p-2 rounded hover:bg-muted",
            editor.isActive('bold') ? 'bg-muted' : ''
          )}
        >
          <Bold className="h-4 w-4" />
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "p-2 rounded hover:bg-muted",
            editor.isActive('italic') ? 'bg-muted' : ''
          )}
        >
          <Italic className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "p-2 rounded hover:bg-muted",
            editor.isActive('bulletList') ? 'bg-muted' : ''
          )}
        >
          <List className="h-4 w-4" />
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "p-2 rounded hover:bg-muted",
            editor.isActive('orderedList') ? 'bg-muted' : ''
          )}
        >
          <ListOrdered className="h-4 w-4" />
        </button>
      </div>
      
      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        placeholder={placeholder}
        className={className}
      />
    </div>
  )
}