import { createModule } from 'redux-modules';
import { Map } from 'immutable';

const DEFAULT_FIELDS = Map({
	wif: '',
	isCreate: false,
});

export default createModule({
	name: 'welcome',
	initialState: DEFAULT_FIELDS,
	transformations: {
		set: {
			reducer: (state, { payload }) => {
				state = state.set(payload.field, payload.value);

				return state;
			},
		},

		setIn: {
			reducer: (state, { payload }) => {
				Object.keys(payload.params).forEach((field) => {
					state = state.setIn([payload.field, field], payload.params[field]);
				});

				return state;
			},
		},

		reset: {
			reducer: (state) => {
				state = DEFAULT_FIELDS;
				return state;
			},
		},
	},
});
