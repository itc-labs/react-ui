/** Stories only: a router-free host for the dashboard templates. */
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import type { UiLinkProps } from '../../../components/link-image-provider';
import { UIProvider } from '../../../theme/provider';

const DemoPathContext = createContext<{
  path: string;
  navigate: (path: string) => void;
}>({
  path: '/dashboard',
  navigate: () => {},
});

/** Current demo path and a navigate function, as a host router would provide. */
export function useDemoPath() {
  return useContext(DemoPathContext);
}

/** Keeps a fake current path and routes kit links through it, so navigation is clickable. */
export function DemoApp({
  initialPath = '/dashboard',
  children,
}: {
  initialPath?: string;
  children: ReactNode;
}) {
  const [path, setPath] = useState(initialPath);
  const DemoLink = useCallback(
    ({ href, onClick, ...props }: UiLinkProps) => (
      <a
        {...props}
        href={href}
        onClick={(event) => {
          onClick?.(event);
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          )
            return;
          event.preventDefault();
          setPath(href);
        }}
      />
    ),
    [],
  );

  return (
    <UIProvider link={DemoLink}>
      <DemoPathContext.Provider value={{ path, navigate: setPath }}>
        {children}
      </DemoPathContext.Provider>
    </UIProvider>
  );
}
