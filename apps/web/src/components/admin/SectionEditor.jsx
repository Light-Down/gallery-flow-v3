
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, ArrowUp, ArrowDown, Plus, AlertCircle } from 'lucide-react';
import { validateSectionRanges, calculateSectionImageCount } from '@/utils/galleryHelpers.js';

const SectionEditor = ({ sections = [], onChange, imageCount }) => {
  const moveSection = (index, direction) => {
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + direction];
    newSections[index + direction] = temp;
    newSections.forEach((s, i) => s.order = i);
    onChange(newSections);
  };

  const updateSection = (index, field, value) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    onChange(newSections);
  };

  const addSection = () => {
    const lastSection = sections[sections.length - 1];
    const newStart = lastSection ? parseInt(lastSection.endImageIndex ?? lastSection.endImage ?? 0) + 1 : 0;
    const newSection = {
      id: crypto.randomUUID(),
      sectionTitle: '',
      startImageIndex: newStart,
      endImageIndex: newStart + 9,
      sectionDescription: '',
      isVisible: true,
      order: sections.length
    };
    onChange([...sections, newSection]);
  };

  const removeSection = (index) => {
    const newSections = sections.filter((_, i) => i !== index);
    newSections.forEach((s, i) => s.order = i);
    onChange(newSections);
  };

  const validationErrors = validateSectionRanges(sections, imageCount);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 gap-4 border-b border-border pb-4">
        <div>
          <h3 className="text-xl font-editorial font-bold text-foreground">Story Chapters</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Map out the narrative arc across your <strong className="text-foreground">{imageCount || 0} total images</strong>.
          </p>
        </div>
        <Button type="button" onClick={addSection} size="sm" variant="default" className="shrink-0 transition-all active:scale-[0.98]">
          <Plus className="w-4 h-4 mr-2" /> Add Chapter
        </Button>
      </div>

      {validationErrors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex flex-col gap-3 mb-6 shadow-sm">
          <div className="font-semibold flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Mapping Errors Detected</div>
          <ul className="space-y-1 pl-6 list-disc text-sm">
            {validationErrors.map((err, i) => (
              <li key={i} className="opacity-90">{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-6">
        {sections.length === 0 && (
           <div className="text-center py-10 bg-muted/30 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">No sections mapped yet. Your gallery will load as one continuous grid.</p>
           </div>
        )}
        
        {sections.map((section, index) => {
          const count = calculateSectionImageCount(section);
          const title = section.sectionTitle || section.name || '';
          const start = section.startImageIndex ?? section.startImage ?? 0;
          const end = section.endImageIndex ?? section.endImage ?? 0;
          const desc = section.sectionDescription || '';
          
          return (
            <div key={section.id || index} className="bg-card border border-border rounded-xl p-5 md:p-6 flex flex-col gap-5 shadow-sm transition-all hover:border-primary/30 group">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-editorial font-bold text-card-foreground text-xl">
                      {title || 'Untitled Chapter'}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium mt-0.5">
                      Covers Images {start} – {end} ({count} total)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-background/50 p-1.5 rounded-lg border border-border/50 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                  <Button type="button" variant="ghost" size="icon" onClick={() => moveSection(index, -1)} disabled={index === 0} className="h-8 w-8 hover:bg-muted">
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1} className="h-8 w-8 hover:bg-muted">
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-4 bg-border mx-1" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSection(index)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start bg-background/50 p-5 rounded-xl border border-border/40">
                <div className="md:col-span-5 space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Section Title</Label>
                  <Input 
                    value={title} 
                    onChange={(e) => updateSection(index, 'sectionTitle', e.target.value)} 
                    placeholder="e.g. The First Look"
                    className="bg-card border-border/60 focus-visible:border-primary"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Start Index</Label>
                  <Input 
                    type="number" 
                    value={start} 
                    onChange={(e) => updateSection(index, 'startImageIndex', parseInt(e.target.value) || 0)} 
                    min="0"
                    className="bg-card border-border/60 focus-visible:border-primary font-mono text-center"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">End Index</Label>
                  <Input 
                    type="number" 
                    value={end} 
                    onChange={(e) => updateSection(index, 'endImageIndex', parseInt(e.target.value) || 0)} 
                    min="0"
                    className="bg-card border-border/60 focus-visible:border-primary font-mono text-center"
                  />
                </div>
                <div className="md:col-span-3 space-y-2 flex flex-col justify-center h-full pt-[22px]">
                  <div className="flex items-center gap-3 justify-end sm:justify-start">
                    <Switch 
                      checked={section.isVisible !== false} 
                      onCheckedChange={(checked) => updateSection(index, 'isVisible', checked)} 
                    />
                    <Label className="cursor-pointer text-sm font-medium">Visible to Client</Label>
                  </div>
                </div>
                <div className="md:col-span-12 space-y-2 mt-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description (Optional)</Label>
                  <Input 
                    value={desc} 
                    onChange={(e) => updateSection(index, 'sectionDescription', e.target.value)} 
                    placeholder="A brief description of this chapter to set the mood..."
                    className="bg-card border-border/60 focus-visible:border-primary"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SectionEditor;
