# Word Table App

## Overview
The Word Table App is a simple React application that allows users to upload files or pictures and decide whether to place them in a green table or a red table. The application is structured to provide a clear separation of components, making it easy to manage and extend.

## Project Structure
```
word-table-app
├── src
│   ├── App.js                # Main entry point of the application
│   ├── components
│   │   ├── GreenTable.js      # Component for rendering the green table
│   │   ├── RedTable.js       # Component for rendering the red table
│   │   └── FileUpload.js     # Component for handling file uploads
│   └── utils
│       └── tableUtils.js     # Utility functions for managing tables
├── public
│   └── index.html            # Main HTML file for the application
├── package.json              # Configuration file for npm
└── README.md                 # Documentation for the project
```

## Features
- **File Upload**: Users can upload files or images.
- **Dynamic Table Management**: Depending on the user's choice, uploaded content can be placed in either the green or red table.
- **Reusable Components**: The application is built using reusable React components for better maintainability.

## Getting Started
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd word-table-app
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the application:
   ```
   npm start
   ```

## Usage
- Upon starting the application, users will see the green and red tables.
- Use the file upload component to select a file or image.
- Choose the desired table for the uploaded content.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License.