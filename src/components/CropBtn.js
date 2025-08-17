import { useRef, useState } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const CropBtn = ({ imageUrl, onCropComplete }) => {
    const [showCropModal, setShowCropModal] = useState(false);
    const [crop, setCrop] = useState({
        unit: '%',
        width: 90,
        aspect: 1
    });
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);

    const handleCropComplete = (crop) => {
        setCompletedCrop(crop);
    };

    const handleSaveCrop = async () => {
        if (!imgRef.current || !completedCrop?.width || !completedCrop?.height) {
            return;
        }

        const canvas = document.createElement('canvas');
        const image = imgRef.current;
        
        // Get the original image dimensions
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        
        // Use maximum dimensions to maintain quality
        const targetWidth = completedCrop.width * scaleX;
        const targetHeight = completedCrop.height * scaleY;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        
        // Enable image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw the cropped portion
        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            targetWidth,
            targetHeight
        );

        // Convert to base64
        try {
            // First try to get the original format
            let mimeType = 'image/jpeg';
            if (imageUrl.startsWith('data:')) {
                mimeType = imageUrl.split(';')[0].split(':')[1];
            }
            
            let base64Image;
            
            // If the original URL is already base64, try to preserve its format
            if (imageUrl.startsWith('data:')) {
                base64Image = canvas.toDataURL(mimeType, 1.0);
            } else {
                // Convert the image to base64 and ensure proper formatting
                base64Image = canvas.toDataURL('image/jpeg', 1.0);
            }

            // Ensure the base64 string starts with proper header if missing
            if (!base64Image.startsWith('data:')) {
                base64Image = 'data:image/jpeg;base64,' + base64Image;
            }
            
            onCropComplete(base64Image);
            setShowCropModal(false);
        } catch (e) {
            console.error('Error during crop:', e);
            // Fallback to JPEG with proper base64 header
            const base64Image = 'data:image/jpeg;base64,' + canvas.toDataURL('image/jpeg', 1.0).split(',')[1];
            onCropComplete(base64Image);
            setShowCropModal(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowCropModal(true)}
                style={{
                    position: 'absolute',
                    top: '5px',
                    right: '35px',
                    background: 'transparent',
                    color: '#4CAF50',
                    border: 'none',
                    padding: 0,
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    transition: 'transform 0.2s ease',
                    ':hover': {
                        transform: 'scale(1.1)'
                    }
                }}
                title="Crop Image"
            >
                <svg 
                    viewBox="0 0 24 24" 
                    width="20" 
                    height="20" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    fill="none"
                >
                    <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
                    <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
                </svg>
            </button>

            {showCropModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                        zIndex: 10000
                    }}>
                        <ReactCrop
                            crop={crop}
                            onChange={c => setCrop(c)}
                            onComplete={handleCropComplete}
                        >
                            <img 
                                ref={imgRef}
                                src={imageUrl}
                                alt="Crop preview" 
                                style={{ maxWidth: '100%', maxHeight: '70vh' }}
                                crossOrigin="anonymous"
                                onLoad={(e) => {
                                    // Force a redraw to ensure proper display
                                    const img = e.target;
                                    img.style.display = 'none';
                                    // Use void operator to properly handle the expression
                                    void img.offsetHeight; // Force reflow
                                    img.style.display = 'block';
                                }}
                            />
                        </ReactCrop>
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <button 
                                onClick={handleSaveCrop}
                                style={{
                                    marginRight: '10px',
                                    padding: '8px 16px',
                                    background: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                שמור
                            </button>
                            <button 
                                onClick={() => setShowCropModal(false)}
                                style={{
                                    padding: '8px 16px',
                                    background: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                ביטול
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CropBtn;