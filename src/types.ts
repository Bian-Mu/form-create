/**
 * Type definitions for the form designer
 * Supports nested containers (rows/columns) and basic form controls
 */

// Base node type
export type NodeType =
  | 'container'
  | 'row'
  | 'col'
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'button'
  | 'text'
  | 'divider';

// Base node interface
export interface FormNode {
  id: string;
  type: NodeType;
  label?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | boolean;
  options?: Array<{ label: string; value: string }>;
  children?: string[]; // Array of child node IDs
  style?: React.CSSProperties;
  props?: Record<string, unknown>;
}

// Flattened form state structure
export interface FormState {
  nodes: Record<string, FormNode>; // Flat map of all nodes by ID
  rootId: string; // Root container node ID
  selectedNodeId: string | null; // Currently selected node for editing
}

// Component palette item
export interface PaletteItem {
  type: NodeType;
  label: string;
  icon?: string;
  defaultProps?: Partial<FormNode>;
}
