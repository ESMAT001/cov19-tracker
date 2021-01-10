var aspectRatio = 2;
window.addEventListener("load", () => {
    if (window.innerWidth <= 767) {
        aspectRatio = 1;
    } else if (window.innerWidth > 767) {
        aspectRatio = 2;
    }
})

window.addEventListener("resize", () => {
    if (window.innerWidth <= 767) {
        aspectRatio = 1;
    } else if (window.innerWidth > 767) {
        aspectRatio = 2;
    }
})
window.addEventListener("scroll", fadeEffect);
window.addEventListener("loadend", fadeEffect);

function fadeEffect(e) {
    // console.log(document.querySelector(".fade").getBoundingClientRect().top);
    // console.log(window.innerHeight);
    var num = document.querySelectorAll(".fade");
    var fadePoint = window.innerHeight / 1.4;


    for (let i = 0; i < num.length; i++) {
        if (num[i].getBoundingClientRect().top <= fadePoint) {
            // var x = document.querySelectorAll(".project");
            // for (var i = 0; i < x.length; i++) {
            //     x[i].classList.add("apear");
            // }
            num[i].classList.remove("fade");
            num[i].classList.add("apear");

            // console.log("done");
            // this.removeEventListener("scroll", run);
        }

    }

}
//navbtn

document.getElementById("navBtn").addEventListener("click", () => {
    let target = document.getElementById("navBtn").getAttribute("trgt");
    document.getElementById(target).classList.toggle("navBar-fade");
    document.getElementById(target).classList.toggle("navBar-apear");
})
document.querySelector(".btn-x").addEventListener("click", () => {
    let target = document.getElementById("navBtn").getAttribute("trgt");
    document.getElementById(target).classList.toggle("navBar-fade");
    document.getElementById(target).classList.toggle("navBar-apear");
})



//firebase





