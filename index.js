let btnStart = document.querySelector('.btn-start');
let btnStop = document.querySelector('.btn-stop');
let leverArray = document.querySelectorAll('.lever');
let currentSwitch;
let successMessage = document.querySelector('.success-message');
let failMessage = document.querySelector('.fail-message');

let socket;

let switchArray = [true, undefined, undefined, undefined];

function startListen() {
    let currentStateId;
    let targetSwitch = true;
    socket = new WebSocket('ws://178.20.156.145:3000');

    socket.addEventListener('message', function (event) {
        if (JSON.parse(event.data).newState === 'poweredOff') {
            if (failMessage.style.display === 'block') {
                failMessage.style.display = 'none';
            }

            successMessage.style.display = 'block';
            let token = document.querySelector('.token');
            token.innerText = JSON.parse(event.data).token;
            token.style.display = 'block';

            socket.close(1000, 'You`ve closed this connection');
        }

        if (JSON.parse(event.data).newState === 'poweredOn') {
            failMessage.style.display = 'block';
            targetSwitch = !targetSwitch;
        }

        if (JSON.parse(event.data).pulled !== undefined) {
            currentStateId = JSON.parse(event.data).stateId;
            currentSwitch = JSON.parse(event.data).pulled;

            if (switchArray[currentSwitch] !== undefined) {
                switchArray[currentSwitch] = !switchArray[currentSwitch];
                changePosition(leverArray[currentSwitch], switchArray[currentSwitch]);
            } else {
                socket.send(JSON.stringify({ 'action': 'check', 'lever1': '0', 'lever2': currentSwitch, 'stateId': currentStateId }));
            }
        }

        if (JSON.parse(event.data).action === 'check') {
            if (JSON.parse(event.data).newState !== 'poweredOn') {
                currentSwitchNumber = JSON.parse(event.data).lever2;
                leverArray[currentSwitchNumber].classList.remove('unknown');

                if (JSON.parse(event.data).same === true) {
                    switchArray[currentSwitchNumber] = switchArray[0];

                    changePosition(leverArray[currentSwitchNumber], switchArray[0]);
                } else {
                    switchArray[currentSwitchNumber] = !switchArray[0];

                    changePosition(leverArray[currentSwitchNumber], !switchArray[0]);
                }
            }
        }

        if (switchArray.every((val, i, arr) => val === targetSwitch)) {
            socket.send(JSON.stringify({ action: "powerOff", stateId: currentStateId }));
        }
    });
}

function changePosition(lever, value) {
    if (value) {
        if (lever.className == 'lever off') {
            lever.classList.remove('off');
        }
        lever.classList.add('on');
    } else {
        if (lever.className == 'lever on') {
            lever.classList.remove('on');
        }
        lever.classList.add('off');
    }
}

function stopListen() {
    socket.close(1000, 'You`ve closed this connection');
}

btnStart.addEventListener('click', startListen);
btnStop.addEventListener('click', stopListen);