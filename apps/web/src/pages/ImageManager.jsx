
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, AlertTriangle, Trash2, X, Pencil, ChevronUp, ChevronDown, UploadCloud, Flag, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { detectImageOrientation, naturalSort, normalizeGalleryImages } from '@/utils/galleryHelpers.js';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ImageUploadZone from '@/components/admin/ImageUploadZone.jsx';
import ImageGridCard from '@/components/admin/ImageGridCard.jsx';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal.jsx';

const getFilenameKey = (filename = '') => filename.toLowerCase().replace(/\.jpe?g$/, '.jpg');

const getAtelierSections = (gallery) => {
  return (gallery?.sections || []).filter(section => section.isAtelierConfig);
};

const buildImageIndexMap = (images) => {
  const map = new Map();
  images.forEach((image, index) => {
    map.set(getFilenameKey(image.filename), index);
  });
  return map;
};

const getSectionStartFilename = (section) => {
  return section.startFilename || section.coverFilename || section.imageFilenames?.[0] || '';
};

const getSectionEndFilename = (section) => {
  return section.endFilename || section.imageFilenames?.[section.imageFilenames.length - 1] || '';
};

const normalizeSectionForSave = (section, index) => {
  const imageFilenames = (section.imageFilenames || []).filter(Boolean);
  const startFilename = section.startFilename || imageFilenames[0] || '';
  const endFilename = section.endFilename || imageFilenames[imageFilenames.length - 1] || '';

  return {
    ...section,
    order: index,
    startFilename,
    endFilename,
    coverFilename: section.coverFilename || startFilename,
    imageFilenames
  };
};

const getSectionFirstImageIndex = (section, imageIndexMap) => {
  return Math.min(
    ...(section.imageFilenames || [])
      .map(filename => imageIndexMap.get(getFilenameKey(filename)))
      .filter(index => index !== undefined)
  );
};

const normalizeEditableSections = (record, normalizedImages) => {
  const normalizedSections = (record.sections || [])
    .filter(section => !section.isAtelierConfig)
    .map((section, index) => {
      let imageFilenames = Array.isArray(section.imageFilenames)
        ? section.imageFilenames.filter(Boolean)
        : [];

      if (imageFilenames.length === 0) {
        const start = parseInt(section.startImageIndex ?? section.startImage ?? 0);
        const end = parseInt(section.endImageIndex ?? section.endImage ?? -1);
        if (end >= start) {
          imageFilenames = normalizedImages
            .slice(Math.max(0, start), Math.min(normalizedImages.length - 1, end) + 1)
            .map(image => image.filename)
            .filter(Boolean);
        }
      }

      return {
        id: section.id || crypto.randomUUID(),
        sectionTitle: section.sectionTitle || section.name || `Chapter ${index + 1}`,
        sectionDescription: section.sectionDescription || '',
        startFilename: section.startFilename || imageFilenames[0] || '',
        endFilename: section.endFilename || imageFilenames[imageFilenames.length - 1] || '',
        coverFilename: section.coverFilename || section.startFilename || imageFilenames[0] || '',
        imageFilenames,
        isVisible: true,
        order: section.order ?? index
      };
    })
    .filter(section => section.imageFilenames.length > 0)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((section, index) => normalizeSectionForSave(section, index));

  return normalizedSections;
};

const ImageManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [gallery, setGallery] = useState(null);
  const [images, setImages] = useState([]);
  const [sections, setSections] = useState([]);
  const [activeEndFilename, setActiveEndFilename] = useState('');
  const [changingStartSectionId, setChangingStartSectionId] = useState(null);
  const [uploadExpanded, setUploadExpanded] = useState(true);
  const [chapterPanelOpen, setChapterPanelOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [chapterDraft, setChapterDraft] = useState({
    sectionTitle: '',
    sectionDescription: '',
    isVisible: true,
    startFilename: '',
    endFilename: ''
  });
  const [heroImageIndex, setHeroImageIndex] = useState(null);
  const [coverImageIndex, setCoverImageIndex] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRepairingMetadata, setIsRepairingMetadata] = useState(false);
  
  const [deleteModal, setDeleteModal] = useState({ open: false, index: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const [deleteAllModal, setDeleteAllModal] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, [id]);

  const fetchGallery = async () => {
    try {
      const record = await pb.collection('galleries').getOne(id, { $autoCancel: false });
      setGallery(record);

      const normalizedImages = normalizeGalleryImages(record);
      setImages(normalizedImages);
      setSections(normalizeEditableSections(record, normalizedImages));
      setActiveEndFilename('');
      setChangingStartSectionId(null);
      setChapterPanelOpen(false);
      setEditingSectionId(null);
      setHeroImageIndex(record.heroImageIndex !== undefined ? record.heroImageIndex : null);
      setCoverImageIndex(record.coverImageIndex !== undefined ? record.coverImageIndex : null);
    } catch (error) {
      toast.error('Failed to load gallery images.');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const buildSectionsForSave = (nextSections) => {
    return [
      ...nextSections.map(normalizeSectionForSave),
      ...getAtelierSections(gallery)
    ];
  };

  const persistSections = async (nextSections, successMessage = 'Chapters updated') => {
    const normalizedSections = nextSections
      .filter(section => (section.imageFilenames || []).length > 0)
      .map(normalizeSectionForSave);

    await pb.collection('galleries').update(gallery.id, {
      sections: buildSectionsForSave(normalizedSections)
    }, { $autoCancel: false });

    setSections(normalizedSections);
    setGallery(prev => ({
      ...prev,
      sections: buildSectionsForSave(normalizedSections)
    }));
    toast.success(successMessage);
  };

  const getImagesForSection = (section) => {
    const sectionFilenames = new Set(section.imageFilenames.map(getFilenameKey));
    return images.filter(image => sectionFilenames.has(getFilenameKey(image.filename)));
  };

  const assignedFilenameKeys = useMemo(() => {
    const keys = new Set();
    sections.forEach(section => {
      section.imageFilenames.forEach(filename => keys.add(getFilenameKey(filename)));
    });
    return keys;
  }, [sections]);

  const startMarkerFilenames = useMemo(() => {
    return new Set(sections.map(section => getFilenameKey(section.startFilename)).filter(Boolean));
  }, [sections]);

  const imageIndexByFilename = useMemo(() => {
    const map = new Map();
    images.forEach((image, index) => {
      map.set(getFilenameKey(image.filename), index);
    });
    return map;
  }, [images]);

  const unassignedBlocks = useMemo(() => {
    const blocks = [];
    let currentImages = [];
    let currentStartIndex = 0;

    const flushBlock = (endIndex) => {
      if (currentImages.length === 0) return;
      blocks.push({
        id: `unassigned-${currentStartIndex}-${endIndex}`,
        images: currentImages,
        startIndex: currentStartIndex,
        endIndex,
        startFilename: currentImages[0]?.filename || '',
        endFilename: currentImages[currentImages.length - 1]?.filename || ''
      });
      currentImages = [];
    };

    images.forEach((image, index) => {
      if (!assignedFilenameKeys.has(getFilenameKey(image.filename))) {
        if (currentImages.length === 0) {
          currentStartIndex = index;
        }
        currentImages.push(image);
        return;
      }

      flushBlock(index - 1);
    });

    flushBlock(images.length - 1);
    return blocks;
  }, [images, assignedFilenameKeys]);

  const unassignedBlockByFilename = useMemo(() => {
    const map = new Map();
    unassignedBlocks.forEach(block => {
      block.images.forEach(image => {
        map.set(getFilenameKey(image.filename), block);
      });
    });
    return map;
  }, [unassignedBlocks]);

  const managerBlocks = useMemo(() => {
    const sectionBlocks = sections.map(section => ({
      id: section.id,
      type: 'section',
      section,
      startIndex: getSectionFirstImageIndex(section, imageIndexByFilename)
    }));

    const freeBlocks = unassignedBlocks.map(block => ({
      ...block,
      type: 'unassigned'
    }));

    return [...sectionBlocks, ...freeBlocks]
      .sort((a, b) => (a.startIndex ?? Number.MAX_SAFE_INTEGER) - (b.startIndex ?? Number.MAX_SAFE_INTEGER));
  }, [sections, unassignedBlocks, imageIndexByFilename]);

  const clearChapterDraft = () => {
    setActiveEndFilename('');
    setChangingStartSectionId(null);
    setChapterPanelOpen(false);
    setEditingSectionId(null);
    setChapterDraft({
      sectionTitle: '',
      sectionDescription: '',
      isVisible: true,
      startFilename: '',
      endFilename: ''
    });
  };

  const openCreateChapter = (filename = activeEndFilename) => {
    if (!filename) {
      toast.error('Wähle zuerst das letzte Bild für das Kapitel aus');
      return;
    }

    const block = unassignedBlockByFilename.get(getFilenameKey(filename));
    if (!block) {
      toast.error('Dieses Bild ist bereits einem Kapitel zugeordnet');
      return;
    }

    setActiveEndFilename(filename);
    setEditingSectionId(null);
    setChapterDraft({
      sectionTitle: '',
      sectionDescription: '',
      isVisible: true,
      startFilename: block.startFilename,
      endFilename: filename
    });
    setChapterPanelOpen(true);
  };

  const openEditChapter = (section) => {
    setActiveEndFilename('');
    setEditingSectionId(section.id);
    setChapterDraft({
      sectionTitle: section.sectionTitle,
      sectionDescription: section.sectionDescription || '',
      isVisible: section.isVisible !== false,
      startFilename: section.startFilename || section.imageFilenames[0] || '',
      endFilename: getSectionEndFilename(section)
    });
    setChapterPanelOpen(true);
  };

  const handleImageCardClick = async (filename) => {
    if (!filename) return;

    if (changingStartSectionId) {
      await handleChangeSectionStart(changingStartSectionId, filename);
      return;
    }

    if (!unassignedBlockByFilename.has(getFilenameKey(filename))) {
      return;
    }

    setActiveEndFilename(filename);
  };

  const handleChapterSubmit = async (e) => {
    e.preventDefault();

    const title = chapterDraft.sectionTitle.trim();
    if (!title) {
      toast.error('Chapter title is required');
      return;
    }

    try {
      setIsSaving(true);

      if (editingSectionId) {
        const nextSections = sections.map(section => (
          section.id === editingSectionId
            ? {
                ...section,
                sectionTitle: title,
                sectionDescription: chapterDraft.sectionDescription.trim(),
                isVisible: true
              }
            : section
        ));

        await persistSections(nextSections, 'Chapter updated');
      } else {
        const endFilename = chapterDraft.endFilename || activeEndFilename;
        const block = unassignedBlockByFilename.get(getFilenameKey(endFilename));

        if (!endFilename || !block) {
          toast.error('Das Endbild ist nicht mehr im freien Bereich verfügbar');
          return;
        }

        const endIndexInBlock = block.images.findIndex(image => getFilenameKey(image.filename) === getFilenameKey(endFilename));
        if (endIndexInBlock < 0) {
          toast.error('Das Endbild ist nicht mehr verfügbar');
          return;
        }

        const selectedImages = block.images.slice(0, endIndexInBlock + 1);
        const nextSection = normalizeSectionForSave({
          id: crypto.randomUUID(),
          sectionTitle: title,
          sectionDescription: chapterDraft.sectionDescription.trim(),
          startFilename: selectedImages[0]?.filename || '',
          endFilename,
          coverFilename: selectedImages[0]?.filename || '',
          imageFilenames: selectedImages.map(image => image.filename),
          isVisible: true,
          order: sections.length
        }, sections.length);

        const nextSections = [
          ...sections,
          nextSection
        ];

        await persistSections(nextSections, 'Chapter created');
      }

      setChapterPanelOpen(false);
      setEditingSectionId(null);
      setChapterDraft({
        sectionTitle: '',
        sectionDescription: '',
        isVisible: true,
        startFilename: '',
        endFilename: ''
      });
      setActiveEndFilename('');
    } catch (err) {
      toast.error('Failed to save chapter');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeSectionStart = async (sectionId, startFilename) => {
    try {
      setIsSaving(true);

      const duplicate = sections.find(section => (
        section.id !== sectionId && getFilenameKey(section.startFilename) === getFilenameKey(startFilename)
      ));

      if (duplicate) {
        toast.error('An diesem Bild beginnt bereits ein anderes Kapitel');
        return;
      }

      const nextSections = sections.map(section => (
        section.id === sectionId
          ? {
              ...section,
              startFilename,
              coverFilename: startFilename,
              imageFilenames: section.imageFilenames.includes(startFilename)
                ? section.imageFilenames
                : [startFilename, ...section.imageFilenames.filter(Boolean)]
            }
          : section
      ));

      await persistSections(nextSections, 'Chapter start updated');
      setChangingStartSectionId(null);
      setActiveEndFilename('');
    } catch (err) {
      toast.error('Failed to update chapter start');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveSection = async (sectionId, direction) => {
    const currentIndex = sections.findIndex(section => section.id === sectionId);
    const targetIndex = currentIndex + direction;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= sections.length) {
      return;
    }

    try {
      setIsSaving(true);
      const nextSections = [...sections];
      const [movedSection] = nextSections.splice(currentIndex, 1);
      nextSections.splice(targetIndex, 0, movedSection);
      const reorderedSections = nextSections.map((section, index) => ({ ...section, order: index }));
      await persistSections(reorderedSections, 'Chapter order updated');
    } catch (err) {
      toast.error('Failed to reorder chapter');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      setIsSaving(true);
      const nextSections = sections.filter(section => section.id !== sectionId);
      await persistSections(nextSections, 'Chapter removed');
      if (changingStartSectionId === sectionId) {
        setChangingStartSectionId(null);
      }
    } catch (err) {
      toast.error('Failed to remove chapter');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadComplete = async (newItems) => {
    try {
      setIsUploading(true);

      // Files are already uploaded to PocketBase storage by ImageUploadZone
      // Just merge metadata with existing images and sort
      const combinedImages = naturalSort([...images, ...newItems]);

      await pb.collection('galleries').update(gallery.id, {
        images: combinedImages,
        sections: buildSectionsForSave(sections),
        imageCount: combinedImages.length
      }, { $autoCancel: false });

      toast.success(`${newItems.length} images saved and naturally sorted.`);

      await fetchGallery();
    } catch (err) {
      toast.error('Failed to save uploaded images to gallery');
    } finally {
      setIsUploading(false);
    }
  };

  const measureImageDimensions = (url) => new Promise((resolve) => {
    if (!url) {
      resolve({ width: 0, height: 0 });
      return;
    }

    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = url;
  });

  const handleRepairImageMetadata = async () => {
    const imagesToRepair = images.filter(image => !image.width || !image.height || !image.orientation);

    if (imagesToRepair.length === 0) {
      toast.info('Alle Bildformate sind bereits gespeichert');
      return;
    }

    setIsRepairingMetadata(true);
    try {
      const repairedByFilename = new Map();
      const batchSize = 6;

      for (let index = 0; index < imagesToRepair.length; index += batchSize) {
        const batch = imagesToRepair.slice(index, index + batchSize);
        const results = await Promise.all(batch.map(async (image) => {
          const dimensions = await measureImageDimensions(image.url);
          return {
            ...image,
            width: dimensions.width || image.width || 0,
            height: dimensions.height || image.height || 0,
            orientation: dimensions.width && dimensions.height
              ? detectImageOrientation(dimensions.width, dimensions.height)
              : image.orientation || 'portrait'
          };
        }));

        results.forEach(image => {
          repairedByFilename.set(getFilenameKey(image.filename), image);
        });
      }

      const repairedImages = images.map(image => repairedByFilename.get(getFilenameKey(image.filename)) || image);

      await pb.collection('galleries').update(gallery.id, {
        images: repairedImages,
        sections: buildSectionsForSave(sections),
        imageCount: repairedImages.length
      }, { $autoCancel: false });

      setImages(repairedImages);
      setGallery(prev => ({
        ...prev,
        images: repairedImages,
        imageCount: repairedImages.length
      }));
      toast.success(`${repairedByFilename.size} Bildformat${repairedByFilename.size === 1 ? '' : 'e'} repariert`);
    } catch (err) {
      toast.error('Bildformate konnten nicht repariert werden');
      console.error(err);
    } finally {
      setIsRepairingMetadata(false);
    }
  };

  const handleDeleteConfirm = async () => {
    const idx = deleteModal.index;
    if (idx === null) return;
    
    setIsDeleting(true);

    try {
      const removedImage = images[idx];
      const newImages = images.filter((_, imageIndex) => imageIndex !== idx);
      const removedFilenameKey = getFilenameKey(removedImage?.filename);
      const nextSections = sections
        .map(section => ({
          ...section,
          startFilename: getFilenameKey(section.startFilename) === removedFilenameKey
            ? section.imageFilenames.find(filename => getFilenameKey(filename) !== removedFilenameKey) || ''
            : section.startFilename,
          endFilename: getFilenameKey(section.endFilename) === removedFilenameKey
            ? [...section.imageFilenames].reverse().find(filename => getFilenameKey(filename) !== removedFilenameKey) || ''
            : section.endFilename,
          coverFilename: getFilenameKey(section.coverFilename) === removedFilenameKey
            ? section.imageFilenames.find(filename => getFilenameKey(filename) !== removedFilenameKey) || ''
            : section.coverFilename,
          imageFilenames: section.imageFilenames.filter(filename => getFilenameKey(filename) !== removedFilenameKey)
        }))
        .filter(section => section.startFilename && section.imageFilenames.length > 0);
      const rebuiltSections = nextSections.map(normalizeSectionForSave);
      const nextHeroIndex = heroImageIndex === idx ? null : heroImageIndex > idx ? heroImageIndex - 1 : heroImageIndex;
      const nextCoverIndex = coverImageIndex === idx ? null : coverImageIndex > idx ? coverImageIndex - 1 : coverImageIndex;

      const data = {
        images: newImages,
        sections: buildSectionsForSave(rebuiltSections),
        heroImageIndex: nextHeroIndex,
        coverImageIndex: nextCoverIndex,
        imageCount: newImages.length
      };

      if (removedImage?.filename) {
        data['galleryImages-'] = removedImage.filename;
      }

      await pb.collection('galleries').update(gallery.id, data, { $autoCancel: false });

      setImages(newImages);
      setSections(rebuiltSections);
      setHeroImageIndex(nextHeroIndex);
      setCoverImageIndex(nextCoverIndex);

      toast.success('Image deleted');
      await fetchGallery();
    } catch (err) {
      toast.error('Failed to delete image');
      console.error(err);
    } finally {
      setIsDeleting(false);
      setDeleteModal({ open: false, index: null });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = {
        images: images,
        sections: buildSectionsForSave(sections),
        heroImageIndex: heroImageIndex,
        coverImageIndex: coverImageIndex,
        imageCount: images.length
      };

      await pb.collection('galleries').update(gallery.id, data, { $autoCancel: false });
      toast.success('Gallery layout and images saved successfully');
      await fetchGallery();
    } catch (err) {
      toast.error('Failed to save changes');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAllConfirm = async () => {
    setIsDeletingAll(true);
    try {
      const data = {
        images: [],
        'galleryImages-': images.map(img => img.filename).filter(Boolean),
        sections: getAtelierSections(gallery),
        heroImageIndex: null,
        coverImageIndex: null,
        imageCount: 0
      };

      await pb.collection('galleries').update(gallery.id, data, { $autoCancel: false });
      toast.success('All images deleted successfully');
      setDeleteAllModal(false);
      await fetchGallery();
    } catch (err) {
      toast.error('Failed to delete all images');
      console.error(err);
    } finally {
      setIsDeletingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Loading workspace...</p>
      </div>
    );
  }

  const missingDataImages = images.filter(img => !img.url || !img.filename);
  const missingDataWarning = missingDataImages.length > 0;
  const imagesMissingMetadataCount = images.filter(image => !image.width || !image.height || !image.orientation).length;
  const changingStartSection = sections.find(section => section.id === changingStartSectionId);

  return (
    <>
      <Helmet>
        <title>{`Manage Images | ${gallery?.title}`}</title>
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        <div className="image-manager-header">
          <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/galleries/${id}/edit`)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-editorial font-bold text-foreground">
                  {gallery?.coupleNames}
                </h1>
                <p className="text-sm text-muted-foreground font-minimal">
                  {images.length} images mapped in correct sequence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                variant="outline"
                className="flex-1 sm:flex-none"
                disabled={isUploading}
              >
                Upload More
              </Button>
              {images.length > 0 && (
                <Button
                  onClick={() => setDeleteAllModal(true)}
                  disabled={isUploading || isSaving}
                  variant="outline"
                  className="flex-1 sm:flex-none text-destructive border-destructive hover:bg-destructive/10 transition-all active:scale-[0.98]"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={isSaving || isUploading}
                className="flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98]"
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-8 pt-10">

          {missingDataWarning && (
             <div className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Incomplete Image Data</h4>
                  <p className="text-sm opacity-90">
                    {missingDataImages.length} image(s) missing filename or URL.
                    {missingDataImages.some(img => img.filename) ? ' URL missing for: ' + missingDataImages.filter(img => img.filename).map(img => img.filename).join(', ') : ''}
                    {missingDataImages.some(img => !img.filename) ? ' Some entries have no filename at all.' : ''}
                  </p>
                </div>
             </div>
          )}

          <section className="mb-8 rounded-lg border border-border bg-card/70 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-border">
              <div>
                <h2 className="text-lg font-editorial font-semibold text-foreground">Upload</h2>
                <p className="text-sm text-muted-foreground">
                  Neue Bilder hochladen. Die Kapitel darunter bleiben automatisch in der Reihenfolge der Startbilder.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                {imagesMissingMetadataCount > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRepairImageMetadata}
                    disabled={isUploading || isSaving || isRepairingMetadata}
                    className="sm:w-auto"
                  >
                    {isRepairingMetadata ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Formate reparieren ({imagesMissingMetadataCount})
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUploadExpanded(prev => !prev)}
                  disabled={isUploading}
                  className="sm:w-auto"
                >
                  <UploadCloud className="w-4 h-4 mr-2" />
                  {uploadExpanded ? 'Upload ausblenden' : 'Upload öffnen'}
                </Button>
              </div>
            </div>
            {uploadExpanded && (
              <div className="p-4 sm:p-5">
                <ImageUploadZone
                  galleryId={gallery?.id}
                  onUploadComplete={handleUploadComplete}
                  isUploading={isUploading}
                  setIsUploading={setIsUploading}
                />
              </div>
            )}
          </section>

          {images.length > 0 && (
            <section className="mb-8 rounded-lg border border-border bg-card/70 p-4 sm:p-5 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-editorial font-semibold text-foreground">Kapitel bis hier</h2>
                  <p className="text-sm text-muted-foreground">
                    {changingStartSection
                      ? `Wähle ein neues Startbild für „${changingStartSection.sectionTitle}“.`
                      : 'Erstelle Kapitel direkt im freien Bereich über „Kapitel bis hier“. Nicht zugeordnete Bilder bleiben nur im Admin sichtbar.'}
                  </p>
                </div>
                {changingStartSectionId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearChapterDraft}
                    disabled={isSaving}
                    className="sm:w-auto"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Startpunkt ändern abbrechen
                  </Button>
                )}
              </div>

              {chapterPanelOpen && (
                <form
                  onSubmit={handleChapterSubmit}
                  className="mt-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 items-end rounded-lg border border-border bg-background p-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="chapter-title">Kapitelname</Label>
                    <Input
                      id="chapter-title"
                      value={chapterDraft.sectionTitle}
                      onChange={(e) => setChapterDraft(prev => ({ ...prev, sectionTitle: e.target.value }))}
                      placeholder="Getting Ready"
                      className="h-12"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chapter-description">Beschreibung (optional)</Label>
                    <Textarea
                      id="chapter-description"
                      value={chapterDraft.sectionDescription}
                      onChange={(e) => setChapterDraft(prev => ({ ...prev, sectionDescription: e.target.value }))}
                      placeholder="Optional"
                      className="min-h-12 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={clearChapterDraft} disabled={isSaving}>
                      Abbrechen
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      {editingSectionId ? 'Speichern' : 'Erstellen'}
                    </Button>
                  </div>
                </form>
              )}
            </section>
          )}

          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 px-4 text-center border border-border rounded-xl bg-muted/20">
              <ImageIcon className="w-16 h-16 text-muted-foreground/50 mb-6" />
              <h2 className="text-2xl font-editorial font-semibold text-foreground mb-3">Your gallery canvas is empty</h2>
              <p className="text-muted-foreground max-w-md leading-relaxed">
                Upload your high-resolution wedding gallery images above. Dimensions and orientation are automatically measured.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {managerBlocks.map(block => {
                if (block.type === 'unassigned') {
                  return (
                    <section key={block.id} className="space-y-4">
                      <div className="border-b border-border pb-3">
                        <h2 className="text-xl font-editorial font-semibold text-foreground">Nicht zugeordnet</h2>
                        <p className="text-sm text-muted-foreground">
                          {block.images.length} Bild{block.images.length === 1 ? '' : 'er'} frei. Wähle das letzte Bild für das nächste Kapitel.
                        </p>
                      </div>
                      <div className="image-manager-grid">
                        {block.images.map((img) => {
                          const imageIndex = imageIndexByFilename.get(getFilenameKey(img.filename));

                          return (
                            <ImageGridCard
                              key={img.id || img.filename}
                              image={img}
                              index={imageIndex ?? 0}
                              isHero={heroImageIndex === imageIndex}
                              isCover={coverImageIndex === imageIndex}
                              isActiveStart={false}
                              isChapterStart={false}
                              chapterActionLabel="Bis hier"
                              onCreateChapterFrom={openCreateChapter}
                              onDelete={() => setDeleteModal({ open: true, index: imageIndex })}
                              onSetHero={(i) => setHeroImageIndex(i)}
                              onSetCover={(i) => setCoverImageIndex(i)}
                            />
                          );
                        })}
                      </div>
                    </section>
                  );
                }

                const section = block.section;
                const sectionImages = getImagesForSection(section);
                const sectionIndex = sections.findIndex(item => item.id === section.id);
                const coverImage = sectionImages[0];

                return (
                  <section key={section.id} className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-3">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted border border-border">
                          {coverImage?.thumbUrl || coverImage?.url ? (
                            <img
                              src={coverImage.thumbUrl || coverImage.url}
                              alt={section.sectionTitle}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <ImageIcon className="h-full w-full p-4 text-muted-foreground/40" />
                          )}
                        </div>
                        <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <h2 className="text-xl font-editorial font-semibold text-foreground">{section.sectionTitle}</h2>
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            Start
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {sectionImages.length} Bild{sectionImages.length === 1 ? '' : 'er'}
                          {section.sectionDescription ? ` · ${section.sectionDescription}` : ''}
                        </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => handleMoveSection(section.id, -1)} disabled={isSaving || sectionIndex === 0}>
                          <ChevronUp className="w-4 h-4" />
                          <span className="sr-only">Nach oben</span>
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleMoveSection(section.id, 1)} disabled={isSaving || sectionIndex === sections.length - 1}>
                          <ChevronDown className="w-4 h-4" />
                          <span className="sr-only">Nach unten</span>
                        </Button>
                        <Button
                          type="button"
                          variant={changingStartSectionId === section.id ? 'default' : 'outline'}
                          size="sm"
	                          onClick={() => {
	                            setChangingStartSectionId(prev => prev === section.id ? null : section.id);
	                            setActiveEndFilename('');
	                          }}
                          disabled={isSaving}
                        >
                          <Flag className="w-4 h-4 mr-2" />
                          Startpunkt ändern
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => openEditChapter(section)} disabled={isSaving}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Umbenennen
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleDeleteSection(section.id)} disabled={isSaving} className="text-destructive border-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Löschen
                        </Button>
                      </div>
                    </div>

                    <div className="image-manager-grid">
                      {sectionImages.map((img) => {
                        const imageIndex = imageIndexByFilename.get(getFilenameKey(img.filename));

                        return (
                          <ImageGridCard
                            key={img.id || img.filename}
                            image={img}
                            index={imageIndex ?? 0}
	                            isHero={heroImageIndex === imageIndex}
	                            isCover={coverImageIndex === imageIndex}
	                            isActiveStart={getFilenameKey(activeEndFilename) === getFilenameKey(img.filename)}
	                            isChapterStart={startMarkerFilenames.has(getFilenameKey(img.filename))}
	                            chapterActionLabel="Kapitel"
	                            onSelectStart={changingStartSectionId ? handleImageCardClick : undefined}
	                            onDelete={() => setDeleteModal({ open: true, index: imageIndex })}
	                            onSetHero={(i) => setHeroImageIndex(i)}
	                            onSetCover={(i) => setCoverImageIndex(i)}
                          />
                        );
                      })}
                    </div>
                  </section>
	                );
	              })}
            </div>
          )}

        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        isDeleting={isDeleting}
        imageName={deleteModal.index !== null ? images[deleteModal.index]?.filename : ''}
        onCancel={() => !isDeleting && setDeleteModal({ open: false, index: null })}
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmDeleteModal
        isOpen={deleteAllModal}
        isDeleting={isDeletingAll}
        imageName="ALL images in this gallery"
        onCancel={() => !isDeletingAll && setDeleteAllModal(false)}
        onConfirm={handleDeleteAllConfirm}
      />
    </>
  );
};

export default ImageManager;
