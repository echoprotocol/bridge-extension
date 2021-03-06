import FormReducer from '../reducers/FormReducer';

/**
 * Set value by field
 * @param form
 * @param field
 * @param value
 * @returns {Function}
 */
export const setValue = (form, field, value) => (dispatch) => {
	dispatch(FormReducer.actions.set({ form, field, value }));
};

/**
 * Set value by field for object {value, error}
 * @param form
 * @param field
 * @param value
 * @returns {Function}
 */
export const setFormValue = (form, field, value) => (dispatch) => {
	dispatch(FormReducer.actions.setFormValue({ form, field, value }));
};

/**
 * Set error by field form
 * @param form
 * @param field
 * @param value
 * @returns {Function}
 */
export const setFormError = (form, field, value) => (dispatch) => {
	dispatch(FormReducer.actions.setFormError({ form, field, value }));
};

/**
 * Toggle loading
 * This function used for form and button loading.
 * You can call this with 2 params(without loading for button loading)
 * and with 3 params(for form loading).
 * If you call without third param(loading), loading equals field,
 * and field equals null(because field doesn't used
 * in button reducer.
 * @param {String} form
 * @param {String|Boolean} field
 * @param {Boolean} loading
 */
export const toggleLoading = (form, field, loading) => (dispatch) => {
	if (typeof loading === 'undefined') {
		loading = field;
		field = null;
	}
	dispatch(FormReducer.actions.toggleLoading({
		form,
		field,
		value: loading,
	}));
};

/**
 * Clear form
 * @param {String} form
 * @returns {Function}
 */
export const clearForm = (form) => (dispatch) => {
	dispatch(FormReducer.actions.clearForm({ form }));
};
