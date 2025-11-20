/**
 * Main App component - Form Designer
 * Integrates Palette, Canvas, and Properties Panel with DnD support
 * Includes custom drag preview with portal and drag state management
 */
import { Layout, Button, Space, Typography, message } from 'antd';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  DragOverlay,
  pointerWithin,
} from '@dnd-kit/core';
import { useDispatch, useSelector } from 'react-redux';
import { Palette } from './components/Palette';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { addNode, loadForm, moveNode } from './store/formSlice';
import { startDrag, updateDragDestination, endDrag } from './store/dragSlice';
import { handleDragEnd } from './utils/dndHelpers';
import { exportToPDF } from './utils/exportPdf';
import { exportToDOCX } from './utils/exportDocx';
import type { RootState, FormState } from './store';
import sampleForm from './sampleForm.json';
import './App.css';
import './styles/drag.css';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

function App() {
  const dispatch = useDispatch();
  const { nodes, rootId } = useSelector((state: RootState) => state.form);
  const dragState = useSelector((state: RootState) => state.drag);

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.source === 'palette') {
      // Dragging from palette
      dispatch(
        startDrag({
          draggingId: active.id as string,
          sourceParentId: 'palette',
          sourceIndex: -1,
          dragType: 'palette',
        })
      );
    } else if (activeData?.source === 'canvas') {
      // Dragging from canvas (reordering)
      const nodeId = activeData.nodeId as string;
      const parentId = activeData.parentPath as string || 'root';
      
      // Find the current index of this node in its parent
      const parent = nodes[parentId];
      const currentIndex = parent?.children?.indexOf(nodeId) ?? -1;
      
      dispatch(
        startDrag({
          draggingId: nodeId,
          sourceParentId: parentId,
          sourceIndex: currentIndex,
          dragType: 'canvas',
        })
      );
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      const overData = over.data.current;
      const parentId = overData?.nodeId || 'root';
      
      // Calculate the index based on the children's position
      const parent = nodes[parentId];
      const childrenCount = parent?.children?.length || 0;
      
      dispatch(
        updateDragDestination({
          destinationParentId: parentId,
          destinationIndex: childrenCount, // Default to end
        })
      );
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    // End drag state
    dispatch(endDrag());

    const result = handleDragEnd(event);
    
    if (dragState.dragType === 'palette' && result?.shouldAdd && result.nodeType) {
      // Adding new component from palette
      dispatch(
        addNode({
          parentId: result.parentId,
          node: { type: result.nodeType },
          index: result.index,
        })
      );
      message.success(`Added ${result.nodeType} to form`);
    } else if (dragState.dragType === 'canvas' && dragState.sourceParentId && dragState.draggingId) {
      // Reordering existing component
      const { over } = event;
      if (over) {
        const overData = over.data.current;
        const targetParentId = overData?.nodeId || 'root';
        const targetParent = nodes[targetParentId];
        const targetIndex = targetParent?.children?.length || 0;
        
        dispatch(
          moveNode({
            nodeId: dragState.draggingId,
            newParentId: targetParentId,
            newIndex: targetIndex,
          })
        );
        message.success('Component moved successfully');
      }
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF(nodes, rootId);
      message.success('PDF exported successfully!');
    } catch {
      message.error('Failed to export PDF');
    }
  };

  const handleExportDOCX = async () => {
    try {
      await exportToDOCX(nodes, rootId);
      message.success('DOCX exported successfully!');
    } catch {
      message.error('Failed to export DOCX');
    }
  };

  const handleLoadSample = () => {
    dispatch(loadForm(sampleForm as FormState));
    message.success('Sample form loaded!');
  };

  return (
    <DndContext
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      collisionDetection={pointerWithin}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#001529', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            Form Designer
          </Title>
          <Space>
            <Button onClick={handleLoadSample}>Load Sample</Button>
            <Button type="primary" onClick={handleExportPDF}>
              Export PDF
            </Button>
            <Button type="primary" onClick={handleExportDOCX}>
              Export DOCX
            </Button>
          </Space>
        </Header>

        <Layout>
          <Sider width={250} theme="light" style={{ padding: '16px', overflow: 'auto' }}>
            <Palette />
          </Sider>

          <Content style={{ padding: '16px', background: '#f0f2f5' }}>
            <Canvas />
          </Content>

          <Sider width={300} theme="light" style={{ padding: '16px', overflow: 'auto' }}>
            <PropertiesPanel />
          </Sider>
        </Layout>
      </Layout>

      {/* Custom drag overlay with portal - follows cursor */}
      <DragOverlay dropAnimation={null}>
        {dragState.isDragging && dragState.dragType === 'palette' ? (
          <div className="drag-preview-content">
            <span className="drag-preview-icon">🎯</span>
            Dragging component...
          </div>
        ) : dragState.isDragging && dragState.dragType === 'canvas' && dragState.draggingId ? (
          <div className="drag-preview-content">
            <span className="drag-preview-icon">📦</span>
            Moving {nodes[dragState.draggingId]?.type || 'component'}...
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;

