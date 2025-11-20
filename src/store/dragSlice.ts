/**
 * Drag state slice - Manages lightweight temporary drag state
 * Tracks dragging element, source, and destination for visual feedback
 * without mutating the main form structure during drag operations
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface DragState {
  draggingId: string | null; // ID of the element being dragged
  sourceParentId: string | null; // Parent of the dragged element
  sourceIndex: number | null; // Original index in parent
  destinationParentId: string | null; // Target parent for drop
  destinationIndex: number | null; // Target index in parent
  isDragging: boolean; // Whether a drag operation is active
  dragType: 'palette' | 'canvas' | null; // Source of drag (new component vs reorder)
}

const initialState: DragState = {
  draggingId: null,
  sourceParentId: null,
  sourceIndex: null,
  destinationParentId: null,
  destinationIndex: null,
  isDragging: false,
  dragType: null,
};

// Helper to reset drag state
const resetDragState = (): DragState => ({
  draggingId: null,
  sourceParentId: null,
  sourceIndex: null,
  destinationParentId: null,
  destinationIndex: null,
  isDragging: false,
  dragType: null,
});

const dragSlice = createSlice({
  name: 'drag',
  initialState,
  reducers: {
    startDrag: (
      state,
      action: PayloadAction<{
        draggingId: string;
        sourceParentId: string;
        sourceIndex: number;
        dragType: 'palette' | 'canvas';
      }>
    ) => {
      state.draggingId = action.payload.draggingId;
      state.sourceParentId = action.payload.sourceParentId;
      state.sourceIndex = action.payload.sourceIndex;
      state.isDragging = true;
      state.dragType = action.payload.dragType;
    },
    updateDragDestination: (
      state,
      action: PayloadAction<{
        destinationParentId: string;
        destinationIndex: number;
      }>
    ) => {
      state.destinationParentId = action.payload.destinationParentId;
      state.destinationIndex = action.payload.destinationIndex;
    },
    endDrag: () => resetDragState(),
    cancelDrag: () => resetDragState(),
  },
});

export const { startDrag, updateDragDestination, endDrag, cancelDrag } =
  dragSlice.actions;

export default dragSlice.reducer;
