(function (){

    function initScheduler(localScope){
        localScope.tableWidth = 0;
        localScope.showingDate = moment();
        localScope.schedule = getSchedule();
        localScope.hours = [];
        localScope.slots = 0;
        localScope.slotArr = [];
        localScope.colSplit = {
            'lPerc': .1, 
            'rPerc': .9,
            'lVal': 500,
            'lVal': 500,
        };
        localScope.prevX = null;
        localScope.dragCalls = 0;
        localScope.nameElem = {};
        localScope.evtElem = {};
        localScope.nameScrollTop = 0;
        localScope.evtScrollTop = 0;
        localScope.hoveringEventer = false;
        localScope.forcedFocusCount = 0;
        localScope.showEventModal = false;
        localScope.highlightEvent = null;
        localScope.selectedHourOne = null;
        localScope.selectedHourTwo = null;
        localScope.colWidth = 58;
        localScope.defaultHours = ['12 am', '1 am','2 am','3 am','4 am','5 am', '6 am','7 am','8 am'
            ,'9 am','10 am','11 am', '12 pm','1 pm','2 pm','3 pm','4 pm','5 pm','6 pm', '7 pm', '8 pm', '9 pm', '10 pm', '11 pm'];
    };

    angular.module("app").component("ngEventScheduler", {

        bindings:{
            schedule: '=?',
            modalOptions: '=',

            showingDate: '@',

            getDaySchedule: '&',
        },

        controller: function ($scope){
            var vm = this;

            vm.clickedHeader = function (hour) {
                if(vm.selectedHourOne !== null && vm.selectedHourTwo !== null){
                    vm.selectedHourOne.isSelected = false;
                    vm.selectedHourTwo.isSelected = false;
                    vm.selectedHourOne = null;
                    vm.selectedHourTwo = null;
                    vm.resetFilters();
                    return;
                }

                hour.isSelected = !hour.isSelected;

                if(vm.selectedHourOne === null) vm.selectedHourOne = hour;
                else {
                    vm.selectedHourTwo = hour;
                    vm.filterHours();
                }
            };

            vm.resetFilters = function (){
                vm.schedule.eventers.forEach(function (eventer) {
                     eventer.events.forEach(function (evt) {
                        evt.isHidden = false;
                    });
                });
            };

            vm.filterHours = function () {
                var order = vm.getHourOrder();

                vm.schedule.eventers.forEach(function (eventers){
                    eventers.events.forEach(function (evt){
                        var evtStart = evt.start.hour();
                        var evtEnd = evt.end.hour();
                        if((evtStart >= order.one && evtEnd <= order.two) || (evtStart >= order.one && evtStart <= order.two))
                             //evt.isHidden = false;
                        evt.backgroundColor = "white";
                        //else evt.isHidden = true;
                        else evt.backgroundColor = "green";
                    });
                });
            };

            vm.getHourTime = function (timeStr) {
                var hr = parseInt(timeStr);

                if(timeStr.includes("am") && hr === 12){
                    return 0;
                } else if(timeStr.includes("pm")){
                    return hr + 12;
                }

                return hr;
            };

            vm.getHourOrder = function () {
                var hourOne = vm.selectedHourOne;
                var hourTwo = vm.selectedHourTwo;

                let splitOne = hourOne.title.split(" ");
                let splitTwo = hourTwo.title.split(" ");
                
                let hrOne;
                let hrTwo;

                if(splitOne[1] !== splitTwo[1]){
                    if(splitOne[1] === 'am'){
                        hrOne = hourOne;
                        hrTwo = hourTwo;
                    } else {
                        hrOne = hourTwo;
                        hrTwo = hourOne;
                    }
                } else {
                    let testOne = parseInt(splitOne[0]);
                    let testTwo = parseInt(splitTwo[0]);

                    if(testOne > testTwo){
                        hrOne = hourOne;
                        hrTwo = hourTwo;
                    } else {
                        hrOne = hourTwo;
                        hrTwo = hourOne;
                    }
                }

                return {
                    one: vm.getHourTime(hrOne.title),
                    two: vm.getHourTime(hrTwo.title)
                }
            };

            vm.changeMonth = function (diff){
                
            };

            vm.changeDay = function (diff){
                
            };

            vm.$onInit = function (){
                initScheduler(vm);
                vm.setHours(vm.defaultHours);
                vm.setupRow();
                vm.setupSchedule();

                vm.getTableWidth();

                vm.colSplit.lVal = vm.getSideHeight(vm.colSplit.lPerc);
                vm.colSplit.rVal = vm.getSideHeight(vm.colSplit.rPerc);

                vm.nameElem = document.getElementById("nameScroll");
                vm.evtElem = document.getElementById("evtScroll");
                vm.hrElem = document.getElementById("hrScroll");
            };

            vm.getTableWidth = function () {
                vm.tableWidth = document.getElementById('schedulerTable').clientWidth
            };

            vm.setupSchedule = function (){
                let groups = vm.distinctGroups(vm.schedule.eventers, 'group');
                if(groups.length > 0){
                    vm.schedule.eventers = vm.sortArr(vm.schedule.eventers, 'group');
                }
            };

            vm.groupRow = function (name){
                return {
                    'name': name,
                    'isGroupHeader': true,
                    'events': vm.emptySlots()
                };
            };

            vm.emptySlots = function(){
                let slots = [];
                for(var i = 0; i < vm.slots; i++) slots.push(vm.emptyCell());
                return slots;
            }

            vm.sortArr = function (arr, type){
                let sorter = {};
                arr.forEach(function (elem){
                    let name = elem[type];
                    if(sorter[name] === undefined) sorter[name] = [];
                    sorter[name].push(elem); 
                });
                let sortedArr = [];
                for (var property in sorter) {
                    if (sorter.hasOwnProperty(property)) {
                        sortedArr.push(vm.groupRow(property));
                        sorter[property].forEach(function (elem){
                            sortedArr.push(elem);
                        });
                    }
                }
                return sortedArr;
            };

            vm.distinctGroups = function (arr, type){
                var flags = {}, output = [];
                for( var i = 0; i < arr.length; i++) {
                    let t = arr[i][type];
                    if(flags[t] !== undefined) continue;
                    flags[t] = true;
                    output.push(t);
                }
                return output;
            };

            vm.setHours = function (hrs){
                for(var i = 0; i < hrs.length; i++){
                    let hrObj = {
                        'title': hrs[i],
                        'highlight': false
                    };
                    vm.hours.push(hrObj);
                }

                vm.slots = vm.hours.length * 2
                vm.slotArr = new Array(vm.slots)
            };

            vm.setupRow = function (){
                for(var i = 0; i < vm.schedule.eventers.length; i++){
                    var eventer = vm.schedule.eventers[i];
                    eventer.events = vm.buildEventerRow(eventer.events);
                }
            };

            vm.getSlotLocation = function (hr, min){
                return min < 30 ? (hr*2) : (hr*2) + 1;
            };

            vm.buildEventerRow = function (events){
                var evtSlots = {};
                for(var i = 0; i < events.length; i++){
                    var start = events[i].start.hour();
                    var end = events[i].end.hour();
                    
                    events[i].startLoc = vm.getSlotLocation(start, 0);
                    events[i].endLoc = vm.getSlotLocation(end, 0);

                    let colspan = (events[i].endLoc - events[i].startLoc);
                    events[i].colspan = colspan > 0 ? colspan : vm.slots - colspan;

                    evtSlots[events[i].startLoc] = events[i];
                }
                
                //Fix the overlap issue
                var cells = [];
                for(var e = 0; e < vm.slots; e++){
                    if(evtSlots[e] !== undefined){
                        var td = evtSlots[e];
                        cells.push(td);
                        e+=td.colspan-1;
                        continue;
                    }

                    cells.push(vm.emptyCell('transparent'));
                }
                
                return cells;
            };

            vm.getSlotHour = function (position){
                var hrStart = 0;
                var hrEnd = 24;
                var hrLength = vm.slots / (hrEnd - hrStart);
                return hrStart + (position / hrLength);
            };

            vm.emptyCell = function (bColor, position){
                var hr = vm.getSlotHour(position);
                return {
                    'isEmpty': true, 
                    'colspan': 1,
                    'start': moment().hour(hr),
                    'end': moment().hour(hr),
                    'backgroundColor': bColor
                };
            };

            vm.getSideHeight = function (percent){
                var w = Math.floor(((vm.tableWidth*percent)));
                return w;
            };

            vm.resizeCols = function (event){
                if(vm.prevX === null) {
                    vm.prevX = event.pageX;
                    return;
                }

                vm.dragCalls++;
                if(vm.dragCalls < 15) return;
                vm.dragCalls = 0;
                
                if (event.pageX < vm.prevX) {
                    if(vm.colSplit.lPerc > .1){
                        vm.colSplit.lPerc -= .006;
                        vm.colSplit.rPerc += .006;
                    } else {
                        vm.colSplit.lPerc = .1;
                        vm.colSplit.rPerc = .9;
                    }
                } else if (event.pageX > vm.prevX) {
                    if(vm.colSplit.rPerc > .1){
                        vm.colSplit.lPerc += .006;
                        vm.colSplit.rPerc -= .006;
                    } else {
                        vm.colSplit.lPerc = .9;
                        vm.colSplit.rPerc = .1;
                    }
                }
                
                vm.colSplit.lVal = vm.getSideHeight(vm.colSplit.lPerc);
                vm.colSplit.rVal = vm.getSideHeight(vm.colSplit.rPerc);

                vm.prevX = event.pageX;
                
                $scope.$apply();
            };

            vm.resetDrag = function (){
                vm.prevX = null;
                vm.dragCalls = 0;
            };

            vm.scrollRight = function (){
                vm.changeScrollTop(vm.evtElem.scrollTop, vm.nameElem.scrollTop);
                vm.hrElem.scrollLeft = vm.evtElem.scrollLeft;
            };

            vm.changeScrollTop = function (evt, name){
                var scroll = vm.getScrollTop(vm.evtElem.scrollTop, vm.nameElem.scrollTop);
                if(scroll != -1){
                    vm.nameElem.scrollTop = scroll;
                    vm.nameScrollTop = 0;

                    vm.evtElem.scrollTop = scroll;
                    vm.evtScrollTop = scroll;
                }
            };

            vm.getScrollTop = function (evt, name){
                if(vm.evtScrollTop !== evt){
                    return evt;
                } else if(vm.nameScrollTop !== name){
                    return name;
                }
                return -1;
            };

            vm.scrollLeft = function (){
                vm.changeScrollTop(vm.evtElem.scrollTop, vm.nameElem.scrollTop);
            };

            vm.hoverEventer = function(eventer, bool){
                if(eventer.isGroupHeader) return;
                eventer.hover = bool;
                vm.hoveringEventer = bool;
            };

            vm.checkUnFocused = function (eventer, evt){
                if(!vm.hoveringEventer && vm.forcedFocusCount === 0) return false;
                return !(eventer.forceFocus || (eventer.hover && !evt.isEmpty));
            };

            vm.forceFocus = function (eventer){
                eventer.forceFocus = !eventer.forceFocus;
                if(eventer.forceFocus) vm.forcedFocusCount++;
                else vm.forcedFocusCount--;
            };

            vm.hoverEvent = function (evt, bool){
                let start = evt.startLoc / 2;
                let end = evt.endLoc / 2;
                for(var i = start; i < end; i++){
                    vm.hours[i].highlight = bool;
                    //vm.hours[i].isSelected = false;
                }
            };

            vm.clickedEvent = function (evt) {
                vm.highlightEvent = evt;
                vm.showEventModal = true;
            };

            vm.zipGroup = function (group){
                vm.schedule.eventers.forEach(function(element) {
                    if(element.group === group) element.isZipped = !element.isZipped;
                }, this);
            };

        },

        controllerAs: 'schedCtrl',

        templateUrl: 'ngEventSchedulerTemplate'

    });


    angular.module("app").component("ngEventSchedulerModal", {
        bindings: {
            evtModalShow: '=',
            event: '='
        },
        controller: function ($scope){
            var vm = this;
        },
        controllerAs: 'schedModal',
        templateUrl: 'ngEventSchedulerModalTemplate'
    })  

    angular.module("app").directive("ngSchedulerModalHelper", ngSchedulerModalHelper);

    function ngSchedulerModalHelper($parse){
        return {
            restrict: 'A',
            link: function (scope, elem, attrs){
                scope.$watch(attrs.ngSchedulerModalHelper, function (newValue, oldValue) {
                    if(newValue){
                        $(elem).modal("show");
                    } else $(elem).modal("hide");
                });
                $(elem).bind("hide.bs.modal", function (e) {
                    $parse(attrs.ngSchedulerModalHelper).assign(scope, false);
                    
                    if (!scope.$$phase && !scope.$root.$$phase) {
                        scope.$apply();
                    } 
                });
            }
        }
    }

})();