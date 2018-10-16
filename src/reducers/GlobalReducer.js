import { createModule } from 'redux-modules';
import { Map, List } from 'immutable';
import _ from 'lodash';

const DEFAULT_FIELDS = Map({
	loading: false,
	error: null,
	account: new Map({
		id: '',
		name: '',
		icon: '',
	}),
	network: new Map({
		name: '',
		registrator: '',
		url: '',
	}),
	networks: new List([]),
	crypto: new Map({
		isLocked: true,
		error: null,
	}),
	accounts: new List([]),
	connected: false,
});

export default createModule({
	name: 'global',
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

		disconnect: {
			reducer: () => DEFAULT_FIELDS,
		},

		logout: {
			reducer: (state) => {
				const network = state.get('network');

				return _.cloneDeep(DEFAULT_FIELDS).merge({ network });
			},
		},
	},
});
