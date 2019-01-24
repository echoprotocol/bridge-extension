import { createModule } from 'redux-modules';
import { Map } from 'immutable';

const DEFAULT_FIELDS = Map({
	objectsById: new Map(),
	accountsByName: new Map(),
});

export default createModule({
	name: 'blockchain',
	initialState: DEFAULT_FIELDS,
	transformations: {
		set: {
			reducer: (state, { payload }) => {
				const newMap = state.get(payload.field).withMutations((map) => {
					payload.value.forEach((value, key) => { map.set(key, value); });
				});

				state = state.set(payload.field, newMap);

				return state;
			},
		},
		disconnect: {
			reducer: () => DEFAULT_FIELDS,
		},
	},
});
