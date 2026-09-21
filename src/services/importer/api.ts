import { Product } from '../../types';

export const extractProductData = async (url: string): Promise<any> => {
  try {
    const response = await fetch('/api/importer/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      let errorMessage = `Server returned ${response.status} ${response.statusText}`;
      try {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // It's not JSON, probably an HTML error page (like 504 Gateway Timeout)
          console.error("Non-JSON error response:", text.substring(0, 200));
          if (response.status === 504) errorMessage = "Request timed out. The product page might be too large.";
          else if (response.status === 502) errorMessage = "Bad Gateway. The server might be restarting.";
        }
      } catch (e) {
        // ignore
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in extractProductData:', error);
    throw error;
  }
};

export const uploadRemoteImageToCloudinary = async (imageUrl: string, cloudName: string, uploadPreset: string): Promise<string> => {
  try {
    // 1. Try our server-side smart upload route which proxies and buffers image data to bypass 403 bot blocks
    try {
      const response = await fetch('/api/importer/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, cloudName, uploadPreset }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.secure_url) {
          return data.secure_url;
        }
      }
    } catch (serverErr) {
      console.warn('[Importer] Server image upload route attempt failed, trying direct upload:', serverErr);
    }

    // 2. Direct client fallback attempt
    const formData = new FormData();
    formData.append('file', imageUrl);
    formData.append('upload_preset', uploadPreset);

    const directResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (directResponse.ok) {
      const data = await directResponse.json();
      if (data && data.secure_url) {
        return data.secure_url;
      }
    }

    // 3. Graceful fallback: return original imageUrl rather than throwing an error
    console.warn(`[Cloudinary] Remote upload could not process ${imageUrl}. Retaining original image URL.`);
    return imageUrl;
  } catch (error) {
    console.warn('[Cloudinary] Upload exception, retaining original URL:', error);
    return imageUrl;
  }
};
