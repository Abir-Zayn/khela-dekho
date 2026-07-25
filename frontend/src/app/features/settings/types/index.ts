import type { AuthUser } from '../../auth/types';

export type SettingsTab = 'account' | 'publishing' | 'notifications';

export interface ProfileListTileProps {
  title: string;
  description?: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  isDanger?: boolean;
}

export interface SettingsViewProps {
  user: AuthUser | null;
}
