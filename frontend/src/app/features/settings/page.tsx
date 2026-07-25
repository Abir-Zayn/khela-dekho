import React from 'react';
import { getCurrentUser } from '../auth';
import SettingsRoot from './root';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  return <SettingsRoot user={user} />;
}
