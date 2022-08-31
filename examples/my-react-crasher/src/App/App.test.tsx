import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it } from 'vitest';

describe('<App />', () => {
  it('should render title in h1 tag', () => {
    render(<App />);
    screen.getByText('Welcome to my-react-crasher');
  });
});
