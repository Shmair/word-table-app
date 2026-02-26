
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
            className="image-action-btn"
            onClick={handleRotate}
            style={{
                background: 'rgba(255,255,255,0.95)',
                color: '#2563eb',
                border: 'none',
                borderRadius: '8px',
                padding: 0,
                width: '28px',
                height: '28px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            title="Rotate Image"
        >
            <svg 
                viewBox="0 0 24 24" 
                width="20" 
                height="20" 
                stroke="#1E90FF" 
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
