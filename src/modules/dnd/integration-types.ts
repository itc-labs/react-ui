import type { ComponentType, ReactElement, ReactNode } from 'react';

/** Lightweight injection contract: importing these types never loads the drag runtime. */
export interface DndIntegrationItem {
  id: string;
  label: string;
  container: string;
  disabled?: boolean | undefined;
}
export interface DndIntegrationProviderProps {
  items: readonly DndIntegrationItem[];
  containers: readonly string[];
  containerLabels?: Readonly<Record<string, string>>;
  disabled?: boolean | undefined;
  overlayClassName?: string | undefined;
  testId?: string | undefined;
  canDrop?: (id: string, container: string) => boolean;
  onDrop: (id: string, container: string, index: number) => void;
  onNavigate?: (id: string, container: string) => void;
  children: ReactNode;
}
export interface DndIntegrationRowProps {
  id: string;
  children: ReactElement;
  handle?: boolean | undefined;
}
export interface DndIntegrationHandleProps {
  id: string;
  className?: string | undefined;
  'data-testid'?: string | undefined;
  disabledReason?: string | undefined;
}
export interface DndIntegrationPlugin {
  Provider: ComponentType<DndIntegrationProviderProps>;
  Row: ComponentType<DndIntegrationRowProps>;
  Zone: ComponentType<{ id: string; children: ReactElement }>;
  Handle: ComponentType<DndIntegrationHandleProps>;
}
export interface TransferDndPlugin extends DndIntegrationPlugin {}
export interface DataTableRowReorderPlugin extends DndIntegrationPlugin {}

/** Upload list/grid contract; the runtime is supplied only by the dnd entry. */
export interface UploadReorderProps {
  blocked: boolean;
  orientation: 'grid' | 'vertical';
  items: readonly { id: string; label: string; disabled?: boolean }[];
  leading?: number;
  onReorder: (ids: string[]) => void;
  children: ReactElement<{ children?: ReactNode; className?: string }>;
}
export interface UploadReorderPlugin {
  Sort: ComponentType<UploadReorderProps>;
}
