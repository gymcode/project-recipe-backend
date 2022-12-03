import { GH_NUMBER_LENGTH_NINE, GH_INVALID_MSISDN, ISO_CODE } from "../shared/constants";

function Gh_MsisdnValidation(msisdn: string) {
  try {
    if (msisdn.length < 9) return { error: true, msg: GH_NUMBER_LENGTH_NINE };

    switch (true) {
      case msisdn.startsWith("0") && msisdn.length == 10:
        return {
          error: false,
          msg: ISO_CODE + msisdn.substring(1),
        };

      case msisdn.startsWith("+") && msisdn.length > 12:
        return { error: false, msg: msisdn.substring(1) };

      case msisdn.startsWith("00") && msisdn.length > 12:
        return {
          error: false,
          msg: ISO_CODE + msisdn.substring(4),
        };

      case msisdn.substring(1) && msisdn.length == 9:
        return { error: false, msg: ISO_CODE + msisdn };

      default:
        return { error: true, msg: GH_INVALID_MSISDN };
    }

  } catch (error) {
    console.error(error);
    return {error: true, msg: "error"}
  }
}

export function CountryMsisdnValidation(msisdn: string, countryCode = "GH") {
  try {
    switch (countryCode) {
      case "GH":
        return Gh_MsisdnValidation(msisdn);
    }
  } catch (error) {
    console.error(error)
    return {error: true, msg: "error"}
  }
}

