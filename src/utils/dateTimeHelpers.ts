export function getMinutes(minutes: number){
    const currentDate = new Date()
    const newMinutes = currentDate.getMinutes() + minutes
    currentDate.setMinutes(newMinutes)
   
    return currentDate
}

export function getCurrentDateTime(hours: number){
    const currentDate = new Date()

    // currentDate.setHours(0, 0, 0, 0);

    const newMinutes = currentDate.getDay() + hours
    currentDate.setHours(newMinutes)
   
    return currentDate
}

function pad(str: number){
    return str.toString().padStart(2, "0")    
}

export function getDate(date: Date){
    const formattedDate = [
        date.getFullYear(),pad(date.getMonth() + 1),pad(date.getDate())
        ].join("-")
    return formattedDate
}

