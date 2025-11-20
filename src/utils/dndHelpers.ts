/**
 * Drag-and-drop helper utilities
 * Handles nested layout drag-and-drop logic with path-based positioning
 * Supports paths like "root/row-1/col-2" for nested containers
 */
import type { DragEndEvent } from '@dnd-kit/core';
import type { NodeType, FormNode } from '../types';

export interface DndHelperResult {
  shouldAdd: boolean;
  parentId: string;
  nodeType?: NodeType;
  index?: number;
}

/**
 * Parse droppableId path (e.g., "root/row-1/col-2") and return components
 */
export function parseDroppablePath(droppableId: string): string[] {
  if (!droppableId) return ['root'];
  return droppableId.split('/').filter(Boolean);
}

/**
 * Get node by following a path through the node tree
 */
export function getNodeByPath(
  nodes: Record<string, FormNode>,
  path: string[]
): FormNode | null {
  if (path.length === 0) return null;
  
  let currentNode = nodes[path[0]];
  if (!currentNode) return null;

  for (let i = 1; i < path.length; i++) {
    const nodeId = path[i];
    currentNode = nodes[nodeId];
    if (!currentNode) return null;
  }

  return currentNode;
}

/**
 * Get the parent node ID from a droppable path
 */
export function getParentIdFromPath(droppableId: string): string {
  const pathComponents = parseDroppablePath(droppableId);
  return pathComponents[pathComponents.length - 1] || 'root';
}

/**
 * Check if a droppableId path is an ancestor of or equal to another path
 */
export function isAncestorPath(ancestorPath: string, descendantPath: string): boolean {
  if (ancestorPath === descendantPath) return true;
  return descendantPath.startsWith(ancestorPath + '/');
}

/**
 * Move node in the node map to a new parent at a specific index
 */
export function moveNodeInMap(
  nodes: Record<string, FormNode>,
  nodeId: string,
  targetParentId: string,
  targetIndex: number
): Record<string, FormNode> {
  const newNodes = { ...nodes };
  
  // Remove from old parent
  Object.values(newNodes).forEach((node) => {
    if (node.children) {
      const index = node.children.indexOf(nodeId);
      if (index !== -1) {
        node.children = [...node.children];
        node.children.splice(index, 1);
      }
    }
  });

  // Add to new parent at specific index
  const targetParent = newNodes[targetParentId];
  if (targetParent && targetParent.children) {
    targetParent.children = [...targetParent.children];
    const insertIndex = Math.min(targetIndex, targetParent.children.length);
    targetParent.children.splice(insertIndex, 0, nodeId);
  }

  return newNodes;
}

/**
 * Determine if a drop should be accepted and where to add the node
 */
export function handleDragEnd(event: DragEndEvent): DndHelperResult | null {
  const { active, over } = event;

  if (!over) {
    return null;
  }

  const activeData = active.data.current;
  const overData = over.data.current;

  // Handle drag from palette
  if (activeData?.source === 'palette') {
    const nodeType = activeData.type as NodeType;
    const droppableId = over.id as string;
    const parentId = getParentIdFromPath(droppableId);
    const index = overData?.index ?? undefined;

    return {
      shouldAdd: true,
      parentId,
      nodeType,
      index,
    };
  }

  // Handle drag within canvas (reordering)
  // This would be implemented for full reordering support
  return null;
}

/**
 * Check if a node type can be a parent (container)
 */
export function canBeParent(nodeType: NodeType): boolean {
  return ['container', 'row', 'col'].includes(nodeType);
}

/**
 * Validate if a node can be dropped into a parent
 */
export function canDropInto(parentType: NodeType): boolean {
  // All container types can accept children
  if (canBeParent(parentType)) {
    return true;
  }
  return false;
}
