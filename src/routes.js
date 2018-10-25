import React from 'react';
import { Route } from 'react-router';


import {
	IMPORT_ACCOUNT_PATH,
	CREATE_ACCOUNT_PATH,
	WALLET_PATH,
	ADD_NETWORK_PATH,
	SUCCESS_ADD_NETWORK_PATH,
	RECEIVE_PATH,
	CREATE_PIN_PATH,
	WIPE_PIN_PATH,
	UNLOCK_PATH,
	TRANSACTIONS_PATH,
	SEND_PATH,
	BACKUP_PATH,
	WATCH_TOKEN_PATH,
} from './constants/RouterConstants';

import App from './containers/App';
import CreateAccount from './containers/CreateAccount';
import ImportAccount from './containers/ImportAccount';
import AddNetwork from './containers/AddNetwork';
import Pin from './containers/PinCode';
import SuccessAddNetwork from './containers/SuccessAddNetwork';
import Wallet from './containers/Wallet';
import Receive from './containers/Receive';
import Transactions from './containers/Transactions';
import Send from './containers/Send';
import Backup from './containers/Backup';
import WatchToken from './containers/WatchToken';

export default class Routes extends React.Component {

	render() {
		return (
			<App>
				<div>
					<Route exact path={CREATE_ACCOUNT_PATH} component={CreateAccount} />
					<Route exact path={IMPORT_ACCOUNT_PATH} component={ImportAccount} />
					<Route exact path={CREATE_PIN_PATH} component={Pin.Create} />
					<Route exact path={WIPE_PIN_PATH} component={Pin.Wipe} />
					<Route exact path={UNLOCK_PATH} component={Pin.Unlock} />
					<Route exact path={ADD_NETWORK_PATH} component={AddNetwork} />
					<Route exact path={SUCCESS_ADD_NETWORK_PATH} component={SuccessAddNetwork} />
					<Route exact path={WALLET_PATH} component={Wallet} />
					<Route exact path={RECEIVE_PATH} component={Receive} />
					<Route exact path={TRANSACTIONS_PATH} component={Transactions} />
					<Route exact path={SEND_PATH} component={Send} />
					<Route exact path={BACKUP_PATH} component={Backup} />
					<Route exact path={WATCH_TOKEN_PATH} component={WatchToken} />

				</div>
			</App>
		);
	}

}
