/**
 * Properties panel - edit selected node properties
 */
import React from 'react';
import { Card, Form, Input, Switch, Button, Typography } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { updateNode, removeNode } from '../store/formSlice';

const { TextArea } = Input;
const { Text } = Typography;

export const PropertiesPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { nodes, selectedNodeId } = useSelector((state: RootState) => state.form);
  const selectedNode = selectedNodeId ? nodes[selectedNodeId] : null;
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (selectedNode) {
      form.setFieldsValue({
        label: selectedNode.label || '',
        placeholder: selectedNode.placeholder || '',
        required: selectedNode.required || false,
        defaultValue: selectedNode.defaultValue || '',
      });
    }
  }, [selectedNode, form]);

  if (!selectedNode) {
    return (
      <Card title="Properties" style={{ height: '100%' }}>
        <Text type="secondary">Select a component to edit its properties</Text>
      </Card>
    );
  }

  const handleUpdate = (changedValues: Record<string, unknown>) => {
    if (selectedNodeId) {
      dispatch(updateNode({ id: selectedNodeId, updates: changedValues }));
    }
  };

  const handleDelete = () => {
    if (selectedNodeId && selectedNodeId !== 'root') {
      dispatch(removeNode(selectedNodeId));
    }
  };

  // Show different fields based on node type
  const showLabel = ['input', 'textarea', 'select', 'checkbox', 'button', 'text', 'container'].includes(
    selectedNode.type
  );
  const showPlaceholder = ['input', 'textarea', 'select'].includes(selectedNode.type);
  const showDefaultValue = ['input', 'textarea', 'select'].includes(selectedNode.type);
  const showRequired = ['input', 'textarea', 'select', 'checkbox'].includes(selectedNode.type);

  return (
    <Card
      title={`Properties: ${selectedNode.type}`}
      style={{ height: '100%', overflow: 'auto' }}
      extra={
        selectedNodeId !== 'root' && (
          <Button danger size="small" onClick={handleDelete}>
            Delete
          </Button>
        )
      }
    >
      <Form form={form} layout="vertical" onValuesChange={handleUpdate}>
        <Text type="secondary">ID: {selectedNode.id}</Text>

        {showLabel && (
          <Form.Item label="Label" name="label">
            <Input placeholder="Enter label" />
          </Form.Item>
        )}

        {showPlaceholder && (
          <Form.Item label="Placeholder" name="placeholder">
            <Input placeholder="Enter placeholder" />
          </Form.Item>
        )}

        {showDefaultValue && (
          <Form.Item label="Default Value" name="defaultValue">
            <Input placeholder="Enter default value" />
          </Form.Item>
        )}

        {showRequired && (
          <Form.Item label="Required" name="required" valuePropName="checked">
            <Switch />
          </Form.Item>
        )}

        {selectedNode.type === 'select' && (
          <Form.Item label="Options">
            <TextArea
              placeholder="Enter options (one per line)"
              rows={4}
              defaultValue={selectedNode.options?.map((opt) => `${opt.label}:${opt.value}`).join('\n')}
              onChange={(e) => {
                const lines = e.target.value.split('\n').filter((line) => line.trim());
                const options = lines.map((line) => {
                  const [label, value] = line.split(':').map((s) => s.trim());
                  return { label: label || value, value: value || label };
                });
                dispatch(updateNode({ id: selectedNodeId!, updates: { options } }));
              }}
            />
          </Form.Item>
        )}
      </Form>
    </Card>
  );
};
