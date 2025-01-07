const { body, validationResult } = require('express-validator');

/*
Middleware validator that read the request body and apply express-validator function (validationResult)
-> in the express router function, it is used after the array of rules to check if an error occured,
in that case return a (non-empty) array, otherwise next() for next midware
*/
const validate = (req, res, next) => {
    console.log('Validating request body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(401).json({ errors: errors.array() });
    }
    next();
}

/*
Same witha twist -> for form with potentially empty field while other are filled
- loop over the rules for the request, to check if any applicable
- if so activate each rule -> map each one its execution (run()) and as it returns a promise, wait for them all
- then classic validator logic
*/
const validateDynamic = async (req, res, next) => {
    const validations = dynamicValidation(req);
    if (validations.length > 0){
        // Execute the validations
        await Promise.all(validations.map(validation => validation.run(req)));

        // Collect validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(401).json({ errors: errors.array() });
        }
    }
    next(); // Proceed to the next middleware if no errors
}


const signupValidationRules = [
    // Validate username
    body('username')
        .trim() // Remove leading/trailing spaces
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),

    // Validate email
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),

    // Validate password
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/\d/).withMessage('Password must contain at least one digit')
        .matches(/[@$!%*?&#]/).withMessage('Password must contain at least one special character')
];

const loginValidationRules = [
    // Validate username
    body('username')
        .trim() // Remove leading/trailing spaces
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),

    // Validate password
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/\d/).withMessage('Password must contain at least one digit')
        .matches(/[@$!%*?&#]/).withMessage('Password must contain at least one special character')
];

 /*
 Used custom validator for comfirm and pwd compare 
 `value` represents the input value of the 'confirmPassword' field
 `req` is the full request object, allowing access to all fields in the request body
 -> throw custom error with message if not matching
 */
const resetPwdValidationRules = [
    // Validate password
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/\d/).withMessage('Password must contain at least one digit')
        .matches(/[@$!%*?&#]/).withMessage('Password must contain at least one special character'),

    // confirm password
    body('confirmPassword')
        .notEmpty().withMessage('Password Confirmation is required')
        .custom((value, {req}) => {
            if (value !== req.body.password)
                throw new Error("Confirmation Password doesn't match");
            return true;
        }),
];

const upDateUserRules = {
    username: signupValidationRules[0], // Rule for username
    email: signupValidationRules[1], // Rule for email
    password: signupValidationRules[2], // Rule for password
};

/* 
Function to dynamically apply validation rules
- iterate over rules field
- check if field in request body
- if so push the rule (friim updateUserRules) to a empty-initiated array that will be used by midware dynamic
*/
const dynamicValidation = (req) => {
    const validations = [];
    for (const [field, rule] of Object.entries(upDateUserRules)) {
        if (req.body[field]) {
            validations.push(rule); // Add rule if field is present in the request
        }
    }
    return validations;
};


module.exports = {signupValidationRules, loginValidationRules, resetPwdValidationRules, upDateUserRules, validate, validateDynamic};
