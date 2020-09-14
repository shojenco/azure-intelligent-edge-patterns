import { createSlice, createAsyncThunk, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { State } from 'RootStateType';
import {
  getInitialDemoState,
  isCRDAction,
  insertDemoFields,
  getSliceApiByDemo,
  getNonDemoSelector,
} from './shared/DemoSliceUtils';

type TrainingProject = {
  id: number;
  name: string;
  customVisionId: string;
  isDemo: boolean;
};

export const getTrainingProject = createAsyncThunk<any, boolean, { state: State }>(
  'trainingSlice/get',
  async (isDemo): Promise<TrainingProject[]> => {
    const response = await getSliceApiByDemo('projects', isDemo);
    return response.data.map((e) => ({
      id: e.id,
      name: e.name,
      customVisionId: e.customvision_id,
      isDemo: e.is_demo,
    }));
  },
);

const entityAdapter = createEntityAdapter<TrainingProject>();

const slice = createSlice({
  name: 'trainingSlice',
  initialState: getInitialDemoState(entityAdapter.getInitialState()),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTrainingProject.fulfilled, entityAdapter.setAll)
      .addMatcher(isCRDAction, insertDemoFields);
  },
});

const { reducer } = slice;
export default reducer;

export const {
  selectAll: selectAllTrainingProjects,
  selectById: selectTrainingProjectById,
  selectEntities: selectTrainingProjectEntities,
} = entityAdapter.getSelectors((state: State) => state.trainingProject);

export const selectNonDemoProject = getNonDemoSelector('trainingProject', selectTrainingProjectEntities);

export const trainingProjectOptionsSelector = (demoProjectId?: number) =>
  createSelector(
    [selectNonDemoProject, (state) => selectTrainingProjectById(state, demoProjectId)],
    (trainingProjects, demoTrainingProject) => {
      const projects = demoTrainingProject ? [demoTrainingProject, ...trainingProjects] : trainingProjects;
      return projects.map((e) => ({
        key: e.id,
        text: e.name,
      }));
    },
  );
