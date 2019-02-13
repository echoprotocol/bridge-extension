import { createModule } from 'redux-modules';
import { Map } from 'immutable';
import _ from 'lodash';

import { MODAL_LOGOUT, MODAL_RM_NETWORK } from '../constants/ModalConstants';

const DEFAULT_FIELDS = Map({ show: false });

const DEFAULT_MODAL_FIELDS = {
	[MODAL_LOGOUT]: Map({
		accountName: null,
	}),
	[MODAL_RM_NETWORK]: Map({
		network: null,
	}),
};
export default createModule({
	name: 'modal',
	initialState: Map({
		[MODAL_LOGOUT]: _.cloneDeep(DEFAULT_FIELDS).merge(DEFAULT_MODAL_FIELDS[MODAL_LOGOUT]),
		[MODAL_RM_NETWORK]: _.cloneDeep(DEFAULT_FIELDS).merge(DEFAULT_MODAL_FIELDS[MODAL_RM_NETWORK]),
	}),
	transformations: {
		open: {
			reducer: (state, { payload }) => {
				state = state.setIn([payload.type, 'show'], true);
				state = state.setIn([payload.type, payload.field], payload.value);
				return state;
			},
		},
		close: {
			reducer: (state, { payload }) => state.setIn(
				[payload.type],
				_.cloneDeep(DEFAULT_FIELDS).merge(DEFAULT_MODAL_FIELDS[payload.type]),
			),
		},
	},
});
