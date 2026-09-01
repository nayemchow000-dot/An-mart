import { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedBlobUrl: string) => void;
  aspect?: number;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export default function ImageCropperModal({ isOpen, onClose, imageUrl, onCropComplete, aspect = 16 / 9 }: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  if (!isOpen) return null;

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  };

  const handleSave = async () => {
    if (imgRef.current && completedCrop?.width && completedCrop?.height) {
      const canvas = document.createElement('canvas');
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height,
      );

      // Extract as blob and create URL
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Canvas is empty');
          return;
        }
        const blobUrl = URL.createObjectURL(blob);
        onCropComplete(blobUrl);
        onClose();
      }, 'image/jpeg', 0.95);
    } else {
      // If no crop, just return the original URL
      onCropComplete(imageUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] rounded-xl border border-[#333] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-[#333]">
          <h3 className="text-lg font-medium text-white">Crop Image</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-[#0a0a0a]">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            className="max-h-full max-w-full"
          >
            <img
              ref={imgRef}
              alt="Crop preview"
              src={imageUrl}
              onLoad={onImageLoad}
              className="max-h-[60vh] w-auto object-contain"
            />
          </ReactCrop>
        </div>

        <div className="p-4 border-t border-[#333] flex justify-end gap-3 bg-[#1a1a1a]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-sm text-gray-300 hover:bg-[#333] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded text-sm font-medium bg-[#c2a578] text-[#121212] hover:bg-[#d4b78a] transition-colors flex items-center gap-2"
          >
            <Check size={16} /> Save & Upload
          </button>
        </div>
      </div>
    </div>
  );
}
