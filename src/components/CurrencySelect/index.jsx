import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import CustomScroll from 'react-custom-scroll';
import { connect } from 'react-redux';
import { KEY_CODE_SPACE, KEY_CODE_ENTER, KEY_CODE_TAB } from '../../constants/GlobalConstants';

import CustomMenu from './CustomMenu';
import { setValue } from '../../actions/FormActions';

class CurrencySelect extends React.Component {

	constructor() {
		super();

		this.state = {
			search: '',
			currentVal: '',
			opened: false,
		};

		this.setMenuRef = this.setMenuRef.bind(this);

		this.handleClickOutside = this.handleClickOutside.bind(this);
		this.tabListener = this.tabListener.bind(this);
	}

	componentDidMount() {
		const { path, data } = this.props;

		if (path) {
			this.props.setValue(path.form, path.field, data[0].list[0].value);
		}

		document.addEventListener('mousedown', this.handleClickOutside);
		document.addEventListener('keyup', this.tabListener);
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
		document.removeEventListener('keyup', this.tabListener);
	}

	onItemKeyPress(e, text, value) {
		const code = e.keyCode || e.which;

		if (this.state.opened && [KEY_CODE_ENTER, KEY_CODE_SPACE].includes(code)) {
			e.preventDefault();
			this.handleClick(text, value);
		}
	}

	onChange(e) {
		this.setState({
			search: e.target.value,
		});

		this.props.onSearch(e.target.value);
	}

	onKeyDown(e) {
		const code = e.keyCode || e.which;

		if (KEY_CODE_TAB === code) {
			this.toggleDropdown();
		}
	}

	setMenuRef(node) {
		this.menuRef = node;
	}

	handleClick(text, value) {
		this.setState({
			currentVal: text,
			opened: false,
			search: '',
		});

		this.props.onSearch();

		const { path } = this.props;

		if (path) {
			this.props.setValue(path.form, path.field, value);
		}
	}
	// Обработчик закрытия дропдауна с помощьб табуляции

	tabListener(e) {
		const code = e.keyCode || e.which;

		if ([KEY_CODE_TAB].includes(code)) {
			e.preventDefault();

			if ((document.activeElement !== (this.searchInput)) && (document.activeElement.className !== 'dropdown-list-item')) {
				this.setState({ opened: false });
			}
		}
	}

	handleClickOutside(event) {
		if (this.menuRef && (!this.menuRef.contains(event.target))) {
			this.setState({ opened: false, search: '' });

			this.props.onSearch();
		}
	}

	toggleDropdown() {
		this.props.onSearch();

		this.setState({
			opened: !this.state.opened,
			search: '',
		});
	}

	render() {
		const { currentVal, search, opened } = this.state;
		const { data } = this.props;

		const searchList = data.reduce((result, value) => result.concat(value.list), []);

		return (
			<div ref={this.setMenuRef}>
				<Dropdown
					id="currency-select"
					className="currency-select"
					pullRight
					onToggle={() => true} // TAB close fix
					open={this.state.opened}
					onKeyUp={(e) => { this.tabListener(e); }}
					disabled={searchList.length === 1 && !opened}
				>
					<Dropdown.Toggle onClick={() => this.toggleDropdown()} noCaret={searchList.length === 1}>
						<span className="val">{currentVal && searchList.find((val) => val.text === currentVal) ? currentVal : 'ECHO'}</span>
					</Dropdown.Toggle>
					<CustomMenu bsRole="menu">
						<div className="menu-container">
							{/* <Input
								placeholder="Type asset or token name"
								value={search}
								onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
								onKeyDown={(e) => this.onKeyDown(e)}
								onChange={(e) => this.onChange(e)}
								ref={(r) => { this.inputRef = r; }}
								focus
								tabIndex={0}
							/> */}
							<div className="ui input">
								<input
									value={search}
									type="text"
									tabIndex={0}
									placeholder="Type asset or token name"
									onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
									onKeyDown={(e) => this.onKeyDown(e)}
									onChange={(e) => this.onChange(e)}
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
															elem.list.map(({ text, value }) => (
																<li key={Math.random()}>
																	<a
																		href=""
																		className="dropdown-list-item"
																		tabIndex={0}
																		onKeyPress={
																			(e) => {
																				this.onItemKeyPress(e, text, value); e.preventDefault();
																			}
																		}
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
	data: PropTypes.array,
	onSearch: PropTypes.func,
	setValue: PropTypes.func.isRequired,
};

CurrencySelect.defaultProps = {
	path: null,
	data: [],
	onSearch: null,
};

export default connect(
	() => ({}),
	(dispatch) => ({
		setValue: (form, field, value) => dispatch(setValue(form, field, value)),
	}),
)(CurrencySelect);
