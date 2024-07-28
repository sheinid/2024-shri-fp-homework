/**
 * @file Домашка по FP ч. 2
 *
 * Подсказки:
 * Метод get у инстанса Api – каррированый
 * GET / https://animals.tech/{id}
 *
 * GET / https://api.tech/numbers/base
 * params:
 * – number [Int] – число
 * – from [Int] – из какой системы счисления
 * – to [Int] – в какую систему счисления
 *
 * Иногда промисы от API будут приходить в состояние rejected, (прямо как и API в реальной жизни)
 * Ответ будет приходить в поле {result}
 */
import * as R from 'ramda';
import Api from '../tools/api';

const api = new Api();

const getAnimal = async (id) => {
	const res = await api.get(`https://animals.tech/${id}`)(undefined);
	return res.result;
};

const getConvertedNumber = async (num) => {
	const res = await api.get('https://api.tech/numbers/base', {
		from: 10,
		to: 2,
		number: num.toString(),
	});
	return res.result;
};

const processSequence = ({ value, writeLog, handleSuccess, handleError }) => {
	const error = R.partial(handleError, ['ValidationError']);

	const validateNumber = R.allPass([
		R.compose(R.partialRight(R.lt, [10]), R.length),
		R.compose(R.partialRight(R.gt, [2]), R.length),
		R.compose(R.partialRight(R.gt, [0]), parseFloat),
		(x) => /^\d+(?:\.\d+)?$/.test(x),
	]);

	const process = R.compose(
		R.andThen(
			R.compose(
				R.andThen(handleSuccess),
				getAnimal,
				R.tap(writeLog),
				(x) => x % 3,
				R.tap(writeLog),
				(x) => x ** 2,
				R.tap(writeLog),
				R.length,
				R.tap(writeLog)
			)
		),
		getConvertedNumber
	);

	const success = R.compose(
		R.tryCatch(process, handleError),
		R.tap(writeLog),
		Math.round,
		parseFloat,
		R.tap(writeLog)
	);

	R.ifElse(validateNumber, success, error)(value);
};

export default processSequence;
