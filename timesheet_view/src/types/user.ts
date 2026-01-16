// ユーザー関連の型定義

import type { ReactNode } from 'react';
import type { TestUser } from '../testdata/users';

export type { TestUser };

export type UserSortingOption = {
  value: string;
  label: string | ReactNode;
};

export type ResourceSelection = {
  id: string;
  number?: string;
  name?: string;
};

