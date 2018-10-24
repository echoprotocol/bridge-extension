import { MAX_PIN_LENGTH, MIN_PIN_LENGTH } from '../constants/ValidationConstants';

class ValidatePinHelper {

	static validatePin(pin) {
		if (/ /.test(pin)) {
			return 'PIN shouldn’t contain spaces';
		}

		if (pin.length < MIN_PIN_LENGTH) {
			return `At least ${MIN_PIN_LENGTH} symbols`;
		}

		if (pin.length > MAX_PIN_LENGTH) {
			return `Maximum ${MAX_PIN_LENGTH} symbols`;
		}

		return null;
	}

}

export default ValidatePinHelper;
