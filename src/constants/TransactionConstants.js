import { OPERATIONS_IDS } from 'echojs-lib';

export default {
	transfer: {
		value: OPERATIONS_IDS.TRANSFER,
		name: 'Sent',
		options: {
			from: 'from',
			subject: ['to', 'name'],
			value: 'amount.amount',
			asset: 'amount.asset_id',
		},
	},
	account_create: {
		value: OPERATIONS_IDS.ACCOUNT_CREATE,
		name: 'Account created',
		options: {
			from: 'registrar',
			subject: ['name', null],
			value: null,
			asset: null,
		},
	},
	account_update: {
		value: OPERATIONS_IDS.ACCOUNT_UPDATE,
		name: 'Update account',
		options: {
			from: 'account',
			subject: null,
			value: null,
			asset: null,
		},
	},
	account_whitelist: {
		value: OPERATIONS_IDS.ACCOUNT_WHITELIST,
		name: 'Account whitelist',
		options: {
			from: 'authorizing_account',
			subject: ['account_to_list', 'name'],
			value: null,
			asset: null,
		},
	},
	asset_create: {
		value: OPERATIONS_IDS.ASSET_CREATE,
		name: 'Create asset',
		options: {
			from: 'issuer',
			subject: ['symbol', null],
			value: null,
			asset: null,
		},
	},
	asset_update: {
		value: OPERATIONS_IDS.ASSET_UPDATE,
		name: 'Update asset',
		options: {
			from: 'issuer',
			subject: ['asset_to_update', 'symbol'],
			value: null,
			asset: null,
		},
	},
	asset_update_bitasset: {
		value: OPERATIONS_IDS.ASSET_UPDATE_BITASSET,
		name: 'Update SmartCoin',
		options: {
			from: 'issuer',
			subject: ['asset_to_update', 'symbol'],
			value: null,
			asset: null,
		},
	},
	asset_update_feed_producers: {
		value: OPERATIONS_IDS.ASSET_UPDATE_FEED_PRODUCERS,
		name: 'Update asset feed producers',
		options: {
			from: 'issuer',
			subject: ['asset_to_update', 'symbol'],
			value: null,
			asset: null,
		},
	},
	asset_issue: {
		value: OPERATIONS_IDS.ASSET_ISSUE,
		name: 'Issue asset',
		options: {
			from: 'issuer',
			subject: ['issue_to_account', 'name'],
			value: 'asset_to_issue.amount',
			asset: 'asset_to_issue.asset_id',
		},
	},
	asset_reserve: {
		value: OPERATIONS_IDS.ASSET_RESERVE,
		name: 'Burn asset',
		options: {
			from: 'payer',
			subject: null,
			value: 'amount_to_reserve.amount',
			asset: 'amount_to_reserve.asset_id',
		},
	},
	asset_fund_fee_pool: {
		value: OPERATIONS_IDS.ASSET_FUND_FEE_POOL,
		name: 'Fund asset fee pool',
		options: {
			from: 'from_account',
			subject: null,
			value: 'amount',
			asset: 'asset_id',
		},
	},
	asset_publish_feed: {
		value: OPERATIONS_IDS.ASSET_PUBLISH_FEED,
		name: 'Publish feed',
		options: {
			from: 'publisher',
			subject: ['asset_id', 'symbol'],
			value: 'feed',
			asset: 'asset_id',
		},
	},
	proposal_create: {
		value: OPERATIONS_IDS.PROPOSAL_CREATE,
		name: 'Create proposal',
		options: {
			from: 'fee_paying_account',
			subject: null,
			value: null,
			asset: null,
		},
	},
	proposal_update: {
		value: OPERATIONS_IDS.PROPOSAL_UPDATE,
		name: 'Update proposal',
		options: {
			from: 'fee_paying_account',
			subject: null,
			value: null,
			asset: null,
		},
	},
	proposal_delete: {
		value: OPERATIONS_IDS.PROPOSAL_DELETE,
		name: 'Delete proposal',
		options: {
			from: 'fee_paying_account',
			subject: null,
			value: null,
			asset: null,
		},
	},
	committee_member_create: {
		value: OPERATIONS_IDS.COMMITTEE_MEMBER_CREATE,
		name: 'Create committee member',
		options: {
			from: 'committee_member_account',
			subject: null,
			value: null,
			asset: null,
		},
	},
	committee_member_update: {
		value: OPERATIONS_IDS.COMMITTEE_MEMBER_UPDATE,
		name: 'Update committee member',
		options: {
			from: 'committee_member_account',
			subject: null,
			value: null,
			asset: null,
		},
	},
	committee_member_update_global_parameters: {
		value: OPERATIONS_IDS.COMMITTEE_MEMBER_UPDATE_GLOBAL_PARAMETERS,
		name: 'Global parameters update',
		options: {
			from: null,
			subject: null,
			value: null,
			asset: null,
		},
	},
	vesting_balance_create: {
		value: OPERATIONS_IDS.VESTING_BALANCE_CREATE,
		name: 'Create vesting balance',
		options: {
			from: 'creator',
			subject: ['owner', 'name'],
			value: 'amount.amount',
			asset: 'amount.asset_id',
		},
	},
	vesting_balance_withdraw: {
		value: OPERATIONS_IDS.VESTING_BALANCE_WITHDRAW,
		name: 'Withdraw vesting balance',
		options: {
			from: 'owner',
			subject: null,
			value: 'amount.amount',
			asset: 'amount.asset_id',
		},
	},
	balance_claim: {
		value: OPERATIONS_IDS.BALANCE_CLAIM,
		name: 'Claim balance',
		options: {
			from: null,
			subject: ['deposit_to_account', 'name'],
			value: null,
			asset: null,
		},
	},
	override_transfer: {
		value: OPERATIONS_IDS.OVERRIDE_TRANSFER,
		name: 'Override transfer',
		options: {
			from: 'from',
			subject: ['to', 'name'],
			value: 'amount.amount',
			asset: 'amount.asset_id',
		},
	},
	asset_claim_fees: {
		value: OPERATIONS_IDS.ASSET_CLAIM_FEES,
		name: 'Claim asset fees',
		options: {
			from: 'issuer',
			subject: null,
			value: 'amount_to_claim.amount',
			asset: 'amount_to_claim.asset_id',
		},
	},
	contract: {
		value: OPERATIONS_IDS.CONTRACT_CREATE,
		name: 'Contract created',
		options: {
			from: 'registrar',
			subject: null,
			value: 'value.amount',
			asset: 'value.asset_id',
		},
	},
	contract_call: {
		value: OPERATIONS_IDS.CONTRACT_CALL,
		name: 'Contract call',
		options: {
			from: 'registrar',
			subject: null,
			value: 'value.amount',
			asset: 'value.asset_id',
		},
	},
	contract_transfer: {
		value: OPERATIONS_IDS.CONTRACT_TRANSFER,
		name: 'Contract transfer',
		options: {
			from: 'from',
			subject: ['to', null],
			value: 'amount.amount',
			asset: 'amount.asset_id',
		},
	},
	contract_update: {
		value: OPERATIONS_IDS.CONTRACT_UPDATE,
		name: 'Contract update',
		options: {
			from: 'sender',
			subject: ['contract'],
			amount: null,
			asset: 'fee',
		},
	},
	account_address_create: {
		value: OPERATIONS_IDS.ACCOUNT_ADDRESS_CREATE,
		name: 'Account address create',
		options: {
			from: 'owner',
			subject: null,
			amount: null,
			asset: null,
		},
	},
	transfer_to_address: {
		value: OPERATIONS_IDS.TRANSFER_TO_ADDRESS,
		name: 'Transfer to address',
		options: {
			from: 'from',
			subject: ['to'],
			amount: 'amount.amount',
			asset: 'amount.asset_id',
		},
	},
	sidechain_eth_create_address: {
		value: OPERATIONS_IDS.SIDECHAIN_ETH_CREATE_ADDRESS,
		name: 'Sidechain eth create address',
		options: {
			from: 'account',
			subject: null,
			amount: null,
			asset: null,
		},
	},
	sidechain_eth_approve_address: {
		value: OPERATIONS_IDS.SIDECHAIN_ETH_APPROVE_ADDRESS,
		name: 'Sidechain eth approve address',
		options: {
			from: 'account',
			subject: null,
			amount: null,
			asset: null,
		},
	},
	sidechain_eth_deposit: {
		value: OPERATIONS_IDS.SIDECHAIN_ETH_DEPOSIT,
		name: 'Sidechain eth deposit',
		options: {
			from: 'committee_member_id',
			subject: ['account', 'name'],
			amount: 'value',
			asset: null,
		},
	},
	sidechain_eth_withdraw: {
		value: OPERATIONS_IDS.SIDECHAIN_ETH_WITHDRAW,
		name: 'Sidechain eth withdraw',
		options: {
			from: 'account',
			subject: ['eth_addr'],
			amount: 'value',
			asset: null,
		},
	},
	sidechain_eth_approve_withdraw: {
		value: OPERATIONS_IDS.SIDECHAIN_ETH_APPROVE_WITHDRAW,
		name: 'Sidechain eth approve withdraw',
		options: {
			from: 'committee_member_id',
			subject: ['withdraw_id'],
			amount: null,
			asset: null,
		},
	},
	contract_fund_pool: {
		value: OPERATIONS_IDS.CONTRACT_FUND_POOL,
		name: 'Contract fund pool',
		options: {
			from: 'sender',
			subject: ['contract'],
			amount: 'value',
			asset: 'fee',
		},
	},
	contract_whitelist: {
		value: OPERATIONS_IDS.CONTRACT_WHITELIST,
		name: 'Contract whitelist',
		options: {
			from: 'sender',
			subject: ['contract'],
			amount: 'value',
			asset: 'fee',
		},
	},
	sidechain_issue: {
		value: OPERATIONS_IDS.SIDECHAIN_ISSUE,
		name: 'Sidechain issue',
		options: {
			from: 'account',
			subject: ['deposit_id'],
			amount: 'value',
			asset: 'fee',
		},
	},
	sidechain_burn: {
		value: OPERATIONS_IDS.SIDECHAIN_BURN,
		name: 'Sidechain burn',
		options: {
			from: 'account',
			subject: ['withdraw_id'],
			amount: 'value',
			asset: 'fee',
		},
	},
	register_erc20_token: {
		value: OPERATIONS_IDS.SIDECHAIN_ERC20_REGISTER_TOKEN,
		name: 'Register ERC20 token',
		options: {
			from: 'account',
			subject: ['eth_addr'],
			amount: null,
			asset: 'fee',
		},
	},
	deposit_erc20_token: {
		value: OPERATIONS_IDS.SIDECHAIN_ERC20_DEPOSIT_TOKEN,
		name: 'Deposit ERC20 token',
		options: {
			from: 'account',
			subject: ['erc20_token_addr'],
			amount: 'value',
			asset: 'fee',
		},
	},
	withdraw_erc20_token: {
		value: OPERATIONS_IDS.SIDECHAIN_ERC20_WITHDRAW_TOKEN,
		name: 'Withdraw ERC20 token',
		options: {
			from: 'account',
			subject: ['to'],
			amount: 'value',
			asset: 'fee',
		},
	},
	approve_erc20_token_withdraw: {
		value: OPERATIONS_IDS.SIDECHAIN_ERC20_APPROVE_TOKEN_WITHDRAW,
		name: 'Approve ERC20 token withdraw',
		options: {
			from: 'account',
			subject: ['to'],
			amount: 'value',
			asset: 'fee',
		},
	},
	sidechain_erc20_issue: {
		value: OPERATIONS_IDS.SIDECHAIN_ERC20_ISSUE,
		name: 'Issue ERC20 token',
		options: {
			from: 'account',
			subject: ['token'],
			amount: 'amount',
			asset: null,
		},
	},
	sidechain_erc20_burn: {
		value: OPERATIONS_IDS.SIDECHAIN_ERC20_BURN,
		name: 'Burn ERC20 token',
		options: {
			from: 'account',
			subject: ['token'],
			amount: 'amount',
			asset: null,
		},
	},
	sidechain_btc_create_address: {
		value: OPERATIONS_IDS.SIDECHAIN_BTC_CREATE_ADDRESS,
		name: 'Create BTC address',
		options: {
			from: 'account',
			subject: null,
			amount: null,
			asset: null,
		},
	},
	sidechain_btc_intermediate_deposit: {
		value: OPERATIONS_IDS.SIDECHAIN_BTC_INTERMEDIATE_DEPOSIT,
		name: 'Intermediate BTC deposit',
		options: {
			from: 'account',
			subject: ['intermediate_address'],
			amount: null,
			asset: null,
		},
	},
	sidechain_btc_deposit: {
		value: OPERATIONS_IDS.SIDECHAIN_BTC_DEPOSIT,
		name: 'BTC deposit',
		options: {
			from: 'account',
			subject: ['intermediate_deposit_id'],
			amount: null,
			asset: null,
		},
	},
	sidechain_btc_withdraw: {
		value: OPERATIONS_IDS.SIDECHAIN_BTC_WITHDRAW,
		name: 'BTC withdraw',
		options: {
			from: 'account',
			subject: ['btc_addr'],
			amount: 'value',
			asset: null,
		},
	},
	sidechain_btc_approve_withdraw: {
		value: OPERATIONS_IDS.SIDECHAIN_BTC_APPROVE_WITHDRAW,
		name: 'Approve BTC withdraw',
		options: {
			from: 'committee_member_id',
			subject: ['withdraw_id'],
			amount: null,
			asset: null,
		},
	},
	sidechain_btc_aggregate: {
		value: OPERATIONS_IDS.SIDECHAIN_BTC_AGGREGATE,
		name: 'Aggregate BTC',
		options: {
			from: null,
			subject: ['transaction_id'],
			amount: null,
			asset: null,
		},
	},
};
