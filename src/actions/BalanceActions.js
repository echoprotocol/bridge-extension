import BN from 'bignumber.js';
import { Map } from 'immutable';
import { batchActions } from 'redux-batched-actions';
import { keccak256 } from 'js-sha3';
import { OPERATIONS_IDS, validators } from 'echojs-lib';

import { setFormError, setValue, setFormValue } from './FormActions';
import { getTransactionFee } from './SignActions';
import { getCrypto, getCryptoInfo, setCryptoInfo } from './CryptoActions';
import { set, storageRemoveDraft, storageSetDraft } from './GlobalActions';

import { FORM_SEND, FORM_WATCH_TOKEN } from '../constants/FormConstants';
import {
	CORE_ID,
	GET_TOKENS_TIMEOUT,
	GLOBAL_ID_1,
	NATHAN_ACCOUNT_ID,
} from '../constants/GlobalConstants';
import { ERROR_SEND_PATH, WALLET_PATH, SEND_PATH } from '../constants/RouterConstants';

import echoService from '../services/echo';

import FormatHelper from '../helpers/FormatHelper';
import ValidateSendHelper from '../helpers/ValidateSendHelper';
import ValidateTransactionHelper from '../helpers/ValidateTransactionHelper';

import BalanceReducer from '../reducers/BalanceReducer';
import GlobalReducer from '../reducers/GlobalReducer';

import history from '../history';

/**
 *  @method initAssetsBalances
 *
 * 	Initialization user's assets
 *
 */
export const initAssetsBalances = () => async (dispatch, getState) => {

	const balancesAssetsPromises = [];
	const balancesState = getState().balance;
	const stateAssets = balancesState.get('assets');
	const stateBalances = balancesState.get('balances');

	const accounts = getState().global.get('accounts');
	const activeNetworkName = getState().global.getIn(['network', 'name']);

	if (!accounts.get(activeNetworkName)) {
		return false;
	}

	const accountsPromise = [];

	accounts.get(activeNetworkName).forEach((account) => {
		const userAccount = echoService.getChainLib().api.getFullAccounts([account.name]);

		accountsPromise.push(userAccount);

		return null;
	});

	const fullAccounts = await Promise.all(accountsPromise);

	fullAccounts.forEach((userAccount) => {
		if (!userAccount || !userAccount[0]) {
			return null;
		}

		const userBalances = userAccount[0].balances;

		Array.prototype.push.apply(balancesAssetsPromises, [
			echoService.getChainLib().api.getObjects(Object.values(userBalances)),
			echoService.getChainLib().api.getObjects(Object.keys(userBalances)),
		]);

		return null;
	});

	await Promise.all(balancesAssetsPromises);

	let balances = stateBalances;
	let assets = stateAssets;

	const { objectsById } = echoService.getChainLib().cache;

	objectsById.forEach((object) => {
		if (validators.isAccountBalanceId(object.get('id'))) {
			balances = balances.set(object.get('id'), object);
		}

		if (validators.isAssetId(object.get('id'))) {
			assets = assets.set(object.get('id'), object);
		}
	});

	if ((stateAssets !== assets) || (stateBalances !== balances)) {
		dispatch(BalanceReducer.actions.setAssets({
			balances,
			assets,
		}));
	}

	return true;

};

/**
 *  @method removeBalances
 *
 * 	Remove balances and assets by deleted user's id
 *
 * 	@param {String} accountId
 */
export const removeBalances = (accountId) => (dispatch, getState) => {
	let balances = getState().balance.get('balances');
	let assets = getState().balance.get('assets');

	balances.forEach((balance) => {
		if (balance.get('owner') === accountId) {
			balances = balances.delete(balance.get('id'));

			if (!balances.find((val) => val.get('asset_type') === balance.get('asset_type'))) {
				assets = assets.delete(balance.get('asset_type'));
			}
		}
	});

	dispatch(BalanceReducer.actions.setAssets({
		balances,
		assets,
	}));
};

/**
 *  @method checkFeePool
 *
 * 	Remove balances and assets by deleted user's id
 *
 * 	@param {Object} coreAsset
 * 	@param {Object} asset
 * 	@param {Number} fee
 */
