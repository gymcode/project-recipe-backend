export class Logger {

    getDateTime(){
        const dateTime = new Date().toUTCString()
        return `\x1b[34m${dateTime}\x1b[0m`
    }

    info(message:any){
        var content = `${this.getDateTime()} \x1b[32mInfo\x1b[0m : ${message}`
        return console.log(content)
    }

    debug(message:any){
        var content = `${this.getDateTime()} \x1b[33mDebug\x1b[0m : ${message}`
        return console.debug(content)
    }

    warning(message:any){
        var content = `${this.getDateTime()} \x1b[33mWarning\x1b[0m : ${message}`
        return console.log(content)
    }

    error(message:any){
        var content = `${this.getDateTime()} \x1b[31mError\x1b[0m : ${message}`
        return console.error(content)
    }


}