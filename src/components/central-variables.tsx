'use client'

import type { ColorInfo, ProcessedFile } from '@/lib/types'
import { Copy, Download, Palette, ToggleLeft, ToggleRight } from 'lucide-react'
import { useState } from 'react'
import ColorCard from './color-card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

type CentralVariablesProps = {
  files: ProcessedFile[]
  onVariableChange: (fileId: string, original: string, newVariable: string) => void
  onColorChange: (fileId: string, original: string, newValue: string) => void
  combinedVariablesCss: string
  multiFileEditMode: boolean
  onMultiFileEditToggle: (enabled: boolean) => void
}

type CategorizedColors = {
  shared: Record<string, ColorInfo & { usedInFiles: string[] }>
  exclusive: Record<string, Record<string, ColorInfo & { usedInFiles: string[] }>>
}

export default function CentralVariables({
  files,
  onVariableChange,
  onColorChange,
  combinedVariablesCss,
  multiFileEditMode,
  onMultiFileEditToggle
}: CentralVariablesProps) {
  const [copiedCss, setCopiedCss] = useState(false)
  const [activeTab, setActiveTab] = useState<'shared' | 'exclusive'>('shared')

  const categorizeColors = (): CategorizedColors => {
    const colorUsage: Record<string, { color: ColorInfo; files: string[] }> = {}


    files.forEach((file) => {
      Object.entries(file.colors).forEach(([colorValue, color]) => {
        if (!colorUsage[colorValue]) {
          colorUsage[colorValue] = { color, files: [] }
        }
        colorUsage[colorValue].files.push(file.id)
      })
    })

    const shared: Record<string, ColorInfo & { usedInFiles: string[] }> = {}
    const exclusive: Record<string, Record<string, ColorInfo & { usedInFiles: string[] }>> = {}

    Object.entries(colorUsage).forEach(([colorValue, usage]) => {
      const colorWithFiles = { ...usage.color, usedInFiles: usage.files }

      if (usage.files.length > 1) {
        // Shared across multiple files
        shared[colorValue] = colorWithFiles
      } else {
        // Exclusive to one file
        const fileId = usage.files[0]
        if (!exclusive[fileId]) {
          exclusive[fileId] = {}
        }
        exclusive[fileId][colorValue] = colorWithFiles
      }
    })

    return { shared, exclusive }
  }

  const { shared, exclusive } = categorizeColors()

  const handleCopyCss = async () => {
    try {
      await navigator.clipboard.writeText(combinedVariablesCss)
      setCopiedCss(true)
      setTimeout(() => setCopiedCss(false), 2000)
    } catch (err) {
      console.error('Failed to copy CSS:', err)
    }
  }

  const downloadAllFilesAsZip = async () => {
    try {
      // Import JSZip dynamically to avoid SSR issues
      // Note: JSZip package needs to be installed: npm install jszip @types/jszip
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      // Add the combined variables CSS
      zip.file('variables.css', combinedVariablesCss)

      // Add each modified file
      files.forEach((file) => {
        const fileName = file.name.endsWith('.css') ? file.name : `${file.name}.css`
        zip.file(`modified-${fileName}`, file.modifiedCss)
      })

      // Generate and download the zip
      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = 'css-variables-files.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to create zip file:', error)
    }
  }

  const getFileNameById = (fileId: string) => {
    return files.find(f => f.id === fileId)?.name || fileId
  }

  const handleVariableChangeForColor = (colorValue: string, newVariable: string) => {
    const colorUsage = shared[colorValue] || Object.values(exclusive).flat().find(colors => colors[colorValue])?.[colorValue]
    if (colorUsage) {
      if (multiFileEditMode && shared[colorValue]) {
        // Multi-file edit: update all files that use this color
        colorUsage.usedInFiles.forEach(fileId => {
          onVariableChange(fileId, colorValue, newVariable)
        })
      } else {
        // Single file edit: only update the first file (or specific file for exclusive colors)
        const targetFileId = colorUsage.usedInFiles[0]
        onVariableChange(targetFileId, colorValue, newVariable)
      }
    }
  }

  const handleColorChangeForColor = (original: string, newValue: string) => {
    const colorUsage = shared[original] || Object.values(exclusive).flat().find(colors => colors[original])?.[original]
    if (colorUsage) {
      if (multiFileEditMode && shared[original]) {
        colorUsage.usedInFiles.forEach(fileId => {
          onColorChange(fileId, original, newValue)
        })
      } else {
        const targetFileId = colorUsage.usedInFiles[0]
        onColorChange(targetFileId, original, newValue)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Variable Manager</h2>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCopyCss}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copiedCss ? 'Copied!' : 'Copy CSS'}
            </Button>
            <Button
              onClick={downloadAllFilesAsZip}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download ZIP
            </Button>
          </div>
        </div>

        {/* Multi-file edit toggle */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Multi-file editing</span>
            <Badge variant={multiFileEditMode ? "default" : "secondary"} className="text-xs">
              {multiFileEditMode ? "ON" : "OFF"}
            </Badge>
          </div>
          <Button
            onClick={() => onMultiFileEditToggle(!multiFileEditMode)}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            {multiFileEditMode ? (
              <ToggleRight className="w-5 h-5 text-primary" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-muted-foreground" />
            )}
            <span className="text-xs">
              {multiFileEditMode ? 'Edits apply to all files' : 'Edits apply to single file'}
            </span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('shared')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'shared'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          type="button"
        >
          Shared Colors ({Object.keys(shared).length})
        </button>
        <button
          onClick={() => setActiveTab('exclusive')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'exclusive'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          type="button"
        >
          File-Exclusive Colors ({Object.values(exclusive).reduce((acc, colors) => acc + Object.keys(colors).length, 0)})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'shared' && (
          <div className="space-y-4">
            {Object.keys(shared).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No shared colors found</p>
                <p className="text-sm">Colors used in multiple files will appear here</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Colors used across multiple files. Changes here will affect all files using these colors.
                </p>
                <div className="grid gap-4">
                  {Object.entries(shared).map(([colorValue, color]) => (
                    <div key={colorValue} className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          Used in {color.usedInFiles.length} files: {color.usedInFiles.map(id => getFileNameById(id)).join(', ')}
                        </Badge>
                      </div>
                      <ColorCard
                        color={color}
                        onVariableChange={(original, newVariable) =>
                          handleVariableChangeForColor(original, newVariable)
                        }
                        onColorChange={handleColorChangeForColor}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'exclusive' && (
          <div className="space-y-6">
            {Object.keys(exclusive).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No file-exclusive colors found</p>
                <p className="text-sm">Colors used in only one file will appear here</p>
              </div>
            ) : (
              Object.entries(exclusive).map(([fileId, colors]) => (
                <div key={fileId} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{getFileNameById(fileId)}</h3>
                    <Badge variant="outline" className="text-xs">
                      {Object.keys(colors).length} exclusive colors
                    </Badge>
                  </div>
                  <div className="grid gap-4 pl-4 border-l-2 border-border">
                    {Object.entries(colors).map(([colorValue, color]) => (
                      <ColorCard
                        key={colorValue}
                        color={color}
                        onVariableChange={(original, newVariable) =>
                          onVariableChange(fileId, original, newVariable)
                        }
                        onColorChange={(original, newValue) =>
                          onColorChange(fileId, original, newValue)
                        }
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
