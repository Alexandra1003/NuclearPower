let btnStart = document.querySelector('.btn-start');
let btnStop = document.querySelector('.btn-stop');
let btnSend = document.querySelector('.btn-send');
let socket;

let switchArray = [true, undefined, undefined, undefined];

function startListen() {
    let currentStateId;
    let targetSwitch = true;
    socket = new WebSocket('ws://178.20.156.145:3000');
    socket.addEventListener('message', function (event) {
        if (JSON.parse(event.data).newState === 'poweredOff') {
            console.log('works', event.data);
            socket.close(1000, 'You`ve closed this connection');
        }
        if (JSON.parse(event.data).newState === 'poweredOn') {
            console.log('does not work', event.data);
            targetSwitch = !targetSwitch;
            console.log(targetSwitch);
        }
        if (JSON.parse(event.data).pulled !== undefined) {
            currentStateId = JSON.parse(event.data).stateId;
            let currentSwitch = JSON.parse(event.data).pulled;

            if (switchArray[currentSwitch] !== undefined) {
                switchArray[currentSwitch] = !switchArray[currentSwitch];
            } else {
                socket.send(JSON.stringify({ 'action': 'check', 'lever1': '0', 'lever2': currentSwitch, 'stateId': currentStateId }));
            }
            console.log('Message from server ', event.data);
            console.log(switchArray, JSON.parse(event.data).stateId);
        }
        if (JSON.parse(event.data).action === 'check') {
            if (JSON.parse(event.data).newState !== 'poweredOn') {
                console.log('Answer from server ', event.data);
                if (JSON.parse(event.data).same === true) {
                    switchArray[JSON.parse(event.data).lever2] = switchArray[0];
                    console.log('Message from server ', event.data);
                } else {
                    switchArray[JSON.parse(event.data).lever2] = !switchArray[0];
                    console.log('Message from server ', event.data);
                }
            }
        }
        if (switchArray.every((val, i, arr) => val === targetSwitch)) {
            socket.send(JSON.stringify({ action: "powerOff", stateId: currentStateId }));
            console.log('power off', JSON.parse(event.data).stateId);
        }
    });
}

function stopListen() {
    socket.close(1000, 'You`ve closed this connection')
}

btnStart.addEventListener('click', startListen);
btnStop.addEventListener('click', stopListen);
