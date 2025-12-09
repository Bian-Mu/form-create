
import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { FormNode } from '../types';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  container: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  col: {
    flex: 1,
    marginRight: 10,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    border: '1 solid #cccccc',
    padding: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#1890ff',
    color: 'white',
    padding: 8,
    textAlign: 'center',
    borderRadius: 4,
  },
  divider: {
    borderBottom: '1 solid #cccccc',
    marginVertical: 10,
  },
});

interface RenderPDFNodeProps {
  node: FormNode;
  nodes: Record<string, FormNode>;
}

const RenderPDFNode: React.FC<RenderPDFNodeProps> = ({ node, nodes }) => {
  const renderChildren = () => {
    if (!node.children) return null;
    return node.children.map((childId) => {
      const childNode = nodes[childId];
      if (!childNode) return null;
      return <RenderPDFNode key={childId} node={childNode} nodes={nodes} />;
    });
  };

  switch (node.type) {
    case 'container':
      return (
        <View style={styles.container}>
          {node.label && <Text style={styles.label}>{node.label}</Text>}
          {renderChildren()}
        </View>
      );

    case 'row':
      return <View style={styles.row}>{renderChildren()}</View>;

    case 'col':
      return <View style={styles.col}>{renderChildren()}</View>;

    case 'input':
    case 'textarea':
      return (
        <View style={styles.container}>
          {node.label && <Text style={styles.label}>{node.label}</Text>}
          <View style={styles.input}>
            <Text>{node.placeholder || ''}</Text>
          </View>
        </View>
      );

    case 'select':
      return (
        <View style={styles.container}>
          {node.label && <Text style={styles.label}>{node.label}</Text>}
          <View style={styles.input}>
            <Text>{node.placeholder || 'Select...'}</Text>
          </View>
        </View>
      );

    case 'checkbox':
      return (
        <View style={styles.container}>
          <Text>☐ {node.label || 'Checkbox'}</Text>
        </View>
      );

    case 'button':
      return (
        <View style={styles.container}>
          <View style={styles.button}>
            <Text>{node.label || 'Button'}</Text>
          </View>
        </View>
      );

    case 'text':
      return (
        <View style={styles.container}>
          <Text>{node.label || 'Text'}</Text>
        </View>
      );

    case 'divider':
      return <View style={styles.divider} />;

    default:
      return null;
  }
};


const FormPDFDocument: React.FC<{ nodes: Record<string, FormNode>; rootId: string }> = ({
  nodes,
  rootId,
}) => {
  const rootNode = nodes[rootId];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <RenderPDFNode node={rootNode} nodes={nodes} />
      </Page>
    </Document>
  );
};


export async function exportToPDF(nodes: Record<string, FormNode>, rootId: string): Promise<void> {
  try {
    const doc = <FormPDFDocument nodes={nodes} rootId={rootId} />;
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `form-${Date.now()}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
}
