import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import CustomScroll from 'react-custom-scroll';
import { connect } from 'react-redux';
import _ from 'lodash';
import classnames from 'classnames';

import {
	KEY_CODE_SPACE,
	KEY_CODE_ENTER,
	KEY_CODE_TAB,
	KEY_CODE_ARROW_DOWN,
	KEY_CODE_ARROW_UP,
	CORE_SYMBOL,
} from '../../constants/GlobalConstants';
import { FORM_SEND } from '../../constants/FormConstants';

import CustomMenu from './CustomMenu';
import { setValue } from '../../actions/FormActions';
import { setAssetFormValue } from '../../actions/BalanceActions';
import ValidateTransactionHelper from '../../helpers/ValidateTransactionHelper';
import downArrow from '../../assets/images/icons/arrow_dropdown_light.svg';

class CurrencySelect extends React.Component {

	constructor(props) {
		super(props);

		this.refList = [];

		const { symbolsList, tokensList } = this.getSymbols();

		let symbolValue = '';

		if (props.path.field === 'selectedBalance' && props.selectedBalance) {
			const list = ValidateTransactionHelper.validateContractId(props.selectedBalance) ?
				symbolsList : tokensList;
			symbolValue = list.find((val) => val.value === props.selectedBalance).text;
		}

		this.state = {
			search: '',
			searchList: { symbolsList, tokensList },
			currentVal: symbolValue,
			opened: false,
		};

		this.setMenuRef = this.setMenuRef.bind(this);

		this.handleClickOutside = this.handleClickOutside.bind(this);
	}

	componentDidMount() {
		const { path } = this.props;
		const { searchList } = this.state;

		document.addEventListener('mousedown', this.handleClickOutside);

		this.props.setAssetFormValue(path.form, path.field, searchList.symbolsList[0].value);

		return null;
	}

	componentWillReceiveProps(nextProps) {
		if (_.isEqual(this.props, nextProps)) { return; }

		const { path } = nextProps;

		const searchList = this.getSymbols(nextProps);

		this.setState({
			searchList,
		});

		if (searchList.symbolsList[0]) {
			this.props.setAssetFormValue(path.form, path.field, searchList.symbolsList[0].value);
		}
	}

