module.exports = function OTPGenerator(){
    return Math.floor(1000 + Math.random() * 9000);
}