// Layout.js
import React from 'react';
import Header from './Header';  // Import your Header component

const Layout = ({ children }) => {
  return (
    <div>
      <Header />
      <main>{children}</main> {/* The page content will be rendered here */}
    </div>
  );
};

export default Layout;