	componentWillUpdate() {
		this.refList = [];
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		return { search: prevState.search };
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
			const { symbolsList, tokensList } = this.getSymbols();

			this.setState({
				searchList:
					{
						symbolsList: symbolsList.filter(({ text }) =>
							text.toLowerCase().includes(value.toLowerCase())),
						tokensList: tokensList.filter(({ text }) =>
							text.toLowerCase().includes(value.toLowerCase())),
					},
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

	onKeyDown(e, index, row) {
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
				if ((row === this.refList[index].length - 1) && (index === this.refList.length - 1)) {
					this.searchInput.focus();
				} else if (
					(row === this.refList[index].length - 1)
					&& (index !== this.refList.length - 1)
				) {
					this.refList[index + 1][0].focus();
				} else if ((row !== this.refList[index].length - 1)) {
					this.refList[index][row + 1].focus();
				}

				e.preventDefault();
				break;
			case KEY_CODE_ARROW_UP:
				if ((index === 0) && (row === 0)) {
					this.searchInput.focus();
				} else if (row !== 0) {
					this.refList[index][row - 1].focus();
				} else if ((row === 0) && (index !== 0)) {
					if (!this.refList[index - 1]) {
						this.searchInput.focus();

						e.preventDefault();
						break;
					}
					this.refList[index - 1][this.refList[index - 1].length - 1].focus();
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
			case KEY_CODE_ARROW_DOWN: {
				const refsLength = this.refList.length;

				for (let i = 0; i < refsLength; i += 1) {
					if (this.refList[i]) {
						this.refList[i][0].focus();
						e.preventDefault();
						break;
					}
				}

				e.preventDefault();
				break;
			}
			case KEY_CODE_ARROW_UP: {
				const rowLength = this.refList[this.refList.length - 1].length - 1;
				this.refList[this.refList.length - 1][rowLength].focus();

				e.preventDefault();
				break;
			}
			default:
				return null;
		}

		return null;
	}

	setMenuRef(node) {
		this.menuRef = node;
	}

	getSymbols(nextProps) {
		const symbolsList = [];
		const tokensList = [];

		if (!this.props) {
			return symbolsList;
		}

		const {
			balances, assets, account, tokens,
		} = nextProps ? nextProps.data : this.props.data;

		if (!account) {
			return symbolsList;
		}

		balances.forEach((balance) => {
			if (balance.get('owner') === account.get('id')) {
				const symbol = assets.getIn([balance.get('asset_type'), 'symbol']);

				if (symbol === CORE_SYMBOL) {
					symbolsList.unshift({ text: symbol, value: balance.get('id') });
					return null;
				}

				symbolsList.push({ text: symbol, value: balance.get('id') });
			}

			return null;
		});

		if (tokens) {
			tokens.mapEntries(([accountId, tokensArr]) => {
				if (accountId !== account.get('id')) {
					return null;
				}

				tokensArr.mapEntries(([contractId, token]) => {
					tokensList.push({
						text: token.get('symbol'),
						value: contractId,
					});
				});

				return null;
			});
		}

		return { symbolsList, tokensList };
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
				list: searchList.symbolsList,
			},
			{
				id: 1,
				title: 'Tokens',
				list: searchList.tokensList,
			},
		];

		if (!dropdownData[0].list.find((value) => value.text === CORE_SYMBOL)) {
			dropdownData[0].list.unshift({ text: 'ECHO', value: '' });
		}

		const resultList = dropdownData.reduce((result, value) => result.concat(value.list), []);

		return (
			<div ref={this.setMenuRef}>
				<Dropdown
					id="currency-select"
					className="currency-select"
					pullRight
					onToggle={() => true} // TAB close fix
					open={this.state.opened}
					disabled={resultList.length === 1 && !opened}
				>
					<Dropdown.Toggle
						onClick={() => this.toggleDropdown()}
						noCaret
					>
						<span className="val">{currentVal || 'ECHO'}</span>
						{resultList.length === 1 && !opened ? null : <img className="ddDown" src={downArrow} alt="" /> }
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
									style={{ height: resultList.length > 3 ? 116 : '' }}
									className={
										classnames(
											'user-scroll',
											{ 'no-scroll': resultList.length < 4 },
										)
									}
								>
									<CustomScroll
										flex="1"
										heightRelativeToParent="calc(100%)"
									>
										{
											dropdownData.map((elem, index) => (
												elem.list.length ?
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
																			ref={(ref) => {
																				if (ref) {
																					if (!this.refList[index]) {
																						this.refList[index] = [];
																					}
																					this.refList[index][i] = ref;
																				}
																			}}
																			href=""
																			className="dropdown-list-item"
																			tabIndex={0}
																			onKeyPress={
																				(e) => {
																					this.onItemKeyPress(e, text, value);
																					e.preventDefault();
																				}
																			}
																			onKeyDown={(e) => this.onKeyDown(e, index, i)}
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
													</div> : null
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
	selectedBalance: PropTypes.string,
	path: PropTypes.object,
	data: PropTypes.object,
	setValue: PropTypes.func.isRequired,
	setAssetFormValue: PropTypes.func.isRequired,
};

CurrencySelect.defaultProps = {
	path: null,
	data: null,
	selectedBalance: '',
};

export default connect(
	(state) => ({
		selectedBalance: state.form.getIn([FORM_SEND, 'selectedBalance']),
	}),
	(dispatch) => ({
		setValue: (form, field, value) => dispatch(setValue(form, field, value)),
		setAssetFormValue: (form, field, value) => dispatch(setAssetFormValue(form, field, value)),
	}),
)(CurrencySelect);
