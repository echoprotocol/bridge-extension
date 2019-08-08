import { createModule } from 'redux-modules';
import { Map, List, OrderedMap } from 'immutable';
import _ from 'lodash';

const DEFAULT_LOCKED_FIELDS = Map({
	account: new Map(),
	accounts: new Map(),
});

const DEFAULT_FIELDS = Map({
	loading: false,
	error: null,
	visibleSidebar: false,
	network: new Map({
		name: '',
		url: '',
	}),
	networkInfo: {
		name: '',
		url: '',
		isActive: false,
		custom: false,
	},
	networks: new List([]),
	connected: false,
	crypto: new Map({
		isLocked: true,
		error: null,
		goTo: null,
	}),
	sign: new Map({
		current: null,
		dataToShow: null,
		transactions: [],
		goTo: null,
	}),
	headBlockNum: 0,
	history: new List([]),
	formattedHistory: new OrderedMap({}),
	signAccount: new Map({}),
	providerRequests: new Map({}),
	signMessageRequests: new Map({}),
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

		deleteIn: {
			reducer: (state, { payload }) => {
				payload.params.forEach((field) => {
					state = state.deleteIn([payload.field, field]);
				});

				return state;
			},
		},

	},
});
