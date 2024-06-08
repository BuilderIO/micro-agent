import { describe, it, expect, vi } from 'vitest';
import { getDependenciesFileContent } from './interactive-mode';

const mocks = vi.hoisted(() => {
  return {
    readFile: vi.fn(),
  };
});

vi.mock('fs/promises', () => {
  return {
    readFile: mocks.readFile,
  };
});

describe('interactive-mode helpers', () => {
  describe('getDependenciesFileContent', () => {
    it('should return the contents of package.json for node', async () => {
      const packageJsonContent = JSON.stringify({
        name: 'example',
        version: '1.0.0',
      });
      mocks.readFile.mockResolvedValueOnce(packageJsonContent);

      const result = await getDependenciesFileContent();
      expect(result).toBe(packageJsonContent);
    });

    it('should return the contents of requirements.txt for python', async () => {
      const requirementsTxtContent = 'example-package==1.0.0';
      mocks.readFile.mockResolvedValueOnce(requirementsTxtContent);

      const result = await getDependenciesFileContent('py');
      expect(result).toBe(requirementsTxtContent);
    });

    it('should return the contents of Gemfile for ruby', async () => {
      const gemfileContent = "gem 'rails', '5.0.0'";
      mocks.readFile.mockResolvedValueOnce(gemfileContent);

      const result = await getDependenciesFileContent('rb');
      expect(result).toBe(gemfileContent);
    });

    it('should throw an error if package.json does not exist for node', async () => {
      mocks.readFile.mockRejectedValueOnce(new Error('File not found'));

      await expect(getDependenciesFileContent()).rejects.toThrow(
        'File not found'
      );
    });

    it('should throw an error if requirements.txt does not exist for python', async () => {
      mocks.readFile.mockRejectedValueOnce(new Error('File not found'));

      await expect(getDependenciesFileContent('py')).rejects.toThrow(
        'File not found'
      );
    });

    it('should throw an error if Gemfile does not exist for ruby', async () => {
      mocks.readFile.mockRejectedValueOnce(new Error('File not found'));

      await expect(getDependenciesFileContent('rb')).rejects.toThrow(
        'File not found'
      );
    });
  });
});
