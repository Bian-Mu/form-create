# Form Designer Example

A React + TypeScript form designer with drag-and-drop capabilities, Redux state management, and export functionality.

## Features

- **Drag-and-Drop Interface**: Use @dnd-kit to drag components from the palette to the canvas
- **Component Palette**: Variety of form components including:
  - Container, Row, Column (layout components)
  - Input, TextArea, Select (form controls)
  - Checkbox, Button, Text, Divider (UI elements)
- **Properties Panel**: Edit selected component properties (label, placeholder, default value, required flag)
- **Redux State Management**: Flattened node storage with Redux Toolkit for efficient updates
- **Export Functionality**:
  - **PDF Export**: Using @react-pdf/renderer for high-quality PDF generation
  - **HTML Export**: Generates HTML files that can be opened in Word and saved as DOCX
- **Sample Form**: Pre-built sample form demonstrating nested layouts

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **@dnd-kit** - Modern drag-and-drop library
- **Ant Design** - UI components
- **@react-pdf/renderer** - PDF generation
- **Vite** - Build tool

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Usage

1. **Load Sample**: Click "Load Sample" to load a pre-built form
2. **Drag Components**: Drag components from the palette to the canvas
3. **Select & Edit**: Click on any component to select it and edit its properties in the right panel
4. **Export**:
   - Click "Export PDF" to download a PDF version
   - Click "Export HTML" to download an HTML file (can be opened in Word and saved as DOCX)

## Architecture

### State Management

The form state uses a flattened structure:
```typescript
{
  nodes: Record<string, FormNode>,  // Flat map of all nodes
  rootId: string,                   // Root container ID
  selectedNodeId: string | null     // Currently selected node
}
```

This approach avoids deep nesting and makes updates more efficient.

### Components

- **Palette**: Draggable component items
- **Canvas**: Drop zone and rendering area
- **Renderer**: Recursive component that renders form nodes
- **PropertiesPanel**: Edit panel for selected components

### Utilities

- **dndHelpers.ts**: Drag-and-drop logic
- **exportPdf.tsx**: PDF export using @react-pdf
- **exportDocx.tsx**: HTML export (fallback for DOCX)

## Screenshots

### Initial State
![Form Designer Initial](https://github.com/user-attachments/assets/65ff76b3-f67a-46ce-937d-bb4c4f5fefdf)

### With Sample Form
![Form Designer with Sample](https://github.com/user-attachments/assets/83c51be9-60c6-4254-a325-73b7c6e7b396)

### Properties Panel
![Form Designer with Properties](https://github.com/user-attachments/assets/2a7ad466-d946-43ac-8505-ea5109dd9980)

### After Drag & Drop
![Form Designer after Drag](https://github.com/user-attachments/assets/b83ea437-85c3-416e-bfb0-f7042343b96d)

## Notes

- The DOCX export currently exports to HTML format. Users can open the HTML file in Microsoft Word and save as DOCX.
- The application uses @dnd-kit instead of react-beautiful-dnd for React 19 compatibility.
- The bundle size is large due to Ant Design and PDF rendering libraries. Consider code splitting for production use.
