
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { GALLERY_TYPES, getGalleryTypeDescription } from '@/utils/galleryTypeConfig.js';

const GalleryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    coupleNames: '',
    date: '',
    location: '',
    password: '',
    driveDownloadUrl: '',
    expirationDate: '',
    isActive: true,
    isFeatured: false,
    galleryType: 'editorial',
    sortOrder: 0,
    imageCount: 0,
    sections: []
  });

  useEffect(() => {
    if (isEdit) {
      fetchGallery();
    }
  }, [id, isEdit]);

  const fetchGallery = async () => {
    try {
      const gallery = await pb.collection('galleries').getOne(id, { $autoCancel: false });
      
      
      if (gallery.images && Array.isArray(gallery.images)) {
        gallery.images.forEach((img, idx) => {
          const missingFields = [];
          if (!img.id) missingFields.push('id');
          if (!img.filename) missingFields.push('filename');
          if (!img.url) missingFields.push('url');
          if (img.width === undefined) missingFields.push('width');
          if (img.height === undefined) missingFields.push('height');
          if (!img.orientation) missingFields.push('orientation');
          if (!img.uploadedAt) missingFields.push('uploadedAt');
          
          if (missingFields.length > 0) {
            console.warn(`GalleryForm - Image at index ${idx} is missing fields:`, missingFields, img);
          }
          
          if (img.url && !img.url.startsWith('/api/files/') && !img.url.includes('http') && !img.url.startsWith('blob:')) {
            console.warn(`GalleryForm - Image at index ${idx} has potentially invalid URL format:`, img.url);
          }
        });
      } else {
      }
      
      const preservedSections = (gallery.sections || [])
        .map((s) => {
          if (!s.isAtelierConfig) {
            return s;
          }

          return {
            id: s.id || crypto.randomUUID(),
            isAtelierConfig: true,
            mastheadText: s.mastheadText || 'ATELIER',
            mainTitle: s.mainTitle || gallery.coupleNames,
            subtitle: s.subtitle || gallery.location,
            editorialText: s.editorialText || '',
            pullQuote: s.pullQuote || '',
            accentLabel: s.accentLabel || 'FINE ART WEDDING',
            showArchive: s.showArchive !== false,
            showCinema: s.showCinema !== false,
            showTypography: s.showTypography || false,
            typographyText: s.typographyText || 'MODERN LOVE',
            typographySubtitle: s.typographySubtitle || ''
          };
        });

      // PocketBase dates come in format "YYYY-MM-DD HH:mm:ss.SSSZ"
      // <input type="date"> requires "YYYY-MM-DD"
      const formattedDate = gallery.date ? gallery.date.substring(0, 10) : '';
      const formattedExpDate = gallery.expirationDate ? gallery.expirationDate.substring(0, 10) : '';

      setFormData({
        slug: gallery.slug || '',
        title: gallery.title || '',
        coupleNames: gallery.coupleNames || '',
        date: formattedDate,
        location: gallery.location || '',
        password: gallery.password || '',
        driveDownloadUrl: gallery.driveDownloadUrl || '',
        expirationDate: formattedExpDate,
        isActive: gallery.isActive,
        isFeatured: gallery.isFeatured || false,
        galleryType: gallery.galleryType || 'editorial',
        sortOrder: gallery.sortOrder || 0,
        imageCount: gallery.imageCount || 0,
        sections: preservedSections
      });
    } catch (err) {
      toast.error('Failed to load gallery');
      navigate('/admin');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAtelierConfigChange = (field, value) => {
    setFormData(prev => {
      const sections = [...prev.sections];
      const configIndex = sections.findIndex(s => s.isAtelierConfig);
      
      if (configIndex >= 0) {
        sections[configIndex] = { ...sections[configIndex], [field]: value };
      } else {
        sections.push({
          id: crypto.randomUUID(),
          isAtelierConfig: true,
          mastheadText: 'ATELIER',
          mainTitle: prev.coupleNames,
          subtitle: prev.location,
          editorialText: '',
          pullQuote: '',
          accentLabel: 'FINE ART WEDDING',
          showArchive: true,
          showCinema: true,
          showTypography: false,
          typographyText: 'MODERN LOVE',
          typographySubtitle: '',
          [field]: value
        });
      }
      return { ...prev, sections };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        coverImage: '',
        heroImage: '',
        sortOrder: parseInt(formData.sortOrder) || 0,
        imageBasePath: '',
        imageCount: parseInt(formData.imageCount) || 0,
        sections: formData.sections
      };

      if (isEdit) {
        await pb.collection('galleries').update(id, data, { $autoCancel: false });
        toast.success('Gallery updated');
      } else {
        await pb.collection('galleries').create(data, { $autoCancel: false });
        toast.success('Gallery created');
      }

      navigate('/admin');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || '';
      const details = err?.response?.data?.data || {};
      let detailText = '';
      if (Object.keys(details).length > 0) {
        detailText = Object.entries(details)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('; ');
      }
      toast.error(`${isEdit ? 'Failed to update' : 'Failed to create'} gallery${detailText ? ' — ' + detailText : message ? ' — ' + message : ''}`);
    } finally {
      setLoading(false);
    }
  };

  const atelierConfig = formData.sections.find(s => s.isAtelierConfig) || {
    mastheadText: 'ATELIER',
    mainTitle: formData.coupleNames,
    subtitle: formData.location,
    editorialText: '',
    pullQuote: '',
    accentLabel: 'FINE ART WEDDING',
    showArchive: true,
    showCinema: true,
    showTypography: false,
    typographyText: 'MODERN LOVE',
    typographySubtitle: ''
  };

  return (
    <>
      <Helmet>
        <title>{isEdit ? 'Edit gallery' : 'Create gallery'}</title>
      </Helmet>

      <div className="min-h-screen bg-background py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to dashboard
            </Button>
            
            {isEdit && (
              <Button 
                onClick={() => navigate(`/admin/galleries/${id}/manage-images`)}
                className="bg-primary text-primary-foreground font-medium"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Manage Images
              </Button>
            )}
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 md:p-10 shadow-sm">
            <h1 className="text-3xl font-editorial font-bold mb-8">{isEdit ? 'Edit gallery' : 'Create gallery'}</h1>

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Basic Info */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold border-b border-border pb-2">Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="slug">Gallery code (slug)</Label>
                    <Input id="slug" value={formData.slug} onChange={(e) => handleChange('slug', e.target.value.toLowerCase())} required placeholder="mueller-schmidt" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} required placeholder="Tuscany Wedding" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coupleNames">Couple names</Label>
                  <Input id="coupleNames" value={formData.coupleNames} onChange={(e) => handleChange('coupleNames', e.target.value)} required placeholder="Emma & Lucas" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date">Wedding date</Label>
                    <Input id="date" type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={formData.location} onChange={(e) => handleChange('location', e.target.value)} required placeholder="Tuscany, Italy" />
                  </div>
                </div>
              </div>

              {/* Presentation & Theming */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold border-b border-border pb-2">Presentation & Theming</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="galleryType">Gallery Type</Label>
                    <Select value={formData.galleryType} onValueChange={(val) => handleChange('galleryType', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {GALLERY_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getGalleryTypeDescription(formData.galleryType)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">Sort Order (lower is first)</Label>
                    <Input id="sortOrder" type="number" value={formData.sortOrder} onChange={(e) => handleChange('sortOrder', e.target.value)} />
                  </div>
                </div>
                
                {/* Atelier Editorial Conditional Config */}
                {formData.galleryType === 'atelier-editorial' && (
                  <div className="p-6 border border-border bg-muted/30 rounded-xl space-y-6 mt-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[hsl(var(--atelier-accent))]"></span>
                      Atelier Editorial Configuration
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Masthead Text (Huge transparent text)</Label>
                        <Input value={atelierConfig.mastheadText} onChange={(e) => handleAtelierConfigChange('mastheadText', e.target.value)} placeholder="ATELIER" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Main Title Overlay</Label>
                        <Input value={atelierConfig.mainTitle} onChange={(e) => handleAtelierConfigChange('mainTitle', e.target.value)} placeholder="Couple Names" />
                      </div>
                      <div className="space-y-2">
                        <Label>Subtitle Overlay</Label>
                        <Input value={atelierConfig.subtitle} onChange={(e) => handleAtelierConfigChange('subtitle', e.target.value)} placeholder="Location or date" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Red Accent Label (Bottom right)</Label>
                      <Input value={atelierConfig.accentLabel} onChange={(e) => handleAtelierConfigChange('accentLabel', e.target.value)} placeholder="FINE ART WEDDING" />
                    </div>

                    <div className="space-y-2">
                      <Label>Editorial Text Block (Optional)</Label>
                      <Textarea value={atelierConfig.editorialText} onChange={(e) => handleAtelierConfigChange('editorialText', e.target.value)} placeholder="A brief narrative about the day..." className="min-h-[100px]" />
                    </div>

                    <div className="space-y-2">
                      <Label>Pull Quote (Optional)</Label>
                      <Textarea value={atelierConfig.pullQuote} onChange={(e) => handleAtelierConfigChange('pullQuote', e.target.value)} placeholder="Love is not about possession..." />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-3">
                        <Switch checked={atelierConfig.showCinema} onCheckedChange={(c) => handleAtelierConfigChange('showCinema', c)} />
                        <Label>Show Cinema Section</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch checked={atelierConfig.showArchive} onCheckedChange={(c) => handleAtelierConfigChange('showArchive', c)} />
                        <Label>Show Archive Grid</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch checked={atelierConfig.showTypography} onCheckedChange={(c) => handleAtelierConfigChange('showTypography', c)} />
                        <Label>Show Big Typography</Label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Access & External Links */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold border-b border-border pb-2 flex justify-between items-center">
                  Access & Links
                  {isEdit && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/admin/galleries/${id}/manage-images`)}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Manage Images Space
                    </Button>
                  )}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password">Gallery password</Label>
                    <Input id="password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} required placeholder="Enter password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expirationDate">Expiration date</Label>
                    <Input id="expirationDate" type="date" value={formData.expirationDate} onChange={(e) => handleChange('expirationDate', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driveDownloadUrl">Google Drive download URL</Label>
                  <Input id="driveDownloadUrl" value={formData.driveDownloadUrl} onChange={(e) => handleChange('driveDownloadUrl', e.target.value)} placeholder="https://drive.google.com/..." />
                </div>
              </div>

              {/* Visibility */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold border-b border-border pb-2">Visibility</h2>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Switch id="isActive" checked={formData.isActive} onCheckedChange={(checked) => handleChange('isActive', checked)} />
                    <Label htmlFor="isActive" className="cursor-pointer font-medium">Gallery is active (visible to clients)</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch id="isFeatured" checked={formData.isFeatured} onCheckedChange={(checked) => handleChange('isFeatured', checked)} />
                    <Label htmlFor="isFeatured" className="cursor-pointer font-medium">Featured gallery (shows on homepage)</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-8 border-t border-border">
                <Button type="submit" disabled={loading} className="flex-1 h-14 text-lg">
                  {loading ? 'Saving...' : (isEdit ? 'Update gallery' : 'Create gallery')}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/admin')} className="h-14 px-8 text-lg">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default GalleryForm;
