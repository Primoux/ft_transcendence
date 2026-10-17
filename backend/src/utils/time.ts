function getTodayParis() : string {
    return Intl.DateTimeFormat("en-CA", {timeZone: "Europe/Paris"}).format()
}

export default getTodayParis
