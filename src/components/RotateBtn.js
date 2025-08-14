import React from 'react';

const RotateBtn = ({ imageUrl, onRotateComplete }) => {
    const handleRotate = () => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size to fit rotated image
            canvas.width = img.height;
            canvas.height = img.width;
            
            // Move to center, rotate, and draw
            ctx.translate(canvas.width/2, canvas.height/2);
            ctx.rotate(Math.PI/2); // Rotate 90 degrees
            ctx.drawImage(img, -img.width/2, -img.height/2);
            
            // Convert to base64
            try {
                // Preserve original format if it's base64
                let mimeType = 'image/jpeg';
                if (imageUrl.startsWith('data:')) {
                    mimeType = imageUrl.split(';')[0].split(':')[1];
                }
                
                const base64Image = canvas.toDataURL(mimeType, 1.0);
                onRotateComplete(base64Image);
            } catch (e) {
                console.error('Error during rotation:', e);
                const base64Image = canvas.toDataURL('image/jpeg', 1.0);
                onRotateComplete(base64Image);
            }
        };
        
        img.src = imageUrl;
    };

    return (
        <button
            onClick={handleRotate}
            style={{
                position: 'absolute',
                top: '5px',
                right: '65px', // Position it to the left of the crop button
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
            title="Rotate Image"
        >
            <svg 
                viewBox="0 0 24 24" 
                width="20" 
                height="20" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none"
            >
                <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
            </svg>
        </button>
    );
};

export default RotateBtn;
