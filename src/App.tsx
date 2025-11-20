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
import { addNode, loadForm } from './store/formSlice';
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
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      const overData = over.data.current;
      const parentId = overData?.nodeId || rootId;
      
      dispatch(
        updateDragDestination({
          destinationParentId: parentId,
          destinationIndex: 0,
        })
      );
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    // End drag state
    dispatch(endDrag());

    const result = handleDragEnd(event);
    if (result?.shouldAdd && result.nodeType) {
      dispatch(
        addNode({
          parentId: result.parentId,
          node: { type: result.nodeType },
        })
      );
      message.success(`Added ${result.nodeType} to form`);
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
      message.success('HTML exported successfully! (Open in Word to save as DOCX)');
    } catch {
      message.error('Failed to export HTML');
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
              Export HTML
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
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;

