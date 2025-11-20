/**
 * Canvas component - main editing area with drag-and-drop support
 * Shows insert highlights during drag operations
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

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-root',
    data: { accepts: ['palette'], nodeId: rootId },
  });

  const handleSelectNode = (nodeId: string) => {
    dispatch(selectNode(nodeId));
  };

  const hasChildren = rootNode?.children && rootNode.children.length > 0;
  const showInsertHighlight = dragState.isDragging && isOver;

  return (
    <Card
      title="Canvas"
      style={{ height: '100%', overflow: 'auto' }}
      bodyStyle={{ minHeight: '400px', padding: '16px' }}
    >
      <div
        ref={setNodeRef}
        className={`${isOver ? 'drop-zone-over' : ''}`}
        style={{
          minHeight: '400px',
          border: '2px dashed #d9d9d9',
          borderRadius: '4px',
          padding: '16px',
          backgroundColor: '#fafafa',
        }}
      >
        {!hasChildren ? (
          <>
            {showInsertHighlight && <div className="insert-highlight" />}
            <Empty description="Drag components here to start building your form" />
          </>
        ) : (
          <>
            {showInsertHighlight && dragState.destinationIndex === 0 && (
              <div className="insert-highlight" />
            )}
            <Renderer
              node={rootNode}
              nodes={nodes}
              onSelect={handleSelectNode}
              isSelected={selectedNodeId === rootId}
            />
          </>
        )}
      </div>
    </Card>
  );
};
