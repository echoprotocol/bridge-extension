import { createModule } from 'redux-modules';
import { Map } from 'immutable';

const DEFAULT_FIELDS = Map({
	objectsById: new Map(),
	accountsByName: new Map(),
	assetsBySymbol: new Map(),
	accountIdsByKey: new Map(),
	accountIdsByAccount: new Map(),

	balanceObjectsByAddress: new Map(),
	accountHistoryRequests: new Map(),
	blockRequests: new Map(),
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

				console.log(payload.field)
				console.log(newMap.toJS())
				state = state.set(payload.field, newMap);

				return state;
			},
		},
		disconnect: {
			reducer: () => DEFAULT_FIELDS,
		},
	},
});
