import { createModule } from 'redux-modules';
import { Set, Map } from 'immutable';
import _ from 'lodash';

const DEFAULT_FIELDS = Map({
	subbedAccounts: new Set(),
	subbedWitnesses: new Set(),
	subbedCommittee: new Set(),

	objectsById: new Map(),
	accountsByName: new Map(),
	assetsBySymbol: new Map(),
	accountIdsByKey: Map(),
	accountIdsByAccount: Map(),

	balanceObjectsByAddress: new Map(),
	getAccountRefsOfKeysCalls: new Set(),
	getAccountRefsOfAccountsCalls: new Set(),
	accountHistoryRequests: new Map(),
	witnessByAccountId: new Map(),
	committeeByAccountId: new Map(),
	objectsByVoteId: new Map(),
	fetchingGetFullAccounts: new Map(),
	getFullAccountsSubscriptions: new Map(),
	blockRequests: new Map(),
});

export default createModule({
	name: 'blockchain',
	initialState: DEFAULT_FIELDS,
	transformations: {
		set: {
			reducer: (state, { payload }) => {
				state = state.set(payload.field, payload.value);

				return state;
			},
		},
		disconnect: {
			reducer: () => DEFAULT_FIELDS,
		},
	},
});
