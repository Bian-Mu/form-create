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

      // Find source parent and index
      let sourceParentId: string | null = null;
      let sourceIndex = -1;

      // Remove from old parent
      Object.values(state.nodes).forEach((node) => {
        if (node.children) {
          const idx = node.children.indexOf(nodeId);
          if (idx !== -1) {
            sourceParentId = node.id;
            sourceIndex = idx;
            node.children = node.children.filter((id) => id !== nodeId);
          }
        }
      });

      const newParent = state.nodes[newParentId];
      if (newParent && newParent.children) {
        let adjustedIndex = newIndex;

        // 4. 【核心逻辑】处理在同一父节点内移动的边缘情况
        // 如果节点是在同一个父容器内移动，并且是向下移动（即原始位置靠前，目标位置靠后）
        if (sourceParentId === newParentId && sourceIndex !== -1 && sourceIndex < newIndex) {
          adjustedIndex = newIndex - 1;
        }
        // 那么，因为我们已经从数组中移除了这个节点，
        // 导致它后面的所有元素的索引都向前移动了一位。
        // 所以，目标插入位置也需要减1来修正。
        newParent.children.splice(adjustedIndex, 0, nodeId);
      }
    },

    selectNode: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload;
    },

    loadForm: (_state, action: PayloadAction<FormState>) => {
      return action.payload;
    },

    resetForm: () => initialState,
  },
});

export const { addNode, removeNode, updateNode, moveNode, selectNode, loadForm, resetForm } =
  formSlice.actions;

export default formSlice.reducer;
