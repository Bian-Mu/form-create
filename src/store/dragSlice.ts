
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface DragState {
  draggingId: string | null;
  sourceParentId: string | null;
  sourceIndex: number | null;
  destinationParentId: string | null;
  destinationIndex: number | null;
  isDragging: boolean;
  dragType: 'palette' | 'canvas' | null;
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
