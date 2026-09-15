import { TopicActionsMenu } from '#/features/study/components/topic-actions-menu'
import { TopicNotesDialog } from '#/features/study/components/topic-notes-dialog'
import { TopicStatusPopover } from '#/features/study/components/topic-status-popover'
import type { TopicTree } from '#/types/api'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CaretDownIcon,
  CaretRightIcon,
  NotePencilIcon,
} from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

type TreeRow = { topic: TopicTree; depth: number; hasChildren: boolean }

/** Depth-first flatten of `node`'s descendants, skipping subtrees rooted at a collapsed node. */
function flattenChildren(
  node: TopicTree,
  depth: number,
  collapsed: Set<string>,
  out: TreeRow[],
) {
  for (const child of node.children) {
    out.push({ topic: child, depth, hasChildren: child.children.length > 0 })
    if (!collapsed.has(child.id)) {
      flattenChildren(child, depth + 1, collapsed, out)
    }
  }
}

/**
 * Anki deck-browser-style table: every descendant of `tree` (not `tree`
 * itself — the page shows that as the header above this table) as one row,
 * indented by depth and collapsible per branch.
 */
export function TopicTreeTable({ tree }: { tree: TopicTree }) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const rows = useMemo(() => {
    const out: TreeRow[] = []
    flattenChildren(tree, 0, collapsed, out)
    return out
  }, [tree, collapsed])

  function toggle(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-xs text-muted-foreground">
        {t('study.tree.empty')}
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('study.tree.title')}</TableHead>
          <TableHead>{t('study.tree.status')}</TableHead>
          <TableHead className="w-10" />
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(({ topic, depth, hasChildren }) => (
          <TableRow key={topic.id}>
            <TableCell>
              <div
                className="flex items-center gap-1.5"
                style={{ paddingLeft: `${depth * 1.25}rem` }}
              >
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggle(topic.id)}
                    aria-label={
                      collapsed.has(topic.id)
                        ? t('study.tree.expand')
                        : t('study.tree.collapse')
                    }
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {collapsed.has(topic.id) ? (
                      <CaretRightIcon className="size-3.5" />
                    ) : (
                      <CaretDownIcon className="size-3.5" />
                    )}
                  </button>
                ) : (
                  <span className="size-3.5" />
                )}
                <span className="truncate">{topic.title}</span>
              </div>
            </TableCell>
            <TableCell>
              <TopicStatusPopover topic={topic} />
            </TableCell>
            <TableCell>
              <TopicNotesDialog
                topic={topic}
                trigger={
                  <Button variant="ghost" size="icon-sm">
                    <NotePencilIcon weight={topic.body ? 'fill' : 'regular'} />
                    <span className="sr-only">{t('study.notes.button')}</span>
                  </Button>
                }
              />
            </TableCell>
            <TableCell>
              <TopicActionsMenu topic={topic} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
