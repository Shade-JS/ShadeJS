// Function getParameterNames(func) {
//     // Convert the function to a string
//     const funcStr = func.toString();

//     // Extract the parameters part using a regular expression
//     const paramsStr = funcStr.slice(funcStr.indexOf('(') + 1, funcStr.indexOf(')')).trim();

//     // Handle special cases (like destructuring and rest parameters)
//     const specialCases = paramsStr.split(/,(?![^{]*})/);

//     return specialCases.map(param => param.trim());
// }

// // Test the function
// function foo(arg1, {title, count}, arg2, ...rest) {}
// console.log(getParameterNames(foo));

// function getParameterNames(func) {
//     const funcStr = func.toString();

//     // Extract the parameters part using a regular expression
//     const paramsStr = funcStr.slice(funcStr.indexOf('(') + 1, funcStr.indexOf(')')).trim();

//     // Split the parameters
//     const params = paramsStr.split(/,(?![^{]*\})/);

//     // Function to handle destructured objects
//     const handleDestructuring = (param) => {
//         // Match the pattern {prop1, prop2} and similar
//         const destructuringMatch = param.match(/{(.*)}/);
//         if (destructuringMatch) {
//             return destructuringMatch[1].split(',').map(p => p.trim());
//         }
//         return [param.trim()];
//     };

//     // Flatten the array of arrays into a single array
//     return params.flatMap(param => handleDestructuring(param));
// }

// // Test the function
// function foo(arg1, {title, count}, arg2, ...rest) {}
// console.log(getParameterNames(foo));

// function getParameterNames(func) {
//     const funcStr = func.toString();

//     // Extract the parameters part using a regular expression
//     const paramsStr = funcStr.slice(funcStr.indexOf('(') + 1, funcStr.indexOf(')')).trim();

//     // Split the parameters
//     const params = paramsStr.split(/,(?![^\[\]]*\]|\{[^\}]*\})/);

//     // Function to handle destructuring (both objects and arrays)
//     const handleDestructuring = (param) => {
//         // Check for object destructuring
//         const objectMatch = param.match(/{(.*)}/);
//         if (objectMatch) {
//             return objectMatch[1].split(',').map(p => p.trim());
//         }

//         // Check for array destructuring
//         const arrayMatch = param.match(/\[(.*)\]/);
//         if (arrayMatch) {
//             return arrayMatch[1].split(',').map(p => p.trim());
//         }

//         // Regular parameter
//         return [param.trim()];
//     };

//     // Flatten the array of arrays into a single array
//     return params.flatMap(param => handleDestructuring(param));
// }

// // Test the function
// function foo(arg1, {title, count}, [foo, bar], arg2, ...rest) {}
// console.log(getParameterNames(foo));

// function getParameterNames(func) {
//     const funcStr = func.toString();

//     // Extract the parameters part using a regular expression
//     const paramsStr = funcStr.slice(funcStr.indexOf('(') + 1, funcStr.indexOf(')')).trim();

//     // Split the parameters, handling nested destructuring
//     const params = paramsStr.split(/,(?![^\[\]]*\]|\{[^\}]*\})/);

//     // Function to handle destructuring (objects and arrays)
//     const handleDestructuring = (param) => {
//         // Check for object destructuring
//         const objectMatch = param.match(/{(.*)}/);
//         if (objectMatch) {
//             return objectMatch[1].split(',').map(p => p.trim());
//         }

//         // Check for array destructuring
//         const arrayMatch = param.match(/\[(.*)\]/);
//         if (arrayMatch) {
//             return arrayMatch[1].split(',').map(p => p.trim());
//         }

//         // Regular parameter or rest parameter
//         return [param.trim()];
//     };

//     // Flatten the array of arrays into a single array
//     return params.flatMap(param => handleDestructuring(param));
// }

// // Test the function
// function foo(arg1, {title, count}, [foo, bar], arg2, ...rest) {}
// console.log(getParameterNames(foo));

function getParameterNames(func) {
	const funcStr = func.toString()

	// Extract the parameters part using a regular expression
	const paramsStr = funcStr.slice(funcStr.indexOf('(') + 1, funcStr.indexOf(')')).trim()

	// Recursive function to handle nested destructuring
	function parseDestructuredParam(param) {
		let matches
		const result = []

		// Object destructuring
		if (param.startsWith('{')) {
			matches = param.slice(1, -1).match(/([a-zA-Z0-9_]+)|({[^{}]+})|(\[[^\[\]]+\])/g)
			if (matches) {
				matches.forEach((match) => {
					if (match.startsWith('{')) {
						result.push(...parseDestructuredParam(match))
					} else if (match.startsWith('[')) {
						result.push(...parseDestructuredParam(match))
					} else {
						result.push(match)
					}
				})
			}
		}
		// Array destructuring
		else if (param.startsWith('[')) {
			matches = param
				.slice(1, -1)
				.split(',')
				.map((p) => p.trim())
			matches.forEach((match) => {
				if (match.startsWith('{')) {
					result.push(...parseDestructuredParam(match))
				} else if (match.startsWith('[')) {
					result.push(...parseDestructuredParam(match))
				} else {
					result.push(match)
				}
			})
		}

		return result
	}

	// Split the parameters and process each one
	const params = paramsStr.split(/,(?![^\[\]]*\]|\{[^\}]*\})/)
	return params.flatMap((param) => {
		if (param.includes('{') || param.includes('[')) {
			return parseDestructuredParam(param)
		}

		return param.trim()
	})
}

// Test the function
function testFunction(arg1, { a, b: { c, d }, e: [f, { g, h }] }, [i, j, [k, l]], ...rest) {}
console.log(getParameterNames(testFunction))
