import { createModule } from 'redux-modules';
import { Set, Map } from 'immutable';

const DEFAULT_FIELDS = Map({
	objects_by_id: new Map(),
	accounts_by_name: new Map(),
	assets_by_symbol: new Map(),
	account_ids_by_key: Map(),
	account_ids_by_account: Map(),

	balance_objects_by_address: new Map(),
	get_account_refs_of_keys_calls: new Set(),
	get_account_refs_of_accounts_calls: new Set(),
	account_history_requests: new Map(),
	witness_by_account_id: new Map(),
	committee_by_account_id: new Map(),
	objects_by_vote_id: new Map(),
	fetching_get_full_accounts: new Map(),
	get_full_accounts_subscriptions: new Map(),
	block_requests: new Map(),
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