const checkFeePool = (coreAsset, asset, fee) => {
	if (coreAsset.get('id') === asset.get('id')) { return true; }

	let feePool = new BN(asset.getIn(['dynamic', 'fee_pool'])).div(10 ** coreAsset.get('precision'));

	const base = asset.getIn(['options', 'core_exchange_rate', 'base']);
	const quote = asset.getIn(['options', 'core_exchange_rate', 'quote']);
	const precision = coreAsset.get('precision') - asset.get('precision');
	const price = new BN(quote.get('amount')).div(base.get('amount')).times(10 ** precision);
	feePool = price.times(feePool).times(10 ** asset.get('precision'));

	return feePool.gt(fee);
};

/**
 *  @method checkAccount
 *
 * 	Look up accounts
 *
 * 	@param {String} fromAccount
 * 	@param {String} toAccount
 * 	@param {Number} limit
 */
export const checkAccount = (fromAccount, toAccount) => async (dispatch) => {
	try {
		if (fromAccount === toAccount) {
			dispatch(setFormError(FORM_SEND, 'to', 'You can not send funds to yourself'));
			return false;
		}

		const result = await echoService.getChainLib().api.lookupAccounts(toAccount);

		if (!result.find((i) => i[0] === toAccount)) {
			dispatch(setFormError(FORM_SEND, 'to', 'Account is not found'));
			return false;
		}
	} catch (err) {
		dispatch(setValue(FORM_SEND, 'error', FormatHelper.formatError(err)));

		history.push(ERROR_SEND_PATH);

		dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));

		return false;
	}

	return true;
};

const getTransferCode = (id, amount) => {
	const method = keccak256('transfer(address,uint256)').substr(0, 8);

	const idArg = Number(id.split('.')[2]).toString(16).padStart(64, '0');

	const amountArg = amount.toString(16).padStart(64, '0');

	return method + idArg + amountArg;
};

/**
 *  @method setFeeFormValue
 *
 * 	Set fee
 */
export const setFeeFormValue = () => async (dispatch, getState) => {
	try {
		const form = getState().form.get(FORM_SEND);

		const to = form.get('to');

		const result = await echoService.getChainLib().api.lookupAccounts(to.value);

		if (!result.find((i) => i[0] === to.value)) {
			return false;
		}

		const amount = Number(form.get('amount').value).toString();
		const selectedBalance = getState().form.getIn([FORM_SEND, 'selectedBalance']);
		const selectedFeeBalance = getState().form.getIn([FORM_SEND, 'selectedFeeBalance']);
		const balances = getState().balance.get('balances');
		const assets = getState().balance.get('assets');
		const [fromAccount] = await echoService.getChainLib().api.getFullAccounts([getState().global.getIn(['account', 'name'])]);
		const [toAccount] = await echoService.getChainLib().api.getFullAccounts([to.value]);

		let isToken = false;

		if (!ValidateTransactionHelper.validateContractId(selectedBalance)) {
			isToken = true;
		}

		let options = {};

		if (!isToken) {
			const amountAsset = assets.get(balances.getIn([selectedBalance, 'asset_type']));

			options = {
				amount: {
					amount: amount * (10 ** amountAsset.get('precision')),
					asset: amountAsset,
				},
				fee: {
					asset: assets.get(balances.getIn([selectedFeeBalance, 'asset_type'])),
				},
				from: fromAccount,
				to: toAccount,
				type: 'transfer',
			};

			if (!options.amount.asset || !options.fee.asset || !options.from) {
				return false;
			}
		} else {
			const activeUser = getState().global.getIn(['account']);
			const precision = getState().balance.getIn(['tokens', activeUser.get('id'), selectedBalance, 'precision']);
			const code = getTransferCode(toAccount.id, new BN(amount).times(10 ** precision));
			const receiver = await echoService.getChainLib().api.getObject(selectedBalance);
			options = {
				code,
				fee: {
					amount: 0,
					asset: assets.get(balances.getIn([selectedFeeBalance, 'asset_type'])),
				},
				callee: receiver,
				registrar: fromAccount,
				type: OPERATIONS_IDS.CALL_CONTRACT,
				value: {
					amount: 0,
					asset_id: assets.get(balances.getIn([selectedFeeBalance, 'asset_type'])),
				},
			};

			if (!options.value.asset_id || !options.fee.asset || !options.registrar) {
				return false;
			}
		}

		const resultFee = await dispatch(getTransactionFee(options));

		if (!resultFee) {
			return false;
		}

		const precision = new BN(10).pow(options.fee.asset.get('precision'));
		dispatch(setFormValue(FORM_SEND, 'fee', new BN(resultFee.amount).div(precision).toString(10)));
	} catch (err) {
		console.warn(err);
	}

	return true;
};

