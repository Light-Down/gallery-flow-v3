
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Facebook, Twitter, Mail } from 'lucide-react';
import { toast } from 'sonner';

const ShareModal = ({ isOpen, onClose, url, title }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Check out ${title}`)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`View the gallery here: ${url}`)}`
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-editorial text-2xl">Share Gallery</DialogTitle>
          <DialogDescription>
            Share this beautiful collection with friends and family.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 mt-4">
          <div className="grid flex-1 gap-2">
            <Input
              readOnly
              value={url}
              className="text-muted-foreground bg-muted/50"
            />
          </div>
          <Button size="icon" onClick={handleCopy} className="shrink-0">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-border">
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => window.open(shareLinks.facebook, '_blank')}>
            <Facebook className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => window.open(shareLinks.twitter, '_blank')}>
            <Twitter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => window.open(shareLinks.email, '_blank')}>
            <Mail className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
