import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function UserLayout() {
  return (
    <div className="app-shell d-flex">
      <Sidebar />
      <main className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0, padding: '1.25rem' }}>
        <Header />
        <Outlet />
      </main>
    </div>
  );
}
