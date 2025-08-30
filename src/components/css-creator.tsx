'use client'

import { processCssFiles } from '@/lib/actions'
import type { ColorInfo, ProcessedFile } from '@/lib/types'
import { generateModifiedCss, generateCssWithVariables } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import CentralVariables from './central-variables'
import ColorList from './color-list'
import CssPreview from './css-preview'
import { Button } from './ui/button'

type FileFilter = {
  id: string
  isVisible: boolean
}

export default function CssCreator() {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([])
  const [fileFilters, setFileFilters] = useState<FileFilter[]>([])
  const [combinedVariablesCss, setCombinedVariablesCss] = useState<string>('')
  const [copiedVariables, setCopiedVariables] = useState(false)
  const [copiedModified, setCopiedModified] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [layoutMode, setLayoutMode] = useState<'default' | 'colorsExpanded' | 'codeExpanded'>(
    'default'
  )
  const [showCentralVariables, setShowCentralVariables] = useState(true)
  const [multiFileEditMode, setMultiFileEditMode] = useState(true)

  const handleVariableChange = (fileId: string, original: string, newVariable: string) => {
    setProcessedFiles((prevFiles) => {
      const updatedFiles = prevFiles.map((file) => {
        if (file.id !== fileId) return file

        const updatedColors = { ...file.colors }
        if (updatedColors[original]) {
          updatedColors[original] = {
            ...updatedColors[original],
            variable: newVariable,
          }
        }

        return {
          ...file,
          colors: updatedColors,
          modifiedCss: generateModifiedCss(file.originalCss, updatedColors),
        }
      })

      // Update combined variables CSS after state change
      setTimeout(() => {
        const combinedColors = getCombinedColorsFromFiles(updatedFiles, fileFilters)
        setCombinedVariablesCss(generateCssWithVariables(combinedColors))
      }, 0)

      return updatedFiles
    })
  }

  const handleColorChange = (fileId: string, original: string, newValue: string) => {
    setProcessedFiles((prevFiles) => {
      const updatedFiles = prevFiles.map((file) => {
        if (file.id !== fileId) return file

        const updatedColors = { ...file.colors }
        if (updatedColors[original]) {
          const updatedColor = {
            ...updatedColors[original],
            value: newValue,
          }
          delete updatedColors[original]
          updatedColors[newValue] = updatedColor
        }

        return {
          ...file,
          colors: updatedColors,
          modifiedCss: generateModifiedCss(file.originalCss, updatedColors),
        }
      })

      // Update combined variables CSS after state change
      setTimeout(() => {
        const combinedColors = getCombinedColorsFromFiles(updatedFiles, fileFilters)
        setCombinedVariablesCss(generateCssWithVariables(combinedColors))
      }, 0)

      return updatedFiles
    })
  }

  const toggleLayoutMode = (mode: 'default' | 'colorsExpanded' | 'codeExpanded') => {
    if (layoutMode === mode) {
      setLayoutMode('default')
    } else {
      setLayoutMode(mode)
    }
  }

  const toggleFileVisibility = (fileId: string) => {
    setFileFilters((prev) => {
      const updatedFilters = prev.map((filter) =>
        filter.id === fileId ? { ...filter, isVisible: !filter.isVisible } : filter
      )

      setTimeout(() => {
        const combinedColors = getCombinedColorsFromFiles(processedFiles, updatedFilters)
        setCombinedVariablesCss(generateCssWithVariables(combinedColors))
      }, 0)

      return updatedFilters
    })
  }

  const getVisibleFiles = () => {
    return processedFiles.filter(
      (file) => fileFilters.find((filter) => filter.id === file.id)?.isVisible ?? true
    )
  }

  const getCombinedColors = () => {
    const visibleFiles = getVisibleFiles()
    return getCombinedColorsFromFiles(visibleFiles, fileFilters)
  }

  const getCombinedColorsFromFiles = (files: ProcessedFile[], filters: FileFilter[]) => {
    const visibleFiles = files.filter(
      (file) => filters.find((filter) => filter.id === file.id)?.isVisible ?? true
    )
    const combinedColors: Record<string, ColorInfo> = {}

    visibleFiles.forEach((file) => {
      Object.entries(file.colors).forEach(([key, color]) => {
        if (combinedColors[key]) {
          combinedColors[key].occurrences += color.occurrences
        } else {
          combinedColors[key] = { ...color }
        }
      })
    })

    return combinedColors
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setProcessing(true)
    setError(null)
    setCopiedVariables(false)
    setCopiedModified(false)

    try {
      const result = await processCssFiles(acceptedFiles)
      console.log('Process result:', result)

      if (result.error) {
        setError(result.error)
        return
      }

      // setIsFullscreen(true)
      setProcessedFiles(result.files)
      setCombinedVariablesCss(result.combinedVariablesCss || '')
      setFileFilters(result.files.map((file) => ({ id: file.id, isVisible: true })))
    } catch (err) {
      console.error('Error processing files:', err)
      setError('An error occurred while processing the files.')
    } finally {
      setProcessing(false)
    }
  }, [])

  const resetState = () => {
    setIsFullscreen(false)
    setProcessing(false)
    setError(null)
    setProcessedFiles([])
    setFileFilters([])
    setCombinedVariablesCss('')
    setCopiedVariables(false)
    setCopiedModified(false)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/css': ['.css'],
      'text/scss': ['.scss'],
      'text/x-scss': ['.scss'],
      'text/sass': ['.sass'],
      'text/x-sass': ['.sass'],
      'text/less': ['.less'],
      'text/x-less': ['.less'],
      'text/plain': ['.css', '.scss', '.sass', '.less', '.styl'],
    },
    multiple: true,
  })

  return (
    <AnimatePresence mode="wait">
      <motion.div
        layout
        className={`transition-all duration-300 ease-in-out ${isFullscreen
          ? 'fixed inset-0 z-[100] bg-gradient-blur backdrop-blur-md flex flex-col'
          : 'relative'
          }`}
      >
        {processedFiles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors duration-200 backdrop-blur-sm bg-white/50 ${isDragActive
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50/50'
                }`}
            >
              <input {...getInputProps()} />
              {processing ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg text-muted-foreground"
                >
                  Processing files...
                </motion.p>
              ) : (
                <div>
                  <p className="mb-2 text-lg">
                    Drop your CSS, SCSS, or other stylesheet files here
                  </p>
                  <p className="text-sm text-muted-foreground">or click to select files</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`relative flex flex-col ${isFullscreen ? 'h-full' : 'h-full'}`}
          >
            <div className={`${isFullscreen ? 'p-4 pb-0' : ''}`}>
              <div className="sticky top-0 z-10 backdrop-blur-sm bg-background/80 p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">
                      Processed Files
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {processedFiles.length} files, {Object.keys(getCombinedColors()).length}{' '}
                        colors found
                      </span>
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetState}
                      className="flex items-center gap-1"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="hidden sm:inline">Reset</span>
                    </Button>
                    {/* <Button
											variant="outline"
											size="sm"
											onClick={() => setIsFullscreen(!isFullscreen)}
											className="flex items-center gap-1"
										>
											{isFullscreen ? (
												<>
													<Minimize2 className="w-4 h-4" />
													<span className="hidden sm:inline">Exit Fullscreen</span>
												</>
											) : (
												<>
													<Maximize2 className="w-4 h-4" />
													<span className="hidden sm:inline">Fullscreen</span>
												</>
											)}
										</Button> */}
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Error</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">File Filters</h3>
                  <div className="flex flex-wrap gap-2">
                    {fileFilters.map((filter) => {
                      const file = processedFiles.find((f) => f.id === filter.id)
                      if (!file) return null

                      return (
                        <Button
                          key={filter.id}
                          variant={filter.isVisible ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleFileVisibility(filter.id)}
                        >
                          {file.name}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant={layoutMode === 'default' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleLayoutMode('default')}
                  >
                    Default View
                  </Button>
                  <Button
                    variant={layoutMode === 'colorsExpanded' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleLayoutMode('colorsExpanded')}
                  >
                    Colors Expanded
                  </Button>
                  <Button
                    variant={layoutMode === 'codeExpanded' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleLayoutMode('codeExpanded')}
                  >
                    Code Expanded
                  </Button>
                  <Button
                    variant={showCentralVariables ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowCentralVariables(!showCentralVariables)}
                  >
                    Variables Panel
                  </Button>
                </div>
              </div>
            </div>

            <div className={`flex-1 overflow-auto ${isFullscreen ? 'p-4' : 'mt-6'}`}>
              <div
                className={`grid gap-6 h-full ${showCentralVariables
                  ? 'grid-cols-1'
                  : layoutMode === 'colorsExpanded'
                    ? 'grid-cols-1'
                    : layoutMode === 'codeExpanded'
                      ? 'grid-cols-1'
                      : 'grid-cols-1 xl:grid-cols-2'
                  }`}
              >
                {showCentralVariables && (
                  <div className="flex flex-col gap-6 col-span-full">
                    <motion.div layout className="border rounded-xl p-6 backdrop-blur-sm bg-white/60 h-full">
                      <CentralVariables
                        files={getVisibleFiles()}
                        onVariableChange={handleVariableChange}
                        onColorChange={handleColorChange}
                        combinedVariablesCss={combinedVariablesCss}
                        multiFileEditMode={multiFileEditMode}
                        onMultiFileEditToggle={setMultiFileEditMode}
                      />
                    </motion.div>
                  </div>
                )}

                {!showCentralVariables && (layoutMode === 'default' || layoutMode === 'colorsExpanded') && (
                  <div
                    className={`flex flex-col gap-6 ${layoutMode === 'default' ? '' : 'order-first'
                      } ${isFullscreen ? 'h-full' : ''}`}
                  >
                    {getVisibleFiles().map((file) => (
                      <motion.div
                        key={file.id}
                        layout
                        className="border rounded-xl p-6 backdrop-blur-sm bg-white/60"
                      >
                        <h3 className="font-medium mb-4">{file.name}</h3>
                        <div className="flex flex-col gap-4">
                          <ColorList
                            title="Colors without Variables"
                            colors={Object.values(file.colors).filter((color) => !color.isExisting)}
                            onVariableChange={(original, newVariable) =>
                              handleVariableChange(file.id, original, newVariable)
                            }
                            onColorChange={(original, newValue) =>
                              handleColorChange(file.id, original, newValue)
                            }
                            className={layoutMode === 'colorsExpanded' ? 'mb-6' : ''}
                          />
                          <ColorList
                            title="Existing Variables"
                            colors={Object.values(file.colors).filter((color) => color.isExisting)}
                            onVariableChange={(original, newVariable) =>
                              handleVariableChange(file.id, original, newVariable)
                            }
                            onColorChange={(original, newValue) =>
                              handleColorChange(file.id, original, newValue)
                            }
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {!showCentralVariables && (layoutMode === 'default' || layoutMode === 'codeExpanded') && (
                  <div
                    className={`flex flex-col gap-6 ${layoutMode === 'default' ? '' : 'order-first'
                      } ${isFullscreen ? 'h-full' : ''}`}
                  >
                    <div className="flex flex-col h-full">
                      <motion.div layout className="mb-6">
                        <CssPreview
                          title="Combined Variables"
                          cssCode={combinedVariablesCss}
                          onCopy={() => {
                            navigator.clipboard.writeText(combinedVariablesCss)
                            setCopiedVariables(true)
                            setTimeout(() => setCopiedVariables(false), 2000)
                          }}
                          copied={copiedVariables}
                        />
                      </motion.div>

                      {getVisibleFiles().map((file) => (
                        <motion.div key={file.id} layout className="mb-6">
                          <CssPreview
                            title={`Modified CSS - ${file.name}`}
                            cssCode={file.modifiedCss}
                            onCopy={() => {
                              navigator.clipboard.writeText(file.modifiedCss)
                              setCopiedModified(true)
                              setTimeout(() => setCopiedModified(false), 2000)
                            }}
                            copied={copiedModified}
                            highlightButton={false}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