/**
 *  @method send
 *
 * 	Transfer transaction
 */
export const send = () => async (dispatch, getState) => {

	const form = getState().form.get(FORM_SEND);

	const amount = new BN(form.get('amount').value).toString();

	const to = form.get('to');
	const fee = form.get('fee');

	if (to.error || form.get('amount').error || fee.error) {
		return false;
	}

	const selectedBalance = getState().form.getIn([FORM_SEND, 'selectedBalance']);
	const selectedFeeBalance = getState().form.getIn([FORM_SEND, 'selectedFeeBalance']);
	const balances = getState().balance.get('balances');
	const assets = getState().balance.get('assets');

	let isToken = false;

	if (!ValidateTransactionHelper.validateContractId(selectedBalance)) {
		isToken = true;
	}

	const activeUser = getState().global.getIn(['account']);

	const token = getState().balance.getIn(['tokens', activeUser.get('id'), selectedBalance]);
	const balance = isToken ?
		{
			symbol: token.get('symbol'),
			precision: token.get('precision'),
			balance: token.get('balance'),
		}
		:
		{
			symbol: assets.getIn([balances.getIn([selectedBalance, 'asset_type']), 'symbol']),
			precision: assets.getIn([balances.getIn([selectedBalance, 'asset_type']), 'precision']),
			balance: balances.getIn([selectedBalance, 'balance']),
		};

	const amountError = ValidateSendHelper.validateAmount(amount, balance);

	if (amountError) {
		dispatch(setFormError(FORM_SEND, 'amount', amountError));
		return false;
	}

	const isAccount = await dispatch(checkAccount(activeUser.get('name'), to.value));

	if (!isAccount) {
		return false;
	}

	const [fromAccount] = await echoService.getChainLib().api.getFullAccounts([activeUser.get('name')]);
	const [toAccount] = await echoService.getChainLib().api.getFullAccounts([to.value]);

	let options = {};

	if (isToken) {
		const code = getTransferCode(toAccount.id, new BN(amount).times(10 ** token.get('precision')));
		const receiver = await echoService.getChainLib().api.getObject(selectedBalance);
		let coreAsset = assets.get(balances.getIn([selectedFeeBalance, 'asset_type']));

		if (!coreAsset) {
			await echoService.getChainLib().api.getObject(CORE_ID, true);
			coreAsset = getState().blockchain.getIn(['objectsById', '1.3.0']);
		}

		options = {
			code,
			fee: {
				amount: fee.value || 0,
				asset: coreAsset,
			},
			callee: receiver,
			registrar: fromAccount,
			type: OPERATIONS_IDS.CALL_CONTRACT,
			value: {
				asset_id: coreAsset,
				amount: 0,
			},
		};
	} else {

		options = {
			amount: {
				amount: parseFloat(amount),
				asset: assets.get(balances.getIn([selectedBalance, 'asset_type'])),
			},
			fee: {
				asset: assets.get(balances.getIn([selectedFeeBalance, 'asset_type'])),
			},
			from: fromAccount,
			to: toAccount,
			type: 'transfer',
		};

		if (fee.value) {
			options.fee.amount = fee.value;
		}
	}

	if (!options.fee.amount) {
		const resultFee = await dispatch(getTransactionFee(options));

		if (!resultFee) {
			return false;
		}

		const precision = new BN(10).pow(options.fee.asset.get('precision'));
		options.fee.amount = new BN(resultFee.amount).div(precision).toString(10);
	}

	if (!checkFeePool(assets.get(CORE_ID), options.fee.asset, options.fee.amount)) {
		dispatch(setFormError(
			FORM_SEND,
			'fee',
			`${options.fee.asset.get('symbol')} fee pool balance is less than fee amount`,
		));
		return false;
	}

	if (!isToken) {
		if (options.amount.asset.get('id') === options.fee.asset.get('id')) {
			const total = new BN(amount).times(10 ** options.amount.asset.get('precision')).plus(options.fee.amount);

			if (total.gt(balances.getIn([selectedBalance, 'balance']))) {
				dispatch(setFormError(FORM_SEND, 'amount', 'Insufficient funds for fee'));
				return false;
			}
		} else {
			const feeBalance = balances.find((val) => val.get('asset_type') === options.fee.asset.get('id')).get('balance');

			if (new BN(fee.value).gt(feeBalance)) {
				dispatch(setFormError(FORM_SEND, 'amount', 'Insufficient funds for fee'));
				return false;
			}
		}
	}

	if (isToken) {
		options.value.amount = 0;
		options.fee.amount *= 10 ** options.fee.asset.get('precision');
	} else {
		options.amount.amount = parseInt(options.amount.amount * (10 ** options.amount.asset.get('precision')), 10);
		options.fee.amount *= 10 ** options.fee.asset.get('precision');
	}

	const activeNetworkName = getState().global.getIn(['network', 'name']);

	dispatch(GlobalReducer.actions.set({ field: 'loading', value: true }));

	await storageRemoveDraft();
	await storageSetDraft(FORM_SEND, 'loading', true);

	const emitter = echoService.getEmitter();

	emitter.emit('sendRequest', options, activeNetworkName);

	return true;
};

