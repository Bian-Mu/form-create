/**
 * Main App component - Form Designer
 * Integrates Palette, Canvas, and Properties Panel with DnD support
 */
import { Layout, Button, Space, Typography, message } from 'antd';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useDispatch, useSelector } from 'react-redux';
import { Palette } from './components/Palette';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { addNode, loadForm } from './store/formSlice';
import { handleDragEnd } from './utils/dndHelpers';
import { exportToPDF } from './utils/exportPdf';
import { exportToDOCX } from './utils/exportDocx';
import type { RootState } from './store';
import sampleForm from './sampleForm.json';
import './App.css';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

function App() {
  const dispatch = useDispatch();
  const { nodes, rootId } = useSelector((state: RootState) => state.form);

  const onDragEnd = (event: DragEndEvent) => {
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
    } catch (error) {
      message.error('Failed to export PDF');
    }
  };

  const handleExportDOCX = async () => {
    try {
      await exportToDOCX(nodes, rootId);
      message.success('DOCX exported successfully!');
    } catch (error) {
      message.error('Failed to export DOCX');
    }
  };

  const handleLoadSample = () => {
    dispatch(loadForm(sampleForm as any));
    message.success('Sample form loaded!');
  };

  return (
    <DndContext onDragEnd={onDragEnd}>
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
    </DndContext>
  );
}

export default App;

