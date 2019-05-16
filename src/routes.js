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
	SIGN_TRANSACTION_PATH,
	SUCCESS_SEND_PATH,
	ERROR_SEND_PATH,
	ABOUT_PATH,
	WELCOME_PATH,
	SETTINGS_PATH,
	NETWORK_PATH,
	CONNECTION_ERROR_PATH,
	INCOMING_CONNECTION_PATH,
} from './constants/RouterConstants';

import App from './containers/App';
import CreateAccount from './containers/CreateAccount';
import ImportAccount from './containers/ImportAccount';
import AddNetwork from './containers/AddNetwork';
import Pin from './containers/PinCode';
import SuccessAddNetwork from './containers/SuccessAddNetwork';
import Welcome from './containers/Welcome';
import SettingsAccount from './containers/SettingsAccount';
import Wallet from './containers/Wallet';
import Receive from './containers/Receive';
import Transactions from './containers/Transactions';
import Send from './containers/Send';
import SuccessTransaction from './containers/Send/SuccessTransaction';
import ErrorTransaction from './containers/Send/ErrorTransaction';
import Backup from './containers/Backup';
import WatchToken from './containers/WatchToken';
import SignTransaction from './containers/SignTransaction';
import About from './containers/About';
import Network from './containers/Network';
import ConnectionError from './containers/ConnectionError';
import IncomingConnection from './containers/IncomingConnection';


import { required } from './components/Require';
import { isConnected } from './components/Connected';

export default class Routes extends React.Component {

	render() {
		return (
			<App>
				<div>
					<Route exact path={CREATE_PIN_PATH} component={Pin.Create} />
					<Route exact path={WIPE_PIN_PATH} component={Pin.Wipe} />
					<Route exact path={UNLOCK_PATH} component={Pin.Unlock} />

					<Route exact path={CREATE_ACCOUNT_PATH} component={isConnected(CreateAccount)} />
					<Route exact path={IMPORT_ACCOUNT_PATH} component={isConnected(ImportAccount)} />

					<Route exact path={SIGN_TRANSACTION_PATH} component={required(SignTransaction)} />
					<Route exact path={CONNECTION_ERROR_PATH} component={ConnectionError} />
					<Route exact path={ADD_NETWORK_PATH} component={AddNetwork} />
					<Route exact path={SUCCESS_ADD_NETWORK_PATH} component={SuccessAddNetwork} />
					<Route exact path={WELCOME_PATH} component={required(Welcome)} />
					<Route exact path={SETTINGS_PATH} component={required(SettingsAccount)} />
					<Route exact path={WALLET_PATH} component={required(Wallet)} />
					<Route exact path={RECEIVE_PATH} component={required(Receive)} />
					<Route exact path={TRANSACTIONS_PATH} component={required(Transactions)} />
					<Route exact path={SEND_PATH} component={required(Send)} />
					<Route exact path={SUCCESS_SEND_PATH} component={required(SuccessTransaction)} />
					<Route exact path={ERROR_SEND_PATH} component={required(ErrorTransaction)} />
					<Route exact path={BACKUP_PATH} component={required(Backup)} />
					<Route exact path={WATCH_TOKEN_PATH} component={required(WatchToken)} />
					<Route exact path={ABOUT_PATH} component={required(About)} />
					<Route exact path={INCOMING_CONNECTION_PATH} component={required(IncomingConnection)} />
					<Route exact path={NETWORK_PATH} component={Network} />
				</div>
			</App>
		);
	}

}
