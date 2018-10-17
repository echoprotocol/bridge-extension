import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'semantic-ui-react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import CustomScroll from 'react-custom-scroll';

class CurrencySelect extends React.Component {

	constructor() {
		super();

		this.state = {
			currentVal: '',
			opened: false,
		};
	}

	handleClick(text) {
		this.setState({ currentVal: text });

		this.setState({ opened: false });
	}

	toggleDropdown() {
		this.setState({ opened: !this.state.opened });
	}

	render() {

		const { currentVal } = this.state;
		const { data } = this.props;

		return (
			<Dropdown
				id="currency-select"
				className="currency-select"
				pullRight
				onToggle={() => this.toggleDropdown()}
				open={this.state.opened}
			>
				<Dropdown.Toggle>
					<span className="val">{(currentVal) || 'ECHO'}</span>
				</Dropdown.Toggle>
				<Dropdown.Menu>
					<div className="menu-container">
						<Input
							onClick={(e) => e.preventDefault()}
							placeholder="Type asset or token name"
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
																onClick={() => this.handleClick(text)}
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
				</Dropdown.Menu>
			</Dropdown>
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
