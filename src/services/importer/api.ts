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
    // Cloudinary's unsigned upload endpoint supports passing a remote URL as the 'file' parameter.
    const formData = new FormData();
    formData.append('file', imageUrl);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Cloudinary upload failed for remote URL');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading remote image to Cloudinary:', error);
    throw error;
  }
};
