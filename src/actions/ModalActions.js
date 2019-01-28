import ModalReducer from './../reducers/ModalReducer';


export const openModal = (type, field, value) => (dispatch) => {
	dispatch(ModalReducer.actions.open({ type, field, value }));
};

export const closeModal = (type) => (dispatch) => {
	dispatch(ModalReducer.actions.close({ type }));
};
