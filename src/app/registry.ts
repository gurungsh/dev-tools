import { type ComponentType, type LazyExoticComponent } from 'react';
import type { Icon } from '@tabler/icons-react';

export interface ToolDefinition {
  id: string;
  path: string;
  label: string;
  description: string;
  icon: Icon;
  component: LazyExoticComponent<ComponentType>;
}

/**
 * Register a tool by adding an entry here. Components are lazy-loaded so heavy
 * dependencies (Mermaid, Prettier) only load when the tool is opened.
 */
export const tools: ToolDefinition[] = [];

