var large = false;
var rows;
var cols;
var x = [];
var y = [];
var w = 15;
var col = [];
var number_users = 0;
var users = new Set();
var saved_file = false;

function download_json(data) {
    var user_lst = [];
    for (const pos of data.keys()) {
        user_lst.push(`${pos.x} ${pos.y}`);
    }
    storageObj = {
        "Number of Ground users": number_users,
        "Position of Ground users": user_lst
    };
    var file_name = `${rows}_${rows}_${number_users}.json`;
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(storageObj));
    var download_element = document.getElementById('download_json');
    download_element.setAttribute("href", dataStr);
    download_element.setAttribute("download", file_name);
    download_element.click();
    showalert(`Download this file to location: input_files/user_input_scenarios`, `success`);
}

function showalert(message, alert_type) {
    $("#alert-wrapper").html(`<div class="alert alert-${alert_type} alert-dismissible fade show" role="alert" id="alertdialog">
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
        </button>
        </div>`);
    window.setTimeout(function () { $("#alertdialog").alert('close'); }, 2000);
    document.getElementById("alertdialog").scrollIntoView();   
}

function init() {
    x = [];
    y = [];
    col = [];
}

function setup() {
    var cnv = createCanvas(500, 500);
    cnv.parent('grid');
    for (var i = 0; i < rows; i++) {
        y[i] = w + i * w;
    }
    for (var i = 0; i < cols; ++i) {
        x[i] = w + i * w;
    }
    for (var i = 0; i < rows; ++i) {
        col[i] = new Array(cols);
        for (var j = 0; j < cols; ++j) {
            col[i][j] = true;
        }
    }
}

function draw() {
    background(255);
    rectMode(CENTER);
    stroke(0);
    for (var j = 0; j < y.length; j++) {
        for (var i = 0; i < cols; i++) {
            if (col[j][i]) {
                fill("white");
            } else {
                fill("red");
            }
            rect(x[i], y[j], w, w);
        }
    }
}

function mousePressed() {
    for (var b = 0; b < rows; b++) {
        for (var a = 0; a < cols; a++) {
            var dis = dist(mouseX, mouseY, x[a], y[b]);
            if (dis < w / 2) {
                col[b][a] = !col[b][a];
                if (col[b][a] == false) {
                    if (!large) {
                        users.add({ 'x': b, 'y': a });
                        document.getElementById('u_placed').value = `Number of users placed: ${users.size}`;
                        if (users.size > number_users) {
                            showalert(`Placed more users. Delete some of them.`, `danger`);
                        }
                        return;
                    }
                    if (i == 0 && j != 1) {
                        users.add({ 'x': b, 'y': a + row_lst[j - 1] });
                    } else if (j == 1) {
                        users.add({ 'x': b + row_lst[i], 'y': a });
                    } else {
                        users.add({ 'x': b + row_lst[i], 'y': a + row_lst[j - 1] });
                    }
                    if (users.size > number_users) {
                        showalert(`Placed more users. Delete some of them.`, `danger`);
                    }
                    document.getElementById('u_placed').value = `Number of users placed: ${users.size}`;
                } else {
                    if (!large) {
                        users.forEach(obj => obj.x === b && obj.y === a ? users.delete(obj) : obj);
                        document.getElementById('u_placed').value = `Number of users placed: ${users.size}`;
                        return;
                    }
                    if (i == 0 && j != 1) {
                        users.forEach(obj => obj.x === b && obj.y === a + row_lst[j - 1] ? users.delete(obj) : obj);
                    } else if (j == 1) {
                        users.forEach(obj => obj.x === b + row_lst[i] && obj.y === a ? users.delete(obj) : obj);
                    } else {
                        users.forEach(obj => obj.x === b + row_lst[i] && obj.y === a + row_lst[j - 1] ? users.delete(obj) : obj);
                    }
                    document.getElementById('u_placed').value = `Number of users placed: ${users.size}`;
                }
            }
        }
    }
}

function validateNum(evt) {
    var theEvent = evt || window.event;
    if (theEvent.type === 'paste') {
        key = event.clipboardData.getData('text/plain');
    } else {
        var key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
    }
    var regex = /[0-9]|\./;
    if (!regex.test(key)) {
        theEvent.returnValue = false;
        if (theEvent.preventDefault) theEvent.preventDefault();
    }
}

var i = 0, j = 1;
var number_rows = 0;
var row_lst = [];

function create_grid(event) {
    rows = document.getElementById('rows').value;
    // cols = document.getElementById('cols').value;
    number_users = document.getElementById('users').value;
    document.getElementById('u_placed').value = `No Users Placed`;
    users = new Set();
    saved_file = false;
    if (!rows || !number_users) {
        showalert(`Please enter a valid number.`, `danger`);
        return;
    } else if (rows > 30) {
        showalert(`Very large value entered. Splitting into subgrids.`, `secondary`);
        init();
        large = true;
        i = 0, j = 1;
        row_lst = [];
        number_rows = rows;
        set_row_list(rows);
        return false;
    } else {
        large = false;
        init();
        cols = rows;
        setup();
        document.getElementById('submit_btn').hidden = false;
    }
}


function load_subgrid() {
    if (!large) {
        showalert(`No subgrid to load.`, `danger`);
        return;
    } else {
        rows = 30;
        cols = 30;
        if (i == row_lst.length - 1) {
            showalert(`Loaded all subgrids.`, `danger`);
            if (!saved_file) {
                if (users.size > number_users) {
                    showalert(`Placed more users. Delete some of them.`, `danger`);
                    return;
                }
                download_json(users);
                saved_file = true;
            }
            return;
        }
        if (j == 1) {
            if (i == row_lst.length - 2) {
                if (row_lst[i + 1] - row_lst[i] < 30) {
                    rows = Math.abs(row_lst[i + 1] - row_lst[i]);
                }
            }
        } else {
            if (i == row_lst.length - 2) {
                if (row_lst[i + 1] - row_lst[i] < 30) {
                    rows = Math.abs(row_lst[i + 1] - row_lst[i]);
                }
            }
            if (j == row_lst.length - 1) {
                if (row_lst[j - 1] - row_lst[j] < 0) {
                    cols = Math.abs(row_lst[j - 1] - row_lst[j]);
                }
            }
        }
        init();
        setup();
        document.getElementById('submit_btn').hidden = false;
    }
}

function save_config() {
    if (large) {
        if (i > row_lst.length - 2) {
            showalert(`You have filled all the subgrids.`, `danger`);
            if (!saved_file) {
                if (users.size > number_users) {
                    showalert(`Placed more users. Delete some of them.`, `danger`);
                    return;
                }
                download_json(users);
                saved_file = true;
                init();
            }
            return;
        }
        if (j == row_lst.length - 1) {
            j = 1;
            i++;
        } else {
            j++;
        }
    }
    if (!large) {
        if (!saved_file) {
            if (users.size > number_users) {
                showalert(`Placed more users. Delete some of them.`, `danger`);
                return;
            }
            download_json(users);
            init();
            return;
        }
    }
    if (users.size > number_users) {
        showalert(`Placed more users. Delete some of them.`, `danger`);
        return;
    }
    init();
    showalert(`Saved this Configuration.`, `success`);
}

function set_row_list(rows) {
    var row = 0;
    if (rows % 30 == 0) {
        while (row <= rows) {
            row_lst.push(row);
            row += 30;
        }
    } else {
        while (row <= rows) {
            row_lst.push(row);
            row += 30;
        }
        if (row != rows) {
            row_lst.push(rows);
        }
    }
}
