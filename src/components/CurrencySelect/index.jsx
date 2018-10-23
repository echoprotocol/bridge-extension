import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'semantic-ui-react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import CustomScroll from 'react-custom-scroll';

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
					onToggle={() => this.toggleDropdown()}
					open={this.state.opened}
				>
					<Dropdown.Toggle onClick={() => this.toggleDropdown()}>
						<span className="val">{(currentVal) || 'ECHO'}</span>
					</Dropdown.Toggle>
					<CustomMenu bsRole="menu">
						<div className="menu-container">
							<Input
								placeholder="Type asset or token name"
								onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
							/>
							<div className="select-container">
								<div
									className="user-scroll"
									style={{ height: '165px' }}
								>
									<CustomScroll
										flex="1"
										heightRelativeToParent="calc(100%)"
									>
										{
											data.map((elem) => (
												<div key={elem.id} className="select-item">
													<div className="title">{elem.title}</div>
													<ul>
														{
															elem.list.map((text) => (
																<MenuItem
																	key={Math.random()}
																	onClick={(e) => { this.handleClick(text); e.preventDefault(); }}
																>
																	{text}
																</MenuItem>
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
