/** Stories only: a router-free host for the dashboard templates. */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { UiLinkProps, UiRouter } from '../../../components/link-image-provider';
import type { UITheme } from '../../../theme';
import { UIProvider } from '../../../theme/provider';

const DemoRouterContext = createContext<UiRouter>({ pathname: '/dashboard' });

/** Stands in for the hook a host writes around its router. */
function useDemoRouter() {
  return useContext(DemoRouterContext);
}

/** Keeps a fake current path and routes kit links through it, so navigation is clickable. */
export function DemoApp({
  initialPath = '/dashboard',
  theme,
  children,
}: {
  initialPath?: string;
  /** A theme or preset mode, e.g. `slateTheme.dark` from `@itclabs/react-ui/theme/presets`. */
  theme?: UITheme;
  children: ReactNode;
}) {
  const [path, setPath] = useState(initialPath);
  const router = useMemo(() => ({ pathname: path }), [path]);
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
    <DemoRouterContext.Provider value={router}>
      <UIProvider link={DemoLink} router={useDemoRouter} {...(theme ? { theme } : {})}>
        {children}
      </UIProvider>
    </DemoRouterContext.Provider>
  );
}