$(document).ready(() => {
    var state = {
        'querySet': undefined,
        'page': 1,
        'rows': 10,
        'window': 2

    }

    firebase.analytics();
    viewsCount();
    getData();
    getGlobalData();
    heartCount()
    topTenCountries();
    news();

    function viewsCount() {
        let value;
        let database = firebase.database();
        database.ref('/comments/views').once("value", (snapshot) => {
            // console.log(snapshot)
            value = (parseInt(snapshot.val()) + 1);
            let updates = {};
            // updates['/comments/heart'] = 33;
            updates['/comments/views'] = value;

            firebase.database().ref().update(updates);
            $("#view").text(value);
        });
    }

    function heartCount() {
        let heart = document.getElementById("heart-span");
        let value;
        let database = firebase.database();
        database.ref('/comments/heart').once("value", (snapshot) => {
            value = (parseInt(snapshot.val()) + 1);
            let updates = {};
            updates['/comments/heart'] = value;

            firebase.database().ref().update(updates);
            // console.log("heart")
            heart.textContent = value;
            // heart.textContent = parseInt(snapshot.val()) - 1;
        });
        document.getElementById("heart").addEventListener("click", () => {

            database.ref('/comments/heart').once("value", (snapshot) => {
                if (snapshot.val() > parseInt(heart.textContent)) {
                    heart.textContent = snapshot.val();
                } else {
                    value = (parseInt(snapshot.val()) + 1);
                    let updates = {};
                    updates['/comments/heart'] = value;

                    firebase.database().ref().update(updates);
                    // console.log("heart")
                    heart.textContent = value;
                }

            });
        })

    }
    //ajax start////////
    async function getData() {
        try {

            let data = await fetch("https://api.coronatracker.com/v3/stats/worldometer/country");

            if (data.status == 200) {
                // console.log("get data");
                // console.log("yesss");
                data = await data.json();
                state.querySet = data;

                // console.log(data);
                insert();
                dataList(data);
                search(data);
                getLocationAndInsertIt(data);

                worldMap(data);

            } else {
                // console.log("NOo")
                getData();
            }
            //////////////////////

        } catch (err) {
            console.error(err);
        }

    }

    function insert() {
        let newData = pagination(state.querySet, state.page, state.rows);
        let data = newData.querySet;
        for (let i = 0; i < data.length; i++) {
            if (data[i].countryCode == null) {
                continue;
            } else {
                let countryCode = data[i].countryCode;
                let country = data[i].country;
                let total = data[i].totalConfirmed;
                let death = data[i].totalDeaths;
                let critical = data[i].totalCritical;
                let recovered = data[i].totalRecovered;
                let active = data[i].activeCases;

                let html = `<tr class="tr">
              <td class="text-left align-middle"><span> <img class="flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/${countryCode.toLowerCase()}.svg" alt="${country}-flag" ></span> ${country}</td>
              <td class="text-center align-middle table-total">${total}</td>
              <td class="text-center align-middle table-death">${death} <span class="badge badge-danger">${getPercent(total, death)}%</span></td>
              <td class="text-center align-middle table-recovered">${recovered} <span class="badge badge-success">${getPercent(total, recovered)}%</span></td>
              <td class="text-center align-middle table-active">${active} <span class="badge badge-warning text-white">${getPercent(total, active)}%</span></td>
              <td class="text-center align-middle table-death">${critical} <span class="badge badge-danger">${getPercent(active, critical)}%</span></td>
          </tr>`
                $("#all-countries").append(html);
            }

        }
        paginationBtns(newData.pages, state.page);
        //datalist part

    }

    function dataList(data) {
        var datalist = "";
        for (let i = 0; i < data.length; i++) {
            if (data[i].countryCode == null) {
                continue;
            } else {
                datalist += `<option value="${data[i].countryCode}">${data[i].country}</option>`
            }
        }
        $("#list").append(datalist);
    }
    ////////ajax end/////
    ///world map
    function worldMap(data) {
        $(".world-map-country-card").hide()
        var el = document.getElementsByClassName("jvectormap-region");
        for (let i = 0; i < el.length; i++) {
            el[i].addEventListener("mouseenter", (e) => { worldMapFunction(e.target) })
        }

        function worldMapFunction(e) {
            $(".world-map-country-card").show();
            let countryCode = e;
            if (countryCode.hasAttribute("data-code")) {
                countryCode = countryCode.getAttribute("data-code")
                for (let i = 0; i < data.length; i++) {
                    if (countryCode == data[i].countryCode) {
                        let country = data[i].country;
                        let total = data[i].totalConfirmed;
                        let active = data[i].activeCases;
                        let death = data[i].totalDeaths;
                        let recoverd = data[i].totalRecovered;
                        $(".world-map-country-card").empty();
                        let html = ` <div class="card shadow rounded apear">
                        <div class="card-body text-center">
                            <p class="hh4 font-weight-light"><span><img class="flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/${countryCode.toLowerCase()}.svg" alt="${country}-flag"></span> ${country}</p>
                            <p class="h4 font-weight-light text-primary">Total ${total}</p>
                            <p class="h4 font-weight-light text-warning">Active ${active} <span class="badge badge-warning">${getPercent(total, active)}%</span></p>
                            <p class="h4 font-weight-light text-danger">Death ${death} <span class="badge badge-danger">${getPercent(total, death)}%</span></p>
                            <p class="h4 font-weight-light  text-success">Recoverd ${recoverd} <span class="badge badge-success">${getPercent(total, recoverd)}%</span></p>
                           </div>
                          </div>`
                            // $(".world-map-country-card").show();
                        $(".world-map-country-card").append(html);
                    }
                }
            }
        }
    }

    ///
    //top ten countries//
    async function topTenCountries() {

        try {
            let data = await fetch("https://api.coronatracker.com/v3/stats/worldometer/topCountry?limit=8&sort=-confirmed");

            if (data.status == 200) {
                data = await data.json();
                // console.log("ten")
                for (let i = 0; i < data.length; i += 4) {
                    let newHtml = `<div class="row" >
                    <div class="col-12 col-lg-6">
                        <div class="row">
                            <div class="col-12 col-md-6 mb-3">
                            <div class="card shadow rounded h-100 fade">
                            <div class="card-body text-center">
                            <p class="h4 font-weight-light"><span><img class="flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/${data[i].countryCode.toLowerCase()}.svg" alt="${data[i].country}-flag" ></span> ${data[i].country}</p>
                            <p class="h4 font-weight-light text-primary">Total ${data[i].totalConfirmed}</p>
                            <p class="h4 font-weight-light text-warning">Active ${data[i].activeCases} <span class="badge badge-warning">${getPercent(data[i].totalConfirmed, data[i].activeCases)}%</span></p>
                            <p class="h4 font-weight-light text-danger">Death  ${data[i].totalDeaths} <span class="badge badge-danger">${getPercent(data[i].totalConfirmed, data[i].totalDeaths)}%</span></p>
                            <p class="h4 font-weight-light text-success">Recoverd ${data[i].totalRecovered} <span class="badge badge-success">${getPercent(data[i].totalConfirmed, data[i].totalRecovered)}%</span></p>
                        </div>
                            </div>
                            </div>
                            <div class="col-12 col-md-6 mb-3">
                            <div class="card shadow rounded h-100 fade">
                            <div class="card-body text-center">
                            <p class="h4 font-weight-light"><span><img class="flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/${data[i + 1].countryCode.toLowerCase()}.svg" alt="${data[i + 1].country}-flag" ></span> ${data[i + 1].country}</p>
                            <p class="h4 font-weight-light text-primary">Total ${data[i + 1].totalConfirmed}</p>
                            <p class="h4 font-weight-light text-warning">Active ${data[i + 1].activeCases} <span class="badge badge-warning">${getPercent(data[i + 1].totalConfirmed, data[i + 1].activeCases)}%</span></p>
                            <p class="h4 font-weight-light text-danger">Death  ${data[i + 1].totalDeaths} <span class="badge badge-danger">${getPercent(data[i + 1].totalConfirmed, data[i + 1].totalDeaths)}%</span></p>
                            <p class="h4 font-weight-light text-success">Recoverd ${data[i + 1].totalRecovered} <span class="badge badge-success">${getPercent(data[i + 1].totalConfirmed, data[i + 1].totalRecovered)}%</span></p>
                        </div>
                            </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-lg-6">
                        <div class="row">
                            <div class="col-12 col-md-6 mb-3">
                            <div class="card shadow rounded h-100 fade">
                            <div class="card-body text-center">
                            <p class="h4 font-weight-light"><span><img class="flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/${data[i + 2].countryCode.toLowerCase()}.svg" alt="${data[i + 2].country}-flag" ></span> ${data[i + 2].country}</p>
                            <p class="h4 font-weight-light text-primary">Total ${data[i + 2].totalConfirmed}</p>
                            <p class="h4 font-weight-light text-warning">Active ${data[i + 2].activeCases} <span class="badge badge-warning">${getPercent(data[i + 2].totalConfirmed, data[i + 2].activeCases)}%</span></p>
                            <p class="h4 font-weight-light text-danger">Death  ${data[i + 2].totalDeaths} <span class="badge badge-danger">${getPercent(data[i + 2].totalConfirmed, data[i + 2].totalDeaths)}%</span></p>
                            <p class="h4 font-weight-light text-success">Recoverd ${data[i + 2].totalRecovered} <span class="badge badge-success">${getPercent(data[i + 2].totalConfirmed, data[i + 2].totalRecovered)}%</span></p>
                        </div>
                            </div>
                            </div>
                            <div class="col-12 col-md-6 mb-3">
                            <div class="card shadow rounded h-100 fade">
                            <div class="card-body text-center">
                            <p class="h4 font-weight-light"><span><img class="flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/${data[i + 3].countryCode.toLowerCase()}.svg" alt="${data[i + 3].country}-flag" ></span> ${data[i + 3].country}</p>
                            <p class="h4 font-weight-light text-primary">Total ${data[i + 3].totalConfirmed}</p>
                            <p class="h4 font-weight-light text-warning">Active ${data[i + 3].activeCases} <span class="badge badge-warning">${getPercent(data[i + 3].totalConfirmed, data[i + 3].activeCases)}%</span></p>
                            <p class="h4 font-weight-light text-danger">Death  ${data[i + 3].totalDeaths} <span class="badge badge-danger">${getPercent(data[i + 3].totalConfirmed, data[i + 3].totalDeaths)}%</span></p>
                            <p class="h4 font-weight-light text-success">Recoverd ${data[i + 3].totalRecovered} <span class="badge badge-success">${getPercent(data[i + 3].totalConfirmed, data[i + 3].totalRecovered)}%</span></p>
                        </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>`

                    $("#top-ten").append(newHtml);
                }
                // console.log(data);
            } else {
                // console.log("NOo")
                topTenCountries();
            }
        } catch (error) {
            console.log(error)
        }
    };



    ////////////////////
    //pagination///
    function pagination(querySet, page, rows) {
        var start = (page - 1) * rows;
        var end = start + rows;

        var trimedData = querySet.slice(start, end);
        var pages = Math.ceil(querySet.length / rows);
        return {
            'querySet': trimedData,
            'pages': pages
        }
    }

    function paginationBtns(pages, currentPage) {
        // console.log("hellooooo")
        let tbl = $("#all-countries");
        // var ul = $("#pagination-ul");
        let ul = document.getElementById("pagination-ul")

        let maxLeft = (state.page - Math.floor(state.window / 2));
        let maxRight = (state.page + Math.floor(state.window / 2));

        if (maxLeft < 1) {
            maxLeft = 1;
            maxRight = state.window
        }
        if (maxRight > pages) {
            maxLeft = pages - (state.window - 1);
            maxRight = pages;
            if (maxLeft < 1) {
                maxLeft = 1;
            }
        }
        for (var i = maxLeft; i <= maxRight; i++) {
            if (i == currentPage) {
                ul.innerHTML += ` <li class="page-item btn-page active" ><button class="page-link" data-page="${i}">${i}</button></li>`;
            } else {
                ul.innerHTML += ` <li class="page-item btn-page" ><button class="page-link" href="" data-page="${i}">${i}</button></li>`;
            }

        }

        if (state.page != 1) {
            ul.innerHTML = ` <li class="page-item btn-page" ><button class="page-link "  data-page="1">1</button></li><li class="page-item d-flex flex-column mx-2 justify-content-center" >...</li>` + ul.innerHTML;
        }

        if (state.page != pages) {
            ul.innerHTML += ` <li class="page-item d-flex flex-column mx-2 justify-content-center" >...</li><li class="page-item btn-page" ><button class="page-link"  data-page="${pages}">${pages}</button></li>`
        }


        $(".btn-page").click((e) => {
            // ulu.fadeOut(100);
            ul.innerHTML = "";
            tbl.empty();
            state.page = parseInt(e.target.getAttribute("data-page"));
            // console.log(state.page)
            // console.log(e.target)
            insert();
        })
    }

    // pagination end

    //geolocation//

    function getLocationAndInsertIt(data) {
        // clientCountryNews(countryCode)
        $(".client-country-news").hide();
        // console.log("msg")
        if (navigator.geolocation) {
            // console.log("msg2")
            let lat;
            let lng;
            let countryCode;
            navigator.geolocation.getCurrentPosition((alowRes) => {
                let country;
                let total;
                let active;
                let death;
                let recoverd;
                // console.log("msg3")
                let res;
                lat = alowRes.coords.latitude.toFixed(2);
                lng = alowRes.coords.longitude.toFixed(2);
                // console.log("msg4")
                for (let i = 0; i < data.length; i++) {
                    if (data[i].lat == null || data[i].lng == null) {
                        continue;
                    } else {
                        let dataLat = data[i].lat.toFixed(2);
                        let dataLng = data[i].lng.toFixed(2);
                        if (((lat + 4) >= dataLat && (lat - 4) <= dataLat) && (lng + 4) >= dataLng && (lng - 4) <= dataLng) {
                            countryCode = data[i].countryCode;
                            country = data[i].country;
                            total = data[i].totalConfirmed;
                            active = data[i].activeCases;
                            death = data[i].totalDeaths;
                            recoverd = data[i].totalRecovered;
                            // console.log("country")
                            res = true;
                        }
                    }

                }
                // console.log(countryCode)
                if (res) {
                    $(".client-country-card").empty();
                    let html = `<div class="card shadow rounded fade">
                    <div class="card-body text-center">
                        <p class="hh4 font-weight-light"><span><img class="flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/${countryCode.toLowerCase()}.svg" alt="${country}-flag" ></span> ${country}</p>
                        <p class="h4 font-weight-light text-primary">Total ${total}</p>
                        <p class="h4 font-weight-light text-warning">Active ${active} <span class="badge badge-warning">${getPercent(total, active)}%</span></p>
                        <p class="h4 font-weight-light text-danger">Death ${death} <span class="badge badge-danger">${getPercent(total, death)}%</span></p>
                        <p class="h4 font-weight-light  text-success">Recoverd ${recoverd} <span class="badge badge-success">${getPercent(total, recoverd)}%</span></p>
                    </div>
                </div>`;
                    $(".client-country-card").append(html);
                    insertCountryDataChart(countryCode, 'canvas-client-country-data');
                    $(".loader").fadeOut(600);
                    clientCountryNews(countryCode, country);
                    $(".client-country-news").show();
                    document.getElementById("body").classList.remove("overflow");
                } else {
                    $("#client-country-data").hide();
                    $(".loader").fadeOut(800);
                    document.getElementById("body").classList.remove("overflow");
                }
            }, (rejRes) => {
                // console.log("msg3rej");
                $("#client-country-data").hide();
                $(".loader").fadeOut(800);
                document.getElementById("body").classList.remove("overflow");
            })

        } else {
            $("#client-country-data").hide();
            $(".loader").fadeOut(800);
            document.getElementById("body").classList.remove("overflow");
        }

    }


    /////
    //global data//
    async function getGlobalData() {
        try {
            let data = await fetch("https://api.coronatracker.com/v3/stats/worldometer/global");
            if (data.status == 200) {
                // console.log("get data global");
                // console.log("yesss");
                data = await data.json();
                // console.log(data);
                insertGlobalData(data)
            } else {
                // console.log("NOo")
                getData();
            }
            //////////////////////

        } catch (err) {
            console.error(err);
        }
    }

    function insertGlobalData(allData) {
        let total = allData.totalConfirmed;
        let death = allData.totalDeaths;
        let recovered = allData.totalRecovered;
        let active = allData.totalActiveCases;
        $("#global-total-case").text(total)
        $("#total-death-number").text(death)
        $("#total-death-number-percent").html(`<span class="badge badge-danger">${getPercent(total, death)}%</span>`)
        $("#total-recovered-number").text(recovered)
        $("#total-recovered-number-percent").html(`<span class="badge badge-success">${getPercent(total, recovered)}%</span>`)
        $("#total-active-number").text(active)
        $("#total-active-number-percent").html(`<span class="badge badge-warning text-white">${getPercent(total, active)}%</span>`)
        createChartBar(total, death, recovered, active);

    }
    //client country data
    async function insertCountryDataChart(countryCode, canvas) {
        let getCurrentDate = () => {
            date = new Date();
            return date.getFullYear() + "-" + date.getMonth() + 1 + "-" + date.getDate()
        }
        try {
            let data = await fetch(`https://api.coronatracker.com/v5/analytics/trend/country?countryCode=${countryCode}&startDate=2020-01-01&endDate=${getCurrentDate()}`);
            if (data.status == 200) {
                data = await data.json();
                console.log(data);
                let total = [];
                let death = [];
                let recoverd = [];
                let date = [];
                for (let i = 0; i < data.length - 1; i += (Math.round(data.length / 10))) {
                    total.push(data[i].total_confirmed);
                    death.push(data[i].total_deaths);
                    recoverd.push(data[i].total_recovered);
                    date.push(data[i].last_updated.slice(5, 10));
                }
                total.push(data[data.length - 1].total_confirmed);
                death.push(data[data.length - 1].total_deaths);
                recoverd.push(data[data.length - 1].total_recovered);
                date.push(data[data.length - 1].last_updated.slice(5, 10));
                if (canvas == 'search-canvas') {
                    $(".loader-search").fadeOut(600);
                }
                createCharLine(date, death, recoverd, total, canvas);
            } else {
                // console.log("NOoClient")
                getData();
            }
            //////////////////////

        } catch (err) {
            console.error(err);
        }
    }
    // Bar chart
    function createChartBar(total, death, recoverd, active) {
        var ctx = document.getElementById('canvas-global-data').getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['World status'],
                datasets: [{

                    label: 'Total',
                    data: [total],
                    backgroundColor: [
                        "rgba(0, 123, 255,0.7)"
                    ],
                    borderColor: [
                        "rgb(0, 123, 255)",
                    ],
                    borderWidth: 1,

                }, {

                    label: 'Death',
                    data: [death],
                    backgroundColor: [
                        "rgba(220, 53, 69,0.7)"
                    ],
                    borderColor: [
                        "rgba(220, 53, 69,0.8)"
                    ],
                    borderWidth: 1,

                }, {

                    label: 'Recoverd',
                    data: [recoverd],
                    backgroundColor: [
                        "rgba(40, 167, 69,0.7)"
                    ],
                    borderColor: [
                        "rgba(40, 167, 69,0.8)"
                    ],
                    borderWidth: 1,

                }, {

                    label: 'Active',
                    data: [active],
                    backgroundColor: [
                        "rgba(255, 193, 7,0.7)"
                    ],
                    borderColor: [
                        "rgba(255, 193, 7,0.8)"
                    ],
                    borderWidth: 1,

                }]
            },
            options: {
                responsive: true,
                defaultFontSize: 22,
                aspectRatio: aspectRatio,

                legend: {
                    display: false,
                    labels: {

                        fontColor: 'black',
                    }
                },

                title: {
                    display: false,
                    text: 'World status',
                    fontFamily: 'Raleway',

                },
                animation: {
                    duration: 5000
                },

                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        })
    }
    //line chart
    function createCharLine(date, death, recoverd, total, canvas) {

        var ctx = document.getElementById(canvas).getContext('2d');
        var myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: date,
                    datasets: [{
                        backgroundColor: "rgba(255,55,55,0)",
                        label: 'Death',
                        data: death,
                        backgroundColor: [
                            "red"
                        ],
                        borderColor: [
                            "rgba(233, 10, 10, 0.87)"
                        ],
                        borderWidth: 1,
                        order: 1
                    }, {
                        backgroundColor: "rgba(255,55,55,0)",
                        label: 'Recoverd',
                        data: recoverd,
                        backgroundColor: [
                            "#7aff10"
                        ],
                        borderColor: [
                            "rgba(21, 212, 65, 0.7)"
                        ],
                        borderWidth: 1,
                        order: 2
                    }, {
                        backgroundColor: "rgba(255,55,55,0)",
                        label: 'Active',
                        data: total,
                        backgroundColor: [
                            "#ffde07d9"
                        ],
                        borderColor: [
                            "rgba(255, 238, 0, 0.84)"
                        ],
                        borderWidth: 1,
                        order: 1
                    }]
                },
                options: {
                    tooltips: {
                        enabled: false,
                        backgroundColor: "rgba(0,0,0,0)"
                    },
                    responsive: true,

                    aspectRatio: aspectRatio,
                    title: {
                        display: false,
                        text: 'Custom Chart Title'
                    },
                    animation: {
                        duration: 2000
                    },

                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            })
            // console.log(myChart);
    }
    //search start///
    function search(data) {
        $(".search-canvas").hide();
        $("#search-card").hide();
        document.querySelector("#btn-search").addEventListener("click", () => {
            $("#search-card").empty();
            // $(".search-canvas").hide();
            $("#search-card").hide();
            $("#search-canvas").hide();
            $(".loader-search").fadeIn(600);
            let code = document.getElementById("textBox").value.toUpperCase();
            let condition = false;
            if (code != "") {
                j
                for (let i = 0; i < data.length; i++) {
                    if (code === data[i].countryCode) {
                        condition = true;
                        let countryCode = data[i].countryCode;
                        let country = data[i].country;
                        let total = data[i].totalConfirmed;
                        let death = data[i].totalDeaths;
                        let critical = data[i].totalCritical;
                        let recovered = data[i].totalRecovered;
                        let active = data[i].activeCases;
                        // console.log(country);
                        $(".search-canvas").show();
                        insertCountryDataChart(data[i].countryCode, 'search-canvas');
                        $("#search-canvas").show();
                        let card = `<div class="card shadow rounded apear">
                        <div class="card-body text-center mt-3" id="search-card-body">
                        <p class="h4 font-weight-light"><span><img class="flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/${countryCode.toLowerCase()}.svg" alt="${country}-flag" ></span> ${country}</p>
                        <p class="h4 font-weight-light text-primary">Total : ${total}</p>
                        <p class="h4 font-weight-light text-warning">Active ${active} <span class="badge badge-warning">${getPercent(total, active)}%</span></p>
                        <p class="h4 font-weight-light text-danger">Death ${death} <span class="badge badge-danger">${getPercent(total, death)}%</span></p>
                        <p class="h4 font-weight-light text-success">Recoverd ${recovered} <span class="badge badge-success">${getPercent(total, recovered)}%</span></p>
                          </div>
                         </div>`;
                        $("#search-card").append(card);
                        $("#search-card").fadeIn(600);
                    }
                }
                if (!condition) {
                    $("#search-card").html('<p class="text-center font-weight-light text-danger">Sorry! country not found </p>');
                    $(".search-canvas").hide();
                }
            } else {
                $("#search-card").html('<p class="text-center font-weight-light text-danger">Please type a country name or country code</p>');
                $(".search-canvas").hide();
            }

        })
    }
    ///search end///
    // hover effect
    setInterval(hoverEffect, 400)

    function hoverEffect() {
        let card = document.querySelectorAll(".card");
        for (let i = 0; i < card.length; i++) {
            card[i].addEventListener("mouseover", () => {
                card[i].classList.replace("shadow", "shadow-sm")
            })
            card[i].addEventListener("mouseout", () => {
                card[i].classList.replace("shadow-sm", "shadow")
            })
        }
    }
    async function news() {
        try {
            let newsData = await fetch("https://api.coronatracker.com/news/trending?limit=6&offset=&language=en");
            if (newsData.status == 200) {

                newsData = await newsData.json()
                    // console.log(newsData);
                    // console.log("news");
                for (let i = 0; i < newsData.items.length; i++) {
                    // console.log("news");
                    let html = `   <div class="row my-3">
                    <div class="col">
                        <div class="row px-lg-3">
                            <div class="col-md-3 col-12 d-flex flex-column justify-content-center">
                            <img src="${newsData.items[i].urlToImage}" class="image" alt="">
                            </div>
                            <div class="col-md-9 col-12 pt-3  px-3 d-flex flex-column justify-content-center"><p class="mb-1">${newsData.items[i].title}  <span class="float-right mr-3"><a  data-toggle="collapse" class="news-link text-primary collapsed" data-target="#num${i}" aria-expanded="false">read more</a></span></p></div>
                        </div>
                        <div class="row mt-2 mt-md-4">
                        <div class="col">
                        <div id="num${i}" class="collapse col-12 px-md-4">
                        <p class="p-news">${newsData.items[i].content}</p>
                        <p class="p-news">Source:<a href="https://${newsData.items[i].siteName}" target="_blank">${newsData.items[i].siteName}</a></p>
                        <p><a href="${newsData.items[i].url}" target="_blank">See orignial news</a></p>
                     </div></div>
                        </div>

                    </div>
                </div><hr>`
                        // console.log("news2");
                    $(".news").append(html);
                };

            } else {
                // console.log("error news");
                news();
            }
        } catch (error) {
            console.error(error)
        }
    }
    async function clientCountryNews(countryCode, country) {
        try {
            let newsData = await fetch(`https://api.coronatracker.com/news/trending?limit=4&offset=0&countryCode=${countryCode}&country=${country}&language=en`);
            if (newsData.status == 200) {

                newsData = await newsData.json()
                    // console.log(newsData);
                    // console.log("news");
                for (let i = 0; i < newsData.items.length; i++) {
                    // console.log("news");
                    let html = `  <div class="row my-3">
                    <div class="col">
                        <div class="row px-lg-3">
                            <div class="col-md-3 col-12 d-flex flex-column justify-content-center">
                            <img src="${newsData.items[i].urlToImage}" class="image" alt="">
                            </div>
                            <div class="col-md-9 col-12 pt-3  px-3 d-flex flex-column justify-content-center"><p class="mb-1">${newsData.items[i].title}  <span class="float-right mr-3"><a  data-toggle="collapse" class="news-link text-primary collapsed" data-target="#numClientNews${i}" aria-expanded="false">read more</a></span></p></div>
                        </div>
                        <div class="row mt-2 mt-md-4">
                        <div class="col">
                        <div id="numClientNews${i}" class="collapse col-12 px-md-4">
                        <p class="p-news">${newsData.items[i].content}</p>
                        <p class="p-news">Source:<a href="https://${newsData.items[i].siteName}" target="_blank">${newsData.items[i].siteName}</a></p>
                        <p><a href="${newsData.items[i].url}" target="_blank">See orignial news</a></p>
                     </div></div>
                        </div>

                    </div>
                </div><hr>`
                        // console.log("news2");
                    $(".client-country-news").append(html);
                };
            } else {
                // console.log("error news");
                news();
            }
        } catch (error) {
            console.error(error)
        }
    }
})

function getPercent(total, current) {
    if (total == 0 && current == 0) {
        return 0;
    } else if (total == 0) {

        return "N/A";
    } else {
        return ((100 * current) / total).toFixed(1);
    }

}