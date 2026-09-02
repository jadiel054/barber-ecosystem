import request from 'supertest';
import { app } from '../src/index';
import { isValidCNPJ, sanitizeCNPJ, formatCNPJ } from '../src/utils/cnpj';

describe('CNPJ Utility & Endpoint Tests', () => {
  describe('isValidCNPJ', () => {
    it('should validate standard real Brazilian CNPJs', () => {
      expect(isValidCNPJ('00.000.000/0001-91')).toBe(true);
      expect(isValidCNPJ('33000167000101')).toBe(true);
    });

    it('should reject invalid CNPJs with wrong digits or repetitive numbers', () => {
      expect(isValidCNPJ('00000000000000')).toBe(false);
      expect(isValidCNPJ('11111111111111')).toBe(false);
      expect(isValidCNPJ('12345678000199')).toBe(false);
      expect(isValidCNPJ('123')).toBe(false);
    });

    it('should sanitize and format CNPJs correctly', () => {
      expect(sanitizeCNPJ('00.000.000/0001-91')).toBe('00000000000191');
      expect(formatCNPJ('00000000000191')).toBe('00.000.000/0001-91');
    });
  });

  describe('GET /api/cnpj/:cnpj', () => {
    it('should return 400 Bad Request for invalid CNPJ digits', async () => {
      const res = await request(app).get('/api/cnpj/11111111111111');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('CNPJ inválido');
    });
  });
});
