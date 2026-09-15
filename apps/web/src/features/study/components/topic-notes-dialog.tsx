import { useUpdateTopic } from '#/features/study/api/update-topic'
import { toast } from '#/components/ui/toast'
import { cn } from '#/lib/utils'
import type { Topic } from '#/types/api'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  CodeIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  QuotesIcon,
  TextBIcon,
  TextHTwoIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
} from '@phosphor-icons/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Markdown } from 'tiptap-markdown'

function ToolbarButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant={active ? 'secondary' : 'ghost'}
      size="icon-sm"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

/**
 * Toolbar + editor + footer, mounted only while the dialog is open (see
 * TopicNotesDialog) — that's what gives it a fresh `topic.body` on every
 * open instead of needing to manually resync Tiptap's one-shot `content`.
 */
function NotesEditorPanel({
  topic,
  saving,
  onSave,
  onCancel,
}: {
  topic: Topic
  saving: boolean
  onSave: (markdown: string | null) => void
  onCancel: () => void
}) {
  const { t } = useTranslation()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({
        html: false,
        // Without these, pasted markdown text lands as literal "# Heading"
        // / "**bold**" characters instead of being parsed into rich content.
        transformPastedText: true,
        transformCopiedText: true,
        linkify: true,
      }),
    ],
    content: topic.body ?? '',
    immediatelyRender: false,
  })

  if (!editor) return null

  function handleSave() {
    if (!editor) return
    // tiptap-markdown doesn't ship a Storage module augmentation for
    // @tiptap/core, so `editor.storage.markdown` isn't typed — cast it.
    const markdownStorage = editor.storage as unknown as {
      markdown: { getMarkdown: () => string }
    }
    const markdown = markdownStorage.markdown.getMarkdown()
    onSave(markdown.trim() ? markdown : null)
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-6">
        <div className="flex flex-wrap items-center gap-1 border-b border-input pb-2">
          <ToolbarButton
            active={editor.isActive('bold')}
            label={t('study.notes.bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <TextBIcon />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('italic')}
            label={t('study.notes.italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <TextItalicIcon />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('strike')}
            label={t('study.notes.strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <TextStrikethroughIcon />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('heading', { level: 2 })}
            label={t('study.notes.heading')}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <TextHTwoIcon />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('bulletList')}
            label={t('study.notes.bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <ListBulletsIcon />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('orderedList')}
            label={t('study.notes.orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListNumbersIcon />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('blockquote')}
            label={t('study.notes.blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <QuotesIcon />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('codeBlock')}
            label={t('study.notes.codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <CodeIcon />
          </ToolbarButton>
          <div className="mx-1 h-4 w-px bg-input" />
          <ToolbarButton
            active={false}
            label={t('study.notes.undo')}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <ArrowCounterClockwiseIcon />
          </ToolbarButton>
          <ToolbarButton
            active={false}
            label={t('study.notes.redo')}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <ArrowClockwiseIcon />
          </ToolbarButton>
        </div>

        <EditorContent
          editor={editor}
          className={cn(
            'min-h-0 flex-1 overflow-y-auto rounded-md border border-input px-3 py-2',
            '[&_.ProseMirror]:h-full [&_.ProseMirror]:outline-none',
            '[&_h2]:mt-2 [&_h2]:mb-1 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:first:mt-0',
            '[&_p]:mb-2 [&_p]:last:mb-0',
            '[&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-4',
            '[&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-4',
            '[&_blockquote]:mb-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground',
            '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5',
            '[&_pre]:mb-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-2',
            '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
          )}
        />
      </div>

      <SheetFooter className="flex-row justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t('study.notes.cancel')}
        </Button>
        <Button type="button" onClick={handleSave} disabled={saving}>
          {t('study.notes.save')}
        </Button>
      </SheetFooter>
    </>
  )
}

/**
 * Right-side sheet for writing a topic's freeform markdown notes with a
 * Tiptap WYSIWYG editor — opened from its own button on a table row,
 * separate from the edit/delete actions menu.
 */
export function TopicNotesDialog({
  topic,
  trigger,
}: {
  topic: Topic
  trigger: React.ReactElement
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const updateTopic = useUpdateTopic({
    mutationConfig: {
      onSuccess: () => {
        toast.add({ title: t('study.notes.saved'), type: 'success' })
        setOpen(false)
      },
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger} />
      <SheetContent className="flex w-full flex-col gap-0 p-0 data-[side=right]:sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{topic.title}</SheetTitle>
          <SheetDescription>{t('study.notes.description')}</SheetDescription>
        </SheetHeader>

        {open && (
          <NotesEditorPanel
            topic={topic}
            saving={updateTopic.isPending}
            onCancel={() => setOpen(false)}
            onSave={(body) =>
              updateTopic.mutate({ id: topic.id, data: { body } })
            }
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
