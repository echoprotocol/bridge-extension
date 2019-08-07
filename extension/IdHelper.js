import * as randomize from 'randomatic';
import { LENGTH_ID_MESSAGE, PATTERN_ID_MESSAGE } from '../src/constants/GlobalConstants';

class IdHelper {

	static getId() {
		return randomize(PATTERN_ID_MESSAGE, LENGTH_ID_MESSAGE);
	}

}

export default IdHelper;
