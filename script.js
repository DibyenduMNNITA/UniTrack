let user = localStorage.getItem("user");


let presentDays = Number(localStorage.getItem("presentDays") || 0);
let totalDays = Number(localStorage.getItem("totalDays") || 0);
let todayMarked = localStorage.getItem("todayMarked") || "";


let tasks = [];
let todayHours = 0;
let weekData = JSON.parse(localStorage.getItem("weekData")) || 
              { Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0, Sun:0 };
let chart = null;

fetch("http://localhost:5000/getTasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: user })
})
.then(res => res.json())
.then(data => {
    tasks = data || [];
    recalcToday();
    showTasks();
    updateAttendanceUI();
});

function addTask(){
    let task = document.getElementById("taskInput").value;
    let hrs = document.getElementById("hourInput").value;

    if(!task || !hrs){
        alert("help enter both");
        return;
    }

    let full = task + " — " + hrs + " hrs";

    fetch("http://localhost:5000/addTask",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ email:user, task:full })
    })
    .then(res=>res.json())
    .then(data=>{
        tasks = data;
        recalcToday();
        showTasks();
        document.getElementById("taskInput").value="";
        document.getElementById("hourInput").value="";
    });
}

function showTasks(){
    let list = document.getElementById("taskList");
    list.innerHTML="";
    tasks.forEach(t=>{
        list.innerHTML += `<li>${t}</li>`;
    });

function recalcToday(){
    todayHours = 0;
    tasks.forEach(t=>{
        let m = t.match(/(\d+)\s*hrs/);
        if(m) todayHours += Number(m[1]);
    });
}


function markPresent(){
    if(todayMarked === ""){
        totalDays++;
        presentDays++;
    } else if(todayMarked === "A"){
        presentDays++;
    }

    todayMarked = "P";
    saveAttendance();
}

function markAbsent(){
    if(todayMarked === ""){
        totalDays++;
    } else if(todayMarked === "P"){
        presentDays--;
    }

    todayMarked = "A";
    saveAttendance();
}

function saveAttendance(){
    localStorage.setItem("presentDays", presentDays);
    localStorage.setItem("totalDays", totalDays);
    localStorage.setItem("todayMarked", todayMarked);
    updateAttendanceUI();
}

function updateAttendanceUI(){
    let percent = totalDays === 0 ? 0 : (presentDays / totalDays) * 100;
    document.getElementById("overallPercent").innerText = percent.toFixed(0) + "%";

    let p = document.getElementById("pBox");
    let a = document.getElementById("aBox");

    p.classList.remove("active");
    a.classList.remove("active");

    if(todayMarked === "P") p.classList.add("active");
    if(todayMarked === "A") a.classList.add("active");
}


function submitDay(){
    let day = new Date().toLocaleString("en-US",{weekday:"short"});
    weekData[day] += todayHours;
    todayHours = 0;

    
    localStorage.setItem("weekData", JSON.stringify(weekData));

    drawChart();
    alert("Day submitted");
}

function drawChart(){
    let ctx = document.getElementById("weekChart").getContext("2d");
    if(chart) chart.destroy();

    chart = new Chart(ctx,{
        type:"bar",
        data:{
            labels:Object.keys(weekData),
            datasets:[{
                label:"Hours",
                data:Object.values(weekData)
            }]
        }
    });
}

if(document.getElementById("weekChart")){
    drawChart();
}
}
