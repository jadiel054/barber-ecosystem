import { describe, it, expect } from 'vitest';
import { createApp } from '../../../app';

const app = createApp();

describe('Auth Router', () => {
  it('should initialize express application correctly', () => {
    expect(app).toBeDefined();
  });
});
