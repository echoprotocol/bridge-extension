class IdHelper {

	static getUniqueNumber() {
		let date = Date.now();

		if (date <= IdHelper.getUniqueNumber.previous) {
			date = IdHelper.getUniqueNumber.previous + 1;
		} else {
			IdHelper.getUniqueNumber.previous = date;
		}

		return date;
	}

}

IdHelper.getUniqueNumber.previous = 0;

export default IdHelper;