/**
 *  @method sendHandler
 *
 * 	On send broadcast result emitter response
 *
 * 	@param {String} path
 */
export const sendHandler = (path) => (dispatch, getState) => {
	getCrypto().updateLockTimeout();

	if (getState().global.get('loading')) {
		history.push(path);
	}

	dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
};

/**
 *  @method getTokenDetails
 *
 * 	Get token balance, symbol and precision
 *
 * 	@param {String} contractId
 * 	@param {String} accountId
 */
export const getTokenDetails = async (contractId, accountId) => {
	const methods = [
		{
			name: 'balanceOf',
			inputs: [{ type: 'address' }],
		},
		{
			name: 'symbol',
			inputs: [],
		},
		{
			name: 'decimals',
			inputs: [],
		},
	];

	const tokenDetails = [];

	try {
		const resultEncode = Number(accountId.substr(accountId.lastIndexOf('.') + 1)).toString(16).padStart(64, '0');

		methods.forEach((method) => {

			const inputs = method.inputs.map((input) => input.type).join(',');

			let methodId = keccak256(`${method.name}(${inputs})`).substr(0, 8);

			if (method.inputs.length) {
				methodId = methodId.concat(resultEncode);
			}

			tokenDetails
				.push(echoService.getChainLib()
					.api
					.callContractNoChangingState(contractId, NATHAN_ACCOUNT_ID, CORE_ID, methodId));
		});

		const start = new Date().getTime();

		let result = null;

		await Promise.race([
			Promise.all(tokenDetails).then((res) => {
				result = res;
				return (new Date().getTime() - start);
			}),
			new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					clearTimeout(timeoutId);
					reject(new Error('timeout close'));
				}, GET_TOKENS_TIMEOUT);
			}),
		]);

		if (!result) {
			return null;
		}

		return {
			balance: new BN(result[0], 16).toString(10),
			symbol: FormatHelper.toUtf8(result[1].substr(-64)),
			precision: parseInt(result[2], 16),
		};
	} catch (e) {
		return e;
	}
};

// TODO::
// export const isAssetsChanged = async (assets) => {
//
// 	if (!assets.size) {
// 		return false;
// 	}
//
// 	let assetArr = [];
//
// 	assets.forEach((asset) => {
// 		assetArr.push(echoService.getChainLib().api.getObject(asset.get('id')));
// 	});
//
// 	assetArr = await Promise.all(assetArr);
//
// 	let isChanged = false;
//
// 	assetArr.forEach((asset) => {
// 		console.log(asset, assets.get(asset.id));
// 		if (assets.get(asset.id) && !assets.get(asset.id).equals(fromJS(asset))) {
// 			isChanged = true;
// 		}
// 	});
//
// 	return isChanged;
// };

