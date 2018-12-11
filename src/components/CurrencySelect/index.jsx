import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import CustomScroll from 'react-custom-scroll';
import { connect } from 'react-redux';
import _ from 'lodash';

import {
	KEY_CODE_SPACE,
	KEY_CODE_ENTER,
	KEY_CODE_TAB,
	KEY_CODE_ARROW_DOWN,
	KEY_CODE_ARROW_UP,
} from '../../constants/GlobalConstants';

import CustomMenu from './CustomMenu';
import { setValue } from '../../actions/FormActions';

class CurrencySelect extends React.Component {

	constructor(props) {
		super(props);

		this.refList = [];

		this.state = {
			search: '',
			searchList: this.getSymbols(),
			currentVal: '',
			opened: false,
		};

		this.setMenuRef = this.setMenuRef.bind(this);

		this.handleClickOutside = this.handleClickOutside.bind(this);
	}

	componentDidMount() {
		const { path } = this.props;
		const { searchList } = this.state;

		if (path) {
			this.props.setValue(path.form, path.field, searchList[0].value);
		}

		document.addEventListener('mousedown', this.handleClickOutside);
	}

	componentWillReceiveProps(nextProps) {
		if (_.isEqual(this.props, nextProps)) { return; }

		this.setState({
			searchList: this.getSymbols(),
		});
	}

	componentDidUpdate(prevProps, prevState) {
		const { opened } = this.state;
		const { opened: prevOpened } = prevState;

		if (opened && (opened !== prevOpened)) {
			this.searchInput.focus();
		}
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClickOutside);
	}

	onItemKeyPress(e, text, value) {
		const code = e.keyCode || e.which;

		if (this.state.opened && [KEY_CODE_ENTER, KEY_CODE_SPACE].includes(code)) {
			e.preventDefault();
			this.handleClick(text, value);
		}
	}

	onSearch(value) {
		if (value) {
			this.setState({
				searchList: this.getSymbols().filter(({ text }) =>
					text.toLowerCase().includes(value.toLowerCase())),
			});
		} else {
			this.setState({ searchList: this.getSymbols() });
		}
	}

	onChange(e) {
		this.setState({
			search: e.target.value,
		});

		this.onSearch(e.target.value);
	}

	onKeyDown(e, index) {
		const code = e.keyCode || e.which;

		switch (code) {
			case KEY_CODE_TAB:
				if (this.state.opened) {
					this.setState({
						opened: false,
						searchList: this.getSymbols(),
					});
				}
				break;
			case KEY_CODE_ARROW_DOWN:
				if (index === this.refList.length - 1) {
					this.searchInput.focus();
				} else {
					this.refList[index + 1].focus();
				}

				e.preventDefault();
				break;
			case KEY_CODE_ARROW_UP:
				if (index === 0) {
					this.searchInput.focus();
				} else {
					this.refList[index - 1].focus();
				}

				e.preventDefault();
				break;
			default:
				return null;
		}

		return null;
	}

	onInputKeyDown(e) {
		const code = e.keyCode || e.which;

		switch (code) {
			case KEY_CODE_TAB:
				if (this.state.opened) {
					this.setState({
						opened: false,
						searchList: this.getSymbols(),
					});
				}
				break;
			case KEY_CODE_ARROW_DOWN:
				this.refList[0].focus();

				e.preventDefault();
				break;
			case KEY_CODE_ARROW_UP:
				this.refList[this.refList.length - 1].focus();

				e.preventDefault();
				break;
			default:
				return null;
		}

		return null;
	}

	setMenuRef(node) {
		this.menuRef = node;
	}

	getSymbols() {
		if (!this.props) {
			return null;
		}

		const { balances, assets, account } = this.props.data;

		const symbolsList = [];

		if (!account) {
			return symbolsList;
		}

		balances.forEach((balance) => {
			if (balance.get('owner') === account.get('id')) {
				const symbol = assets.getIn([balance.get('asset_type'), 'symbol']);

				if (!symbolsList.includes(symbol)) {
					symbolsList.push({ text: symbol, value: balance.get('id') });
				}
			}
		});

		return symbolsList;
	}

	handleClick(text, value) {
		this.setState({
			currentVal: text,
			opened: false,
			search: '',
		});

		this.onSearch();

		const { path } = this.props;

		if (path) {
			this.props.setValue(path.form, path.field, value);
		}
	}

	handleClickOutside(event) {
		if (this.menuRef && (!this.menuRef.contains(event.target))) {
			this.setState({
				opened: false,
				searchList: this.getSymbols(),
			});
		}
	}

	toggleDropdown() {
		this.onSearch();

		this.setState({
			opened: !this.state.opened,
			search: '',
		});
	}

	render() {
		const {
			currentVal, search, opened, searchList,
		} = this.state;

		if (!searchList) {
			return null;
		}

		const dropdownData = [
			{
				id: 0,
				title: 'Assets',
				list: searchList,
			},
			// {
			// 	id: 1,
			// 	title: 'Tokens',
			// 	list: ['ECHO', 'EchoTest', 'EchoEcho', 'EchoEcho245'],
			// },
		];

		const resultList = dropdownData.reduce((result, value) => result.concat(value.list), []);

		this.refList = [];

		return (
			<div ref={this.setMenuRef}>
				<Dropdown
					id="currency-select"
					className="currency-select"
					pullRight
					onToggle={() => true} // TAB close fix
					open={this.state.opened}
					// onKeyUp={(e) => { this.tabListener(e); }}
					disabled={resultList.length === 1 && !opened}
				>
					<Dropdown.Toggle
						onClick={() => this.toggleDropdown()}
						noCaret={resultList.length === 1 && !opened}
					>
						<span className="val">{currentVal || 'ECHO'}</span>
					</Dropdown.Toggle>
					<CustomMenu bsRole="menu">
						<div className="menu-container">
							<div className="ui input">
								<input
									value={search}
									type="text"
									placeholder="Type asset or token name"
									onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
									onChange={(e) => this.onChange(e)}
									onKeyDown={(e) => { this.onInputKeyDown(e); }}
									ref={(node) => { this.searchInput = node; }}
								/>
							</div>
							<div className="select-container">
								<div
									className="user-scroll"
									style={{ height: resultList.length > 3 ? 118 : '' }}
								>
									<CustomScroll
										flex="1"
										heightRelativeToParent="calc(100%)"
									>
										{
											dropdownData.map((elem) => (
												<div
													key={elem.id}
													className="select-item"
												>
													<div className="title">{elem.title}</div>
													<ul>
														{
															elem.list.map(({ text, value }, i) => (
																<li key={Math.random()}>
																	<a
																		ref={(ref) => { if (ref) { this.refList[i] = ref; } }}
																		href=""
																		className="dropdown-list-item"
																		tabIndex={0}
																		onKeyPress={
																			(e) => {
																				this.onItemKeyPress(e, text, value); e.preventDefault();
																			}
																		}
																		onKeyDown={(e) => this.onKeyDown(e, i)}
																		onClick={(e) => {
																			this.handleClick(text, value);
																			e.preventDefault();
																		}}
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
	path: PropTypes.object,
	data: PropTypes.object,
	setValue: PropTypes.func.isRequired,
};

CurrencySelect.defaultProps = {
	path: null,
	data: null,
};

export default connect(
	() => ({}),
	(dispatch) => ({
		setValue: (form, field, value) => dispatch(setValue(form, field, value)),
	}),
)(CurrencySelect);
