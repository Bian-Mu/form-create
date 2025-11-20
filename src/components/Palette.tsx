/**
 * Component palette - draggable components that can be added to canvas
 */
import { Card, Typography, Space } from 'antd';
import { useDraggable } from '@dnd-kit/core';
import type { PaletteItem } from '../types';

const { Text } = Typography;

// Available components in the palette
const paletteItems: PaletteItem[] = [
  { type: 'container', label: 'Container', icon: '📦' },
  { type: 'row', label: 'Row', icon: '↔️' },
  { type: 'col', label: 'Column', icon: '↕️' },
  { type: 'input', label: 'Input', icon: '📝' },
  { type: 'textarea', label: 'TextArea', icon: '📄' },
  { type: 'select', label: 'Select', icon: '📋' },
  { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { type: 'button', label: 'Button', icon: '🔘' },
  { type: 'text', label: 'Text', icon: '📌' },
  { type: 'divider', label: 'Divider', icon: '➖' },
];

interface DraggableItemProps {
  item: PaletteItem;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ item }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.type}`,
    data: { type: item.type, source: 'palette' },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        padding: '12px',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
        cursor: 'grab',
        backgroundColor: isDragging ? '#e6f7ff' : 'white',
        opacity: isDragging ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span style={{ fontSize: '20px' }}>{item.icon}</span>
      <Text>{item.label}</Text>
    </div>
  );
};

export const Palette: React.FC = () => {
  return (
    <Card title="Components" style={{ height: '100%', overflow: 'auto' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        {paletteItems.map((item) => (
          <DraggableItem key={item.type} item={item} />
        ))}
      </Space>
    </Card>
  );
};