/**
 *  @method watchToken
 *
 * 	Add token to wallet balances list
 *
 * 	@param {String} contractId
 */
export const watchToken = (contractId) => async (dispatch, getState) => {
	if (!contractId) {
		dispatch(setFormError(FORM_WATCH_TOKEN, 'contractId', 'Contract id should not be empty'));
		return null;
	}

	if (ValidateTransactionHelper.validateContractId(contractId)) {
		dispatch(setFormError(FORM_WATCH_TOKEN, 'contractId', 'Invalid contract id'));
		return null;
	}

	try {
		dispatch(GlobalReducer.actions.set({ field: 'loading', value: true }));
		const contract = await echoService.getChainLib().api.getContract(contractId);

		if (!contract) {
			dispatch(setFormError(FORM_WATCH_TOKEN, 'contractId', 'Invalid contract id'));
			dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
			return null;
		}

		const accountId = getState().global.getIn(['account', 'id']);

		const { symbol, precision, balance } = await getTokenDetails(contractId, accountId);

		if (!symbol || !Number.isInteger(precision)) {
			dispatch(setFormError(FORM_WATCH_TOKEN, 'contractId', 'Invalid token contract'));
			dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
			return null;
		}

		const networkName = getState().global.getIn(['network', 'name']);

		let tokens = await dispatch(getCryptoInfo('tokens', networkName));

		if (tokens) {
			const isExists = Object.entries(tokens).find(([accId, tokensArr]) => {
				if (accId === accountId) {
					return !!tokensArr.find((id) => id.includes(contractId.split('.')[2]));
				}

				return false;
			});

			if (isExists) {
				dispatch(setFormError(FORM_WATCH_TOKEN, 'contractId', 'Token already exists'));
				dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
				return null;
			}
		}

		if (!tokens) {
			tokens = {};
			tokens[accountId] = [];
		}

		if (!tokens[accountId]) {
			tokens[accountId] = [];
		}

		tokens[accountId].push(contractId.split('.')[2]);

		dispatch(setCryptoInfo('tokens', tokens));

		let stateTokens = getState().balance.get('tokens');

		stateTokens = stateTokens
			.setIn([accountId, contractId, 'symbol'], symbol)
			.setIn([accountId, contractId, 'precision'], precision)
			.setIn([accountId, contractId, 'balance'], balance);

		dispatch(batchActions([
			BalanceReducer.actions.set({ field: 'tokens', value: stateTokens }),
			GlobalReducer.actions.set({ field: 'loading', value: false }),
		]));

		history.push(WALLET_PATH);
	} catch (err) {
		dispatch(setValue(FORM_WATCH_TOKEN, 'error', FormatHelper.formatError(err)));

		dispatch(GlobalReducer.actions.set({ field: 'loading', value: false }));
	}

	return null;
};

/**
 *  @method checkBlockTransactions
 *
 * 	Check transactions in the last blocks
 *
 * 	@param {Number} blockNum
 * 	@param {Number} count
 * 	@param {Object} tokens
 */
const checkBlockTransactions = async (blockNum, count, tokens) => {
	const block = await echoService.getChainLib().api.getBlock(blockNum);

	if (block.transactions.length) {
		for (let tr = 0; tr < block.transactions.length; tr += 1) {
			for (let i = 0; i < block.transactions[tr].operations.length; i += 1) {
				const [, data] = block.transactions[tr].operations[i];

				let isChanged = false;

				tokens.mapEntries(([, tokensArr]) => {
					if (tokensArr.findKey((value, key) => key === data.callee)) {
						isChanged = true;
					}
				});

				if (isChanged) {
					return true;
				}
			}
		}
	}

	blockNum += 1;
	count -= 1;

	if (count < 0) {
		return false;
	}

	const isUpdated = await checkBlockTransactions(blockNum, count, tokens);

	return !!isUpdated;
};

/**
 *  @method isBlockChanged
 *
 * 	Is token was used in the last blocks
 *
 * 	@param {Object} tokens
 */
