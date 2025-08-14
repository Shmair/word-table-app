const RemoveBtn = ({ onClick }) => {
    return (
        <button 
            onClick={onClick}
            style={{
                position: 'relative',
                top: '5px',
                right: '5px',
                background: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer'
            }}
        >
            ×
        </button>
    );
};

export default RemoveBtn;