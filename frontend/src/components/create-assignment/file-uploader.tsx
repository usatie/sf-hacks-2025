"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, FileImage } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface FileUploaderProps {
  onFileUpload: (file: File) => void
}

export default function FileUploader({ onFileUpload }: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  })

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-500" />
    } else if (file.type.includes("image")) {
      return <FileImage className="h-5 w-5 text-blue-500" />
    } else {
      return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  return (
    <div className="p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-border"
        } ${selectedFile ? "border-primary/50" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4">
          {!selectedFile ? (
            <>
              <div className="rounded-full bg-muted p-4">
                <Upload className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Drag and drop your file here or click to browse</p>
                <p className="text-sm text-muted-foreground">Supports PDF, DOCX, and TXT files up to 10MB</p>
              </div>
              <Button variant="secondary" className="mt-2">
                Browse Files
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-full bg-primary/10 p-4">{getFileIcon(selectedFile)}</div>
              <div className="space-y-1">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type || "Unknown type"}
                </p>
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedFile(null)
                  }}
                >
                  Change File
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUpload()
                  }}
                >
                  Process Document
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium mb-2">Supported file types:</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-primary/5">
            PDF
          </Badge>
          <Badge variant="outline" className="bg-primary/5">
            DOCX
          </Badge>
          <Badge variant="outline" className="bg-primary/5">
            TXT
          </Badge>
        </div>
      </div>
    </div>
  )
}

