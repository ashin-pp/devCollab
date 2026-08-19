import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Poll } from '../../types/poll';
import { pollApi } from '../../api/poll/poll.service';

interface PollState {
  polls: Poll[];
  loading: boolean;
  error: string | null;
}

const initialState: PollState = {
  polls: [],
  loading: false,
  error: null,
};

export const fetchWorkspacePolls = createAsyncThunk(
  'polls/fetchWorkspacePolls',
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      return await pollApi.getWorkspacePolls(workspaceId);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch polls');
    }
  }
);

export const fetchChannelPolls = createAsyncThunk(
  'polls/fetchChannelPolls',
  async (channelId: string, { rejectWithValue }) => {
    try {
      return await pollApi.getChannelPolls(channelId);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch polls');
    }
  }
);

export const votePoll = createAsyncThunk(
  'polls/vote',
  async ({ pollId, optionId }: { pollId: string; optionId: string }, { rejectWithValue }) => {
    try {
      return await pollApi.vote(pollId, optionId);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to vote');
    }
  }
);

export const deletePollThunk = createAsyncThunk(
  'polls/delete',
  async (pollId: string, { rejectWithValue }) => {
    try {
      await pollApi.delete(pollId);
      return pollId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to delete poll');
    }
  }
);

export const closePollThunk = createAsyncThunk(
  'polls/close',
  async (pollId: string, { rejectWithValue }) => {
    try {
      return await pollApi.close(pollId);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to close poll');
    }
  }
);

const pollSlice = createSlice({
  name: 'polls',
  initialState,
  reducers: {
    addPoll: (state, action: PayloadAction<Poll>) => {
      const index = state.polls.findIndex(p => p.id === action.payload.id);
      if (index === -1) {
        state.polls.unshift(action.payload);
      }
    },
    updatePoll: (state, action: PayloadAction<Poll>) => {
      const index = state.polls.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.polls[index] = action.payload;
      }
    },
    removePoll: (state, action: PayloadAction<string>) => {
      state.polls = state.polls.filter(p => p.id !== action.payload);
    },
    clearPolls: (state) => {
      state.polls = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspacePolls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspacePolls.fulfilled, (state, action) => {
        state.loading = false;
        state.polls = action.payload;
      })
      .addCase(fetchWorkspacePolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchChannelPolls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChannelPolls.fulfilled, (state, action) => {
        state.loading = false;
        state.polls = action.payload;
      })
      .addCase(fetchChannelPolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(votePoll.fulfilled, (state, action) => {
        const index = state.polls.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.polls[index] = action.payload;
        }
      })
      .addCase(closePollThunk.fulfilled, (state, action) => {
        const index = state.polls.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.polls[index] = action.payload;
        }
      });
  }
});

export const { addPoll, updatePoll, removePoll, clearPolls } = pollSlice.actions;
export default pollSlice.reducer;
