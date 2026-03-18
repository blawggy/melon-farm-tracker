import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Book,
  Plus,
  X,
  Eye,
  Pencil,
  Trash,
  ArrowLeft,
  BookOpen,
  FloppyDisk,
  Star
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { marked } from 'marked'

export interface FarmingGuide {
  id: string
  title: string
  content: string
  plotType: string
  createdAt: number
  updatedAt: number
  starred: boolean
}

interface GuidesViewProps {
  onClose: () => void
}

export function GuidesView({ onClose }: GuidesViewProps) {
  const [guides, setGuides] = useKV<FarmingGuide[]>('farming-guides', [])
  const [selectedGuide, setSelectedGuide] = useState<FarmingGuide | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', content: '', plotType: '' })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [guideToDelete, setGuideToDelete] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')

  const createGuide = () => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      toast.error('Title and content are required')
      return
    }

    const newGuide: FarmingGuide = {
      id: Date.now().toString(),
      title: editForm.title.trim(),
      content: editForm.content.trim(),
      plotType: editForm.plotType.trim() || 'General',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      starred: false
    }

    setGuides((current) => [...(current || []), newGuide])
    setEditForm({ title: '', content: '', plotType: '' })
    setIsCreating(false)
    toast.success('Guide created successfully!')
  }

  const updateGuide = () => {
    if (!selectedGuide || !editForm.title.trim() || !editForm.content.trim()) {
      toast.error('Title and content are required')
      return
    }

    setGuides((current) =>
      (current || []).map((guide) =>
        guide.id === selectedGuide.id
          ? {
              ...guide,
              title: editForm.title.trim(),
              content: editForm.content.trim(),
              plotType: editForm.plotType.trim() || 'General',
              updatedAt: Date.now()
            }
          : guide
      )
    )

    setSelectedGuide({
      ...selectedGuide,
      title: editForm.title.trim(),
      content: editForm.content.trim(),
      plotType: editForm.plotType.trim() || 'General',
      updatedAt: Date.now()
    })
    setIsEditing(false)
    toast.success('Guide updated successfully!')
  }

  const deleteGuide = (id: string) => {
    setGuides((current) => (current || []).filter((guide) => guide.id !== id))
    if (selectedGuide?.id === id) {
      setSelectedGuide(null)
    }
    setDeleteDialogOpen(false)
    setGuideToDelete(null)
    toast.success('Guide deleted')
  }

  const toggleStar = (id: string) => {
    setGuides((current) =>
      (current || []).map((guide) =>
        guide.id === id ? { ...guide, starred: !guide.starred } : guide
      )
    )
    if (selectedGuide?.id === id) {
      setSelectedGuide({ ...selectedGuide, starred: !selectedGuide.starred })
    }
  }

  const startEdit = (guide: FarmingGuide) => {
    setEditForm({
      title: guide.title,
      content: guide.content,
      plotType: guide.plotType
    })
    setSelectedGuide(guide)
    setIsEditing(true)
    setViewMode('edit')
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setIsCreating(false)
    setEditForm({ title: '', content: '', plotType: '' })
  }

  const startCreate = () => {
    setIsCreating(true)
    setSelectedGuide(null)
    setEditForm({ title: '', content: '', plotType: '' })
    setViewMode('edit')
  }

  const selectGuide = (guide: FarmingGuide) => {
    setSelectedGuide(guide)
    setIsEditing(false)
    setIsCreating(false)
  }

  const renderMarkdown = (content: string) => {
    return { __html: marked(content) }
  }

  const sortedGuides = [...(guides || [])].sort((a, b) => {
    if (a.starred && !b.starred) return -1
    if (!a.starred && b.starred) return 1
    return b.updatedAt - a.updatedAt
  })

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Book size={40} weight="fill" className="text-primary" />
            <div>
              <h1 className="text-3xl md:text-4xl text-primary tracking-tight">
                Farming Plot Guides
              </h1>
              <p className="text-muted-foreground font-body text-sm">
                Create and manage custom farming guides with markdown
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={startCreate} className="gap-2">
              <Plus size={20} weight="bold" />
              New Guide
            </Button>
            <Button variant="outline" onClick={onClose} className="gap-2">
              <ArrowLeft size={20} />
              Back
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-4 border-2">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground font-body">
                <BookOpen size={24} weight="fill" className="text-secondary" />
                Your Guides ({sortedGuides.length})
              </h2>

              <ScrollArea className="h-[600px]">
                <div className="space-y-2 pr-4">
                  {sortedGuides.length === 0 ? (
                    <div className="text-center py-12">
                      <Book size={48} className="text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground font-body">
                        No guides yet
                      </p>
                      <p className="text-xs text-muted-foreground font-body mt-1">
                        Create your first farming guide!
                      </p>
                    </div>
                  ) : (
                    sortedGuides.map((guide) => (
                      <motion.div
                        key={guide.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <Card
                          className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${
                            selectedGuide?.id === guide.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border'
                          }`}
                          onClick={() => selectGuide(guide)}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-sm text-foreground font-body line-clamp-1 flex-1">
                              {guide.title}
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleStar(guide.id)
                              }}
                            >
                              <Star
                                size={16}
                                weight={guide.starred ? 'fill' : 'regular'}
                                className={guide.starred ? 'text-primary' : 'text-muted-foreground'}
                              />
                            </Button>
                          </div>
                          <Badge variant="secondary" className="text-xs mb-2">
                            {guide.plotType}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            Updated {new Date(guide.updatedAt).toLocaleDateString()}
                          </p>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {isCreating || isEditing ? (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="p-6 border-2">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-foreground font-body flex items-center gap-2">
                        <Pencil size={24} weight="fill" className="text-accent" />
                        {isCreating ? 'Create New Guide' : 'Edit Guide'}
                      </h2>
                      <Button variant="ghost" size="sm" onClick={cancelEdit}>
                        <X size={20} />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Title
                        </label>
                        <Input
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          placeholder="e.g., Melon Farm Optimization Guide"
                          className="font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Plot Type
                        </label>
                        <Input
                          value={editForm.plotType}
                          onChange={(e) => setEditForm({ ...editForm, plotType: e.target.value })}
                          placeholder="e.g., Melon, Carrot, Pumpkin, etc."
                          className="font-mono"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-foreground">
                            Content (Markdown supported)
                          </label>
                          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'edit' | 'preview')} className="w-auto">
                            <TabsList className="h-8">
                              <TabsTrigger value="edit" className="text-xs gap-1">
                                <Pencil size={14} />
                                Edit
                              </TabsTrigger>
                              <TabsTrigger value="preview" className="text-xs gap-1">
                                <Eye size={14} />
                                Preview
                              </TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>

                        {viewMode === 'edit' ? (
                          <Textarea
                            value={editForm.content}
                            onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                            placeholder="# Your Guide Title&#10;&#10;## Section 1&#10;&#10;Write your farming guide here using Markdown formatting...&#10;&#10;- Bullet point&#10;- Another point&#10;&#10;**Bold text** and *italic text*"
                            className="min-h-[400px] font-mono text-sm"
                          />
                        ) : (
                          <ScrollArea className="h-[400px] border rounded-md">
                            <div
                              className="p-4 prose prose-sm prose-invert max-w-none"
                              dangerouslySetInnerHTML={renderMarkdown(editForm.content || '*No content yet*')}
                            />
                          </ScrollArea>
                        )}
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={isCreating ? createGuide : updateGuide}
                          className="gap-2"
                        >
                          <FloppyDisk size={20} weight="fill" />
                          {isCreating ? 'Create Guide' : 'Save Changes'}
                        </Button>
                        <Button variant="outline" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ) : selectedGuide ? (
                <motion.div
                  key="viewer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="p-6 border-2">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="text-2xl font-semibold text-foreground font-body">
                            {selectedGuide.title}
                          </h2>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => toggleStar(selectedGuide.id)}
                          >
                            <Star
                              size={20}
                              weight={selectedGuide.starred ? 'fill' : 'regular'}
                              className={selectedGuide.starred ? 'text-primary' : 'text-muted-foreground'}
                            />
                          </Button>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Badge variant="secondary">{selectedGuide.plotType}</Badge>
                          <span>
                            Updated {new Date(selectedGuide.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(selectedGuide)}
                          className="gap-2"
                        >
                          <Pencil size={16} />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setGuideToDelete(selectedGuide.id)
                            setDeleteDialogOpen(true)
                          }}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash size={16} />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <Separator className="mb-6" />

                    <ScrollArea className="h-[600px]">
                      <div
                        className="prose prose-sm prose-invert max-w-none pr-4"
                        dangerouslySetInnerHTML={renderMarkdown(selectedGuide.content)}
                      />
                    </ScrollArea>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex items-center justify-center"
                >
                  <Card className="p-12 border-2 border-dashed text-center">
                    <Book size={64} className="text-muted-foreground mx-auto mb-4" weight="light" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No Guide Selected
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select a guide from the list or create a new one
                    </p>
                    <Button onClick={startCreate} className="gap-2">
                      <Plus size={20} weight="bold" />
                      Create Your First Guide
                    </Button>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Guide</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this guide? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => guideToDelete && deleteGuide(guideToDelete)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
