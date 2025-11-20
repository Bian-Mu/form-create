/**
 * DOCX export utility using docx library
 * Converts form nodes to proper DOCX format and triggers download
 */
import { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, Packer } from 'docx';
import { saveAs } from 'file-saver';
import type { FormNode } from '../types';

/**
 * Convert form nodes to docx paragraphs and tables
 */
function nodesToDocxElements(node: FormNode, nodes: Record<string, FormNode>): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  const renderChildren = (): (Paragraph | Table)[] => {
    if (!node.children) return [];
    const childElements: (Paragraph | Table)[] = [];
    node.children.forEach((childId) => {
      const childNode = nodes[childId];
      if (!childNode) return;
      childElements.push(...nodesToDocxElements(childNode, nodes));
    });
    return childElements;
  };

  switch (node.type) {
    case 'container':
      if (node.label) {
        elements.push(
          new Paragraph({
            text: node.label,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );
      }
      elements.push(...renderChildren());
      break;

    case 'row':
      // Create a table row with columns
      const childCells = node.children?.map((childId) => {
        const childNode = nodes[childId];
        if (!childNode) return new TableCell({ children: [] });
        const cellContent = nodesToDocxElements(childNode, nodes);
        return new TableCell({
          children: cellContent.length > 0 ? cellContent : [new Paragraph({ text: '' })],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
          },
        });
      }) || [];

      elements.push(
        new Table({
          rows: [new TableRow({ children: childCells })],
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );
      break;

    case 'col':
      // Render column content directly
      elements.push(...renderChildren());
      break;

    case 'input':
      if (node.label) {
        elements.push(
          new Paragraph({
            children: [new TextRun({ text: node.label, bold: true })],
            spacing: { before: 100, after: 50 },
          })
        );
      }
      elements.push(
        new Paragraph({
          text: node.placeholder || '________________________________',
          spacing: { after: 100 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' },
          },
        })
      );
      break;

    case 'textarea':
      if (node.label) {
        elements.push(
          new Paragraph({
            children: [new TextRun({ text: node.label, bold: true })],
            spacing: { before: 100, after: 50 },
          })
        );
      }
      elements.push(
        new Paragraph({
          text: node.placeholder || '',
          spacing: { after: 100 },
        }),
        new Paragraph({ text: '_____________________________________' }),
        new Paragraph({ text: '_____________________________________' }),
        new Paragraph({ text: '_____________________________________', spacing: { after: 100 } })
      );
      break;

    case 'select':
      if (node.label) {
        elements.push(
          new Paragraph({
            children: [new TextRun({ text: node.label, bold: true })],
            spacing: { before: 100, after: 50 },
          })
        );
      }
      elements.push(
        new Paragraph({
          text: node.placeholder || 'Select an option: _________________',
          spacing: { after: 100 },
        })
      );
      break;

    case 'checkbox':
      elements.push(
        new Paragraph({
          text: `☐ ${node.label || 'Checkbox'}`,
          spacing: { before: 50, after: 50 },
        })
      );
      break;

    case 'button':
      elements.push(
        new Paragraph({
          text: `[${node.label || 'Button'}]`,
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 100 },
        })
      );
      break;

    case 'text':
      elements.push(
        new Paragraph({
          text: node.label || 'Text',
          spacing: { before: 50, after: 50 },
        })
      );
      break;

    case 'divider':
      elements.push(
        new Paragraph({
          text: '',
          spacing: { before: 100, after: 100 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
          },
        })
      );
      break;

    default:
      break;
  }

  return elements;
}

/**
 * Export form to DOCX using docx library
 * Creates a proper DOCX document and triggers download
 */
export async function exportToDOCX(nodes: Record<string, FormNode>, rootId: string): Promise<void> {
  try {
    const rootNode = nodes[rootId];
    
    // Generate document elements
    const docElements = nodesToDocxElements(rootNode, nodes);

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: 'Form Export',
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
            ...docElements,
          ],
        },
      ],
    });

    // Generate and download DOCX
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `form-export-${Date.now()}.docx`);
  } catch (error) {
    console.error('Error exporting to DOCX:', error);
    throw error;
  }
}

