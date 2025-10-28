'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import UsersContent from '../components/UsersContent';

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('all-users');

  return (
    <UsersContent 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
    />
  );
}