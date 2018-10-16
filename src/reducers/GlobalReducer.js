import { createModule } from 'redux-modules';
import { Map, List } from 'immutable';
import _ from 'lodash';

const DEFAULT_LOCKED_FIELDS = Map({
	account: new Map({
		id: '',
		name: '',
		icon: '',
	}),
	crypto: new Map({
		isLocked: true,
		error: null,
		goBack: false,
	}),
	accounts: new List([]),
});

const DEFAULT_FIELDS = Map({
	loading: false,
	error: null,
	network: new Map({
		name: '',
		registrator: '',
		url: '',
	}),
	networks: new List([]),
	connected: false,
});

export default createModule({
	name: 'global',
	initialState: _.cloneDeep(DEFAULT_FIELDS).merge(DEFAULT_LOCKED_FIELDS),
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

		lock: {
			reducer: (state) => {
				state = _.cloneDeep(state).merge(DEFAULT_LOCKED_FIELDS);
				return state.setIn(['crypto', 'goBack'], true);
			},
		},
	},
});
