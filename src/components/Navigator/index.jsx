import React from 'react';
import PropTypes from 'prop-types';
import FocusTrap from 'focus-trap-react';
import Header from '../Header';
import Navbar from '../Navbar';
import BridgeSidebar from '../BridgeSidebar';

import { SIGN_TRANSACTION_PATH } from '../../constants/RouterConstants';

class Navigator extends React.PureComponent {

	/*
        1)  Вынести visible в редакс и onSidebarToggle в экшенсы
        2)  Реализовать закрытие сайдбара при открытии дропдаунов
        3)  В компоненте BridgeSidebar реализвовать вывод имени юзера
            и его изображения
     */

	constructor(props) {
		super(props);
		this.sidebarRef = React.createRef();
	}

	render() {
		const { visible, onSidebarToggle, pathname } = this.props;


		return (
			<React.Fragment>
				<FocusTrap active={visible} className="trap-wrap">
					<Header pathname={pathname} />
					<BridgeSidebar
						visible={visible}
						onSidebarToggle={onSidebarToggle}
					/>
				</FocusTrap>
				{
					pathname !== SIGN_TRANSACTION_PATH ?
						<Navbar onSidebarToggle={onSidebarToggle} /> : null
				}
			</React.Fragment>
		);
	}

}

Navigator.propTypes = {
	visible: PropTypes.bool.isRequired,
	onSidebarToggle: PropTypes.func.isRequired,
	pathname: PropTypes.string.isRequired,
};

export default Navigator;
