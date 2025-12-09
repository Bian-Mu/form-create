
import type { DragEndEvent } from '@dnd-kit/core';
import type { NodeType, FormNode } from '../types';

export interface DndHelperResult {
  shouldAdd: boolean;
  parentId: string;
  nodeType?: NodeType;
  index?: number;
}


export function parseDroppablePath(droppableId: string): string[] {
  if (!droppableId) return ['root'];
  return droppableId.split('/').filter(Boolean);
}


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


export function getParentIdFromPath(droppableId: string): string {
  const pathComponents = parseDroppablePath(droppableId);
  return pathComponents[pathComponents.length - 1] || 'root';
}


export function isAncestorPath(ancestorPath: string, descendantPath: string): boolean {
  if (ancestorPath === descendantPath) return true;
  return descendantPath.startsWith(ancestorPath + '/');
}


export function moveNodeInMap(
  nodes: Record<string, FormNode>,
  nodeId: string,
  targetParentId: string,
  targetIndex: number
): Record<string, FormNode> {
  const newNodes = { ...nodes };

  // Find and remove from old parent, tracking source info
  let sourceParentId: string | null = null;
  let sourceIndex = -1;

  Object.values(newNodes).forEach((node) => {
    if (node.children) {
      const index = node.children.indexOf(nodeId);
      if (index !== -1) {
        sourceParentId = node.id;
        sourceIndex = index;
        node.children = [...node.children];
        node.children.splice(index, 1);
      }
    }
  });

  // Add to new parent at specific index
  const targetParent = newNodes[targetParentId];
  if (targetParent && targetParent.children) {
    targetParent.children = [...targetParent.children];

    // If moving within same parent and removal was before target, adjust index
    let adjustedIndex = targetIndex;
    if (sourceParentId === targetParentId && sourceIndex !== -1 && sourceIndex < targetIndex) {
      adjustedIndex = targetIndex - 1;
    }

    const insertIndex = Math.min(adjustedIndex, targetParent.children.length);
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


  return null;
}


export function canBeParent(nodeType: NodeType): boolean {
  return ['container', 'row', 'col'].includes(nodeType);
}


export function canDropInto(parentType: NodeType): boolean {
  // All container types can accept children
  if (canBeParent(parentType)) {
    return true;
  }
  return false;
}
