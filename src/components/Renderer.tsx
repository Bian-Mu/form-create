/**
 * Recursive renderer that converts JSON nodes to React components
 * Handles nested containers with path-based droppable IDs
 * Shows insert highlights at all possible insertion positions
 * Supports drag-to-reorder for existing components
 */
import React, { useState, useRef, useCallback } from 'react';
import { Input, Select, Checkbox, Button, Typography, Divider } from 'antd';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { FormNode } from '../types';
import { isAncestorPath } from '../utils/dndHelpers';

const { TextArea } = Input;
const { Text } = Typography;

// Long-press hook for drag handle
const useLongPress = (callback: () => void, ms = 500) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const start = useCallback(() => {
    timeoutRef.current = setTimeout(callback, ms);
  }, [callback, ms]);
  
  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  return { onMouseDown: start, onMouseUp: clear, onMouseLeave: clear };
};

interface RendererProps {
  node: FormNode;
  nodes: Record<string, FormNode>;
  onSelect?: (nodeId: string) => void;
  isSelected?: boolean;
  isPreview?: boolean; // Preview mode for export
  path?: string; // Path for droppable ID (e.g., "root/row-1/col-2")
  parentPath?: string; // Parent path for draggable logic
}

export const Renderer: React.FC<RendererProps> = ({
  node,
  nodes,
  onSelect,
  isSelected,
  isPreview = false,
  path = 'root',
  parentPath = '',
}) => {
  const dragState = useSelector((state: RootState) => state.drag);
  const [showHandle, setShowHandle] = useState(false);
  
  // Long-press handler
  const longPressProps = useLongPress(() => {
    if (!isPreview && node.id !== 'root') {
      setShowHandle(true);
    }
  }, 500);
  
  // Make component draggable (except root)
  const { attributes, listeners, setNodeRef: setDraggableRef, isDragging: isThisNodeDragging } = useDraggable({
    id: node.id,
    disabled: isPreview || node.id === 'root' || !showHandle,
    data: { 
      nodeId: node.id,
      source: 'canvas',
      parentPath: parentPath,
    },
  });
  
  // Reset handle when dragging ends
  React.useEffect(() => {
    if (!dragState.isDragging) {
      setShowHandle(false);
    }
  }, [dragState.isDragging]);
  
  const handleClick = (e: React.MouseEvent) => {
    if (!isPreview && onSelect) {
      e.stopPropagation();
      onSelect(node.id);
    }
  };

  const isContainer = ['container', 'row', 'col'].includes(node.type);
  const isDragging = dragState.isDragging;
  const isDropTarget = isDragging && dragState.destinationParentId === node.id;
  const isAncestorOfTarget = isDragging && dragState.destinationParentId && 
    isAncestorPath(path, `${parentPath}/${dragState.destinationParentId}`);

  // Base style with always visible border
  const baseStyle: React.CSSProperties = {
    padding: '8px',
    border: isSelected 
      ? '2px solid #1890ff' 
      : '1px solid #d0e8ff', // Always visible light blue border
    borderRadius: '4px',
    cursor: isPreview ? 'default' : 'pointer',
    minHeight: '40px',
    transition: 'all 0.2s ease',
    backgroundColor: isDropTarget ? 'rgba(24, 144, 255, 0.05)' : 'transparent',
    boxShadow: (isDropTarget || isAncestorOfTarget) && !isPreview
      ? '0 0 0 2px rgba(24, 144, 255, 0.3)'
      : 'none',
    opacity: isThisNodeDragging ? 0.3 : 1,
    position: 'relative',
    ...node.style,
  };

  // Render insert highlight at specific index
  const renderInsertHighlight = (index: number) => {
    if (!isDragging || isPreview) return null;
    
    const shouldShowHighlight = 
      dragState.destinationParentId === node.id && 
      dragState.destinationIndex === index;

    if (!shouldShowHighlight) return null;

    return (
      <div 
        key={`highlight-${index}`}
        className="insert-highlight"
        style={{ margin: '4px 0' }}
      />
    );
  };

  // Render drag handle when shown after long-press
  const renderDragHandle = () => {
    if (isPreview || node.id === 'root' || !showHandle) return null;
    
    return (
      <div 
        {...attributes}
        {...listeners}
        className="drag-handle"
        style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          cursor: 'grab',
          padding: '4px 8px',
          background: '#1890ff',
          color: 'white',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 10,
          userSelect: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        ⋮⋮
      </div>
    );
  };

  // Render children with insert highlights between them
  const renderChildrenWithHighlights = () => {
    if (!node.children || node.children.length === 0) {
      // Empty container - show highlight if this is the drop target
      if (isDragging && dragState.destinationParentId === node.id) {
        return (
          <div className="nested-container empty">
            {renderInsertHighlight(0)}
          </div>
        );
      }
      return null;
    }

    const elements: React.ReactNode[] = [];
    
    // Insert highlight before first child
    elements.push(renderInsertHighlight(0));

    // Render each child with highlight after it
    node.children.forEach((childId, index) => {
      const childNode = nodes[childId];
      if (!childNode) return;
      
      const childPath = `${path}/${childId}`;
      elements.push(
        <Renderer
          key={childId}
          node={childNode}
          nodes={nodes}
          onSelect={onSelect}
          isSelected={false}
          isPreview={isPreview}
          path={childPath}
          parentPath={path}
        />
      );
      
      // Insert highlight after this child
      elements.push(renderInsertHighlight(index + 1));
    });

    return elements;
  };

  // Setup droppable for container types
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: path,
    disabled: !isContainer || isPreview,
    data: { 
      nodeId: node.id,
      path,
      accepts: ['palette', 'canvas'],
    },
  });

  // Combine refs for containers (both draggable and droppable)
  const combinedRef = (element: HTMLDivElement | null) => {
    if (isContainer && !isPreview) {
      setDroppableRef(element);
    }
    if (node.id !== 'root' && !isPreview) {
      setDraggableRef(element);
    }
  };

  // Get props for wrapper - only attach long-press, not drag listeners
  const getWrapperProps = () => {
    if (isPreview || node.id === 'root') return {};
    return longPressProps;
  };

  // Render based on node type
  switch (node.type) {
    case 'container':
      return (
        <div 
          ref={combinedRef}
          {...getWrapperProps()}
          style={{ 
            ...baseStyle, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px',
          }} 
          onClick={handleClick}
        >
          {renderDragHandle()}
          {node.label && <Text strong>{node.label}</Text>}
          {renderChildrenWithHighlights()}
        </div>
      );

    case 'row':
      return (
        <div 
          ref={combinedRef}
          {...getWrapperProps()}
          style={{ 
            ...baseStyle, 
            display: 'flex', 
            flexDirection: 'row', 
            gap: '8px',
          }} 
          onClick={handleClick}
        >
          {renderDragHandle()}
          {renderChildrenWithHighlights()}
        </div>
      );

    case 'col':
      return (
        <div 
          ref={combinedRef}
          {...getWrapperProps()}
          style={{ 
            ...baseStyle, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px', 
            flex: 1,
          }} 
          onClick={handleClick}
        >
          {renderDragHandle()}
          {renderChildrenWithHighlights()}
        </div>
      );

    case 'input':
      return (
        <div ref={setDraggableRef} {...getWrapperProps()} style={baseStyle} onClick={handleClick}>
          {renderDragHandle()}
          {node.label && <Text>{node.label}</Text>}
          <Input
            placeholder={node.placeholder || ''}
            defaultValue={node.defaultValue as string}
            disabled={isPreview}
          />
        </div>
      );

    case 'textarea':
      return (
        <div ref={setDraggableRef} {...getWrapperProps()} style={baseStyle} onClick={handleClick}>
          {renderDragHandle()}
          {node.label && <Text>{node.label}</Text>}
          <TextArea
            placeholder={node.placeholder || ''}
            defaultValue={node.defaultValue as string}
            rows={4}
            disabled={isPreview}
          />
        </div>
      );

    case 'select':
      return (
        <div ref={setDraggableRef} {...getWrapperProps()} style={baseStyle} onClick={handleClick}>
          {renderDragHandle()}
          {node.label && <Text>{node.label}</Text>}
          <Select
            placeholder={node.placeholder || 'Select an option'}
            defaultValue={node.defaultValue as string}
            style={{ width: '100%' }}
            disabled={isPreview}
            options={node.options || []}
          />
        </div>
      );

    case 'checkbox':
      return (
        <div ref={setDraggableRef} {...getWrapperProps()} style={baseStyle} onClick={handleClick}>
          {renderDragHandle()}
          <Checkbox defaultChecked={node.defaultValue as boolean} disabled={isPreview}>
            {node.label || 'Checkbox'}
          </Checkbox>
        </div>
      );

    case 'radio':
      return (
        <div ref={setDraggableRef} {...getWrapperProps()} style={baseStyle} onClick={handleClick}>
          {renderDragHandle()}
          <Text>{node.label}</Text>
          {/* Radio group would be implemented here with node.options */}
        </div>
      );

    case 'button':
      return (
        <div ref={setDraggableRef} {...getWrapperProps()} style={baseStyle} onClick={handleClick}>
          {renderDragHandle()}
          <Button type="primary" disabled={isPreview}>
            {node.label || 'Button'}
          </Button>
        </div>
      );

    case 'text':
      return (
        <div ref={setDraggableRef} {...getWrapperProps()} style={baseStyle} onClick={handleClick}>
          {renderDragHandle()}
          <Text>{node.label || 'Text'}</Text>
        </div>
      );

    case 'divider':
      return (
        <div ref={setDraggableRef} {...getWrapperProps()} style={baseStyle} onClick={handleClick}>
          {renderDragHandle()}
          <Divider />
        </div>
      );

    default:
      return (
        <div ref={setDraggableRef} {...getWrapperProps()} style={baseStyle} onClick={handleClick}>
          {renderDragHandle()}
          <Text type="secondary">Unknown type: {node.type}</Text>
        </div>
      );
  }
};
