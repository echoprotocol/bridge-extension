import { MAX_PIN_LENGTH, MIN_PIN_LENGTH } from '../constants/ValidationConstants';

class ValidatePinHelper {

	static validatePin(pin) {
		if (/ /.test(pin)) {
			return 'PIN should not contain spaces';
		}

		if (pin.length < MIN_PIN_LENGTH) {
			return `PIN must be ${MIN_PIN_LENGTH} characters or more`;
		}

		if (pin.length > MAX_PIN_LENGTH) {
			return `PIN must be ${MAX_PIN_LENGTH} characters or less`;
		}

		return null;
	}

}

export default ValidatePinHelper;
