"use strict";

// This scriptable widget is from https://github.com/BusHanyang/hybus-ios-widget
// By Taewan Park

const VERSION = '1.0.0';

const API_URL = 'https://api.hybus.app/';


const getTimetable = async (week, season, location) => {
    const url = `${API_URL}/timetable/${season}/${week}/${location}`;

    let req = new Request(url);
    const result = req.loadJSON().then((response) => {
        if (response["error"] !== undefined) {
            return Array(1);
        }
        return response
    }).catch((error) => {
        console.error(error);
        return Array(2);
    })

    return result;
}


const getSettings = async () => {
    const url = `${API_URL}/settings/`;

    let req = new Request(url);
    const result = req.loadJSON().then((response) => {
        if (response["error"] !== undefined) {
            return {};
        }
        return response
    }).catch((error) => {
        console.error(error);
        return {};
    })

    return result;
}


const convertLocationString = (loc) => {
    if (loc == "셔틀콕") {
        return "shuttlecoke_o"
    } else if (loc == "한대앞") {
        return "subway"
    } else if (loc == "예술인") {
        return "yesulin"
    } else if (loc == "중앙역") {
        return "jungang"
    } else if (loc == "기숙사") {
        return "residence"
    } else if (loc == "건너편") {
        return "shuttlecoke_i"
    }
    return "invalid"
}


const isWeekend = () => {
    const today = new Date();
    const day = today.getDay();

    return day == 0 || day == 6;
}


const getSeason = (settings) => {
    const today = new Date();

    const [semesterStart, semesterEnd] = [new Date(settings["semester"]["start_date"]), new Date(`${settings["semester"]["end_date"]}T23:59:59+09:00`)];
    const [vacationSessionStart, vacationSessionEnd] = [new Date(settings["vacation_session"]["start_date"]), new Date(`${settings["vacation_session"]["end_date"]}T23:59:59+09:00`)];
    const [vacationStart, vacationEnd] = [new Date(settings["vacation"]["start_date"]), new Date(`${settings["vacation"]["end_date"]}T23:59:59+09:00`)];

    const todayUnix = +today; // In milliseconds, not to do /1000 operation in all comparisons

    const convertedHoliday = settings["holiday"].map((s) => { return new Date(s) });
    const convertedHaltday = settings["halt"].map((s) => { return new Date(s) });

    let isHoliday = false

    for (const holiday of convertedHoliday) {
        if (
            today.getFullYear() == holiday.getFullYear() &&
            today.getMonth() == holiday.getMonth() &&
            today.getDate() == holiday.getDate()
        ) {
            isHoliday = true;
            break;
        }
    }

    for (const haltDay of convertedHaltday) {
        if (
            today.getFullYear() == haltDay.getFullYear() &&
            today.getMonth() == haltDay.getMonth() &&
            today.getDate() == haltDay.getDate()
        ) {
            return ['halt', '']
        }
    }

    if (+semesterStart < todayUnix && todayUnix < +semesterEnd) {
        // Semester
        if (isWeekend() || isHoliday) {
            return ['semester', 'weekend']
        } else {
            return ['semester', 'week']
        }
    } else if (
        +vacationSessionStart < todayUnix &&
        todayUnix < +vacationSessionEnd
    ) {
        // Vacation Session
        if (isWeekend() || isHoliday) {
            return ['vacation_session', 'weekend']
        } else {
            return ['vacation_session', 'week']
        }
    } else if (
        +vacationStart < todayUnix &&
        todayUnix < +vacationEnd
    ) {
        // Vacation
        if (isWeekend() || isHoliday) {
            return ['vacation', 'weekend']
        } else {
            return ['vacation', 'week']
        }
    } else {
        // Error!
        return ['error', '']
    }
}


const isAfterCurrentTime = (sch) => {
    const today = new Date();
    const timestamp = +today

    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();

    const schedule = new Date(`${year}-${month}-${date}T${sch["time"]}:00+09:00`);
    return +schedule - timestamp >= 0
}


const getDestinationType = (busType, loc) => {
    if (loc == 'shuttlecoke_o') {
        if (busType == 'C' || busType == 'DH' || busType == 'DHJ') {
            return '한대앞행'
        } else if (busType == 'DY') {
            return '예술인행'
        } else {
            return '로딩중..'
        }
    } else if (loc == 'subway') {
        if (busType == 'C') {
            return '예술인행'
        } else if (busType == 'DHJ') {
            return '중앙역행'
        } else {
            return '컨퍼앞행'
        }
    } else if (loc == 'yesulin') {
        return '컨퍼앞행'
    } else if (loc == 'jungang') {
        return '컨퍼앞행'
    } else if (loc == 'shuttlecoke_i') {
        if (busType == 'NA') {
            return '행선지X'
        } else if (busType == 'R') {
            return '기숙사행'
        } else {
            return '로딩중..'
        }
    } else if (loc == 'residence') {
        return '셔틀콕행'
    } else {
        return '로딩중..'
    }
}


const getCurrentInfo = async (loc) => {
    // Based on hybus-genesis/Card.tsx
    const settings = await getSettings();

    if (settings == {}) {
        console.log("Error while retrieving settings");
        return [];
    }

    const [s, w] = getSeason(settings);

    const timetable = await getTimetable(w, s, loc);

    if (timetable.length === 0) {
        // No shuttle bus for today
        return "오늘 운행하는 셔틀이 없습니다."
    } else if (timetable.length === 1) {
        // Input error
        return "시간표를 불러오는 중 오류가 발생했습니다."
    } else if (timetable.length === 2) {
        // Network error
		return "네트워크 오류입니다."
    }

    const filteredTimetable = timetable.filter(isAfterCurrentTime);

    if (filteredTimetable.length == 0) {
        // Service is done for today
        return "오늘 셔틀 운행이 종료되었습니다."
    }

    const converted = filteredTimetable.map((sch, i) => {
        if (i < 2) {
            return { "time": sch["time"], "destination": getDestinationType(sch["type"], loc) }
        }
    })

    const result = converted.filter((sch) => sch);

    return result
}


