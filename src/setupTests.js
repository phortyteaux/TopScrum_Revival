// src/setupTests.js

import { expect, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

// Extend Vitest's expect with all of jest-dom's matchers
expect.extend(matchers);

// Clean up the DOM after each test to avoid test interference
afterEach(() => {
  cleanup();
});
