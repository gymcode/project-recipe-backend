const { getMinutes } = require("./getMinutes")

function InvalidLoginValidation(user) {
    if (user.userLockStatus && user.invalidLoginAttempts > 1) {
        // return error response    
    } else {
        if (user.invalidLoginAttempts < 3) {
            const invalidLoginCount = user.invalidLoginAttempts + 1
            // update the user's invalid login attempt count 
            // return error response
        } else {
            // account will be deactivated after the lock co eff is greater then 3
            if (user.lockCoeff > 3) {
                //   completely deactivate the account 
            } else {
                if (user.lockCoeff == 0) {
                    const newLockPeriod = getMinutes(1)
                    const newLockCoeff = user.lockCoeff + 1
                    // update the lock period based on the user msisdn
                    // return success response
                } else {
                    const newLockPeriod = getMinutes(15 * user.lockCoeff)
                    const newLockCoeff = user.lockCoeff + 1
                    // update the lock period based on the user msisdn
                    // return success response
                }
            }
        }
    }
}

module.exports = { InvalidLoginValidation }