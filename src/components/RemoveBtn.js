const RemoveBtn = ({ onClick }) => {
    return (
        <button 
            className="image-action-btn"
            onClick={onClick}
            style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                cursor: 'pointer',
                fontSize: '16px',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            ×
        </button>
    );
};

export default RemoveBtn;