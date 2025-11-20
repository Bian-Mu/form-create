/**
 * Redux slice for form state management
 * Uses flattened node storage for efficient updates
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FormNode, FormState } from '../types';

// Generate unique ID for new nodes
const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Initial state with a root container
const initialState: FormState = {
  nodes: {
    root: {
      id: 'root',
      type: 'container',
      children: [],
    },
  },
  rootId: 'root',
  selectedNodeId: null,
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    // Add a new node to a parent
    addNode: (state, action: PayloadAction<{ parentId: string; node: Partial<FormNode>; index?: number }>) => {
      const { parentId, node, index } = action.payload;
      const id = generateId();
      const newNode: FormNode = {
        id,
        type: node.type || 'input',
        label: node.label || '',
        children: node.type === 'container' || node.type === 'row' || node.type === 'col' ? [] : undefined,
        ...node,
      };

      state.nodes[id] = newNode;

      const parent = state.nodes[parentId];
      if (parent && parent.children) {
        if (typeof index === 'number') {
          parent.children.splice(index, 0, id);
        } else {
          parent.children.push(id);
        }
      }
    },

    // Remove a node and its children
    removeNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      const node = state.nodes[nodeId];

      if (!node) return;

      // Remove from parent's children array
      Object.values(state.nodes).forEach((n) => {
        if (n.children) {
          n.children = n.children.filter((id) => id !== nodeId);
        }
      });

      // Recursively remove children
      const removeRecursive = (id: string) => {
        const n = state.nodes[id];
        if (n?.children) {
          n.children.forEach(removeRecursive);
        }
        delete state.nodes[id];
      };

      removeRecursive(nodeId);

      if (state.selectedNodeId === nodeId) {
        state.selectedNodeId = null;
      }
    },

    // Update node properties
    updateNode: (state, action: PayloadAction<{ id: string; updates: Partial<FormNode> }>) => {
      const { id, updates } = action.payload;
      const node = state.nodes[id];
      if (node) {
        Object.assign(node, updates);
      }
    },

    // Move node to new parent at specific index
    moveNode: (
      state,
      action: PayloadAction<{ nodeId: string; newParentId: string; newIndex: number }>
    ) => {
      const { nodeId, newParentId, newIndex } = action.payload;

      // Remove from old parent
      Object.values(state.nodes).forEach((node) => {
        if (node.children) {
          node.children = node.children.filter((id) => id !== nodeId);
        }
      });

      // Add to new parent at index
      const newParent = state.nodes[newParentId];
      if (newParent && newParent.children) {
        newParent.children.splice(newIndex, 0, nodeId);
      }
    },

    // Select a node for editing
    selectNode: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload;
    },

    // Load entire form state
    loadForm: (_state, action: PayloadAction<FormState>) => {
      return action.payload;
    },

    // Reset to initial state
    resetForm: () => initialState,
  },
});

export const { addNode, removeNode, updateNode, moveNode, selectNode, loadForm, resetForm } =
  formSlice.actions;

export default formSlice.reducer;