const isBlockChanged = (tokens) => async (dispatch, getState) => {
	const blockNum = (await echoService.getChainLib().api.getObject(GLOBAL_ID_1, true))
		.head_block_number;

	const stateBlockNum = getState().global.get('headBlockNum');

	if (stateBlockNum === 0) {
		dispatch(GlobalReducer.actions.set({ field: 'headBlockNum', value: blockNum }));
		return false;
	}

	if (blockNum === stateBlockNum) {
		return false;
	}

	let isUpdated = false;

	isUpdated = await checkBlockTransactions(
		stateBlockNum + 1,
		(blockNum - stateBlockNum) - 1,
		tokens,
	);

	dispatch(GlobalReducer.actions.set({ field: 'headBlockNum', value: blockNum }));

	return isUpdated;
};

/**
 *  @method updateTokens
 *
 *  Update tokens in state when contract was used in the last proceed blocks
 */
export const updateTokens = () => async (dispatch, getState) => {
	const tokens = getState().balance.get('tokens');

	try {
		if (!(await dispatch(isBlockChanged(tokens)))) {
			return false;
		}

		const tokensDetails = [];

		tokens.mapEntries(([accountId, tokensArr]) => {
			const tokenPromises = [];
			tokensArr.mapKeys((contractId) => {
				tokenPromises.push(getTokenDetails(contractId, accountId));
			});
			tokensDetails.push(Promise.all(tokenPromises));
		});

		const resTokensDetails = await Promise.all(tokensDetails);

		let stateTokens = tokens;

		tokens.mapEntries(([accountId, tokensArr], i) => {
			tokensArr.mapEntries(([contractId], j) => {
				stateTokens = stateTokens
					.setIn([accountId, contractId, 'symbol'], resTokensDetails[i][j].symbol)
					.setIn([accountId, contractId, 'precision'], resTokensDetails[i][j].precision)
					.setIn([accountId, contractId, 'balance'], resTokensDetails[i][j].balance);
			});
		});

		if (stateTokens !== tokens) {
			dispatch(BalanceReducer.actions.set({ field: 'tokens', value: stateTokens }));
		}
	} catch (err) {
		dispatch(set('error', FormatHelper.formatError(err)));

		return false;
	}

	return true;
};

/**
 *  @method removeToken
 *
 * 	Remove token from wallet balances list
 *
 * 	@param {String} contractId
 */
export const removeToken = (contractId) => async (dispatch, getState) => {
	const networkName = getState().global.getIn(['network', 'name']);

	const tokens = await dispatch(getCryptoInfo('tokens', networkName));

	const accountId = getState().global.getIn(['account', 'id']);

	tokens[accountId] = tokens[accountId].filter((id) => contractId.split('.')[2] !== id);

	dispatch(setCryptoInfo('tokens', tokens));


	const stateTokens = getState().balance.get('tokens');
	let stateTmpTokens = new Map({});

	stateTokens.mapEntries(([accId, tokensArr]) => {
		if (accId !== accountId) {
			stateTmpTokens = stateTmpTokens.set(accId, tokensArr);
			return null;
		}

		tokensArr.mapEntries(([id, value]) => {
			if (contractId !== id) {
				stateTmpTokens = stateTmpTokens.setIn([accId, id], value);
			}
		});

		return null;
	});

	dispatch(BalanceReducer.actions.set({ field: 'tokens', value: stateTmpTokens }));
};

/**
 *  @method sendRedirect
 *
 * 	On wallet balance choose redirect from wallet to send
 *
 * 	@param {String} balanceId
 */
export const sendRedirect = (balanceId) => (dispatch) => {
	dispatch(setValue(FORM_SEND, 'selectedBalance', balanceId));

	history.push(SEND_PATH);
};

/**
 *  @method setAssetFormValue
 *
 * 	Set asset form value
 *
 * 	@param {String} form
 * 	@param {String} field
 * 	@param {String} value
 */
export const setAssetFormValue = (form, field, value) => (dispatch, getState) => {
	const selectedBalance = getState().form.getIn([FORM_SEND, 'selectedBalance']);

	if (field === 'selectedBalance' && selectedBalance) {
		return null;
	}

	dispatch(setValue(form, field, value));

	return null;
};
