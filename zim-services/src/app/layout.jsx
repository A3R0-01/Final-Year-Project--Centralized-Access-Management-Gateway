// src/components/layout/Layout.js
import React from 'react';

const Layout = ({ children }) => {
  return (
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
    </head>
    <body>
    <div>
      <header className="bg-gray-800 text-white py-4">
        <div className="container mx-auto">
          {/* You can add a navigation bar here if needed */}
          <h1 className="text-2xl font-bold">
            Centralized Gateway for Access Management
          </h1>
        </div>
      </header>
      <main className="container mx-auto py-8">{children}</main>
      <footer className="bg-gray-800 text-white text-center py-4">
        <p>&copy; {new Date().getFullYear()} Centralized Gateway</p>
      </footer>
    </div>  
    </body>
    </html>
    
  );
};

export default Layout;