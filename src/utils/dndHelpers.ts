/**
 * Drag-and-drop helper utilities
 * Handles nested layout drag-and-drop logic
 */
import type { DragEndEvent } from '@dnd-kit/core';
import type { NodeType } from '../types';

export interface DndHelperResult {
  shouldAdd: boolean;
  parentId: string;
  nodeType?: NodeType;
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
    const parentId = overData?.nodeId || 'root';

    return {
      shouldAdd: true,
      parentId,
      nodeType,
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
export function canDropInto(parentType: NodeType, _childType: NodeType): boolean {
  // All container types can accept children
  if (canBeParent(parentType)) {
    return true;
  }
  return false;
}
