import { createModule } from 'redux-modules';
import { Map } from 'immutable';
import _ from 'lodash';

const DEFAULT_FIELDS = Map({
	globalLoading: false,
	accountLoading: false,
	error: null,
	activeUser: new Map({
		id: '',
		name: '',
		icon: '',
	}),
	network: new Map({
		name: '',
		registrator: '',
		url: '',
	}),
	cryptoError: null,
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
		logout: {
			reducer: (state) => {
				const network = state.get('network');

				return _.cloneDeep(DEFAULT_FIELDS).merge({ network });
			},
		},
	},
});
