{
    init: function(elevators, floors) {
        let floorQueue = [];

        floors.forEach(floor => {
            floor.on("up_button_pressed", () => {
                if (floorQueue.map(q => q.floorNum).indexOf(floor.floorNum) === -1)
                    floorQueue.push({floorNum: floor.floorNum(), held: false});
            });

            floor.on("down_button_pressed", () => {
                if (floorQueue.map(q => q.floorNum).indexOf(floor.floorNum) === -1)
                    floorQueue.push({floorNum: floor.floorNum(), held: false});
            });
        });

        elevators.forEach((elevator, index) => {
            elevator.on("idle", function() {
                const pressedFloors = elevator.getPressedFloors();
                const closestFloors = pressedFloors.filter(f => f > elevator.currentFloor());

                const floorDiffs = pressedFloors.map(f => Math.abs(f - elevator.currentFloor()));
                const minFloorDiff = Math.min(...floorDiffs);
                const minFloorDiffIndex = floorDiffs.indexOf(minFloorDiff);
                const closestFloor = minFloorDiffIndex > -1
                    ? pressedFloors[minFloorDiffIndex]
                    : (pressedFloors.length
                       ? pressedFloors[0]
                       : (floorQueue.pop()?.floorNum || 0));

                elevator.goToFloor(closestFloor);
            });
        });
    }
}
