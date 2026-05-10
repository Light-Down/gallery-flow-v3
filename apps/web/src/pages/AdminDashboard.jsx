
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Eye, Copy, Trash2, LogOut, Star } from 'lucide-react';
import { toast } from 'sonner';
import DeleteGalleryModal from '@/components/DeleteGalleryModal.jsx';
import { getVisibleSections, getGalleryCoverImageUrl } from '@/utils/galleryHelpers.js';
import { GALLERY_TYPES, getGalleryTypeLabel, getGalleryTypeDescription } from '@/utils/galleryTypeConfig.js';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, gallery: null });

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const records = await pb.collection('galleries').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setGalleries(records);
    } catch (err) {
      toast.error('Failed to load galleries');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (gallery) => {
    try {
      await pb.collection('galleries').update(gallery.id, {
        isActive: !gallery.isActive
      }, { $autoCancel: false });

      setGalleries(galleries.map(g =>
        g.id === gallery.id ? { ...g, isActive: !g.isActive } : g
      ));

      toast.success(gallery.isActive ? 'Gallery deactivated' : 'Gallery activated');
    } catch (err) {
      toast.error('Failed to update gallery');
    }
  };

  const toggleFeatured = async (gallery) => {
    try {
      await pb.collection('galleries').update(gallery.id, {
        isFeatured: !gallery.isFeatured
      }, { $autoCancel: false });

      setGalleries(galleries.map(g =>
        g.id === gallery.id ? { ...g, isFeatured: !g.isFeatured } : g
      ));

      toast.success(gallery.isFeatured ? 'Removed from featured' : 'Marked as featured');
    } catch (err) {
      toast.error('Failed to update featured status');
    }
  };

  const updateGalleryType = async (gallery, newType) => {
    try {
      await pb.collection('galleries').update(gallery.id, {
        galleryType: newType
      }, { $autoCancel: false });

      setGalleries(galleries.map(g =>
        g.id === gallery.id ? { ...g, galleryType: newType } : g
      ));

      toast.success('Gallery type updated');
    } catch (err) {
      toast.error('Failed to update gallery type');
    }
  };

  const copyLink = (slug) => {
    const url = `${window.location.origin}/gallery/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Gallery link copied to clipboard');
  };

  const handleDelete = async () => {
    if (!deleteModal.gallery) return;

    try {
      await pb.collection('galleries').delete(deleteModal.gallery.id, { $autoCancel: false });
      setGalleries(galleries.filter(g => g.id !== deleteModal.gallery.id));
      toast.success('Gallery deleted');
      setDeleteModal({ open: false, gallery: null });
    } catch (err) {
      toast.error('Failed to delete gallery');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin dashboard</title>
        <meta name="description" content="Manage wedding photography galleries" />
      </Helmet>

      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-editorial font-bold mb-2 text-foreground">Gallery dashboard</h1>
              <p className="text-muted-foreground">{galleries.length} {galleries.length === 1 ? 'gallery' : 'galleries'}</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/admin/galleries/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create gallery
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {galleries.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">No galleries yet</h2>
              <p className="text-muted-foreground mb-8">Create your first wedding gallery to get started</p>
              <Button onClick={() => navigate('/admin/galleries/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create gallery
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {galleries.map((gallery) => {
                const visibleSections = getVisibleSections(gallery);
                const sectionNames = visibleSections.map(s => s.sectionTitle || s.name).join(', ');
                const coverImageUrl = getGalleryCoverImageUrl(gallery);

                return (
                  <div key={gallery.id} className="bg-card rounded-xl border border-border p-6 transition-all duration-200 hover:shadow-md">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      
                      <div className="flex items-start gap-4 flex-1">
                        {coverImageUrl ? (
                          <img src={coverImageUrl} alt="" className="w-20 h-20 rounded-lg object-cover hidden sm:block shrink-0" />
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-muted hidden sm:block shrink-0"></div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-editorial font-bold text-card-foreground">{gallery.coupleNames}</h3>
                            {gallery.isFeatured && (
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                <Star className="w-3 h-3 mr-1 fill-amber-800" /> Featured
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                            <span>{format(new Date(gallery.date), 'MMM d, yyyy')}</span>
                            <span>•</span>
                            <span>{gallery.location}</span>
                            <span>•</span>
                            <span>{gallery.imageCount} photos</span>
                            {visibleSections.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[200px]" title={sectionNames}>
                                  {visibleSections.length} sections
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize bg-secondary/30">
                                {getGalleryTypeLabel(gallery.galleryType)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">Slug: {gallery.slug}</span>
                            </div>
                            <p className="text-xs text-muted-foreground ml-1">
                              {getGalleryTypeDescription(gallery.galleryType)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                        <div className="flex items-center gap-2">
                          <Select 
                            value={gallery.galleryType || 'editorial'} 
                            onValueChange={(val) => updateGalleryType(gallery, val)}
                          >
                            <SelectTrigger className="w-[180px] h-9">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {GALLERY_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center gap-4 border-l border-border pl-4 lg:pl-6">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={gallery.isFeatured}
                              onCheckedChange={() => toggleFeatured(gallery)}
                              id={`featured-${gallery.id}`}
                            />
                            <label htmlFor={`featured-${gallery.id}`} className="text-sm cursor-pointer font-medium">Featured</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={gallery.isActive}
                              onCheckedChange={() => toggleActive(gallery)}
                              id={`active-${gallery.id}`}
                            />
                            <label htmlFor={`active-${gallery.id}`} className="text-sm cursor-pointer font-medium">Active</label>
                          </div>
                        </div>

                        <div className="flex gap-2 border-l border-border pl-4 lg:pl-6">
                          <Button variant="outline" size="icon" onClick={() => navigate(`/admin/galleries/${gallery.id}/edit`)} title="Edit Gallery">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => window.open(`/gallery/${gallery.slug}`, '_blank')} title="Preview Gallery">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => copyLink(gallery.slug)} title="Copy Link">
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => setDeleteModal({ open: true, gallery })} title="Delete Gallery" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <DeleteGalleryModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, gallery: null })}
        onConfirm={handleDelete}
        galleryTitle={deleteModal.gallery?.coupleNames || ''}
      />
    </>
  );
};

export default AdminDashboard;
