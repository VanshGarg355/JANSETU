import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import FamilyDocumentsVault from '../components/FamilyDocumentsVault';

export default function DocumentsPage() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const isHindi = i18n.language === 'hi';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <FamilyDocumentsVault isHindi={isHindi} currentUser={user} />
    </div>
  );
}
