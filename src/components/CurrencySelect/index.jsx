import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import CustomScroll from 'react-custom-scroll';
import { KEY_CODE_TAB, KEY_CODE_SPACE, KEY_CODE_ENTER } from '../../constants/GlobalConstants';

import CustomMenu from './CustomMenu';

class CurrencySelect extends React.Component {

	constructor() {
		super();

		this.state = {
			currentVal: '',
			opened: false,
		};

		this.setMenuRef = this.setMenuRef.bind(this);

		this.handleClickOutside = this.handleClickOutside.bind(this);
	}

	componentDidMount() {
		document.addEventListener('mousedown', this.handleClickOutside);
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClickOutside);
	}

	onItemKeyPress(e, text) {
		const code = e.keyCode || e.which;

		if (this.state.opened && [KEY_CODE_ENTER, KEY_CODE_SPACE].includes(code)) {
			e.preventDefault();
			this.handleClick(text);
		}
	}

	setMenuRef(node) {
		this.menuRef = node;
	}


	handleClick(text) {
		this.setState({ currentVal: text });
		this.setState({ opened: false });
	}


	handleClickOutside(event) {
		if (this.menuRef && (!this.menuRef.contains(event.target))) {
			this.setState({ opened: false });
		}
	}

	toggleDropdown() {
		this.setState({ opened: !this.state.opened });
	}

	render() {

		const { currentVal } = this.state;
		const { data } = this.props;

		return (
			<div ref={this.setMenuRef}>
				<Dropdown
					id="currency-select"
					className="currency-select"
					pullRight
					// onToggle={() => this.toggleDropdown()}
					onToggle={() => true} // TAB close fix
					open={this.state.opened}
					onKeyPress={() => { console.log('key press'); }}
				>
					<Dropdown.Toggle
						onClick={() => this.toggleDropdown()}
					>
						<span className="val">{(currentVal) || 'ECHO'}</span>
					</Dropdown.Toggle>
					<CustomMenu bsRole="menu">
						<div className="menu-container">
							{/* <Input
								placeholder="Type asset or token name"
								onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
								focus
								tabIndex={0}
							/> */}
							<div className="ui input">
								<input
									type="text"
									tabIndex={0}
									placeholder="Type asset or token name"
									onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
									ref={(node) => { this.searchInput = node; }}
								/>
							</div>
							<div className="select-container">
								<div
									className="user-scroll"
									style={{ height: '118px' }}
								>
									<CustomScroll
										flex="1"
										heightRelativeToParent="calc(100%)"
									>
										{
											data.map((elem) => (
												<div
													key={elem.id}
													className="select-item"
												>
													<div className="title">{elem.title}</div>
													<ul>
														{
															elem.list.map((text) => (
																<li key={Math.random()}>
																	<a
																		href=""
																		tabIndex={0}
																		onClick={(e) => { this.handleClick(text); e.preventDefault(); }}
																		onKeyPress={
																			(e) => {
																				this.onItemKeyPress(e, text); e.preventDefault();
																			}
																		}
																	>
																		{text}
																	</a>
																</li>
															))
														}
													</ul>
												</div>
											))
										}
									</CustomScroll>
								</div>
							</div>
						</div>
					</CustomMenu>
				</Dropdown>
			</div>
		);
	}

}

CurrencySelect.propTypes = {
	data: PropTypes.array,
};

CurrencySelect.defaultProps = {
	data: [],
};

export default CurrencySelect;