const createMediumWidget = async () => {
    let widget = new ListWidget();
    let backgroundColor = '#001148'
    
	let mainStack = widget.addStack();
    mainStack.layoutHorizontally();
    
    let locationStack = mainStack.addStack()
    let simpleGradient = new LinearGradient()
    simpleGradient.colors = [new Color("001148"), new Color("1a1e43")]
    simpleGradient.locations = [0, 1]
    simpleGradient.startPoint = new Point(0, 0)
    simpleGradient.endPoint = new Point(1, 1)

    widget.backgroundGradient = simpleGradient
    var location = null;
    
    if (config.runsInWidget) {
        location = args.widgetParameter;
        
        if (location == null || location == undefined || location == "") {
            let title = mainStack.addText("정류장 파라미터를 설정해 주세요!");
    
            return widget;
        }
    } else {
        location = "셔틀콕"
    }
    
    const convertedLocation = convertLocationString(location);
	const busInfo = await getCurrentInfo(convertedLocation);

	locationStack.layoutVertically();
    let locationText = locationStack.addText(location);
	locationText.font = Font.boldSystemFont(36);
    
	mainStack.addSpacer(30);

    let shuttleStack = mainStack.addStack();
    shuttleStack.layoutVertically();
    
    if (busInfo.length == 2) {
        let firstBusStack = shuttleStack.addStack();
        let firstBusType = firstBusStack.addText(busInfo[0]["destination"]);
        firstBusType.font = Font.systemFont(14);
        firstBusStack.addSpacer(10);
        let firstBusTime = firstBusStack.addText(busInfo[0]["time"]);
        firstBusTime.font = new Font("CourierNewPS-BoldMT", 25);
        firstBusStack.addSpacer(10);
        let firstBusDepartText = firstBusStack.addText("출발");
        firstBusDepartText.font = Font.systemFont(14);
        firstBusStack.centerAlignContent();

        shuttleStack.addSpacer(8);
        let secondBusStack = shuttleStack.addStack();
        let secondBusType = secondBusStack.addText(busInfo[1]["destination"]);
        secondBusType.font = Font.systemFont(14);
        secondBusStack.addSpacer(10);
        let secondBusTime = secondBusStack.addText(busInfo[1]["time"]);
        secondBusTime.font = new Font("CourierNewPS-BoldMT", 25);
        secondBusStack.addSpacer(10);
        let secondBusDepartText = secondBusStack.addText("출발");
        secondBusDepartText.font = Font.systemFont(14);
        secondBusStack.centerAlignContent();
    } else if (busInfo.length == 1) {  
        shuttleStack.addSpacer(18)
        let firstBusStack = shuttleStack.addStack();
        let firstBusType = firstBusStack.addText(busInfo[0]["destination"]);
        firstBusType.font = Font.systemFont(14);
        firstBusStack.addSpacer(10);
        let firstBusTime = firstBusStack.addText(busInfo[0]["time"]);
        firstBusTime.font = new Font("CourierNewPS-BoldMT", 25);
        firstBusStack.addSpacer(10);
        let firstBusDepartText = firstBusStack.addText("출발");
        firstBusDepartText.font = Font.systemFont(14);
        firstBusStack.centerAlignContent();
    } else {
        shuttleStack.addSpacer(14);
        let doneText = shuttleStack.addText(busInfo);
        doneText.font = Font.systemFont(14)
        doneText.centerAlignText();
    }

    if (!config.runsWithSiri) {
        let safariSymbol = SFSymbol.named("safari");
        let linkStack = locationStack.addStack();

        linkStack.url = "https://hybus.app"
        linkStack.addSpacer(4);
        let linkElement = linkStack.addImage(safariSymbol.image);
        linkElement.imageSize = new Size(14, 14);
        linkElement.tintColor = Color.blue();
        linkStack.addSpacer(3);
        let linkText = linkStack.addText("버스하냥 열기");
        linkText.font = Font.mediumSystemFont(12);
    }
    
    return widget;
}


const createSmallWidget = async () => {
    let widget = new ListWidget();
    let titleStack = widget.addStack();
    const loc = args.widgetParameter;

    if (loc == null || loc == undefined || loc == "") {
        let title = titleStack.addText("정류장 파라미터를 설정해 주세요!");
    }
    else {
        let title = titleStack.addText(`🚌 현재 버스 시간표: ${loc}`);
    }

    return widget;
}


if (config.runsInApp) {
    const widget = await createMediumWidget();
    Script.setWidget(widget);
    widget.presentMedium();
} else {
    let nextRefresh = Date.now() + 1000*30
    if (config.widgetFamily === "small") {
        const widget = await createSmallWidget();
        Script.setWidget(widget);
        widget.presentSmall();
        widget.refreshAfterDate = new Date(nextRefresh);
    } else if (config.widgetFamily === "medium") {
        const widget = await createMediumWidget();
        Script.setWidget(widget);
        widget.presentMedium();
        widget.refreshAfterDate = new Date(nextRefresh);
    } else if (config.widgetFamily === "accessoryRectangular") {
        // Not made yet
    } else {
        // Others just render in medium size
        const widget = await createMediumWidget();
        Script.setWidget(widget);
        widget.presentMedium();
        widget.refreshAfterDate = new Date(nextRefresh);
    }
}


