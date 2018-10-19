import { MAX_PIN_LENGTH, MIN_PIN_LENGTH } from '../constants/ValidationConstants';

class ValidatePinHelper {

	static validatePin(pin) {
		if (/ /.test(pin)) {
			return 'PIN shouldn’t contain spaces';
		}

		if (pin.length < MIN_PIN_LENGTH) {
			return 'At least 6 symbols';
		}

		if (pin.length > MAX_PIN_LENGTH) {
			return 'Maximum 32 symbols';
		}

		return null;
	}

}

export default ValidatePinHelper;
