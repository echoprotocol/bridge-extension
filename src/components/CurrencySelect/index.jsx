import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'semantic-ui-react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import CustomScroll from 'react-custom-scroll';
import { connect } from 'react-redux';

import CustomMenu from './CustomMenu';
import { setValue } from '../../actions/FormActions';
import { KEY_CODE_TAB } from '../../constants/GlobalConstants';

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
	}

	componentDidMount() {
		const { path, data } = this.props;

		if (path) {
			this.props.setValue(path.form, path.field, data[0].list[0].value);
		}

		document.addEventListener('mousedown', this.handleClickOutside);
	}

	componentDidUpdate(prevProps, prevState) {
		const { opened } = this.state;
		const { opened: prevOpened } = prevState;

		if (opened && (opened !== prevOpened)) {
			this.inputRef.focus();
		}
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClickOutside);
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

	handleClickOutside(event) {
		if (this.menuRef && (!this.menuRef.contains(event.target))) {
			this.setState({ opened: false });
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
					onToggle={() => this.toggleDropdown()}
					open={this.state.opened}
					disabled={searchList.length === 1 && !opened}
				>
					<Dropdown.Toggle onClick={() => this.toggleDropdown()}>
						<span className="val">{currentVal && searchList.find((val) => val.text === currentVal) ? currentVal : 'ECHO'}</span>
					</Dropdown.Toggle>
					<CustomMenu bsRole="menu">
						<div className="menu-container">
							<Input
								placeholder="Type asset or token name"
								value={search}
								onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
								onKeyDown={(e) => this.onKeyDown(e)}
								onChange={(e) => this.onChange(e)}
								ref={(r) => { this.inputRef = r; }}
							/>
							<div className="select-container">
								<div
									className="user-scroll"
									// style={{ height: '165px' }}
									style={{ height: '118px' }}
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
															elem.list.map(({ text, value }, i) => (
																<MenuItem
																	eventKey={i}
																	key={text}
																	onClick={(e) => {
																		this.handleClick(text, value);
																		e.preventDefault();
																	}}
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
