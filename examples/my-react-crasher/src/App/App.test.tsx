import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App, { loadUserSettings } from './App';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('<App />', () => {
  it('should render title in h1 tag', () => {
    render(<App />);
    screen.getByText('Welcome to my-react-crasher');
  });

  it('should hand the "Crash with cause" error to the ErrorBoundary', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Crash with cause/ }));

    screen.getByRole('button', { name: 'Reset' });
  });
});

describe('loadUserSettings', () => {
  it('should throw an Error whose cause is the SyntaxError from JSON.parse', () => {
    let thrown: unknown;
    try {
      loadUserSettings();
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).toBe('Failed to load user settings');
    expect((thrown as Error).cause).toBeInstanceOf(SyntaxError);
  });
});
