// PublicLayout.js
import React from 'react';
import PublicHeader from './PublicHeader';

const PublicLayout = ({ children }) => {
  return (
    <div>
      <PublicHeader />
      <main className="pt-16">{children}</main> {/* Add padding-top to account for fixed header */}
    </div>
  );
};

export default PublicLayout;