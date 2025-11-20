# Form Designer Example

A React + TypeScript form designer with advanced drag-and-drop capabilities, Redux state management, and export functionality.

## Features

- **Advanced Drag-and-Drop Interface**: 
  - Custom drag preview with portal overlay that follows the cursor
  - Visual insert highlight indicators showing drop positions
  - Drag state management with Redux for smooth operations
  - Uses @dnd-kit for modern, React 19 compatible drag-and-drop
- **Component Palette**: Variety of form components including:
  - Container, Row, Column (layout components)
  - Input, TextArea, Select (form controls)
  - Checkbox, Button, Text, Divider (UI elements)
- **Properties Panel**: Edit selected component properties (label, placeholder, default value, required flag)
- **Redux State Management**: 
  - Flattened node storage with Redux Toolkit for efficient updates
  - Separate dragSlice for managing temporary drag state
  - Prevents unnecessary re-renders during drag operations
- **Export Functionality**:
  - **PDF Export**: Using @react-pdf/renderer for high-quality PDF generation
  - **HTML Export**: Generates HTML files that can be opened in Word and saved as DOCX
- **Sample Form**: Pre-built sample form demonstrating nested layouts

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Redux Toolkit** - State management (formSlice + dragSlice)
- **@dnd-kit** - Modern drag-and-drop library with portal support
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

The application uses two Redux slices for optimal performance:

**Form State (formSlice)** - Flattened structure for the form tree:
```typescript
{
  nodes: Record<string, FormNode>,  // Flat map of all nodes
  rootId: string,                   // Root container ID
  selectedNodeId: string | null     // Currently selected node
}
```

**Drag State (dragSlice)** - Temporary state during drag operations:
```typescript
{
  draggingId: string | null,        // Element being dragged
  sourceParentId: string | null,    // Source parent container
  sourceIndex: number | null,       // Original position
  destinationParentId: string | null, // Target parent
  destinationIndex: number | null,  // Target position
  isDragging: boolean,              // Drag active flag
  dragType: 'palette' | 'canvas'    // Drag source type
}
```

This separation avoids deep nesting issues and prevents unnecessary re-renders during drag operations.

### Drag-and-Drop Features

- **DragOverlay with Portal**: Custom drag preview that follows the cursor, rendered via portal to `document.body`
- **Insert Highlights**: Visual indicators showing where components will be dropped
- **Drag State Tracking**: Redux integration for managing drag state across components
- **CSS Animations**: Smooth transitions and visual feedback during drag operations

### Components

- **Palette**: Draggable component items with drag state tracking
- **Canvas**: Drop zone with insert highlight indicators
- **Renderer**: Recursive component that renders form nodes
- **PropertiesPanel**: Edit panel for selected components

### Utilities

- **dndHelpers.ts**: Drag-and-drop logic for handling drop events
- **exportPdf.tsx**: PDF export using @react-pdf
- **exportDocx.tsx**: HTML export (fallback for DOCX)

### Styling

- **drag.css**: Comprehensive styles for drag operations including:
  - Custom drag preview portal styles
  - Insert highlight animations
  - Drop zone visual feedback
  - Draggable item hover effects

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
