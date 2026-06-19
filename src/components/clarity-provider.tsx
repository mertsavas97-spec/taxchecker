'use client';

import Clarity from '@microsoft/clarity';
import { useEffect } from 'react';

const CLARITY_PROJECT_ID = 'x97h98a2i8';

export function ClarityProvider() {
  useEffect(() => {
    Clarity.init(CLARITY_PROJECT_ID);
  }, []);

  return null;
}
