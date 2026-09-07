export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.error(`
      ===============================================================
      CRITICAL WARNING: CLOUDINARY IS NOT CONFIGURED IN .env
      ===============================================================
      You are attempting to upload an image without Cloudinary credentials.
      A temporary 'blob:' URL will be returned for local development, 
      but THIS WILL BREAK IN PRODUCTION AND ON OTHER DEVICES.
      
      To fix this permanently:
      1. Create a Cloudinary account
      2. Add VITE_CLOUDINARY_CLOUD_NAME to .env
      3. Add VITE_CLOUDINARY_UPLOAD_PRESET to .env
      ===============================================================
    `);
    
    // In production, we should probably throw an error to prevent saving blob URLs to the DB.
    if (import.meta.env.PROD) {
      throw new Error("Cloudinary configuration missing. Cannot upload images in production.");
    }
    
    return URL.createObjectURL(file);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.warn("Cloudinary upload error:", error);
    throw error;
  }
};
