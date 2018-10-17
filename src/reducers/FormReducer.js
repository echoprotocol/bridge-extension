import { createModule } from 'redux-modules';
import { Map } from 'immutable';
import _ from 'lodash';

import {
	FORM_SIGN_UP,
	FORM_SIGN_IN,
	FORM_ADD_NETWORK,
	FORM_UNLOCK,
	FORM_WIPE,
	FORM_CREATE_PIN,
} from '../constants/FormConstants';

const DEFAULT_FIELDS = Map({
	error: null,
	loading: false,
});

const DEFAULT_FORM_FIELDS = {
	[FORM_SIGN_UP]: Map({
		accountName: {
			error: null,
			example: '',
		},
	}),
	[FORM_SIGN_IN]: Map({
		nameError: null,
		passwordError: null,
	}),
	[FORM_ADD_NETWORK]: Map({
		address: {
			value: '',
			error: null,
		},
		name: {
			value: '',
			error: null,
		},
		registrator: {
			value: '',
			error: null,
		},
	}),
	[FORM_WIPE]: Map({
		checked: false,
	}),
};

export default createModule({
	name: 'form',
	initialState: Map({
		[FORM_SIGN_UP]: _.cloneDeep(DEFAULT_FIELDS).merge(DEFAULT_FORM_FIELDS[FORM_SIGN_UP]),
		[FORM_SIGN_IN]: _.cloneDeep(DEFAULT_FIELDS).merge(DEFAULT_FORM_FIELDS[FORM_SIGN_IN]),
		[FORM_ADD_NETWORK]: _.cloneDeep(DEFAULT_FIELDS).merge(DEFAULT_FORM_FIELDS[FORM_ADD_NETWORK]),
		[FORM_UNLOCK]: _.cloneDeep(DEFAULT_FIELDS),
		[FORM_WIPE]: _.cloneDeep(DEFAULT_FIELDS).merge(DEFAULT_FORM_FIELDS[FORM_WIPE]),
		[FORM_CREATE_PIN]: _.cloneDeep(DEFAULT_FIELDS),
	}),
	transformations: {
		set: {
			reducer: (state, { payload }) => {
				state = state.setIn([payload.form, payload.field], payload.value);

				return state;
			},
		},

		setIn: {
			reducer: (state, { payload }) => {
				const field = state.getIn([payload.form, payload.field]);

				state = state.setIn([payload.form, payload.field], {
					...field,
					...payload.params,
				});

				return state;
			},
		},

		setFormValue: {
			reducer: (state, { payload }) => {
				state = state.setIn([payload.form, 'error'], null);

				const field = state.getIn([payload.form, payload.field]);

				state = state.setIn([payload.form, payload.field], Object.assign({}, field, {
					...field,
					value: payload.value,
					error: null,
				}));

				return state;
			},
		},

		setFormError: {
			reducer: (state, { payload }) => {
				if (payload.field === 'error') {
					state = state.setIn([payload.form, payload.field], payload.value);
				} else {
					const field = state.getIn([payload.form, payload.field]);

					state = state.setIn([payload.form, payload.field], Object.assign({}, field, {
						...field,
						error: payload.value,
					}));
				}

				return state;
			},
		},

		toggleLoading: {
			reducer: (state, { payload }) => {
				state = state.setIn([payload.form, 'loading'], !!payload.value);

				return state;
			},
		},


		clearForm: {
			reducer: (state, { payload }) => {
				const form = _.cloneDeep(DEFAULT_FIELDS).merge(DEFAULT_FORM_FIELDS[payload.form]);
				state = state.set(payload.form, form);

				return state;
			},
		},

		clearByField: {
			reducer: (state, { payload }) => {
				const field = _.cloneDeep(DEFAULT_FORM_FIELDS[payload.form].get(payload.field));
				state = state.setIn([payload.form, payload.field], field);

				return state;
			},
		},
	},
});
