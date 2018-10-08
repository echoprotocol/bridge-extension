import { createModule } from 'redux-modules';
import { Map, List } from 'immutable';

const DEFAULT_FIELDS = Map({
	globalLoading: true,
	loading: false,
	error: null,
	activeUser: new Map({
		id: '',
		name: '',
	}),
	network: new Map({
		name: '',
		registrator: '',
		url: '',
	}),
	networks: new List([]),
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
		setGlobalLoading: {
			reducer: (state, { payload }) => {
				state = state.set('globalLoading', payload.globalLoading);

				return state;
			},
		},
		setLoading: {
			reducer: (state, { payload }) => {
				state = state.set('loading', !!payload);
				return state;
			},
		},
		push: {
			reducer: (state, { payload }) => {
				state = state.setIn([payload.field, payload.param], payload.value);

				return state;
			},
		},
		update: {
			reducer: (state, { payload }) => {
				const param = state.getIn([payload.field, payload.param]);

				state = state.setIn([payload.field, payload.param], { ...param, ...payload.value });

				return state;
			},
		},
		remove: {
			reducer: (state, { payload }) => {
				state = state.deleteIn([payload.field, payload.param]);

				return state;
			},
		},
		disconnect: {
			reducer: () => DEFAULT_FIELDS,
		},
	},
});
