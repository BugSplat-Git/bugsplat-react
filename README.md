# [![BugSplat](https://s3.amazonaws.com/bugsplat-public/npm/header.png)](https://www.bugsplat.com)

## Introduction

BugSplat supports the collection of errors in React applications. The bugsplat-react npm package implements an [ErrorBoundary](https://reactjs.org/docs/error-boundaries.html) component in order to capture rendering errors in children and post them to BugSplat where they can be tracked and managed. The package also includes a [react context](https://reactjs.org/docs/context.html) provider and additional utilities to further integrate BugSplat with your application and customize it to your needs. Adding BugSplat to your React application is extremely easy. Before getting started please complete the following tasks:

- [Sign up](https://app.bugsplat.com/v2/sign-up) for BugSplat
- Create a new [database](https://app.bugsplat.com/v2/options?tab=database) for your application
<!-- * Check out the [live demo](https://www.bugsplat.com/platforms/react/my-react-crasher) of BugSplat’s React error reporting -->

## Get Started

To start using BugSplat in your React application, run the following command at the root of your project. This will install bugsplat-react and its sub dependency [bugsplat](https://github.com/BugSplat-Git/bugsplat-js).

```shell
npm install bugsplat-react --save
```

In addition to standard `package.json` properties `name` and `version`, include a `database` property to your `package.json` file with the value of your BugSplat database. Make sure to replace {{database}} with your actual database name.

`package.json`

```json
{
  "name": "my-app",
  "version": "1.2.0",
  "database": "{{database}}"
}
```

In the root of your project, import data from your `package.json` and initialize a new `BugSplat` instance with it. Now you can pass your newly created `BugSplat` instance to the `BugSplatProvider` at the root of your app in order to share it with all child components.

```jsx
// src/index.tsx

import ReactDOM from 'react-dom';
import { BugSplat, BugSplatProvider } from 'bugsplat-react';
import App from './App';
import * as packageJson from '../package.json';

const bugsplat = new BugSplat(
  packageJson.database,
  packageJson.name,
  packageJson.version
);

ReactDOM.render(
  <BugSplatProvider value={bugsplat}>
    <App />
  </BugSplatProvider>,
  document.getElementById('root')
);
```

With this provider, you are supplying the `BugSplat` instance to your application components through [react context](https://reactjs.org/docs/context.html). You can now wrap your component trees with `ErrorBoundary` to capture rendering errors and automatically post them to BugSplat with the instance you passed to `BugSplatProvider`.

```jsx
// src/App.tsx

import { ErrorBoundary } from 'bugsplat-react';

export default function App() {
  return (
    <ErrorBoundary fallback={<h1>Oops, there was a problem.</h1>}>
      <Content>...</Content>
    </ErrorBoundary>
  );
}
```

You can also access the provided `BugSplat` instance in any child function component with the `useBugSplat` hook.

```jsx
// src/App.tsx

import { useBugSplat } from 'bugsplat-react';

export default function App() {
  const bugSplat = useBugSplat();

  return (
    <div>
      <h1>Hello, world!</h1>
      <button onClick={() => bugSplat.post('There was a problem')}>
        Post Message
      </button>
    </div>
  );
}
```

## Further Integration

Want your error boundary to also handle errors that are not caught by `ErrorBoundary`, such as async errors or event handlers? No problem! `useErrorHandler` to the rescue. Pass your error to the callback returned from `useErrorHandler` in order to propagate the error to the nearest `ErrorBoundary`. You can also pass your error directly to `useErrorHandler` if you manage the error state yourself or get it from another library.

```jsx
// src/App.tsx

import { useState } from 'react'
import { ErrorBoundary, useErrorHandler } from 'bugsplat-react';

function NestedComponent() {
  const handleError = useErrorHandler();

  const handleClick = async () => {
    try {
      await doThing();
    } catch (err) {
      handleError(err);
    }
  };

  return <button onClick={handleClick}>Do Thing</button>;
}

function NestedComponent2() {
  const [error, setError] = useState<Error>()

  useErrorHandler(error)

  const handleClick = async () => {
    try {
      await doThing()
    } catch (err) {
      setError(err)
    }
  }

  return <button onClick={handleClick}>Do Thing</button>;
}

export default function App() {
  return (
    <ErrorBoundary fallback={<h1>Oops, there was a problem.</h1>}>
      <NestedComponent />
      <NestedComponent2 />
    </ErrorBoundary>
  );
}
```

In it's simplest form, the `ErrorBoundary` component just catches rendering errors in its children and can be used without BugSplat integrated at all. To utilize the full power of `ErrorBoundary`, pass it a `BugSplat` instance through a parent `BugSplatProvider` or with the `bugSplat` prop. If both are provided, the prop will take preference over the context value.

```jsx
function Component() {
  return (
    <BugSplatProvider value={bugSplat}>
      <ErrorBoundary bugSplat={bugSplat}>
        <ChildComponent />
      </ErrorBoundary>
    </BugSplatProvider>
  );
}
```

Doing this will enable the fully integrated `ErrorBoundary` to automatically post any errors it catches to BugSplat.

The `ErrorBoundary` component is packed with props that can be used to customize it to your exact needs:

- `fallback`
- `onMount`
- `onUnmount`
- `onError`
- `beforePost`
- `onReset`
- `onResetKeysChange`

We highly recommend passing a `fallback` prop to render when `ErrorBoundary` encounters an error.

This can be a valid element

```jsx
function Component() {
  return (
    <ErrorBoundary fallback={<div>Oops, there was a problem.</div>}>
      ...
    </ErrorBoundary>
  );
}
```

...or a function that renders one

```jsx
function Component() {
  return (
    <ErrorBoundary fallback={() => <div>Oops, there was a problem.</div>}>
      ...
    </ErrorBoundary>
  );
}
```

If `fallback` is a function, it will be called with

- `error` - the error caught be `ErrorBoundary`
- `componentStack` - the component stack trace of the error
- `response` - the BugSplat response of posting error to BugSplat, if applicable
- `resetErrorBoundary` - a function to call in order to reset the `ErrorBoundary` state

The fallback will render any time the `ErrorBoundary` catches an error. It is useful to have a fallback UI to gracefully handle errors for your users, while still sending errors to BugSplat behind the scenes.

`ErrorBoundary` accepts a resetKeys prop that you can pass with an array of values that will cause it to automatically reset if one of those values changes. This gives you the power to control the error state from outside of the component.

```jsx
function App() {
  const [error, setError] = useState<Error | null>();

  return (
    <ErrorBoundary
      fallback={(props) => <Fallback {...props} />}
      onReset={() => setError(null)}
      resetKeys={[error]}
    >
      ...
    </ErrorBoundary>
  );
}
```

## API

This package re-exports all exports from [bugsplat-js](https://github.com/BugSplat-Git/bugsplat-js).

### `BugSplatContext`

```typescript
const BugSplatContext: React.Context<BugSplat | null>;

interface BugSplatProviderProps {
  /**
   * BugSplat instance
   *
   * *Should be memoized or created outside of
   * render to preserve referential integrity*
   */
  value: BugSplat;
  children: ReactNode;
}

/**
 * Provide BugSplat instance to children.
 */
function BugSplatProvider(props: BugSplatProviderProps): JSX.Element;

/**
 * Retrieve the BugSplat instance provided by a parent BugSplatProvider
 * @returns {BugSplat} BugSplat instance
 */
function useBugSplat(): BugSplat | null;

/**
 * Higher order component to inject BugSplat instance
 * into component props from context.
 */
function withBugSplat<P extends { bugSplat?: BugSplat }>(
  Component: React.ComponentType<P>,
  bugSplat?: BugSplat
): React.ComponentType<P>;
```

### `ErrorBoundary`

```typescript
interface FallbackProps {
  error: Error;
  componentStack: string | null;
  response: BugSplatResponse | null;
  resetErrorBoundary: (...args: unknown[]) => void;
}

type FallbackElement = ReactElement<
  unknown,
  string | FunctionComponent | typeof Component
> | null;

type FallbackRender = (props: FallbackProps) => FallbackElement;

interface ErrorBoundaryProps {
  /**
   * BugSplat instance used to post errors.
   */
  bugSplat?: BugSplat;
  /**
   * Callback called before error post to BugSplat.
   */
  beforePost?: (
    bugSplat: BugSplat,
    error: Error | null,
    componentStack: string | null
  ) => void;
  /**
   * Callback called when ErrorBoundary catches an error in componentDidCatch()
   */
  onError?: (
    error: Error,
    componentStack: string,
    response: BugSplatResponse | null
  ) => void;
  /**
   * Callback called on componentDidMount().
   */
  onMount?: () => void;
  /**
   * Callback called on componentWillUnmount().
   */
  onUnmount?: (
    error: Error | null,
    componentStack: string | null,
    response: BugSplatResponse | null
  ) => void;
  /**
   * Callback called before ErrorBoundary resets internal state,
   * resulting in rendering children again. This should be
   * used to ensure that rerendering of children would not
   * repeat the same error that occurred.
   *
   * *Not called when reset from change in resetKeys -
   * use onResetKeysChange for that.*
   */
  onReset?: (
    error: Error | null,
    componentStack: string | null,
    response: BugSplatResponse | null,
    extraArgs?: unknown[]
  ) => void;
  /**
   * Callback called when keys passed to resetKeys are changed.
   */
  onResetKeysChange?: (
    prevResetKeys?: unknown[],
    resetKeys?: unknown[]
  ) => void;
  /**
   * Array of values passed from parent scope. When ErrorBoundary
   * is in an error state, it will check each passed value
   * and automatically reset if any of the values have changed.
   */
  resetKeys?: unknown[];
  /**
   * Provide a fallback to render when ErrorBoundary catches an error.
   * Not required, but it is highly recommended to provide a value for this.
   *
   * This can be an element or a function that renders an element.
   */
  fallback?: FallbackElement | FallbackRender;
  /**
   * If true, caught errors will not be automatically
   * posted to BugSplat.
   */
  skipPost?: boolean;
}

interface ErrorBoundaryState {
  error: Error | null;
  componentStack: string | null;
  response: BugSplatResponse | null;
}

/**
 * Handle errors that occur during rendering by wrapping
 * your component tree with ErrorBoundary. Any number of ErrorBoundary
 * components can be rendered in the tree and any rendering error will
 * propagate to the nearest one.
 */
class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
>
```

### `withErrorBoundary`

```typescript
/**
 * Higher order component to wrap your component tree with ErrorBoundary
 */
function withErrorBoundary<P extends Record<string, unknown>>(
  Component: ComponentType<P>,
  errorBoundaryProps: ErrorBoundaryProps = {}
): ComponentType<P>;
```

### `useErrorHandler`

```typescript
/**
 * Utility hook to declaratively or imperatively propagate an
 * error to the nearest error boundary.
 * *Should only be called from a child of ErrorBoundary*
 *
 * * Pass an error prop to declaratively propagate errors
 * when its value is truthy
 *
 * * Call the returned handler with a truthy value to
 * imperatively propagate errors
 *
 * @param errorProp - Declarative error prop that will throw when it is truthy
 */
function useErrorHandler(errorProp?: unknown): (error: unknown) => void;
```
