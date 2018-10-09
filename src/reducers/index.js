import globalReducer from './GlobalReducer';
import formReducer from './FormReducer';
import balanceReducer from './BalanceReducer';
import welcomeReducer from './WelcomeReducer';

export default {
	global: globalReducer.reducer,
	form: formReducer.reducer,
	balance: balanceReducer.reducer,
	welcome: welcomeReducer.reducer,
};
