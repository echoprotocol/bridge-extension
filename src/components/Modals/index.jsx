import React from 'react';

import ModalLogout from './ModalLogout';
import ModalRemoveNetwork from './ModalRemoveNetwork';


export default class ModalsComponent extends React.Component {

	render() {
		return (
			<React.Fragment>
				<ModalLogout />
				<ModalRemoveNetwork />
			</React.Fragment>
		);
	}

}
