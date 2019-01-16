import { createModule } from 'redux-modules';
import { Map } from 'immutable';

export default createModule({
	name: 'modal',
	initialState: Map({}),
	transformations: {
		open: {
			reducer: (state, { payload }) => {
				state = state.setIn([payload.type, 'show'], true);
				return state;
			},
		},
		close: {
			reducer: (state, { payload }) => {
				state = state.setIn([payload.type, 'show'], false);
				return state;
			},
		},
	},
});
