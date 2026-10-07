import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { IconFingerprint, IconBraces, IconGitCompare, IconChartDots3, IconSend, type Icon } from '@tabler/icons-react';

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
export const tools: ToolDefinition[] = [
  {
    id: 'guid',
    path: '/guid',
    label: 'GUID Generator',
    description: 'Generate v4, v7 or nil UUIDs in bulk with format options.',
    icon: IconFingerprint,
    component: lazy(() => import('../tools/guid/GuidTool')),
  },
  {
    id: 'formatter',
    path: '/formatter',
    label: 'Formatter',
    description: 'Format, validate and minify JSON, YAML, XML, HTML, CSS, Markdown, SQL and Mermaid.',
    icon: IconBraces,
    component: lazy(() => import('../tools/formatter/FormatterTool')),
  },
  {
    id: 'diff',
    path: '/diff',
    label: 'Diff Checker',
    description: 'Compare two texts or files side by side or inline, with word-level highlights.',
    icon: IconGitCompare,
    component: lazy(() => import('../tools/diff/DiffTool')),
  },
  {
    id: 'mermaid',
    path: '/mermaid',
    label: 'Mermaid Renderer',
    description: 'Live-render Mermaid diagrams offline and export as SVG or PNG.',
    icon: IconChartDots3,
    component: lazy(() => import('../tools/mermaid/MermaidTool')),
  },
  {
    id: 'request',
    path: '/request',
    label: 'Request Generator',
    description: 'Generate dummy request bodies from sample JSON or a Swagger/OpenAPI endpoint, with cURL and fetch snippets.',
    icon: IconSend,
    component: lazy(() => import('../tools/request/RequestTool')),
  },
];

