import { createModule } from 'redux-modules';
import { Map } from 'immutable';
import { CORE_SYMBOL } from '../constants/GlobalConstants';

const DEFAULT_FIELDS = Map({
	balances: new Map({}),
	assets: new Map({}),
	redirectSymbol: CORE_SYMBOL,
});

export default createModule({
	name: 'balance',
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

		setAssets: {
			reducer: (state, { payload }) => {
				state = state.set('balances', payload.balances).set('assets', payload.assets);

				return state;
			},
		},

		push: {
			reducer: (state, { payload }) => {
				const field = state.get(payload.field);
				state = state.set(payload.field, field.push(payload.value));

				return state;
			},
		},

		delete: {
			reducer: (state, { payload }) => {
				const field = state.get(payload.field);
				state = state.set(payload.field, field.delete(payload.value));

				return state;
			},
		},

		reset: {
			reducer: (state) => {
				state = DEFAULT_FIELDS;
				return state;
			},
		},

		update: {
			reducer: (state, { payload }) => {
				const index = state.get(payload.field).findIndex((t) => (t.id === payload.param));
				if (index === -1) return state;
				const updatedList = state
					.get(payload.field)
					.update(index, (v) => ({ ...v, ...payload.value }));

				state = state.set(payload.field, updatedList);

				return state;
			},
		},
	},
});
