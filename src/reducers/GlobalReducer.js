import { createModule } from 'redux-modules';
import { Map, List, OrderedMap } from 'immutable';
import _ from 'lodash';

const DEFAULT_LOCKED_FIELDS = Map({
	account: null,
	accounts: new Map(),
});

const DEFAULT_FIELDS = Map({
	loading: false,
	error: null,
	visibleSidebar: false,
	network: new Map({
		name: '',
		registrator: '',
		url: '',
	}),
	networks: new List([]),
	connected: false,
	crypto: new Map({
		isLocked: true,
		error: null,
		goTo: null,
	}),
	sign: new Map({
		current: null,
		transactions: new List([]),
		goTo: null,
	}),
	history: new List([]),
	formattedHistory: new OrderedMap({}),
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

		logout: {
			reducer: (state) => {
				state = _.cloneDeep(state).merge({
					account: DEFAULT_LOCKED_FIELDS.get('account'),
				});
				return state;
			},
		},

		lock: {
			reducer: (state, { payload }) => {
				state = _.cloneDeep(state).merge(DEFAULT_LOCKED_FIELDS);
				state = state.setIn(['crypto', 'goTo'], payload.goTo);
				return state.setIn(['crypto', 'isLocked'], true);
			},
		},

		sidebarToggle: {
			reducer: (state, { payload }) => state.set('visibleSidebar', !payload.value),
		},
	},
});
