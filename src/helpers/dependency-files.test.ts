import { describe, it, expect, vi } from 'vitest';
import { getDependencyFile, getDependencyFileName } from './dependency-files';
import path from 'path';

const mocks = vi.hoisted(() => {
  return {
    readFile: vi.fn(),
    fileExists: vi.fn(),
  };
});

vi.mock('fs/promises', () => {
  return {
    readFile: mocks.readFile,
  };
});

vi.mock('./file-exists', () => {
  return {
    fileExists: mocks.fileExists,
  };
});

describe('getDependencyFile', () => {
  it('should return the contents of package.json for node', async () => {
    const packageJsonContent = JSON.stringify({
      name: 'example',
      version: '1.0.0',
    });
    mocks.readFile.mockResolvedValueOnce(packageJsonContent);
    mocks.fileExists.mockResolvedValue(true);

    const result = await getDependencyFile('', 'ts');
    expect(result).toBe(packageJsonContent);
    expect(mocks.readFile).toHaveBeenCalledWith('package.json', 'utf8');
  });

  it('should return the contents of requirements.txt for python', async () => {
    const requirementsTxtContent = 'example-package==1.0.0';
    mocks.readFile.mockResolvedValueOnce(requirementsTxtContent);
    mocks.fileExists.mockResolvedValue(true);

    const result = await getDependencyFile('', 'py');
    expect(result).toBe(requirementsTxtContent);
    expect(mocks.readFile).toHaveBeenCalledWith('requirements.txt', 'utf8');
  });

  it('should return the contents of Gemfile for ruby', async () => {
    const gemfileContent = "gem 'rails', '5.0.0'";
    mocks.readFile.mockResolvedValueOnce(gemfileContent);
    mocks.fileExists.mockResolvedValue(true);

    const result = await getDependencyFile('', 'rb');
    expect(result).toBe(gemfileContent);
    expect(mocks.readFile).toHaveBeenCalledWith('Gemfile', 'utf8');
  });

  it('should check all three dependency files if no language is provided', async () => {
    mocks.fileExists.mockReset();
    mocks.fileExists.mockResolvedValue(false);

    const result = await getDependencyFile('/src');
    expect(mocks.fileExists).toHaveBeenCalledTimes(3);
    expect(mocks.fileExists).toHaveBeenCalledWith(
      path.join('/src', 'package.json')
    );
    expect(mocks.fileExists).toHaveBeenCalledWith(
      path.join('/src', 'requirements.txt')
    );
    expect(mocks.fileExists).toHaveBeenCalledWith(path.join('/src', 'Gemfile'));
  });

  it('should return null if package.json file does not exist', async () => {
    mocks.fileExists.mockResolvedValue(false);

    await expect(getDependencyFile()).resolves.toBeNull();
  });

  it('should return null if requirements.txt does not exist for python', async () => {
    mocks.fileExists.mockResolvedValue(false);

    await expect(getDependencyFile(process.cwd(), 'py')).resolves.toBeNull();
  });

  it('should return null if Gemfile does not exist for ruby', async () => {
    mocks.fileExists.mockResolvedValue(false);

    await expect(getDependencyFile(process.cwd(), 'rb')).resolves.toBeNull();
  });
});

describe('getDependencyFileName', () => {
  it('should return package.json for node', () => {
    const result = getDependencyFileName();
    expect(result).toBe('package.json');
  });

  it('should return requirements.txt for python', () => {
    const result = getDependencyFileName('py');
    expect(result).toBe('requirements.txt');
  });

  it('should return Gemfile for ruby', () => {
    const result = getDependencyFileName('rb');
    expect(result).toBe('Gemfile');
  });
});
