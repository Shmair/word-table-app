import React, { useState } from 'react';
import BlueTable from './components/BlueTable';
import RedTable from './components/RedTable';
import FileUpload from './components/FileUpload';

const App = () => {
    const [blueTableData, setBlueTableData] = useState([]);
    const [redTableData, setRedTableData] = useState([]);

    const handleFileUpload = (file, tableType) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const imageUrl = e.target.result;
        if (tableType === 'blue') {
            setBlueTableData(prevData => [...prevData, imageUrl]);
        } else if (tableType === 'red') {
            setRedTableData(prevData => [...prevData, imageUrl]);
        }
    };
    reader.readAsDataURL(file);
};

    return (
        <div>
            <h1>Word Table App</h1>
            <FileUpload 
                onFileUpload={handleFileUpload}
                blueTableData={blueTableData}
                redTableData={redTableData}
            />
            <BlueTable data={blueTableData} />
            <RedTable data={redTableData} />
        </div>
    );
};

export default App;