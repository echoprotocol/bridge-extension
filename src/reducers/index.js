import globalReducer from './GlobalReducer';
import formReducer from './FormReducer';
import balanceReducer from './BalanceReducer';
import blockchainReducer from './BlockchainReducer';
import modalReducer from './ModalReducer';

export default {
	global: globalReducer.reducer,
	form: formReducer.reducer,
	balance: balanceReducer.reducer,
	blockchain: blockchainReducer.reducer,
	modal: modalReducer.reducer,
};
