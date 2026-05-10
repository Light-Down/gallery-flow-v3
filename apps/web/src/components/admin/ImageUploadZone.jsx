
import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, Image as ImageIcon, Loader2, RotateCcw, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { detectImageOrientation, naturalSort } from '@/utils/galleryHelpers.js';
import pb from '@/lib/pocketbaseClient.js';

const ImageUploadZone = ({ galleryId, onUploadComplete, isUploading, setIsUploading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, filename: '' });
  const [uploadQueue, setUploadQueue] = useState([]);
  const fileInputRef = useRef(null);

  const updateQueueItem = useCallback((itemId, updates) => {
    setUploadQueue(prev => prev.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    ));
  }, []);

  const uploadSingleFile = async (file, galleryId) => {
    const formData = new FormData();
    formData.append('galleryImages+', file);

    const record = await pb.collection('galleries').update(galleryId, formData, {
      $autoCancel: false
    });

    // PocketBase stores files with unique generated filenames, not the original name.
    // Find the uploaded file by matching the original name against the stored names.
    const storedFilenames = record.galleryImages || [];
    const originalName = file.name;

    // Normalize for comparison: lowercase, handle jpeg/jpg equivalence
    const normalizeName = (name) => name.toLowerCase().replace(/\.jpe?g$/, '.jpg');
    const originalNormalized = normalizeName(originalName);

    // PocketBase may sanitize the filename (lowercase, replace spaces, add uniqueness suffix).
    // Try exact match first, then fallback to case-insensitive or suffix match.
    let storedFilename = storedFilenames.find(fn => fn === originalName);
    if (!storedFilename) {
      storedFilename = storedFilenames.find(fn => fn.toLowerCase() === originalName.toLowerCase());
    }
    if (!storedFilename) {
      // Handle jpeg/jpg extension equivalence
      storedFilename = storedFilenames.find(fn => normalizeName(fn) === originalNormalized);
    }
    if (!storedFilename) {
      // Fallback: match by base name (without the uniqueness suffix PocketBase may add)
      const originalBase = originalName.replace(/\.[^.]+$/, '').toLowerCase();
      storedFilename = storedFilenames.find(fn => {
        const fnBase = fn.replace(/_[a-zA-Z0-9_]+\.[^.]+$/, '').replace(/\.[^.]+$/, '').toLowerCase();
        return fnBase === originalBase || fn.toLowerCase().includes(originalBase);
      });
    }
    if (!storedFilename && storedFilenames.length > 0) {
      // Last resort: use the most recently added file (should be the last in the array)
      storedFilename = storedFilenames[storedFilenames.length - 1];
    }

    if (!storedFilename) {
      throw new Error(
        `Upload storage is not ready for "${originalName}". Run the latest PocketBase migrations and try again.`
      );
    }

    const url = pb.files.getUrl(record, storedFilename);

    // Load image to determine natural dimensions & orientation
    const dimensions = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = url;
    });

    const orientation = detectImageOrientation(dimensions.width, dimensions.height);

    return {
      id: crypto.randomUUID(),
      url,
      filename: storedFilename || originalName,
      uploadedAt: new Date().toISOString(),
      width: dimensions.width,
      height: dimensions.height,
      orientation
    };
  };

  const processQueueItem = async (item, queueItems) => {
    const index = queueItems.findIndex(q => q.id === item.id);

    updateQueueItem(item.id, { status: 'uploading', progress: 0 });

    try {
      const result = await uploadSingleFile(item.file, galleryId);
      updateQueueItem(item.id, { status: 'complete', progress: 100, url: result.url });
      return { status: 'success', data: result };
    } catch (err) {
      updateQueueItem(item.id, {
        status: 'error',
        progress: 0,
        error: err.message || 'Upload failed'
      });
      return { status: 'error', error: err, file: item.file };
    }
  };

  const processFiles = async (files) => {
    if (!files || files.length === 0) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validFiles = Array.from(files).filter(f => validTypes.includes(f.type));

    if (validFiles.length !== files.length) {
      toast.warning('Some files were ignored. Only JPG, PNG, and WEBP formats are supported.');
    }

    if (validFiles.length === 0) return;

    if (!galleryId) {
      toast.error('Gallery ID is required for upload');
      return;
    }

    // Create queue items with unique IDs
    const newQueueItems = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      status: 'pending',
      progress: 0,
      error: null,
      retryCount: 0,
      url: null
    }));

    setUploadQueue(newQueueItems);
    setIsUploading(true);
    setProgress({ current: 0, total: validFiles.length, filename: '' });

    const uploadedImages = [];
    const queueResults = [];

    for (let i = 0; i < newQueueItems.length; i++) {
      const item = newQueueItems[i];

      if (item.status === 'complete') continue;

      setProgress({ current: i + 1, total: validFiles.length, filename: item.file.name });

      const result = await processQueueItem(item, newQueueItems);
      queueResults.push(result);

      if (result.status === 'success') {
        uploadedImages.push(result.data);
      }
    }

    const successCount = queueResults.filter(r => r.status === 'success').length;
    const errorCount = queueResults.filter(r => r.status === 'error').length;

    if (errorCount > 0) {
      toast.error(`${successCount} uploaded, ${errorCount} failed`);
    } else {
      toast.success(`${successCount} images uploaded`);
    }

    setIsUploading(false);
    setProgress({ current: 0, total: 0, filename: '' });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (uploadedImages.length > 0) {
      const sortedBatch = naturalSort(uploadedImages);
      onUploadComplete(sortedBatch);
    }

    return queueResults;
  };

  const handleRetry = async (itemId) => {
    const item = uploadQueue.find(q => q.id === itemId);
    if (!item || item.retryCount >= 3) {
      toast.error('Maximum retry attempts reached for this file');
      return;
    }

    if (!galleryId) {
      toast.error('Gallery ID is required for upload');
      return;
    }

    updateQueueItem(itemId, {
      status: 'pending',
      error: null,
      retryCount: item.retryCount + 1,
      progress: 0
    });

    setIsUploading(true);
    setProgress({ current: 0, total: 1, filename: item.file.name });

    const result = await processQueueItem({ ...item, retryCount: item.retryCount + 1 }, uploadQueue);

    if (result.status === 'success') {
      toast.success(`${item.file.name} uploaded successfully`);
      onUploadComplete(naturalSort([result.data]));
    } else {
      toast.error(`${item.file.name} failed again (${item.retryCount + 1}/3 retries)`);
    }

    setIsUploading(false);
    setProgress({ current: 0, total: 0, filename: '' });
  };

  const handleClearCompleted = () => {
    setUploadQueue(prev => prev.filter(item => item.status !== 'complete'));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    processFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    processFiles(files);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-muted-foreground/50" />;
    }
  };

  const hasCompletedItems = uploadQueue.some(item => item.status === 'complete');
  const hasErrorItems = uploadQueue.some(item => item.status === 'error');

  return (
    <div className="w-full space-y-4">
      {/* Upload Drop Zone */}
      <div
        className={`upload-zone ${isDragging ? 'active' : ''} ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileInput}
        />

        {isUploading ? (
          <div className="flex flex-col items-center max-w-md w-full">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h3 className="text-xl font-medium mb-2">
              Uploading {progress.current} of {progress.total}
              {progress.filename ? ` — ${progress.filename}` : ''}
            </h3>
            <Progress value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0} className="w-full h-2 mb-2" />
            <p className="text-sm text-muted-foreground">
              {Math.round(progress.total > 0 ? (progress.current / progress.total) * 100 : 0)}% Complete
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-editorial font-semibold mb-3">Drag & Drop Images</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Upload high-resolution files to build your gallery narrative. Automatically detects portrait, landscape, and square formats.
            </p>
            <Button type="button" variant="outline" className="font-medium">
              Browse Files
            </Button>
          </div>
        )}
      </div>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <div className="border border-border rounded-xl bg-card p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-sm">Upload Queue</h4>
            {hasCompletedItems && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearCompleted}
                className="h-7 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Clear completed
              </Button>
            )}
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uploadQueue.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-2 rounded-lg border ${
                  item.status === 'error' ? 'border-destructive/30 bg-destructive/5' :
                  item.status === 'complete' ? 'border-green-500/30 bg-green-500/5' :
                  item.status === 'uploading' ? 'border-primary/30 bg-primary/5' :
                  'border-muted bg-muted/30'
                }`}
              >
                {getStatusIcon(item.status)}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.status === 'uploading' && 'Uploading...'}
                    {item.status === 'complete' && 'Complete'}
                    {item.status === 'error' && (
                      <span className="text-destructive">{item.error || 'Failed'}</span>
                    )}
                    {item.status === 'pending' && 'Pending'}
                    {item.retryCount > 0 && ` (retry ${item.retryCount}/3)`}
                  </p>
                  {item.status === 'uploading' && (
                    <Progress value={item.progress} className="h-1 mt-1" />
                  )}
                </div>

                {item.status === 'error' && item.retryCount < 3 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRetry(item.id)}
                    className="h-7 w-7 p-0"
                    disabled={isUploading}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}

                {item.status === 'error' && item.retryCount >= 3 && (
                  <span className="text-xs text-destructive font-medium">Max retries</span>
                )}
              </div>
            ))}
          </div>

          {hasErrorItems && (
            <p className="text-xs text-muted-foreground">
              Failed uploads can be retried up to 3 times. Re-select files to retry beyond the limit.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploadZone;
