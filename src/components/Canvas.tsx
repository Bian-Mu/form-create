/**
 * Canvas component - main editing area with drag-and-drop support
 * Shows insert highlights during drag operations with path-based droppable IDs
 */
import { Card, Empty } from 'antd';
import { useDroppable } from '@dnd-kit/core';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { selectNode } from '../store/formSlice';
import { Renderer } from './Renderer';

export const Canvas: React.FC = () => {
  const dispatch = useDispatch();
  const { nodes, rootId, selectedNodeId } = useSelector((state: RootState) => state.form);
  const dragState = useSelector((state: RootState) => state.drag);
  const rootNode = nodes[rootId];

  // Use slot format for empty root
  const { setNodeRef, isOver } = useDroppable({
    id: `${rootId}@0`,
    data: { 
      parentId: rootId,
      index: 0,
      type: 'slot',
    },
  });

  const handleSelectNode = (nodeId: string) => {
    dispatch(selectNode(nodeId));
  };

  const hasChildren = rootNode?.children && rootNode.children.length > 0;
  const showInsertHighlight = dragState.isDragging && isOver && !hasChildren;

  return (
    <Card
      title="Canvas"
      style={{ height: '100%', overflow: 'auto' }}
      bodyStyle={{ minHeight: '400px', padding: '16px' }}
    >
      <div
        className={dragState.isDragging ? 'global-dragging' : ''}
        style={{
          minHeight: '400px',
          border: '2px dashed #d9d9d9',
          borderRadius: '4px',
          padding: '16px',
          backgroundColor: '#fafafa',
        }}
      >
        {!hasChildren ? (
          <div ref={setNodeRef} style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {showInsertHighlight && <div className="insert-highlight" />}
            <Empty description="Drag components here to start building your form" />
          </div>
        ) : (
          <Renderer
            node={rootNode}
            nodes={nodes}
            onSelect={handleSelectNode}
            isSelected={selectedNodeId === rootId}
            path={rootId}
          />
        )}
      </div>
    </Card>
  );
};
