/**
 * Recursive renderer that converts JSON nodes to React components
 * Handles nested containers and basic form controls
 */
import React from 'react';
import { Input, Select, Checkbox, Button, Typography, Divider } from 'antd';
import type { FormNode } from '../types';

const { TextArea } = Input;
const { Text } = Typography;

interface RendererProps {
  node: FormNode;
  nodes: Record<string, FormNode>;
  onSelect?: (nodeId: string) => void;
  isSelected?: boolean;
  isPreview?: boolean; // Preview mode for export
}

export const Renderer: React.FC<RendererProps> = ({
  node,
  nodes,
  onSelect,
  isSelected,
  isPreview = false,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (!isPreview && onSelect) {
      e.stopPropagation();
      onSelect(node.id);
    }
  };

  const baseStyle: React.CSSProperties = {
    padding: '8px',
    border: isSelected ? '2px solid #1890ff' : '1px solid transparent',
    borderRadius: '4px',
    cursor: isPreview ? 'default' : 'pointer',
    minHeight: '40px',
    ...node.style,
  };

  const renderChildren = () => {
    if (!node.children || node.children.length === 0) return null;
    return node.children.map((childId) => {
      const childNode = nodes[childId];
      if (!childNode) return null;
      return (
        <Renderer
          key={childId}
          node={childNode}
          nodes={nodes}
          onSelect={onSelect}
          isSelected={false}
          isPreview={isPreview}
        />
      );
    });
  };

  // Render based on node type
  switch (node.type) {
    case 'container':
      return (
        <div style={{ ...baseStyle, display: 'flex', flexDirection: 'column', gap: '8px' }} onClick={handleClick}>
          {node.label && <Text strong>{node.label}</Text>}
          {renderChildren()}
        </div>
      );

    case 'row':
      return (
        <div style={{ ...baseStyle, display: 'flex', flexDirection: 'row', gap: '8px' }} onClick={handleClick}>
          {renderChildren()}
        </div>
      );

    case 'col':
      return (
        <div style={{ ...baseStyle, display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }} onClick={handleClick}>
          {renderChildren()}
        </div>
      );

    case 'input':
      return (
        <div style={baseStyle} onClick={handleClick}>
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
        <div style={baseStyle} onClick={handleClick}>
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
        <div style={baseStyle} onClick={handleClick}>
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
        <div style={baseStyle} onClick={handleClick}>
          <Checkbox defaultChecked={node.defaultValue as boolean} disabled={isPreview}>
            {node.label || 'Checkbox'}
          </Checkbox>
        </div>
      );

    case 'radio':
      return (
        <div style={baseStyle} onClick={handleClick}>
          <Text>{node.label}</Text>
          {/* Radio group would be implemented here with node.options */}
        </div>
      );

    case 'button':
      return (
        <div style={baseStyle} onClick={handleClick}>
          <Button type="primary" disabled={isPreview}>
            {node.label || 'Button'}
          </Button>
        </div>
      );

    case 'text':
      return (
        <div style={baseStyle} onClick={handleClick}>
          <Text>{node.label || 'Text'}</Text>
        </div>
      );

    case 'divider':
      return (
        <div style={baseStyle} onClick={handleClick}>
          <Divider />
        </div>
      );

    default:
      return (
        <div style={baseStyle} onClick={handleClick}>
          <Text type="secondary">Unknown type: {node.type}</Text>
        </div>
      );
  }
};
