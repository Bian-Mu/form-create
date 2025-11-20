/**
 * DOCX export utility using html-to-docx
 * Converts HTML DOM to proper DOCX format and triggers download
 */
import HTMLtoDOCX from 'html-to-docx';
import type { FormNode } from '../types';

/**
 * Convert form nodes to HTML string
 */
function nodesToHTML(node: FormNode, nodes: Record<string, FormNode>): string {
  const renderChildren = (): string => {
    if (!node.children) return '';
    return node.children
      .map((childId) => {
        const childNode = nodes[childId];
        if (!childNode) return '';
        return nodesToHTML(childNode, nodes);
      })
      .join('');
  };

  switch (node.type) {
    case 'container':
      return `
        <div style="margin-bottom: 10px; border: 1px solid #ddd; padding: 10px;">
          ${node.label ? `<p style="font-weight: bold; margin-bottom: 8px;">${node.label}</p>` : ''}
          ${renderChildren()}
        </div>
      `;

    case 'row':
      return `
        <table style="width: 100%; margin-bottom: 10px; border-collapse: collapse;">
          <tr>
            ${renderChildren()}
          </tr>
        </table>
      `;

    case 'col':
      return `
        <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">
          ${renderChildren()}
        </td>
      `;

    case 'input':
      return `
        <div style="margin-bottom: 10px;">
          ${node.label ? `<p style="font-weight: bold; margin-bottom: 4px;">${node.label}</p>` : ''}
          <div style="border: 1px solid #ccc; padding: 8px; background-color: #f5f5f5; min-height: 20px;">
            ${node.placeholder || '___________________________'}
          </div>
        </div>
      `;

    case 'textarea':
      return `
        <div style="margin-bottom: 10px;">
          ${node.label ? `<p style="font-weight: bold; margin-bottom: 4px;">${node.label}</p>` : ''}
          <div style="border: 1px solid #ccc; padding: 8px; min-height: 80px; background-color: #f5f5f5;">
            ${node.placeholder || ''}
          </div>
        </div>
      `;

    case 'select':
      return `
        <div style="margin-bottom: 10px;">
          ${node.label ? `<p style="font-weight: bold; margin-bottom: 4px;">${node.label}</p>` : ''}
          <div style="border: 1px solid #ccc; padding: 8px; background-color: #f5f5f5;">
            ${node.placeholder || 'Select an option...'}
          </div>
        </div>
      `;

    case 'checkbox':
      return `
        <div style="margin-bottom: 10px;">
          <p style="margin: 0;">☐ ${node.label || 'Checkbox'}</p>
        </div>
      `;

    case 'button':
      return `
        <div style="margin-bottom: 10px;">
          <div style="background-color: #1890ff; color: white; padding: 8px 16px; text-align: center; border-radius: 4px; display: inline-block;">
            ${node.label || 'Button'}
          </div>
        </div>
      `;

    case 'text':
      return `
        <div style="margin-bottom: 10px;">
          <p style="margin: 0;">${node.label || 'Text'}</p>
        </div>
      `;

    case 'divider':
      return '<hr style="margin: 15px 0; border: 0; border-top: 1px solid #ccc;" />';

    default:
      return '';
  }
}

/**
 * Export form to DOCX using html-to-docx library
 * Converts HTML DOM to proper DOCX format and triggers download
 */
export async function exportToDOCX(nodes: Record<string, FormNode>, rootId: string): Promise<void> {
  try {
    const rootNode = nodes[rootId];
    
    // Generate HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Form Export</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 800px; 
              margin: 20px auto; 
              padding: 20px; 
            }
            h1 {
              color: #1890ff;
              border-bottom: 2px solid #1890ff;
              padding-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <h1>Form Export</h1>
          ${nodesToHTML(rootNode, nodes)}
        </body>
      </html>
    `;

    // Convert HTML to DOCX using html-to-docx
    const docxBlob = await HTMLtoDOCX(htmlContent, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });

    // Trigger download
    const url = URL.createObjectURL(docxBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `form-export-${Date.now()}.docx`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to DOCX:', error);
    throw error;
  }
}

