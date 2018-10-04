import globalReducer from './GlobalReducer';
import formReducer from './FormReducer';

export default {
	global: globalReducer.reducer,
	form: formReducer.reducer,
};
