/**
 * DOCX export utility
 * Note: html-to-docx has Node.js dependencies that don't work well in browser.
 * This provides a simple fallback that creates an HTML file.
 */
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
        <div style="margin-bottom: 10px;">
          ${node.label ? `<p style="font-weight: bold;">${node.label}</p>` : ''}
          ${renderChildren()}
        </div>
      `;

    case 'row':
      return `
        <div style="display: flex; margin-bottom: 10px;">
          ${renderChildren()}
        </div>
      `;

    case 'col':
      return `
        <div style="flex: 1; margin-right: 10px;">
          ${renderChildren()}
        </div>
      `;

    case 'input':
      return `
        <div style="margin-bottom: 10px;">
          ${node.label ? `<p style="font-weight: bold;">${node.label}</p>` : ''}
          <div style="border: 1px solid #ccc; padding: 8px; background-color: #f5f5f5;">
            ${node.placeholder || ''}
          </div>
        </div>
      `;

    case 'textarea':
      return `
        <div style="margin-bottom: 10px;">
          ${node.label ? `<p style="font-weight: bold;">${node.label}</p>` : ''}
          <div style="border: 1px solid #ccc; padding: 8px; height: 80px; background-color: #f5f5f5;">
            ${node.placeholder || ''}
          </div>
        </div>
      `;

    case 'select':
      return `
        <div style="margin-bottom: 10px;">
          ${node.label ? `<p style="font-weight: bold;">${node.label}</p>` : ''}
          <div style="border: 1px solid #ccc; padding: 8px; background-color: #f5f5f5;">
            ${node.placeholder || 'Select...'}
          </div>
        </div>
      `;

    case 'checkbox':
      return `
        <div style="margin-bottom: 10px;">
          <p>☐ ${node.label || 'Checkbox'}</p>
        </div>
      `;

    case 'button':
      return `
        <div style="margin-bottom: 10px;">
          <div style="background-color: #1890ff; color: white; padding: 8px; text-align: center; border-radius: 4px; display: inline-block;">
            ${node.label || 'Button'}
          </div>
        </div>
      `;

    case 'text':
      return `
        <div style="margin-bottom: 10px;">
          <p>${node.label || 'Text'}</p>
        </div>
      `;

    case 'divider':
      return '<hr style="margin: 10px 0; border: 1px solid #ccc;" />';

    default:
      return '';
  }
}

/**
 * Export form to HTML (as a fallback for DOCX)
 * Users can open the HTML in Word and save as DOCX
 */
export async function exportToDOCX(nodes: Record<string, FormNode>, rootId: string): Promise<void> {
  try {
    const rootNode = nodes[rootId];
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Form Export</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; }
          </style>
        </head>
        <body>
          <h1>Form Export</h1>
          ${nodesToHTML(rootNode, nodes)}
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `form-${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting HTML:', error);
    throw error;
  }
}

