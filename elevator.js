{
	init: function(elevators, floors) {
		let upQueue = [];
		let downQueue = [];

		floors.forEach(floor => {
			floor.on("up_button_pressed", () => {
				if (upQueue.indexOf(floor.floorNum) === -1) {
					console.log(`Floor ${floor.floorNum()} waiting to go up`);
					upQueue.push(floor.floorNum());
				} else {
					console.log(`Floor ${floor.floorNum()} is already waiting to go up`);
				}
			});

			floor.on("down_button_pressed", () => {
				if (downQueue.indexOf(floor.floorNum) === -1) {
					console.log(`Floor ${floor.floorNum()} waiting to go down`);
					downQueue.push(floor.floorNum());
				} else {
					console.log(`Floor ${floor.floorNum()} is already waiting to go down`);
				}
			});
		});

		elevators.forEach((elevator, index) => {

			elevator.on("idle", function () {
				console.log(`Elevator ${index} is idle`);

				const nextFloor = getNextFloor(index);
				if (nextFloor !== undefined) {
					console.log(`Elevator ${index} choosing floor ${nextFloor}`);
					elevator.goToFloor(nextFloor);
				} else {
					console.log(`Elevator ${index} has nothing to do`);
				}
			});

			elevator.on("stopped_at_floor", (floorNum) => {
				console.log(`Elevator ${index} stopped at floor ${floorNum}`);
				elevator.goingUpIndicator(true);
				elevator.goingDownIndicator(true);
				if (floorNum === 0) {
					elevator.goingDownIndicator(false);
				} else if (floorNum === 2) {
					elevator.goingUpIndicator(false);
				} else {
					const direction = elevator.destinationDirection();
					if (direction === "up") {
						elevator.goingDownIndicator(false);
					} else if (direction === "down") {
						elevator.goingUpIndicator(false);
					}
				}
			});

			elevator.on("passing_floor", (floorNum, direction) => {
				console.log(`Elevator ${index} passing floor ${floorNum} going ${direction} (${upQueue} / ${downQueue})`);
				if (direction === "up" && upQueue.includes(floorNum)) {
					console.log(`Elevator ${index} stopping immediately at floor ${floorNum}`);
					elevator.goToFloor(floorNum, true);
					const toDelete = upQueue.indexOf(floorNum);
					upQueue.splice(toDelete, 1);
				} else if (direction === "down" && downQueue.includes(floorNum)) {
					console.log(`Elevator ${index} stopping immediately at floor ${floorNum}`);
					elevator.goToFloor(floorNum, true);
					const toDelete = downQueue.indexOf(floorNum);
					downQueue.splice(toDelete, 1);
				}
			});

			function getNextFloor(index) {
				const pressedFloors = elevator.getPressedFloors();
				const floorDiffs = pressedFloors.map(f => Math.abs(f - elevator.currentFloor()));
				const minFloorDiff = Math.min(...floorDiffs);
				const minFloorDiffIndex = floorDiffs.indexOf(minFloorDiff);

				if (minFloorDiffIndex > -1) {
					return pressedFloors[minFloorDiffIndex];
				} else if (pressedFloors.length) {
					return pressedFloors[0];
				} else {
					const nextFloorUp = upQueue.pop();
					if (nextFloorUp !== undefined) {
						return nextFloorUp;
					} else {
						const nextFloorDown = downQueue.pop();
						return nextFloorDown || index;
					}
				}
			}
		});
	},
	update: function(dt, elevators, floors) {
		// We normally don't need to do anything here
	}
}