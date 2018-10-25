import React from 'react';
import PropTypes from 'prop-types';
import FocusTrap from 'focus-trap-react';
import Header from '../Header';
import Navbar from '../Navbar';
import BridgeSidebar from '../BridgeSidebar';


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
		const { visible, onSidebarToggle } = this.props;


		return (
			<React.Fragment>
				<FocusTrap active={visible} className="trap-wrap">
					<Header />
					<BridgeSidebar
						visible={visible}
						onSidebarToggle={onSidebarToggle}
					/>
				</FocusTrap>

				{/* <Navbar onSidebarToggle={onSidebarToggle} /> */}
			</React.Fragment>
		);
	}

}

Navigator.propTypes = {
	visible: PropTypes.bool.isRequired,
	onSidebarToggle: PropTypes.func.isRequired,

};

export default Navigator;
