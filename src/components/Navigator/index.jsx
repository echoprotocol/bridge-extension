import React from 'react';
import PropTypes from 'prop-types';
import FocusTrap from 'focus-trap-react';
import { connect } from 'react-redux';

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
		const { visibleSidebar } = this.props;


		return (
			<React.Fragment>
				<FocusTrap active={visibleSidebar} className="trap-wrap">
					<Header />
					{/* <BridgeSidebar /> */}
				</FocusTrap>

				<Navbar />
			</React.Fragment>
		);
	}

}

Navigator.propTypes = {
	visibleSidebar: PropTypes.bool.isRequired,

};

export default connect(
	(state) => ({
		visibleSidebar: state.global.get('visibleSidebar'),
	}),
	() => ({}),
)(Navigator);
